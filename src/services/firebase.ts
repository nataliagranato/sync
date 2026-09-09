import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId
};

// Initialize Firebase once
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfigJson.firestoreDatabaseId);

// Standardized Firestore Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Google Auth Provider setup with Drive scope
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// In-memory & session token cache as mandated by workspace-integration guidelines
let cachedGoogleAccessToken: string | null = null;

export function getCachedGoogleAccessToken(): string | null {
  if (cachedGoogleAccessToken) return cachedGoogleAccessToken;
  try {
    const saved = sessionStorage.getItem('google_drive_access_token') || localStorage.getItem('google_drive_access_token');
    if (saved) {
      cachedGoogleAccessToken = saved;
      return saved;
    }
  } catch {
    // Storage fallback
  }
  return null;
}

export function setCachedGoogleAccessToken(token: string | null): void {
  cachedGoogleAccessToken = token;
  try {
    if (token) {
      sessionStorage.setItem('google_drive_access_token', token);
      localStorage.setItem('google_drive_access_token', token);
    } else {
      sessionStorage.removeItem('google_drive_access_token');
      localStorage.removeItem('google_drive_access_token');
    }
  } catch {
    // Storage fallback
  }
}

// Real Google Sign-in via popup with Drive access
export async function signInWithGoogleReal(): Promise<{ user: FirebaseUser; accessToken?: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      setCachedGoogleAccessToken(credential.accessToken);
    }
    return { user: result.user, accessToken: getCachedGoogleAccessToken() || undefined };
  } catch (error: any) {
    console.error('Firebase Google Sign-In error:', error);
    if (error.code === 'auth/popup-blocked') {
      throw new Error('O pop-up de login foi bloqueado pelo navegador. Por favor, permita pop-ups para este site ou abra a aplicação em uma nova aba.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('A janela de login com o Google foi fechada antes da conclusão.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Operação de login cancelada.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('Domínio da aplicação não autorizado no Firebase Console. Para testar com todas as contas, o domínio atual foi configurado.');
    }
    throw error;
  }
}

// Sign out
export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
  setCachedGoogleAccessToken(null);
}

// Test connection on boot
export async function testFirestoreConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, check connection.');
    }
  }
}

// Run connection test silently in background
testFirestoreConnection().catch(() => {});

export interface FirestoreBackupRecord {
  id: string;
  userId: string;
  name: string;
  size: number;
  sha256Hash: string;
  encrypted: boolean;
  destinations: string;
  status: string;
  timestamp: string;
}

export async function saveBackupRecordToFirestore(userId: string, record: FirestoreBackupRecord): Promise<void> {
  const path = `users/${userId}/backups/${record.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'backups', record.id);
    await setDoc(docRef, record, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchUserBackupHistoryFromFirestore(userId: string): Promise<FirestoreBackupRecord[]> {
  const path = `users/${userId}/backups`;
  try {
    const collRef = collection(db, 'users', userId, 'backups');
    const q = query(collRef, orderBy('timestamp', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as FirestoreBackupRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function deleteBackupRecordFromFirestore(userId: string, recordId: string): Promise<void> {
  const path = `users/${userId}/backups/${recordId}`;
  try {
    const docRef = doc(db, 'users', userId, 'backups', recordId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Could not delete backup record from Firestore:', error);
  }
}
