import React from 'react';
import { useSync } from '../context/SyncContext';
import { formatBytes } from '../services/crypto';
import {
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
  Clock,
  HardDrive,
  Cloud,
  Smartphone,
  ArrowRight,
  Activity,
  Layers,
  Sparkles,
  Play,
  FolderDown,
  Eye,
  RefreshCw
} from 'lucide-react';
import { TabKey } from './VercelTabs';

interface OverviewDashboardProps {
  onNavigateTab: (tab: TabKey) => void;
  onOpenSecurityModal: () => void;
  onOpenRestoreModal?: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onNavigateTab,
  onOpenSecurityModal,
  onOpenRestoreModal
}) => {
  const {
    files,
    storageProviders,
    schedule,
    updateSchedule,
    history,
    isSyncing,
    startSync,
    currentSpeedMbps,
    deduplicationStats,
    runDeduplicationScan,
    openViewer,
    loadSampleFiles,
    clearAllFiles
  } = useSync();

  const totalFiles = files.length;
  const syncedFiles = files.filter(f => f.status === 'synced');
  const pendingFiles = files.filter(f => f.status === 'local' || f.status === 'queued');
  
  const totalProtectedBytes = syncedFiles.reduce((sum, f) => sum + (f.encryptedSize || f.originalSize), 0);
  const totalPendingBytes = pendingFiles.reduce((sum, f) => sum + f.originalSize, 0);

  const photosCount = files.filter(f => f.category === 'photos').length;
  const videosCount = files.filter(f => f.category === 'videos').length;
  const contactsCount = files.filter(f => f.category === 'contacts').length;
  const docsCount = files.filter(f => f.category === 'documents').length;

  const googleProvider = storageProviders.find(p => p.id === 'google_drive');
  const oneDriveProvider = storageProviders.find(p => p.id === 'onedrive');

  const latestHistory = history[0];

  const firstSyncedPhoto = files.find(f => f.category === 'photos' && f.status === 'synced') || files.find(f => f.category === 'photos');

  return (
    <div className="space-y-6">
      {/* Top Banner: Quick Sync Action & Real-time status */}
      <div className="rounded-2xl border border-[#333] bg-[#111] p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                ATIVO • Blindagem de Privacidade
              </span>
              <span className="text-xs text-[#888] font-medium">
                Proteção em Qualquer Dispositivo
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fafafa]">
              Guarde o que importa. Restaure quando precisar.
            </h1>
            <p className="text-xs sm:text-sm text-[#bbb] font-medium leading-relaxed">
              Sem esforço, sem interrupções. A arte de proteger seus dados com a simplicidade que você sempre quis.
            </p>
            <p className="text-xs sm:text-sm text-[#888] leading-relaxed">
              Fotos, vídeos, contatos e documentos são lacrados com chave exclusiva no seu dispositivo antes de qualquer envio ao Google Drive e OneDrive. Nem os provedores nem intermediários têm acesso ao seu conteúdo.
            </p>
          </div>

          {/* Sync Trigger Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              id="btn-sync-all-both"
              disabled={isSyncing || pendingFiles.length === 0}
              onClick={() => startSync(undefined, 'both')}
              className={`px-5 py-2.5 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                isSyncing
                  ? 'bg-[#1a1a1a] text-[#666] cursor-not-allowed border border-[#333]'
                  : pendingFiles.length === 0
                  ? 'bg-[#1a1a1a] text-[#666] cursor-not-allowed border border-[#333]'
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              {isSyncing ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-[#888]" />
                  <span>Protegendo & Enviando...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Sincronizar Tudo ({pendingFiles.length} pendentes)</span>
                </>
              )}
            </button>

            <button
              id="btn-view-queue"
              onClick={() => onNavigateTab('queue')}
              className="px-4 py-2.5 rounded-md text-xs font-semibold bg-[#111] border border-[#333] text-[#fafafa] hover:border-[#555] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Fila em Tempo Real</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Bandwidth Indicator if syncing */}
        {isSyncing && (
          <div className="mt-6 pt-4 border-t border-[#222] flex flex-wrap items-center justify-between text-xs text-[#888]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              <span className="text-[#fafafa] font-medium">Taxa de Transferência Ativa:</span>
              <span className="font-mono text-blue-400">{currentSpeedMbps.toFixed(1)} MB/s</span>
            </div>
            <div className="text-[#888] text-[11px] font-medium">
              Transferência Blindada de Ponta a Ponta
            </div>
          </div>
        )}
      </div>

      {/* Background Backup Continuity Banner */}
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-950/20 via-[#111] to-[#111] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#fafafa]">Backup em Segundo Plano ao Sair</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                schedule.runOnAppClose
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}>
                {schedule.runOnAppClose ? 'Proteção Contínua Ativa' : 'Pausado'}
              </span>
            </div>
            <p className="text-xs text-[#888] mt-0.5">
              Caso você saia ou feche o app, o backup continuará em segundo plano. Sem esforço, sem interrupções.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            id="btn-toggle-bg-backup"
            onClick={() => updateSchedule({ runOnAppClose: !schedule.runOnAppClose })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              schedule.runOnAppClose
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                : 'bg-[#222] hover:bg-[#333] text-[#aaa] border border-[#333]'
            }`}
          >
            <span>{schedule.runOnAppClose ? 'Ativado ao Sair/Fechar' : 'Ativar Backup em Segundo Plano'}</span>
          </button>
        </div>
      </div>

      {/* 3 Dedicated Feature Highlights: Restore, Deduplication, Zero-Knowledge Viewer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Feature 1: One-Click Restore */}
        <div className="rounded-2xl border border-[#333] bg-[#111] p-5 flex flex-col justify-between space-y-4 hover:border-[#444] transition-colors">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FolderDown className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-[#fafafa] tracking-tight">
              Restauração & Download Decifrado (One-Click)
            </h2>
            <p className="text-xs text-[#888] leading-relaxed">
              Recupere fotos, vídeos e catálogo de contatos com decodificação no próprio dispositivo, sem depender de servidores terceiros.
            </p>
          </div>
          <button
            onClick={() => onOpenRestoreModal ? onOpenRestoreModal() : onNavigateTab('files')}
            className="w-full py-2 px-3 rounded-lg bg-[#161616] border border-[#333] text-xs font-semibold text-[#fafafa] hover:border-[#555] hover:bg-[#222] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <FolderDown className="w-3.5 h-3.5 text-blue-400" />
            <span>Abrir Central de Restauração</span>
          </button>
        </div>

        {/* Feature 2: Content-Addressable Deduplication */}
        <div className="rounded-2xl border border-[#333] bg-[#111] p-5 flex flex-col justify-between space-y-4 hover:border-[#444] transition-colors">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#fafafa] tracking-tight">
                Deduplicação Inteligente no Dispositivo
              </h2>
              <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                {deduplicationStats.enabled ? 'Ativa' : 'Pausada'}
              </span>
            </div>
            <p className="text-xs text-[#888] leading-relaxed">
              Evita uploads repetidos calculando digests criptográficos antes de gastar largura de banda ou plano móvel.
            </p>
            <div className="text-[11px] font-mono text-[#888] pt-1">
              Economia: <span className="text-white font-semibold">{formatBytes(deduplicationStats.savedBytes)}</span> • {deduplicationStats.skippedFilesCount} envios evitados
            </div>
          </div>
          <button
            onClick={() => runDeduplicationScan()}
            className="w-full py-2 px-3 rounded-lg bg-[#161616] border border-[#333] text-xs font-semibold text-[#fafafa] hover:border-[#555] hover:bg-[#222] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-green-400" />
            <span>Verificar Duplicatas Locais</span>
          </button>
        </div>

        {/* Feature 3: Zero-Knowledge RAM Viewer */}
        <div className="rounded-2xl border border-[#333] bg-[#111] p-5 flex flex-col justify-between space-y-4 hover:border-[#444] transition-colors">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Eye className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-[#fafafa] tracking-tight">
              Visualizador Seguro em Memória
            </h2>
            <p className="text-xs text-[#888] leading-relaxed">
              Inspecione mídias decifrando os bytes exclusivamente na memória RAM, sem salvar arquivos temporários desprotegidos no disco.
            </p>
          </div>
          <button
            onClick={() => firstSyncedPhoto ? openViewer(firstSyncedPhoto) : onNavigateTab('files')}
            className="w-full py-2 px-3 rounded-lg bg-[#161616] border border-[#333] text-xs font-semibold text-[#fafafa] hover:border-[#555] hover:bg-[#222] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span>Visualizar Mídia em Memória</span>
          </button>
        </div>
      </div>

      {/* 4 Elegant Dark KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Protected */}
        <div className="rounded-2xl border border-[#333] bg-[#111] p-6 space-y-3 hover:border-[#444] transition-colors">
          <div className="flex items-center justify-between text-[#888] text-xs">
            <span className="font-medium">Protegido no Cofre</span>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-green-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fafafa] font-mono">
              {formatBytes(totalProtectedBytes)}
            </span>
          </div>
          <p className="text-[11px] text-[#666]">
            {syncedFiles.length === 0
              ? 'Nenhum arquivo sincronizado ainda.'
              : `${syncedFiles.length} de ${totalFiles} arquivos sincronizados com integridade.`}
          </p>
        </div>

        {/* Metric 2: Pending Upload */}
        <div className="rounded-2xl border border-[#333] bg-[#111] p-6 space-y-3 hover:border-[#444] transition-colors">
          <div className="flex items-center justify-between text-[#888] text-xs">
            <span className="font-medium">Aguardando Backup</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fafafa] font-mono">
              {formatBytes(totalPendingBytes)}
            </span>
          </div>
          <p className="text-[11px] text-[#666]">
            {pendingFiles.length === 0
              ? 'Nenhum arquivo pendente no dispositivo.'
              : `${pendingFiles.length} item(ns) locais aguardando envio.`}
          </p>
        </div>

        {/* Metric 3: Automated Schedule */}
        <div className="rounded-2xl border border-[#333] bg-[#111] p-6 space-y-3 hover:border-[#444] transition-colors">
          <div className="flex items-center justify-between text-[#888] text-xs">
            <span className="font-medium">Agendamento</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-bold tracking-tight text-[#fafafa]">
              {schedule.enabled ? 'Diário (03:00)' : 'Desativado'}
            </span>
          </div>
          <p className="text-[11px] text-[#666]">
            {schedule.wifiOnly ? 'Apenas Wi-Fi' : 'Qualquer rede'} • {schedule.chargingOnly ? 'Carregando' : 'Bateria'}
          </p>
        </div>

        {/* Metric 4: Dual Storage */}
        <div className="rounded-2xl border border-[#333] bg-[#111] p-6 space-y-3 hover:border-[#444] transition-colors">
          <div className="flex items-center justify-between text-[#888] text-xs">
            <span className="font-medium">Nuvens Conectadas</span>
            <div className="flex -space-x-1">
              <span className={`w-2.5 h-2.5 rounded-full ring-2 ring-black ${googleProvider?.connected ? 'bg-blue-500' : 'bg-zinc-700'}`}></span>
              <span className={`w-2.5 h-2.5 rounded-full ring-2 ring-black ${oneDriveProvider?.connected ? 'bg-cyan-400' : 'bg-zinc-700'}`}></span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-bold tracking-tight text-[#fafafa]">
              {googleProvider?.connected && oneDriveProvider?.connected
                ? 'Google & OneDrive'
                : googleProvider?.connected
                ? 'Google Drive'
                : oneDriveProvider?.connected
                ? 'OneDrive'
                : 'Nenhuma Conectada'}
            </span>
          </div>
          <p className="text-[11px] text-[#666]">
            {googleProvider?.connected && oneDriveProvider?.connected
              ? 'Armazenamento duplo com redundância de segurança.'
              : googleProvider?.connected
              ? `Conectado como ${googleProvider.accountEmail || 'Google Drive'}.`
              : oneDriveProvider?.connected
              ? `Conectado como ${oneDriveProvider.accountEmail || 'OneDrive'}.`
              : 'Conecte sua conta do Google Drive ou OneDrive.'}
          </p>
        </div>
      </div>

      {/* Two Column Grid: Storage Quotas + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Quotas */}
        <div className="rounded-2xl border border-[#333] bg-[#111] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#fafafa] tracking-tight flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#888]" />
              Destinos de Armazenamento
            </h2>
            <button
              onClick={() => onNavigateTab('storage')}
              className="text-xs text-[#888] hover:text-[#fafafa] transition-colors cursor-pointer"
            >
              Configurar contas →
            </button>
          </div>

          <div className="space-y-3">
            {/* Google Drive */}
            {googleProvider && (
              <div className="p-4 rounded-xl bg-[#161616] border border-[#222] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center">
                      <Cloud className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <span className="font-semibold text-[#fafafa]">{googleProvider.name}</span>
                      {googleProvider.connected && googleProvider.accountEmail && (
                        <span className="text-[10px] text-[#888] font-mono ml-1.5">({googleProvider.accountEmail})</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-[#fafafa]">
                    {googleProvider.connected
                      ? `${formatBytes(googleProvider.usedSpaceBytes)} / ${formatBytes(googleProvider.totalSpaceBytes)}`
                      : 'Não conectado'}
                  </span>
                </div>
                {/* Progress bar */}
                {googleProvider.connected && (
                  <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (googleProvider.usedSpaceBytes / (googleProvider.totalSpaceBytes || 1)) * 100
                        )}%`
                      }}
                    ></div>
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] text-[#888] pt-0.5">
                  <span>Ocupado pelo Cofre: <strong className="text-zinc-200 font-mono">{formatBytes(googleProvider.vaultUsedBytes || 0)}</strong></span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-bold tracking-wider ${
                    googleProvider.connected
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {googleProvider.connected ? 'CONNECTED' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            )}

            {/* OneDrive */}
            {oneDriveProvider && (
              <div className="p-4 rounded-xl bg-[#161616] border border-[#222] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-600/20 flex items-center justify-center">
                      <HardDrive className="w-4 h-4 text-cyan-500" />
                    </div>
                    <div>
                      <span className="font-semibold text-[#fafafa]">{oneDriveProvider.name}</span>
                      {oneDriveProvider.connected && oneDriveProvider.accountEmail && (
                        <span className="text-[10px] text-[#888] font-mono ml-1.5">({oneDriveProvider.accountEmail})</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-[#fafafa]">
                    {oneDriveProvider.connected
                      ? `${formatBytes(oneDriveProvider.usedSpaceBytes)} / ${formatBytes(oneDriveProvider.totalSpaceBytes)}`
                      : 'Não conectado'}
                  </span>
                </div>
                {/* Progress bar */}
                {oneDriveProvider.connected && (
                  <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (oneDriveProvider.usedSpaceBytes / (oneDriveProvider.totalSpaceBytes || 1)) * 100
                        )}%`
                      }}
                    ></div>
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] text-[#888] pt-0.5">
                  <span>Ocupado pelo Cofre: <strong className="text-zinc-200 font-mono">{formatBytes(oneDriveProvider.vaultUsedBytes || 0)}</strong></span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-bold tracking-wider ${
                    oneDriveProvider.connected
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {oneDriveProvider.connected ? 'CONNECTED' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Device Content Category Summary */}
        <div className="rounded-2xl border border-[#333] bg-[#111] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#fafafa] tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#888]" />
              Inventário do Dispositivo
            </h2>
            <button
              onClick={() => onNavigateTab('files')}
              className="text-xs text-[#888] hover:text-[#fafafa] transition-colors cursor-pointer"
            >
              Gerenciar arquivos →
            </button>
          </div>

          {totalFiles === 0 ? (
            <div className="p-6 rounded-xl bg-[#161616] border border-[#222] text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#fafafa]">Inventário vazio (0 arquivos)</h3>
                <p className="text-[11px] text-[#888] max-w-sm mx-auto mt-1">
                  Nenhum arquivo local foi adicionado ainda. Seus dados refletem o estado real e limpo da sua conta.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => onNavigateTab('files')}
                  className="px-3.5 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  Adicionar Arquivos do Dispositivo
                </button>
                <button
                  onClick={loadSampleFiles}
                  className="px-3 py-1.5 rounded-lg bg-[#222] text-[#888] hover:text-[#fafafa] text-xs font-medium hover:bg-[#282828] transition-colors cursor-pointer border border-[#333]"
                  title="Carregar itens fictícios para teste"
                >
                  Carregar Amostras Demonstrativas
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#161616] border border-[#222] space-y-1">
                  <span className="text-xs text-[#888]">Fotos (Alta Resolução)</span>
                  <p className="text-xl font-bold text-[#fafafa] font-mono">{photosCount}</p>
                  <p className="text-[10px] text-[#666]">Galeria & Imagens</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#161616] border border-[#222] space-y-1">
                  <span className="text-xs text-[#888]">Vídeos (4K/HDR)</span>
                  <p className="text-xl font-bold text-[#fafafa] font-mono">{videosCount}</p>
                  <p className="text-[10px] text-[#666]">Gravações & Clipes</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#161616] border border-[#222] space-y-1">
                  <span className="text-xs text-[#888]">Contatos (vCard)</span>
                  <p className="text-xl font-bold text-[#fafafa] font-mono">{contactsCount}</p>
                  <p className="text-[10px] text-[#666]">Catálogo de Contatos</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#161616] border border-[#222] space-y-1">
                  <span className="text-xs text-[#888]">Arquivos & Notas</span>
                  <p className="text-xl font-bold text-[#fafafa] font-mono">{docsCount}</p>
                  <p className="text-[10px] text-[#666]">PDFs e Documentos</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={clearAllFiles}
                  className="text-[11px] text-red-400/80 hover:text-red-300 transition-colors cursor-pointer"
                >
                  Limpar todos os arquivos
                </button>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={onOpenSecurityModal}
              className="w-full text-center py-2.5 px-3.5 rounded-lg bg-[#161616] border border-[#333] text-xs text-[#fafafa] hover:border-[#555] transition-colors flex items-center justify-center gap-2 cursor-pointer font-medium"
            >
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Gerenciar Chave de Proteção do Dispositivo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Latest Completed Sync Audit Snippet */}
      {latestHistory && (
        <div className="rounded-2xl border border-[#333] bg-[#111] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            <div>
              <span className="font-semibold text-[#fafafa]">Última Sincronização com Sucesso: </span>
              <span className="text-[#888]">{latestHistory.timestamp}</span>
              <span className="text-[#444] mx-2">•</span>
              <span className="text-[#888]">{latestHistory.filesCount} arquivos ({formatBytes(latestHistory.totalEncryptedBytes)})</span>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#666]">
            <span>Hash: {latestHistory.batchHash.substring(0, 16)}...</span>
            <button
              onClick={() => onNavigateTab('history')}
              className="text-[#888] hover:text-[#fafafa] underline ml-1 cursor-pointer"
            >
              Ver relatório
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

