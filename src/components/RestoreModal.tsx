import React, { useState } from 'react';
import { useSync } from '../context/SyncContext';
import { formatBytes } from '../services/crypto';
import { FileItem, IosCategory } from '../types';
import {
  Download,
  CheckCircle2,
  Lock,
  Smartphone,
  ShieldCheck,
  FolderDown,
  RefreshCw,
  Image,
  Video,
  Users,
  FileText,
  X,
  AlertCircle,
  Eye
} from 'lucide-react';

interface RestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenViewer?: (file: FileItem) => void;
}

export const RestoreModal: React.FC<RestoreModalProps> = ({ isOpen, onClose, onOpenViewer }) => {
  const { files, restoreFile, restoreAllSyncedFiles, restoreProgress, openViewer } = useSync();

  const [selectedCategory, setSelectedCategory] = useState<IosCategory | 'all'>('all');
  const [restoringFileId, setRestoringFileId] = useState<string | null>(null);

  if (!isOpen) return null;

  const syncedFiles = files.filter(f => f.status === 'synced');
  const filteredFiles = syncedFiles.filter(f => {
    if (selectedCategory === 'all') return true;
    return f.category === selectedCategory;
  });

  const totalBytes = syncedFiles.reduce((acc, f) => acc + f.originalSize, 0);

  const handleRestoreSingle = async (fileId: string) => {
    setRestoringFileId(fileId);
    try {
      await restoreFile(fileId);
    } finally {
      setRestoringFileId(null);
    }
  };

  const handleRestoreAll = async () => {
    await restoreAllSyncedFiles();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#111] border border-[#333] rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold">
              <FolderDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#fafafa] tracking-tight">
                Restauração & Download Decifrado (One-Click Restore)
              </h2>
              <p className="text-xs text-[#888]">
                Recupere suas fotos, vídeos e contatos decifrados diretamente no seu dispositivo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#888] hover:text-[#fafafa] p-1 text-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Restore Overview Stats */}
        <div className="p-4 rounded-xl bg-[#161616] border border-[#333] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] text-[#888] uppercase font-semibold block">Pronto para Recuperação</span>
            <p className="text-sm font-bold text-[#fafafa]">
              {syncedFiles.length} arquivos seguros • {formatBytes(totalBytes)}
            </p>
            <p className="text-[11px] text-green-400 font-medium">
              Cópia íntegra espelhada no Google Drive e OneDrive
            </p>
          </div>

          <button
            onClick={handleRestoreAll}
            disabled={restoreProgress.isRestoring || syncedFiles.length === 0}
            className="px-4 py-2.5 rounded-md bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 shrink-0"
          >
            {restoreProgress.isRestoring ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Restaurando Todos...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Restaurar Tudo (1-Click)</span>
              </>
            )}
          </button>
        </div>

        {/* Live Progress feedback if restoring */}
        {restoreProgress.isRestoring && (
          <div className="p-4 rounded-xl bg-[#141414] border border-blue-500/30 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#fafafa]">
              <span className="font-semibold flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                Decifrando e restaurando: {restoreProgress.activeFileName || 'Arquivo'}
              </span>
              <span className="font-mono text-[#888]">
                {restoreProgress.restoredCount} de {restoreProgress.totalToRestore}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{
                  width: `${(restoreProgress.restoredCount / Math.max(1, restoreProgress.totalToRestore)) * 100}%`
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: `Todos (${syncedFiles.length})` },
            { id: 'photos', label: `Fotos (${syncedFiles.filter(f => f.category === 'photos').length})` },
            { id: 'videos', label: `Vídeos (${syncedFiles.filter(f => f.category === 'videos').length})` },
            { id: 'contacts', label: `Contatos (${syncedFiles.filter(f => f.category === 'contacts').length})` },
            { id: 'documents', label: `Documentos (${syncedFiles.filter(f => f.category === 'documents').length})` }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-white text-black'
                  : 'bg-[#161616] text-[#888] hover:text-[#fafafa] border border-[#222]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Synced Files List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredFiles.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#666] space-y-2">
              <AlertCircle className="w-6 h-6 mx-auto text-[#444]" />
              <p>Nenhum arquivo sincronizado nesta categoria ainda.</p>
              <p className="text-[11px] text-[#555]">Execute o backup para sincronizar fotos e contatos da galeria.</p>
            </div>
          ) : (
            filteredFiles.map(file => {
              const isItemRestoring = restoringFileId === file.id;
              return (
                <div
                  key={file.id}
                  className="p-3.5 rounded-xl bg-[#161616] border border-[#222] hover:border-[#333] transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {file.thumbnailUrl ? (
                      <img
                        src={file.thumbnailUrl}
                        alt={file.name}
                        className="w-10 h-10 rounded-lg object-cover border border-[#333] shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center text-[#888] shrink-0">
                        {file.category === 'photos' && <Image className="w-4 h-4" />}
                        {file.category === 'videos' && <Video className="w-4 h-4" />}
                        {file.category === 'contacts' && <Users className="w-4 h-4" />}
                        {file.category === 'documents' && <FileText className="w-4 h-4" />}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="font-semibold text-[#fafafa] truncate">{file.name}</p>
                      <p className="text-[11px] text-[#666] font-mono truncate">
                        {formatBytes(file.originalSize)} • Salvo em {file.lastSyncedAt || 'Hoje'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onClose();
                        openViewer(file);
                      }}
                      className="p-2 rounded-md bg-[#111] border border-[#333] text-[#888] hover:text-[#fafafa] transition-colors cursor-pointer"
                      title="Visualizar em Memória (Zero-Knowledge)"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleRestoreSingle(file.id)}
                      disabled={isItemRestoring || restoreProgress.isRestoring}
                      className="px-3 py-1.5 rounded-md bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Restaurar e baixar no dispositivo"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isItemRestoring ? 'Decifrando...' : 'Restaurar'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
