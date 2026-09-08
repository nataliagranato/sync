import React, { useState } from 'react';
import { useSync } from '../context/SyncContext';
import { formatBytes } from '../services/crypto';
import {
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertCircle,
  FolderSync,
  Layers,
  Settings,
  ShieldCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface StorageProvidersConfigProps {
  onOpenGoogleAuth: () => void;
  onOpenOneDriveAuth: () => void;
}

export const StorageProvidersConfig: React.FC<StorageProvidersConfigProps> = ({
  onOpenGoogleAuth,
  onOpenOneDriveAuth
}) => {
  const { storageProviders, updateStorageProvider, addNotification, checkCloudHealth } = useSync();

  const [dualSyncRedundancy, setDualSyncRedundancy] = useState(true);
  const [editingFolderId, setEditingFolderId] = useState<'google_drive' | 'onedrive' | null>(null);
  const [tempFolderPath, setTempFolderPath] = useState('');

  const googleProvider = storageProviders.find(p => p.id === 'google_drive');
  const oneDriveProvider = storageProviders.find(p => p.id === 'onedrive');

  const handleEditFolder = (providerId: 'google_drive' | 'onedrive') => {
    const provider = storageProviders.find(p => p.id === providerId);
    if (provider) {
      setTempFolderPath(provider.syncFolder);
      setEditingFolderId(providerId);
    }
  };

  const handleSaveFolder = (providerId: 'google_drive' | 'onedrive') => {
    updateStorageProvider(providerId, { syncFolder: tempFolderPath });
    setEditingFolderId(null);
    addNotification({
      type: 'info',
      title: 'Diretório Atualizado',
      message: `Novo destino na nuvem salvo para ${providerId === 'google_drive' ? 'Google Drive' : 'OneDrive'}.`
    });
  };

  const handleHealthCheck = async (providerId: 'google_drive' | 'onedrive') => {
    const res = await checkCloudHealth(providerId);
    addNotification({
      type: res.ok ? 'success' : 'warning',
      title: res.ok ? 'Diagnóstico de Conexão OK' : 'Diagnóstico de Nuvem',
      message: res.message
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-[#333] bg-[#111] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HardDrive className="w-5 h-5 text-[#888]" />
            <h1 className="text-xl font-bold text-[#fafafa] tracking-tight">
              Provedores de Armazenamento em Nuvem
            </h1>
          </div>
          <span className="text-[10px] font-mono text-green-500 flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 uppercase font-bold tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> E2EE Payload Safe
          </span>
        </div>
        <p className="text-xs text-[#888] max-w-2xl">
          O Sync suporta oficialmente o Google Drive e o Microsoft OneDrive. Os arquivos enviados para estas plataformas são blobs indecifráveis para os servidores da Google e Microsoft.
        </p>
      </div>

      {/* Dual Cloud Redundancy Switch */}
      <div className="p-5 rounded-2xl border border-[#333] bg-[#111] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#fafafa]">Redundância Dual-Cloud (Google + Microsoft)</p>
            <p className="text-[11px] text-[#666]">
              Grava cópias espelhadas em ambos os serviços para proteção total contra indisponibilidade de provedor.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setDualSyncRedundancy(!dualSyncRedundancy);
            addNotification({
              type: 'info',
              title: 'Modo de Redundância Alterado',
              message: !dualSyncRedundancy
                ? 'Backups serão enviados simultaneamente para o Google Drive e OneDrive.'
                : 'Backups serão direcionados individualmente por arquivo.'
            });
          }}
          className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            dualSyncRedundancy
              ? 'bg-white text-black hover:bg-zinc-200'
              : 'bg-[#161616] text-[#888] border border-[#333] hover:text-[#fafafa]'
          }`}
        >
          {dualSyncRedundancy ? 'Dupla Nuvem Ativa' : 'Nuvem Única'}
        </button>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Drive Card */}
        {googleProvider && (
          <div className="p-6 rounded-2xl border border-[#333] bg-[#111] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-500">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#fafafa]">{googleProvider.name}</h2>
                  <p className="text-[11px] text-[#888] font-mono">
                    {googleProvider.connected ? googleProvider.accountEmail : 'Conta não conectada'}
                  </p>
                </div>
              </div>

              <span
                className={`text-[10px] px-2 py-1 rounded border font-bold tracking-wider ${
                  googleProvider.connected
                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {googleProvider.connected ? 'ACTIVE' : 'DESCONECTADO'}
              </span>
            </div>

            {/* Quota bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#888]">Espaço em Disco</span>
                <span className="font-mono text-[#fafafa]">
                  {formatBytes(googleProvider.usedSpaceBytes)} / {formatBytes(googleProvider.totalSpaceBytes)}
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (googleProvider.usedSpaceBytes / googleProvider.totalSpaceBytes) * 100)}%`
                  }}
                ></div>
              </div>
              <p className="text-[10px] text-[#666] text-right">
                {Math.round((googleProvider.usedSpaceBytes / googleProvider.totalSpaceBytes) * 100)}% utilizado no Google Drive
              </p>
            </div>

            {/* Sync Folder Path */}
            <div className="p-3.5 rounded-xl bg-[#161616] border border-[#222] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#888]">Pasta no Google Drive:</span>
                {editingFolderId === 'google_drive' ? (
                  <button
                    onClick={() => handleSaveFolder('google_drive')}
                    className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                  >
                    Salvar
                  </button>
                ) : (
                  <button
                    onClick={() => handleEditFolder('google_drive')}
                    className="text-[11px] text-[#888] hover:text-[#fafafa] cursor-pointer"
                  >
                    Editar
                  </button>
                )}
              </div>

              {editingFolderId === 'google_drive' ? (
                <input
                  type="text"
                  value={tempFolderPath}
                  onChange={e => setTempFolderPath(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md bg-[#111] border border-[#333] text-xs text-[#fafafa] font-mono focus:outline-hidden"
                />
              ) : (
                <p className="text-xs font-mono text-[#fafafa] truncate">
                  {googleProvider.syncFolder}
                </p>
              )}
            </div>

            {/* Card Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleHealthCheck('google_drive')}
                className="text-xs text-[#888] hover:text-[#fafafa] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Testar Conexão</span>
              </button>

              <button
                id="btn-open-google-auth-storage"
                onClick={onOpenGoogleAuth}
                className={`text-xs transition-colors cursor-pointer font-semibold ${
                  googleProvider.connected
                    ? 'text-[#888] hover:text-[#fafafa]'
                    : 'text-blue-400 hover:text-blue-300'
                }`}
              >
                {googleProvider.connected
                  ? 'Alternar Conta do Google Drive →'
                  : 'Conectar com o Google (Pop-up) →'}
              </button>
            </div>
          </div>
        )}

        {/* Microsoft OneDrive Card */}
        {oneDriveProvider && (
          <div className="p-6 rounded-2xl border border-[#333] bg-[#111] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-600/20 flex items-center justify-center text-cyan-500">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#fafafa]">{oneDriveProvider.name}</h2>
                  <p className="text-[11px] text-[#888] font-mono">
                    {oneDriveProvider.connected ? oneDriveProvider.accountEmail : 'Conta não conectada'}
                  </p>
                </div>
              </div>

              <span
                className={`text-[10px] px-2 py-1 rounded border font-bold tracking-wider ${
                  oneDriveProvider.connected
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {oneDriveProvider.connected ? 'ACTIVE' : 'DESCONECTADO'}
              </span>
            </div>

            {/* Quota bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#888]">Espaço em Disco</span>
                <span className="font-mono text-[#fafafa]">
                  {formatBytes(oneDriveProvider.usedSpaceBytes)} / {formatBytes(oneDriveProvider.totalSpaceBytes)}
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (oneDriveProvider.usedSpaceBytes / oneDriveProvider.totalSpaceBytes) * 100)}%`
                  }}
                ></div>
              </div>
              <p className="text-[10px] text-[#666] text-right">
                {Math.round((oneDriveProvider.usedSpaceBytes / oneDriveProvider.totalSpaceBytes) * 100)}% utilizado no OneDrive
              </p>
            </div>

            {/* Sync Folder Path */}
            <div className="p-3.5 rounded-xl bg-[#161616] border border-[#222] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#888]">Pasta no Microsoft OneDrive:</span>
                {editingFolderId === 'onedrive' ? (
                  <button
                    onClick={() => handleSaveFolder('onedrive')}
                    className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    Salvar
                  </button>
                ) : (
                  <button
                    onClick={() => handleEditFolder('onedrive')}
                    className="text-[11px] text-[#888] hover:text-[#fafafa] cursor-pointer"
                  >
                    Editar
                  </button>
                )}
              </div>

              {editingFolderId === 'onedrive' ? (
                <input
                  type="text"
                  value={tempFolderPath}
                  onChange={e => setTempFolderPath(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md bg-[#111] border border-[#333] text-xs text-[#fafafa] font-mono focus:outline-hidden"
                />
              ) : (
                <p className="text-xs font-mono text-[#fafafa] truncate">
                  {oneDriveProvider.syncFolder}
                </p>
              )}
            </div>

            {/* Card Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleHealthCheck('onedrive')}
                className="text-xs text-[#888] hover:text-[#fafafa] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Testar Conexão</span>
              </button>

              <button
                id="btn-open-onedrive-auth-storage"
                onClick={onOpenOneDriveAuth}
                className={`text-xs transition-colors cursor-pointer font-semibold flex items-center gap-1.5 ${
                  oneDriveProvider.connected
                    ? 'text-[#888] hover:text-[#fafafa]'
                    : 'text-cyan-400 hover:text-cyan-300'
                }`}
              >
                <div className="w-3 h-3 grid grid-cols-2 gap-0.5 shrink-0">
                  <div className="bg-[#F25022] rounded-[0.5px]"></div>
                  <div className="bg-[#7FBA00] rounded-[0.5px]"></div>
                  <div className="bg-[#00A4EF] rounded-[0.5px]"></div>
                  <div className="bg-[#FFB900] rounded-[0.5px]"></div>
                </div>
                <span>
                  {oneDriveProvider.connected
                    ? 'Alternar Conta do OneDrive →'
                    : 'Autenticar com o OneDrive →'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
