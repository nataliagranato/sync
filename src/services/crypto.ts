/**
 * Real Web Crypto API End-to-End Encryption (E2EE)
 * AES-GCM 256-bit with PBKDF2-SHA-256 Key Derivation
 */

export interface EncryptedPayload {
  ciphertext: Uint8Array;
  ivHex: string;
  saltHex: string;
  hashHex: string;
}

const DEFAULT_SALT_HEX = '7f8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c';

export function buf2hex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hex2buf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function sha256Hex(data: ArrayBuffer | Uint8Array): Promise<string> {
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return buf2hex(hashBuffer);
}

export async function encryptBuffer(data: ArrayBuffer, passphrase: string): Promise<EncryptedPayload> {
  // Generate random 16-byte salt
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  // Generate 12-byte IV for AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const cryptoKey = await deriveKey(passphrase, salt);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128
    },
    cryptoKey,
    data
  );

  const hashHex = await sha256Hex(encryptedBuffer);

  return {
    ciphertext: new Uint8Array(encryptedBuffer),
    ivHex: buf2hex(iv),
    saltHex: buf2hex(salt),
    hashHex
  };
}

export async function decryptBuffer(
  ciphertext: Uint8Array,
  ivHex: string,
  saltHex: string,
  passphrase: string
): Promise<ArrayBuffer> {
  const salt = hex2buf(saltHex);
  const iv = hex2buf(ivHex);
  const cryptoKey = await deriveKey(passphrase, salt);

  return window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128
    },
    cryptoKey,
    ciphertext
  );
}

export function generateRecoveryPhrase(): string {
  const words = [
    'apple', 'shield', 'cipher', 'vault', 'orbit', 'quantum', 'vertex', 'aurora',
    'beacon', 'summit', 'crystal', 'vector', 'horizon', 'pulse', 'matrix', 'zenith',
    'echo', 'timber', 'glacier', 'falcon', 'nebula', 'solaris', 'prism', 'vanguard'
  ];
  const selected: string[] = [];
  for (let i = 0; i < 12; i++) {
    const idx = Math.floor(Math.random() * words.length);
    selected.push(words[idx]);
  }
  return selected.join(' ');
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
