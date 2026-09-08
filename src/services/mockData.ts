import { FileItem, StorageProviderConfig, SyncSchedule, HistoryRecord, UserProfile, CryptoConfig } from '../types';

// O cofre inicia 100% limpo e vazio, sem qualquer dado simulado ou mock
export const INITIAL_FILES: FileItem[] = [];

export const INITIAL_STORAGE_PROVIDERS: StorageProviderConfig[] = [
  {
    id: 'google_drive',
    name: 'Google Drive',
    connected: false,
    userAccount: '',
    accountEmail: '',
    totalSpaceBytes: 15 * 1024 * 1024 * 1024, // 15 GB
    usedSpaceBytes: 0,
    vaultUsedBytes: 0,
    syncFolder: 'Drive / Backups / Sync_E2EE',
    lastSyncAt: 'Nunca'
  },
  {
    id: 'onedrive',
    name: 'Microsoft OneDrive',
    connected: false,
    userAccount: '',
    accountEmail: '',
    totalSpaceBytes: 5 * 1024 * 1024 * 1024, // 5 GB
    usedSpaceBytes: 0,
    vaultUsedBytes: 0,
    syncFolder: 'OneDrive / Apps / Sync_Vault',
    lastSyncAt: 'Nunca'
  }
];

export const INITIAL_SCHEDULE: SyncSchedule = {
  enabled: true,
  frequency: 'daily',
  scheduledHour: 3,
  scheduledMinute: 0,
  wifiOnly: true,
  chargingOnly: true,
  lowPowerPause: true,
  backgroundFetchEnabled: true,
  runOnAppClose: true,
  nextRunTime: 'Amanhã às 03:00',
  lastRunTime: 'Nenhum backup realizado'
};

export const INITIAL_HISTORY: HistoryRecord[] = [];

export const INITIAL_USER: UserProfile = {
  id: 'usr_guest',
  name: 'Visitante',
  email: '',
  avatarUrl: '',
  isGoogleAuthenticated: false,
  isOneDriveAuthenticated: false,
  authProvider: 'guest'
};

export const INITIAL_CRYPTO_CONFIG: CryptoConfig = {
  algorithm: 'AES-GCM-256',
  keyDerivation: 'PBKDF2-SHA256',
  iterations: 100000,
  saltHex: '7f8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c',
  isUnlocked: true,
  recoveryPhrase: 'shield cipher vault quantum vertex aurora beacon summit crystal horizon pulse zenith',
  fingerprint: 'SHA256:4a8c9e2b...f712'
};

