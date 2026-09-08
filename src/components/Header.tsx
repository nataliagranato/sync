import React, { useState } from 'react';
import { useSync } from '../context/SyncContext';
import {
  ShieldCheck,
  Lock,
  Smartphone,
  LayoutDashboard,
  Cloud,
  HardDrive,
  Bell,
  Key,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  LogOut,
  Loader2
} from 'lucide-react';
import { formatBytes } from '../services/crypto';

interface HeaderProps {
  onOpenGoogleAuth: () => void;
  onOpenSecurityModal: () => void;
  onOpenNotifications: () => void;
  onNavigateToStorage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGoogleAuth,
  onOpenSecurityModal,
  onOpenNotifications,
  onNavigateToStorage
}) => {
  const {
    user,
    cryptoConfig,
    viewMode,
    setViewMode,
    storageProviders,
    notifications,
    uploadQueue,
    isSyncing,
    logoutGoogle,
    loginWithGoogle,
    isAuthLoading
  } = useSync();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch {
      // If error or blocked popup, open modal for troubleshooting / retry
      onOpenGoogleAuth();
    }
  };

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const activeJobsCount = uploadQueue.filter(j => j.stage !== 'completed' && j.stage !== 'error').length;

  const googleProvider = storageProviders.find(p => p.id === 'google_drive');
  const oneDriveProvider = storageProviders.find(p => p.id === 'onedrive');

  return (
    <header className="border-b border-[#333] bg-black/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand / Breadcrumbs */}
          <div className="flex items-center space-x-3">
            {/* Elegant Dark Animated Spinner Logo */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black shadow-sm shrink-0">
              <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin rounded-full"></div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-base font-bold tracking-tight text-[#fafafa] flex items-center gap-2">
                Sync
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#1a1a1a] text-[#888] border border-[#333] uppercase tracking-wider">
                  Blindado
                </span>
              </span>
              <span className="text-[#444]">/</span>
              <span className="text-xs text-[#888] font-medium hidden sm:inline-block">
                Backup Privado Multiplataforma
              </span>
            </div>
          </div>

          {/* Center: Realtime Status Indicators */}
          <div className="hidden md:flex items-center space-x-3 text-xs">
            {/* Shielded Privacy badge */}
            <button
              id="header-security-badge"
              onClick={onOpenSecurityModal}
              className="flex items-center space-x-2 px-3 py-1 rounded-md bg-[#111] border border-[#333] text-[#888] hover:text-[#fafafa] hover:border-[#444] transition-colors cursor-pointer"
              title="Privacidade Total: Chaves geradas e mantidas exclusivamente no seu dispositivo"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[11px] font-semibold text-[#fafafa]">Proteção Blindada</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            </button>

            {/* Cloud Destinations Status */}
            <div className="flex items-center space-x-2.5 bg-[#111] px-3 py-1 rounded-md border border-[#333]">
              <div className="flex items-center space-x-1.5" title="Google Drive conectado">
                <Cloud className={`w-3.5 h-3.5 ${googleProvider?.connected ? 'text-blue-500' : 'text-[#666]'}`} />
                <span className="text-[11px] text-[#fafafa]">G-Drive</span>
                {googleProvider?.connected && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
              </div>
              <span className="text-[#333]">|</span>
              <div className="flex items-center space-x-1.5" title="OneDrive conectado">
                <HardDrive className={`w-3.5 h-3.5 ${oneDriveProvider?.connected ? 'text-cyan-500' : 'text-[#666]'}`} />
                <span className="text-[11px] text-[#fafafa]">OneDrive</span>
                {oneDriveProvider?.connected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>}
              </div>
            </div>

            {/* Active Sync Pulse */}
            {isSyncing && (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                <span>SYNCING ({activeJobsCount})</span>
              </div>
            )}
          </div>

          {/* Right: Controls, View Mode, Auth */}
          <div className="flex items-center space-x-2.5">
            {/* View Mode Toggle: Dashboard vs iPhone Simulator */}
            <div className="bg-[#111] border border-[#333] rounded-md p-0.5 flex items-center">
              <button
                id="btn-view-dashboard"
                onClick={() => setViewMode('dashboard')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'dashboard'
                    ? 'bg-white text-black font-semibold shadow-xs'
                    : 'text-[#888] hover:text-[#fafafa]'
                }`}
                title="Console de Engenharia Vercel"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Console</span>
              </button>
              <button
                id="btn-view-mobile"
                onClick={() => setViewMode('iphone_mockup')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'iphone_mockup'
                    ? 'bg-white text-black font-semibold shadow-xs'
                    : 'text-[#888] hover:text-[#fafafa]'
                }`}
                title="Visualização em Dispositivo Móvel"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            {/* Encryption Key Button */}
            <button
              id="btn-security-key"
              onClick={onOpenSecurityModal}
              className="p-2 text-[#888] hover:text-[#fafafa] hover:bg-[#111] border border-[#333] rounded-md transition-colors cursor-pointer"
              title="Chave de Criptografia E2EE & Recuperação"
            >
              <Key className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <button
              id="btn-notifications"
              onClick={onOpenNotifications}
              className="relative p-2 text-[#888] hover:text-[#fafafa] hover:bg-[#111] border border-[#333] rounded-md transition-colors cursor-pointer"
              title="Notificações de sincronização"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-black"></span>
              )}
            </button>

            {/* Cloud User Profile / Login */}
            {user.isGoogleAuthenticated || user.isOneDriveAuthenticated ? (
              <div className="relative">
                <button
                  id="btn-user-profile"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 pl-2 pr-2 py-1.5 rounded-md bg-[#111] border border-[#333] hover:border-[#444] transition-colors text-left cursor-pointer"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-[#444]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-cyan-600/30 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-[10px] font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs text-[#fafafa] font-medium max-w-[100px] truncate hidden md:inline">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#888]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#111] border border-[#333] shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="px-3.5 py-2.5 border-b border-[#222]">
                      <div className="text-[10px] uppercase text-[#666] mb-0.5 font-bold tracking-wider">Conta Conectada</div>
                      <p className="text-xs font-semibold text-[#fafafa]">{user.name}</p>
                      <p className="text-[11px] text-[#888] truncate">{user.email || 'Autenticado'}</p>
                      <div className="mt-2 flex items-center gap-2">
                        {googleProvider?.connected ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-green-400 font-mono bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Drive
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#666] font-mono bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-[#333]">
                            Drive OFF
                          </span>
                        )}
                        {oneDriveProvider?.connected ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                            <CheckCircle2 className="w-2.5 h-2.5" /> OneDrive
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#666] font-mono bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-[#333]">
                            OneDrive OFF
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="px-1.5 py-1 space-y-0.5">
                      <button
                        id="btn-manage-clouds"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigateToStorage();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-[#888] hover:text-white hover:bg-[#1a1a1a] rounded-md transition-colors cursor-pointer flex items-center gap-2 font-medium"
                      >
                        <Cloud className="w-3.5 h-3.5 text-sky-400" />
                        <span>Gerenciar Nuvens</span>
                      </button>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenSecurityModal();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-[#888] hover:text-white hover:bg-[#1a1a1a] rounded-md transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <Key className="w-3.5 h-3.5 text-green-400" />
                        <span>Configurar Chave E2EE</span>
                      </button>

                      <div className="my-1 border-t border-[#222]" />

                      <button
                        id="btn-logout-header"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logoutGoogle();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sair / Desconectar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="btn-login-google-header"
                onClick={handleGoogleLogin}
                disabled={isAuthLoading}
                className="flex items-center space-x-2 px-4 py-2 rounded-md bg-white text-black text-xs font-semibold hover:bg-zinc-200 disabled:opacity-60 transition-colors shadow-sm cursor-pointer"
              >
                {isAuthLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                ) : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>{isAuthLoading ? 'Abrindo Google...' : 'Entrar com Google'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
