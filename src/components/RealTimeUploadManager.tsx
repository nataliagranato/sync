import React, { useState } from 'react';
import { useSync } from '../context/SyncContext';
import { formatBytes } from '../services/crypto';
import {
  UploadCloud,
  Pause,
  Play,
  X,
  CheckCircle2,
  Lock,
  HardDrive,
  Cloud,
  Clock,
  Zap,
  Trash2,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

export const RealTimeUploadManager: React.FC = () => {
  const {
    uploadQueue,
    isSyncing,
    currentSpeedMbps,
    pauseJob,
    resumeJob,
    cancelJob,
    clearCompletedJobs,
    startSync,
    files
  } = useSync();

  const [expandedDetailsId, setExpandedDetailsId] = useState<string | null>(null);

  const pendingFiles = files.filter(f => f.status === 'local' || f.status === 'queued');
  const activeJobs = uploadQueue.filter(j => j.stage !== 'completed' && j.stage !== 'error');
  const completedJobs = uploadQueue.filter(j => j.stage === 'completed');

  const totalTransferred = uploadQueue.reduce((acc, j) => acc + j.transferredBytes, 0);
  const totalBytesInQueue = uploadQueue.reduce((acc, j) => acc + j.totalBytes, 0);
  const overallProgress = totalBytesInQueue > 0 ? Math.round((totalTransferred / totalBytesInQueue) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header with Control Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-[#333] bg-[#111]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#fafafa] tracking-tight">
              Gerenciador de Uploads em Tempo Real
            </h1>
            {isSyncing && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                Transmissão Ativa
              </span>
            )}
          </div>
          <p className="text-xs text-[#888] mt-1">
            Pipeline com criptografia de ponta a ponta em tempo de upload. Cada arquivo gera seu próprio IV e assinatura SHA-256.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          {pendingFiles.length > 0 && !isSyncing && (
            <button
              id="btn-queue-sync-now"
              onClick={() => startSync(undefined, 'both')}
              className="px-4 py-2 rounded-md bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Iniciar ({pendingFiles.length} pendentes)</span>
            </button>
          )}

          {completedJobs.length > 0 && (
            <button
              id="btn-clear-completed"
              onClick={clearCompletedJobs}
              className="px-3.5 py-2 rounded-md bg-[#161616] border border-[#333] text-[#888] hover:text-[#fafafa] hover:border-[#555] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Concluídos</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Progress and Speed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl border border-[#333] bg-[#111] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#888]">
            <span>Velocidade de Upload E2EE</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#fafafa]">
            {isSyncing ? `${currentSpeedMbps.toFixed(1)} MB/s` : '0.0 MB/s'}
          </div>
          <p className="text-[11px] text-[#666]">
            Conexão TLS 1.3 multiplexada com pipeline AES
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-[#333] bg-[#111] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#888]">
            <span>Fila de Tarefas</span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-[#fafafa]">
            {activeJobs.length} ativos / {completedJobs.length} concluídos
          </div>
          <p className="text-[11px] text-[#666]">
            Total na fila: {formatBytes(totalBytesInQueue)}
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-[#333] bg-[#111] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#888]">
            <span>Progresso da Sessão</span>
            <span className="font-mono text-[#fafafa] font-semibold">{overallProgress}%</span>
          </div>
          <div className="h-2 w-full bg-[#222] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-[#666] font-mono">
            {formatBytes(totalTransferred)} de {formatBytes(totalBytesInQueue)} transmitidos
          </p>
        </div>
      </div>

      {/* Upload Queue List */}
      <div className="rounded-2xl border border-[#333] bg-[#111] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#222] bg-[#161616]/70 flex items-center justify-between text-xs font-semibold text-[#888]">
          <span>Arquivos na Fila de Upload ({uploadQueue.length})</span>
          <span className="text-[11px] text-[#666] font-mono">
            Algoritmo: AES-GCM-256 (IV aleatório por payload)
          </span>
        </div>

        {uploadQueue.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#161616] border border-[#333] flex items-center justify-center mx-auto text-[#666]">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#fafafa]">Nenhum upload em andamento</p>
            <p className="text-xs text-[#888] max-w-sm mx-auto">
              Seus backups automáticos serão exibidos aqui em tempo real. Você também pode sincronizar arquivos manualmente agora.
            </p>
            {pendingFiles.length > 0 && (
              <button
                onClick={() => startSync(undefined, 'both')}
                className="mt-2 px-5 py-2.5 rounded-md bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors cursor-pointer shadow-sm"
              >
                Sincronizar {pendingFiles.length} itens do dispositivo
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#222]">
            {uploadQueue.map(job => {
              const isExpanded = expandedDetailsId === job.id;
              return (
                <div key={job.id} className="p-5 hover:bg-[#161616]/40 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* File info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center shrink-0">
                        <Lock className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#fafafa] truncate max-w-xs sm:max-w-md">
                          {job.fileName}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-[#888] mt-0.5">
                          <span className="font-mono">{formatBytes(job.totalBytes)}</span>
                          <span className="text-[#444]">•</span>
                          <span className="flex items-center gap-1">
                            {job.target === 'google_drive' ? (
                              <Cloud className="w-3 h-3 text-blue-400" />
                            ) : (
                              <HardDrive className="w-3 h-3 text-cyan-400" />
                            )}
                            <span className="capitalize">
                              {job.target === 'google_drive' ? 'Google Drive' : 'OneDrive'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stage & Progress */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {job.stage === 'encrypting' && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                              Criptografando...
                            </span>
                          )}
                          {job.stage === 'uploading' && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                              Enviando ({job.speedMbps.toFixed(1)} MB/s)
                            </span>
                          )}
                          {job.stage === 'verifying' && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-purple-400 font-mono">
                              Verificando SHA-256...
                            </span>
                          )}
                          {job.stage === 'completed' && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-green-500 font-mono font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Sincronizado
                            </span>
                          )}
                          {job.stage === 'paused' && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#888] font-mono">
                              Pausado
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#666] font-mono mt-0.5">
                          {job.progress}% • ETA {job.etaSeconds}s
                        </p>
                      </div>

                      {/* Job Controls */}
                      <div className="flex items-center gap-1">
                        {job.stage === 'uploading' && (
                          <button
                            onClick={() => pauseJob(job.id)}
                            className="p-1.5 text-[#888] hover:text-[#fafafa] hover:bg-[#222] rounded transition-colors cursor-pointer"
                            title="Pausar upload"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {job.stage === 'paused' && (
                          <button
                            onClick={() => resumeJob(job.id)}
                            className="p-1.5 text-[#888] hover:text-[#fafafa] hover:bg-[#222] rounded transition-colors cursor-pointer"
                            title="Retomar upload"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {job.stage !== 'completed' && (
                          <button
                            onClick={() => cancelJob(job.id)}
                            className="p-1.5 text-[#888] hover:text-rose-400 hover:bg-[#222] rounded transition-colors cursor-pointer"
                            title="Cancelar upload"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-200 ${
                        job.stage === 'completed'
                          ? 'bg-emerald-500'
                          : job.stage === 'encrypting'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${job.progress}%` }}
                    ></div>
                  </div>

                  {/* Toggle Cryptographic details button */}
                  <div className="flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => setExpandedDetailsId(isExpanded ? null : job.id)}
                      className="text-[#888] hover:text-[#fafafa] font-mono transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <KeyRound className="w-3 h-3" />
                      <span>{isExpanded ? 'Ocultar detalhes de criptografia' : 'Ver IV & SHA-256 E2EE'}</span>
                    </button>
                    <span className="text-[#666] font-mono">
                      {formatBytes(job.transferredBytes)} / {formatBytes(job.totalBytes)}
                    </span>
                  </div>

                  {/* Expanded Cryptographic Metadata Card */}
                  {isExpanded && (
                    <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-[#222] font-mono text-[10px] space-y-1.5 text-[#888] animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[#666]">Vetor de Inicialização (IV 96-bit):</span>
                        <span className="text-green-400 truncate max-w-xs">{job.ivHex || 'Gerando...'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#666]">Hash SHA-256 do Ciphertext:</span>
                        <span className="text-blue-400 truncate max-w-xs">{job.checksum || 'Calculando em tempo real...'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#666] pt-1.5 border-t border-[#222]">
                        <span>Zero-Knowledge: O provedor {job.target} recebe apenas o payload encriptado.</span>
                        <ShieldCheck className="w-3 h-3 text-green-400" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
