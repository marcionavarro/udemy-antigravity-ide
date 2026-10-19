/**
 * Módulo de criptografia — Tec Justiça Lite
 *
 * Usa exclusivamente a Web Crypto API nativa do navegador:
 * - PBKDF2 (100 000 iterações, SHA-256) para derivar hashes de senha
 * - AES-GCM (256-bit) para criptografar/descriptografar dados do app
 * - Tokens de sessão com validade de 30 dias
 */

const PBKDF2_ITERATIONS = 100_000;
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

// ─── Helpers de conversão ────────────────────────────────────────

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV para AES-GCM
}

// ─── Derivação de chave a partir da senha ────────────────────────

async function getKeyMaterial(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey'],
  );
}

// ─── Hash de Senha (PBKDF2) ─────────────────────────────────────

export async function hashPassword(
  password: string,
  existingSalt?: Uint8Array,
): Promise<{ hash: string; salt: string }> {
  const salt = existingSalt ?? generateSalt();
  const keyMaterial = await getKeyMaterial(password);

  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256,
  );

  return {
    hash: arrayBufferToBase64(derivedBits),
    salt: arrayBufferToBase64(salt.buffer as ArrayBuffer),
  };
}

export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string,
): Promise<boolean> {
  const saltBytes = new Uint8Array(base64ToArrayBuffer(storedSalt));
  const { hash } = await hashPassword(password, saltBytes);
  return hash === storedHash;
}

// ─── Chave de Criptografia de Dados (AES-GCM 256) ───────────────

export async function deriveEncryptionKey(
  password: string,
  saltBase64: string,
): Promise<CryptoKey> {
  const salt = base64ToArrayBuffer(saltBase64);
  const keyMaterial = await getKeyMaterial(password);

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

// ─── Criptografar / Descriptografar Dados ────────────────────────

export async function encryptData(
  data: string,
  key: CryptoKey,
): Promise<string> {
  const iv = generateIV();
  const encoder = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    encoder.encode(data),
  );

  // Armazena IV + ciphertext juntos, separados por '.'
  return `${arrayBufferToBase64(iv.buffer as ArrayBuffer)}.${arrayBufferToBase64(ciphertext)}`;
}

export async function decryptData(
  encryptedPayload: string,
  key: CryptoKey,
): Promise<string> {
  const [ivBase64, ciphertextBase64] = encryptedPayload.split('.');
  if (!ivBase64 || !ciphertextBase64) {
    throw new Error('Formato de dados criptografados inválido.');
  }

  const iv = base64ToArrayBuffer(ivBase64);
  const ciphertext = base64ToArrayBuffer(ciphertextBase64);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext,
  );

  return new TextDecoder().decode(decrypted);
}

// ─── Token de Sessão Local ───────────────────────────────────────

export interface SessionToken {
  email: string;
  createdAt: number;
  expiresAt: number;
}

export function generateSessionToken(email: string): string {
  const token: SessionToken = {
    email,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
  return btoa(JSON.stringify(token));
}

export function parseSessionToken(tokenStr: string): SessionToken | null {
  try {
    const token: SessionToken = JSON.parse(atob(tokenStr));
    return token;
  } catch {
    return null;
  }
}

export function isSessionValid(tokenStr: string | null): boolean {
  if (!tokenStr) return false;
  const token = parseSessionToken(tokenStr);
  if (!token) return false;
  return Date.now() < token.expiresAt;
}
