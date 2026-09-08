import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
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
export const db = getFirestore(app);

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
    const saved = sessionStorage.getItem('google_drive_access_token');
    if (saved) {
      cachedGoogleAccessToken = saved;
      return saved;
    }
  } catch {
    // Session storage fallback
  }
  return null;
}

export function setCachedGoogleAccessToken(token: string | null): void {
  cachedGoogleAccessToken = token;
  try {
    if (token) {
      sessionStorage.setItem('google_drive_access_token', token);
    } else {
      sessionStorage.removeItem('google_drive_access_token');
    }
  } catch {
    // Session storage fallback
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
