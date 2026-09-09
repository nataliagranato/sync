export type IosCategory = 'photos' | 'videos' | 'contacts' | 'documents';

export type FileStatus = 'local' | 'queued' | 'encrypting' | 'uploading' | 'synced' | 'failed';

export interface FileItem {
  id: string;
  name: string;
  originalSize: number;
  category: IosCategory;
  mimeType: string;
  createdAt: string;
  iosPath: string;
  thumbnailUrl?: string;
  contactDetails?: {
    phone?: string;
    email?: string;
    company?: string;
  };
  fileBlob?: File | Blob;
  ciphertextHex?: string;
  ivHex?: string;
  saltHex?: string;
  driveFileId?: string;
  driveWebViewLink?: string;
  oneDriveFileId?: string;
  oneDriveWebUrl?: string;
  encryptedSize?: number;
  checksum?: string;
  status: FileStatus;
  lastSyncedAt?: string;
  target?: 'google_drive' | 'onedrive' | 'both';
  deduplicated?: boolean;
}

export interface DeduplicationStats {
  enabled: boolean;
  savedBytes: number;
  skippedFilesCount: number;
  lastScanAt?: string;
  duplicateCount: number;
}

export interface RestoreProgress {
  isRestoring: boolean;
  activeFileName?: string;
  restoredCount: number;
  totalToRestore: number;
  status: 'idle' | 'decrypting' | 'packaging' | 'ready' | 'error';
}

export type StorageTarget = 'google_drive' | 'onedrive' | 'both';

export interface StorageProviderConfig {
  id: 'google_drive' | 'onedrive';
  name: string;
  connected: boolean;
  userAccount?: string;
  accountEmail?: string;
  totalSpaceBytes: number;
  usedSpaceBytes: number;
  vaultUsedBytes?: number;
  syncFolder: string;
  lastSyncAt?: string;
  accessToken?: string;
}

export type UploadStage = 'idle' | 'encrypting' | 'uploading' | 'verifying' | 'completed' | 'paused' | 'error';

export interface UploadJob {
  id: string;
  fileId: string;
  fileName: string;
  category: IosCategory;
  totalBytes: number;
  transferredBytes: number;
  progress: number; // 0 - 100
  speedMbps: number;
  etaSeconds: number;
  stage: UploadStage;
  target: 'google_drive' | 'onedrive';
  ivHex?: string;
  checksum?: string;
  error?: string;
  startedAt: number;
}

export interface SyncSchedule {
  enabled: boolean;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  scheduledHour: number; // 0-23
  scheduledMinute: number; // 0-59
  wifiOnly: boolean;
  chargingOnly: boolean;
  lowPowerPause: boolean;
  backgroundFetchEnabled: boolean;
  runOnAppClose: boolean; // Continuous backup even if user closes or exits the app
  nextRunTime: string;
  lastRunTime?: string;
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  filesCount: number;
  breakdown: {
    photos: number;
    videos: number;
    contacts: number;
    documents: number;
  };
  totalOriginalBytes: number;
  totalEncryptedBytes: number;
  providers: ('google_drive' | 'onedrive')[];
  durationSeconds: number;
  status: 'success' | 'partial' | 'failed';
  batchHash: string;
  details?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  isGoogleAuthenticated: boolean;
  isOneDriveAuthenticated: boolean;
  oneDriveAccount?: {
    name: string;
    email: string;
    connected: boolean;
  };
  authProvider: 'google' | 'microsoft' | 'guest';
}

export interface CryptoConfig {
  algorithm: 'AES-GCM-256';
  keyDerivation: 'PBKDF2-SHA256';
  iterations: number;
  saltHex: string;
  isUnlocked: boolean;
  recoveryPhrase: string;
  fingerprint: string;
}

export interface SyncNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  provider?: 'google_drive' | 'onedrive';
  read: boolean;
}

export interface ConflictDetails {
  fileName: string;
  fileSize: number;
  existingSize?: number;
  existingModifiedTime?: string;
  targetFolder?: string;
  onReplace: () => void;
  onSkip: () => void;
}
