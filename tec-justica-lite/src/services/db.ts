/**
 * Camada de persistência com IndexedDB — Tec Justiça Lite
 *
 * Armazena todos os dados do app em IndexedDB com criptografia AES-GCM.
 * Migra automaticamente dados existentes do localStorage na primeira execução.
 */

const DB_NAME = 'tecjustica_db';
const DB_VERSION = 1;

const STORES = {
  AUTH: 'auth',
  DATA: 'data',
} as const;

// ─── Inicialização do banco ──────────────────────────────────────

let dbInstance: IDBDatabase | null = null;

export function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.AUTH)) {
        db.createObjectStore(STORES.AUTH);
      }
      if (!db.objectStoreNames.contains(STORES.DATA)) {
        db.createObjectStore(STORES.DATA);
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(new Error('Falha ao abrir IndexedDB: ' + request.error?.message));
    };
  });
}

// ─── Operações genéricas de leitura/escrita ──────────────────────

export function dbPut(
  storeName: string,
  key: string,
  value: any,
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function dbGet<T = any>(
  storeName: string,
  key: string,
): Promise<T | undefined> {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

export function dbDelete(storeName: string, key: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ─── Operações de dados criptografados ───────────────────────────

import { encryptData, decryptData } from './crypto';

export async function saveEncrypted(
  key: string,
  data: any,
  cryptoKey: CryptoKey,
): Promise<void> {
  const json = JSON.stringify(data);
  const encrypted = await encryptData(json, cryptoKey);
  await dbPut(STORES.DATA, key, encrypted);
}

export async function loadDecrypted<T>(
  key: string,
  cryptoKey: CryptoKey,
): Promise<T | null> {
  const encrypted = await dbGet<string>(STORES.DATA, key);
  if (!encrypted || typeof encrypted !== 'string') return null;

  try {
    const json = await decryptData(encrypted, cryptoKey);
    return JSON.parse(json) as T;
  } catch {
    console.warn(`[DB] Falha ao descriptografar chave "${key}". Dados podem estar corrompidos.`);
    return null;
  }
}

export async function deleteData(key: string): Promise<void> {
  await dbDelete(STORES.DATA, key);
}

// ─── Operações de autenticação (sem criptografia extra) ──────────

export async function saveAuthData(key: string, data: any): Promise<void> {
  await dbPut(STORES.AUTH, key, data);
}

export async function getAuthData<T = any>(key: string): Promise<T | undefined> {
  return dbGet<T>(STORES.AUTH, key);
}

export async function deleteAuthData(key: string): Promise<void> {
  await dbDelete(STORES.AUTH, key);
}

// ─── Migração do localStorage para IndexedDB ────────────────────

const LEGACY_KEYS = {
  PROFILE: 'tecjustica_profile_v1',
  TASKS: 'tecjustica_tasks_v1',
  CASES: 'tecjustica_cases_v1',
  CATEGORIES: 'tecjustica_categories_v1',
};

export async function migrateFromLocalStorage(
  cryptoKey: CryptoKey,
): Promise<boolean> {
  let migrated = false;

  for (const [dataKey, lsKey] of Object.entries(LEGACY_KEYS)) {
    const raw = localStorage.getItem(lsKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const dbKey = dataKey.toLowerCase(); // profile, tasks, cases, categories
        await saveEncrypted(dbKey, parsed, cryptoKey);
        localStorage.removeItem(lsKey);
        migrated = true;
        console.log(`[DB] Migrado localStorage "${lsKey}" → IndexedDB "${dbKey}"`);
      } catch (err) {
        console.warn(`[DB] Falha ao migrar "${lsKey}":`, err);
      }
    }
  }

  return migrated;
}
