import React from 'react';
import { AlertTriangle, Replace, Ban, HardDrive, Clock, File } from 'lucide-react';
import { formatBytes } from '../services/crypto';

export interface ConflictDetails {
  fileName: string;
  fileSize: number;
  existingSize?: number;
  existingModifiedTime?: string;
  targetFolder?: string;
  onReplace: () => void;
  onSkip: () => void;
}

interface ConflictModalProps {
  conflict: ConflictDetails | null;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({ conflict }) => {
  if (!conflict) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#161618] border border-[#2e2e32] rounded-2xl p-6 shadow-2xl space-y-5 text-white">
        
        {/* Header with Icon */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Arquivo já existe no Google Drive
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Identificamos que um arquivo com o mesmo nome já está presente na sua pasta do Google Drive.
            </p>
          </div>
        </div>

        {/* File Comparison Card */}
        <div className="bg-[#1f1f23] rounded-xl p-4 border border-[#2a2a2e] space-y-3">
          <div className="flex items-center gap-2.5 text-xs text-zinc-200 font-medium">
            <File className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate font-mono font-semibold text-white" title={conflict.fileName}>
              {conflict.fileName}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2a2a2e] text-[11px]">
            <div className="bg-[#141416] p-2.5 rounded-lg border border-[#27272b]">
              <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">Novo Arquivo</span>
              <span className="text-zinc-200 font-medium mt-0.5 block">{formatBytes(conflict.fileSize)}</span>
            </div>

            <div className="bg-[#141416] p-2.5 rounded-lg border border-[#27272b]">
              <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">No Google Drive</span>
              <span className="text-zinc-200 font-medium mt-0.5 block">
                {conflict.existingSize ? formatBytes(conflict.existingSize) : 'Já armazenado'}
              </span>
            </div>
          </div>

          {conflict.existingModifiedTime && (
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 pt-1">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span>Modificado no Drive em: {new Date(conflict.existingModifiedTime).toLocaleString('pt-BR')}</span>
            </div>
          )}

          {conflict.targetFolder && (
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
              <HardDrive className="w-3 h-3 text-zinc-500" />
              <span>Pasta destino: <strong className="text-zinc-300">{conflict.targetFolder}</strong></span>
            </div>
          )}
        </div>

        <p className="text-xs text-zinc-400">
          Como você deseja proceder para esta sincronização?
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            type="button"
            onClick={conflict.onSkip}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-[#3a3a3e] bg-[#222226] hover:bg-[#2c2c32] text-zinc-300 hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Ban className="w-4 h-4 text-zinc-400" />
            Não enviá-lo
          </button>

          <button
            type="button"
            onClick={conflict.onReplace}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-900/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Replace className="w-4 h-4 text-white" />
            Substituir arquivo
          </button>
        </div>

      </div>
    </div>
  );
};
