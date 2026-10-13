/**
 * Gerenciador de Autenticação Local — Tec Justiça Lite
 *
 * Registra, autentica e gerencia sessões de usuários localmente.
 * Credenciais nunca trafegam: tudo fica no IndexedDB do dispositivo.
 */

import {
  hashPassword,
  verifyPassword,
  deriveEncryptionKey,
  generateSessionToken,
  isSessionValid,
  parseSessionToken,
} from './crypto';

import { initDB, saveAuthData, getAuthData, deleteAuthData } from './db';

// ─── Tipos ───────────────────────────────────────────────────────

interface StoredCredentials {
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: number;
}

const AUTH_KEYS = {
  CREDENTIALS: 'user_credentials',
};

const SESSION_KEY = 'tecjustica_session';

// ─── Registro ────────────────────────────────────────────────────

export async function registerUser(
  email: string,
  password: string,
): Promise<string> {
  await initDB();

  // Verifica se já existe conta registrada
  const existing = await getAuthData<StoredCredentials>(AUTH_KEYS.CREDENTIALS);
  if (existing) {
    throw new Error('Já existe uma conta registrada neste dispositivo. Faça login ou limpe os dados.');
  }

  if (password.length < 6) {
    throw new Error('A senha deve ter no mínimo 6 caracteres.');
  }

  const { hash, salt } = await hashPassword(password);

  const credentials: StoredCredentials = {
    email: email.toLowerCase().trim(),
    passwordHash: hash,
    salt,
    createdAt: Date.now(),
  };

  await saveAuthData(AUTH_KEYS.CREDENTIALS, credentials);

  // Gera token de sessão
  const token = generateSessionToken(email);
  localStorage.setItem(SESSION_KEY, token);

  return token;
}

// ─── Login ───────────────────────────────────────────────────────

export async function loginUser(
  email: string,
  password: string,
): Promise<string> {
  await initDB();

  const credentials = await getAuthData<StoredCredentials>(AUTH_KEYS.CREDENTIALS);
  if (!credentials) {
    throw new Error('Nenhuma conta encontrada neste dispositivo. Crie uma conta primeiro.');
  }

  if (credentials.email !== email.toLowerCase().trim()) {
    throw new Error('Email ou senha incorretos.');
  }

  const valid = await verifyPassword(password, credentials.passwordHash, credentials.salt);
  if (!valid) {
    throw new Error('Email ou senha incorretos.');
  }

  // Gera token de sessão
  const token = generateSessionToken(email);
  localStorage.setItem(SESSION_KEY, token);

  return token;
}

// ─── Logout ──────────────────────────────────────────────────────

export function logoutUser(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ─── Verificação de sessão ───────────────────────────────────────

export function checkSession(): { valid: boolean; email: string | null } {
  const token = localStorage.getItem(SESSION_KEY);
  if (!token || !isSessionValid(token)) {
    return { valid: false, email: null };
  }
  const parsed = parseSessionToken(token);
  return { valid: true, email: parsed?.email ?? null };
}

// ─── Verificar se há conta registrada ────────────────────────────

export async function hasRegisteredAccount(): Promise<boolean> {
  await initDB();
  const credentials = await getAuthData<StoredCredentials>(AUTH_KEYS.CREDENTIALS);
  return !!credentials;
}

// ─── Obter chave de criptografia do usuário logado ───────────────
// Nota: para derivar a chave, precisamos da senha — mas não a armazenamos.
// A chave é derivada durante o login e mantida em memória (no state do React).

export async function getEncryptionKeyFromPassword(
  password: string,
): Promise<CryptoKey> {
  const credentials = await getAuthData<StoredCredentials>(AUTH_KEYS.CREDENTIALS);
  if (!credentials) {
    throw new Error('Nenhuma conta registrada.');
  }
  return deriveEncryptionKey(password, credentials.salt);
}

// ─── Resetar todos os dados (emergência) ─────────────────────────

export async function resetAllData(): Promise<void> {
  localStorage.removeItem(SESSION_KEY);
  // Limpar keys legadas do localStorage
  localStorage.removeItem('tecjustica_profile_v1');
  localStorage.removeItem('tecjustica_tasks_v1');
  localStorage.removeItem('tecjustica_cases_v1');
  localStorage.removeItem('tecjustica_categories_v1');

  // Deletar todo o IndexedDB
  await deleteAuthData(AUTH_KEYS.CREDENTIALS);

  // Recarregar
  const dbs = await indexedDB.databases();
  for (const db of dbs) {
    if (db.name === 'tecjustica_db') {
      indexedDB.deleteDatabase(db.name);
    }
  }
}
