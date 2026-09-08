import React, { useState, useEffect } from 'react';
import { SyncProvider, useSync } from './context/SyncContext';
import { Header } from './components/Header';
import { VercelTabs, TabKey } from './components/VercelTabs';
import { OverviewDashboard } from './components/OverviewDashboard';
import { RealTimeUploadManager } from './components/RealTimeUploadManager';
import { IosFilePicker } from './components/IosFilePicker';
import { SchedulerSettings } from './components/SchedulerSettings';
import { StorageProvidersConfig } from './components/StorageProvidersConfig';
import { SyncHistoryView } from './components/SyncHistoryView';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { OneDriveAuthModal } from './components/OneDriveAuthModal';
import { E2EESecurityModal } from './components/E2EESecurityModal';
import { NotificationToast } from './components/NotificationToast';
import { IPhoneMockup } from './components/IPhoneMockup';
import { ZeroKnowledgeMediaViewer } from './components/ZeroKnowledgeMediaViewer';
import { RestoreModal } from './components/RestoreModal';
import {
  ShieldCheck,
  Command,
  Cloud,
  HardDrive,
  Lock,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  FolderDown,
  Eye,
  Sparkles
} from 'lucide-react';

function SyncMainApp() {
  const {
    viewMode,
    setViewMode,
    viewerFile,
    closeViewer,
    openViewer,
    files
  } = useSync();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [googleAuthOpen, setGoogleAuthOpen] = useState(false);
  const [oneDriveAuthOpen, setOneDriveAuthOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-black text-[#fafafa] flex flex-col vercel-grid selection:bg-[#222] selection:text-white">
      {/* Header */}
      <Header
        onOpenGoogleAuth={() => setGoogleAuthOpen(true)}
        onOpenSecurityModal={() => setSecurityModalOpen(true)}
        onOpenNotifications={() => setNotificationCenterOpen(true)}
        onNavigateToStorage={() => {
          setViewMode('dashboard');
          setActiveTab('storage');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main View Area */}
      {viewMode === 'iphone_mockup' ? (
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          <IPhoneMockup
            onOpenGoogleAuth={() => setGoogleAuthOpen(true)}
            onOpenSecurityModal={() => setSecurityModalOpen(true)}
          />
        </main>
      ) : (
        <>
          {/* Tabs */}
          <VercelTabs activeTab={activeTab} onSelectTab={setActiveTab} />

          {/* Tab Body */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'overview' && (
              <OverviewDashboard
                onNavigateTab={setActiveTab}
                onOpenSecurityModal={() => setSecurityModalOpen(true)}
                onOpenRestoreModal={() => setRestoreModalOpen(true)}
              />
            )}

            {activeTab === 'queue' && <RealTimeUploadManager />}

            {activeTab === 'files' && <IosFilePicker />}

            {activeTab === 'scheduler' && <SchedulerSettings />}

            {activeTab === 'storage' && (
              <StorageProvidersConfig
                onOpenGoogleAuth={() => setGoogleAuthOpen(true)}
                onOpenOneDriveAuth={() => setOneDriveAuthOpen(true)}
              />
            )}

            {activeTab === 'history' && <SyncHistoryView />}
          </main>
        </>
      )}

      {/* Modals & Overlays */}
      <GoogleAuthModal
        isOpen={googleAuthOpen}
        onClose={() => setGoogleAuthOpen(false)}
      />

      <OneDriveAuthModal
        isOpen={oneDriveAuthOpen}
        onClose={() => setOneDriveAuthOpen(false)}
      />

      <E2EESecurityModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />

      <NotificationToast
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
      />

      <RestoreModal
        isOpen={restoreModalOpen}
        onClose={() => setRestoreModalOpen(false)}
        onOpenViewer={openViewer}
      />

      {/* Zero-Knowledge In-Memory RAM Viewer */}
      <ZeroKnowledgeMediaViewer
        file={viewerFile}
        onClose={closeViewer}
      />

      {/* Command Palette (⌘K) */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
          <div className="bg-[#111] border border-[#333] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-3.5 border-b border-[#333] flex items-center gap-2.5">
              <Command className="w-4 h-4 text-[#888]" />
              <input
                autoFocus
                placeholder="Navegar no Sync (ex: restaurar, fotos, agendamento, drive)..."
                className="w-full bg-transparent text-xs text-[#fafafa] placeholder-[#666] focus:outline-hidden"
              />
              <span className="text-[10px] text-[#666] font-mono px-1.5 py-0.5 rounded border border-[#333] bg-[#1a1a1a]">ESC</span>
            </div>
            <div className="p-2 space-y-1 text-xs">
              <button
                onClick={() => {
                  setRestoreModalOpen(true);
                  setCommandPaletteOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-[#1a1a1a] flex items-center justify-between transition-colors cursor-pointer font-medium"
              >
                <div className="flex items-center gap-2">
                  <FolderDown className="w-4 h-4" />
                  <span>Restauração & Download Decifrado (One-Click)</span>
                </div>
                <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded font-mono">1-Click</span>
              </button>
              <button
                onClick={() => {
                  const samplePhoto = files.find(f => f.category === 'photos');
                  if (samplePhoto) openViewer(samplePhoto);
                  setCommandPaletteOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-[#1a1a1a] flex items-center justify-between transition-colors cursor-pointer font-medium"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>Visualizador Seguro em Memória (Zero-Knowledge)</span>
                </div>
                <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded font-mono">RAM</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('overview');
                  setViewMode('dashboard');
                  setCommandPaletteOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-[#888] hover:text-[#fafafa] hover:bg-[#1a1a1a] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Ir para Visão Geral</span>
                <span className="text-[10px] text-[#666] font-mono">Tab 1</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('queue');
                  setViewMode('dashboard');
                  setCommandPaletteOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-[#888] hover:text-[#fafafa] hover:bg-[#1a1a1a] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Uploads em Tempo Real</span>
                <span className="text-[10px] text-[#666] font-mono">Tab 2</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('files');
                  setViewMode('dashboard');
                  setCommandPaletteOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-[#888] hover:text-[#fafafa] hover:bg-[#1a1a1a] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Explorar Arquivos & Fotos do iPhone</span>
                <span className="text-[10px] text-[#666] font-mono">Tab 3</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('scheduler');
                  setViewMode('dashboard');
                  setCommandPaletteOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-[#888] hover:text-[#fafafa] hover:bg-[#1a1a1a] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Configurar Agendamento Automático</span>
                <span className="text-[10px] text-[#666] font-mono">Tab 4</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('storage');
                  setViewMode('dashboard');
                  setCommandPaletteOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-[#888] hover:text-[#fafafa] hover:bg-[#1a1a1a] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Gerenciar Nuvens (Google Drive & OneDrive)</span>
                <span className="text-[10px] text-[#666] font-mono">Tab 5</span>
              </button>
              <button
                onClick={() => {
                  setSecurityModalOpen(true);
                  setCommandPaletteOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-[#888] hover:text-[#fafafa] hover:bg-[#1a1a1a] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Privacidade & Chave Mestra do Dispositivo</span>
                <span className="text-[10px] text-green-400 font-mono">Blindado</span>
              </button>
              <button
                onClick={() => {
                  setViewMode(viewMode === 'dashboard' ? 'iphone_mockup' : 'dashboard');
                  setCommandPaletteOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-[#888] hover:text-[#fafafa] hover:bg-[#1a1a1a] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Alternar Visualização (iPhone 16 Pro / Console)</span>
                <span className="text-[10px] text-[#666] font-mono">Toggle</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Elegant Dark Minimalist Footer */}
      <footer className="border-t border-[#333] bg-black py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#888]">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
              <div className="w-2.5 h-2.5 border-2 border-black border-t-transparent animate-spin rounded-full"></div>
            </div>
            <span className="text-[#fafafa] font-bold text-xs">Sync</span>
            <span className="text-[#333]">|</span>
            <span className="text-[#888]">Guarde com segurança. Restaure com autonomia</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-green-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Privacidade Absoluta no Dispositivo
            </span>
            <span className="text-[#333]">|</span>
            <span className="text-[#888]">Google Drive & OneDrive</span>
            <span className="text-[#333]">|</span>
            <span className="text-[#666] font-mono text-[11px]">⌘K para ações rápidas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <SyncProvider>
      <SyncMainApp />
    </SyncProvider>
  );
}
