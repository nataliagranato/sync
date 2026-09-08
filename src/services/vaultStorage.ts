/**
 * IndexedDB Durable Storage for Encrypted Blobs and Real Device Files
 * Eliminates localStorage 5MB quota limitations for real encrypted media.
 */

const DB_NAME = 'SyncVaultDB_v1';
const STORE_NAME = 'encrypted_payloads';

function openVaultDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não suportado no navegador'));
      return;
    }

    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'fileId' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export interface StoredVaultPayload {
  fileId: string;
  ciphertext?: Uint8Array;
  rawBlob?: Blob;
  ivHex: string;
  saltHex: string;
  hashHex: string;
  mimeType: string;
  fileName: string;
  updatedAt: number;
}

export async function saveVaultPayload(payload: StoredVaultPayload): Promise<void> {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(payload);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not save payload to IndexedDB:', err);
  }
}

export async function getVaultPayload(fileId: string): Promise<StoredVaultPayload | null> {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(fileId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not retrieve payload from IndexedDB:', err);
    return null;
  }
}

export async function deleteVaultPayload(fileId: string): Promise<void> {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(fileId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not delete payload from IndexedDB:', err);
  }
}

export async function clearVaultStorage(): Promise<void> {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not clear IndexedDB:', err);
  }
}
