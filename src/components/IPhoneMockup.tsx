import React, { useState } from 'react';
import { useSync } from '../context/SyncContext';
import { formatBytes } from '../services/crypto';
import {
  Smartphone,
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
  Lock,
  Image,
  Video,
  Users,
  HardDrive,
  Cloud,
  Clock,
  Wifi,
  Battery,
  Sliders,
  Play,
  Activity,
  Maximize2,
  LogOut,
  User
} from 'lucide-react';

interface IPhoneMockupProps {
  onOpenGoogleAuth: () => void;
  onOpenSecurityModal: () => void;
}

export const IPhoneMockup: React.FC<IPhoneMockupProps> = ({
  onOpenGoogleAuth,
  onOpenSecurityModal
}) => {
  const {
    files,
    storageProviders,
    schedule,
    updateSchedule,
    isSyncing,
    startSync,
    uploadQueue,
    currentSpeedMbps,
    user,
    logoutGoogle,
    setViewMode
  } = useSync();

  const [mobileTab, setMobileTab] = useState<'home' | 'media' | 'contacts' | 'settings'>('home');

  const pendingFiles = files.filter(f => f.status === 'local' || f.status === 'queued');
  const photos = files.filter(f => f.category === 'photos');
  const videos = files.filter(f => f.category === 'videos');
  const contacts = files.filter(f => f.category === 'contacts');

  const activeJob = uploadQueue.find(j => j.stage === 'uploading' || j.stage === 'encrypting');

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      {/* Switcher back bar */}
      <div className="mb-4 flex items-center justify-between max-w-[390px] w-full text-xs text-[#888]">
        <span className="flex items-center gap-1.5 font-semibold text-[#fafafa]">
          <Smartphone className="w-4 h-4 text-[#888]" />
          Visualização em Dispositivo Móvel
        </span>
        <button
          onClick={() => setViewMode('dashboard')}
          className="text-[#888] hover:text-[#fafafa] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Console Vercel</span>
        </button>
      </div>

      {/* Modern Smartphone Frame */}
      <div className="relative w-[380px] h-[780px] bg-black rounded-[50px] p-3 shadow-2xl ring-1 ring-[#333] border-[4px] border-[#222] overflow-hidden flex flex-col select-none">
        {/* Hardware side buttons decoration */}
        <div className="absolute -left-[7px] top-[140px] w-[3px] h-[35px] bg-[#333] rounded-l"></div>
        <div className="absolute -left-[7px] top-[190px] w-[3px] h-[55px] bg-[#333] rounded-l"></div>
        <div className="absolute -left-[7px] top-[260px] w-[3px] h-[55px] bg-[#333] rounded-l"></div>
        <div className="absolute -right-[7px] top-[180px] w-[3px] h-[75px] bg-[#333] rounded-r"></div>

        {/* Inner Screen */}
        <div className="w-full h-full bg-[#0a0a0a] rounded-[40px] overflow-hidden flex flex-col relative text-[#fafafa]">
          {/* Status Bar */}
          <div className="h-11 px-6 pt-3 flex items-center justify-between text-xs font-semibold z-20">
            <span className="tracking-tight text-[13px] text-[#fafafa]">14:27</span>

            {/* Smart Island / Dynamic Capsule */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 h-7 px-3 rounded-full bg-black border border-[#222] flex items-center gap-2 shadow-lg transition-all duration-300">
              {isSyncing ? (
                <>
                  <Lock className="w-3 h-3 text-green-400 animate-spin" />
                  <span className="text-[10px] text-white font-mono">
                    {activeJob ? `${activeJob.progress}%` : 'Sync...'}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  <span className="text-[10px] text-[#888] font-mono">Sync E2EE</span>
                </>
              )}
            </div>

            {/* Signal & Battery */}
            <div className="flex items-center gap-1.5 text-[#888]">
              <span className="text-[10px] font-mono text-[#fafafa]">5G</span>
              <Wifi className="w-3.5 h-3.5 text-[#fafafa]" />
              <Battery className="w-4 h-4 text-green-400" />
            </div>
          </div>

          {/* App Header */}
          <div className="px-5 py-2.5 border-b border-[#222] flex items-center justify-between bg-[#0a0a0a]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-white text-black flex items-center justify-center font-bold text-xs">
                S
              </div>
              <span className="font-bold text-sm tracking-tight text-[#fafafa]">Sync</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#161616] border border-[#333] text-green-400 font-mono font-bold">
                E2EE
              </span>
            </div>

            <button
              onClick={onOpenGoogleAuth}
              className="flex items-center gap-1.5 text-xs text-[#888] hover:text-[#fafafa] cursor-pointer"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-5 h-5 rounded-full object-cover border border-[#333]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center border border-[#333]">
                  <User className="w-3 h-3 text-zinc-400" />
                </div>
              )}
            </button>
          </div>

          {/* Screen Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
            {mobileTab === 'home' && (
              <>
                {/* Main Action Card */}
                <div className="p-4 rounded-2xl bg-[#111] border border-[#333] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#888]">
                      Backup do Dispositivo
                    </span>
                    <span className="text-[11px] font-mono text-green-400 flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Zero-Knowledge
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[#fafafa]">
                      {pendingFiles.length === 0 ? 'Tudo Protegido' : `${pendingFiles.length} Itens Pendentes`}
                    </h2>
                    <p className="text-xs text-[#888] mt-0.5">
                      {pendingFiles.length === 0
                        ? 'Fotos, vídeos e contatos estão seguros no Google Drive e OneDrive.'
                        : 'Fotos recentes e contatos ainda não sincronizados no cofre.'}
                    </p>
                  </div>

                  <button
                    onClick={() => startSync(undefined, 'both')}
                    disabled={isSyncing || pendingFiles.length === 0}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                      isSyncing
                        ? 'bg-[#222] text-[#666]'
                        : pendingFiles.length === 0
                        ? 'bg-[#161616] text-[#666] border border-[#222]'
                        : 'bg-white text-black hover:bg-zinc-200'
                    }`}
                  >
                    {isSyncing ? (
                      <>
                        <Activity className="w-4 h-4 animate-spin" />
                        <span>Sincronizando ({currentSpeedMbps.toFixed(1)} MB/s)...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>Fazer Backup Agora</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Cloud Destinations Status */}
                <div className="p-3.5 rounded-2xl bg-[#111] border border-[#333] space-y-2">
                  <span className="text-xs font-semibold text-[#fafafa]">Destinos Conectados</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#161616] border border-[#222] space-y-1">
                      <div className="flex items-center gap-1.5 text-blue-400">
                        <Cloud className="w-3.5 h-3.5" />
                        <span className="font-semibold">Google Drive</span>
                      </div>
                      <p className="text-[10px] text-[#888] font-mono">granatonatalia@gmail.com</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#161616] border border-[#222] space-y-1">
                      <div className="flex items-center gap-1.5 text-cyan-400">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span className="font-semibold">OneDrive</span>
                      </div>
                      <p className="text-[10px] text-[#888] font-mono">Microsoft 365</p>
                    </div>
                  </div>
                </div>

                {/* Quick categories overview */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-[#888] px-1">
                    Itens no Dispositivo
                  </span>
                  <div className="space-y-1.5">
                    <div
                      onClick={() => setMobileTab('media')}
                      className="p-3 rounded-xl bg-[#111] border border-[#333] flex items-center justify-between cursor-pointer hover:bg-[#161616] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 text-xs text-[#fafafa] font-medium">
                        <Image className="w-4 h-4 text-green-400" />
                        <span>Fotos & Vídeos do Rolo</span>
                      </div>
                      <span className="text-xs font-mono text-[#888]">
                        {photos.length + videos.length} itens
                      </span>
                    </div>

                    <div
                      onClick={() => setMobileTab('contacts')}
                      className="p-3 rounded-xl bg-[#111] border border-[#333] flex items-center justify-between cursor-pointer hover:bg-[#161616] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 text-xs text-[#fafafa] font-medium">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span>Catálogo de Contatos</span>
                      </div>
                      <span className="text-xs font-mono text-[#888]">
                        {contacts.length} fichas
                      </span>
                    </div>

                    <div
                      onClick={() => setMobileTab('settings')}
                      className="p-3 rounded-xl bg-[#111] border border-[#333] flex items-center justify-between cursor-pointer hover:bg-[#161616] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 text-xs text-[#fafafa] font-medium">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span>Agendamento Automático</span>
                      </div>
                      <span className="text-xs font-mono text-green-400 font-semibold">
                        03:00 AM
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {mobileTab === 'media' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#fafafa]">Rolo da Câmera (Fotos & Vídeos)</h3>
                  <span className="text-[11px] font-mono text-[#888]">{photos.length + videos.length} itens</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[...photos, ...videos].map(item => (
                    <div key={item.id} className="rounded-xl overflow-hidden bg-[#111] border border-[#333] relative group">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.name}
                          className="w-full h-24 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-24 flex items-center justify-center bg-[#161616] text-[#666]">
                          {item.category === 'photos' ? <Image className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                        </div>
                      )}
                      <div className="p-2 space-y-1">
                        <p className="text-[11px] font-semibold text-[#fafafa] truncate">{item.name}</p>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono text-[#888]">{formatBytes(item.originalSize)}</span>
                          {item.status === 'synced' ? (
                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                          ) : (
                            <span className="text-amber-400 font-mono font-medium">Pendente</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mobileTab === 'contacts' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#fafafa]">Contatos do Dispositivo</h3>
                  <span className="text-[11px] font-mono text-[#888]">{contacts.length} fichas</span>
                </div>

                <div className="space-y-2">
                  {contacts.map(c => (
                    <div key={c.id} className="p-3 rounded-xl bg-[#111] border border-[#333] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#222] border border-[#333] flex items-center justify-center text-[#fafafa] font-bold">
                          {c.name.substring(0, 1)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#fafafa]">{c.name}</p>
                          <p className="text-[10px] text-[#888] font-mono">{c.contactDetails?.phone}</p>
                        </div>
                      </div>
                      {c.status === 'synced' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <span className="text-[10px] font-mono text-amber-400 font-medium">Pendente</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mobileTab === 'settings' && (
              <div className="space-y-3 text-xs">
                <h3 className="font-bold text-[#fafafa]">Ajustes do Sync</h3>
                
                {/* Account card with Logout */}
                <div className="p-3 rounded-xl bg-[#111] border border-[#333] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-500/50"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center ring-1 ring-[#444]">
                          <User className="w-4 h-4 text-zinc-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-[#fafafa] text-xs leading-none">
                          {user.isGoogleAuthenticated ? user.name : 'Não Conectado'}
                        </p>
                        <p className="text-[10px] text-[#888] truncate max-w-[150px]">
                          {user.isGoogleAuthenticated ? user.email : 'Faça login com sua conta Google'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono ${user.isGoogleAuthenticated ? 'text-green-400' : 'text-zinc-500'}`}>
                      {user.isGoogleAuthenticated ? 'Google Conectado' : 'Offline'}
                    </span>
                  </div>
                  {user.isGoogleAuthenticated ? (
                    <button
                      id="btn-mobile-logout"
                      onClick={logoutGoogle}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sair da Conta</span>
                    </button>
                  ) : (
                    <button
                      id="btn-mobile-login"
                      onClick={onOpenGoogleAuth}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                    >
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
                      <span>Entrar com Google</span>
                    </button>
                  )}
                </div>

                {/* Sync Conditions */}
                <div className="p-3 rounded-xl bg-[#111] border border-[#333] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#fafafa]">Agendamento Noturno</p>
                      <p className="text-[11px] text-[#888]">Executa às 03:00 ao carregar</p>
                    </div>
                    <span className="text-green-400 font-semibold font-mono">Ativo</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#222]">
                    <div>
                      <p className="font-semibold text-[#fafafa]">Somente no Wi-Fi</p>
                      <p className="text-[11px] text-[#888]">Economiza dados móveis</p>
                    </div>
                    <span className="text-green-400 font-semibold font-mono">Sim</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#222]">
                    <div>
                      <p className="font-semibold text-[#fafafa]">Backup ao Fechar/Sair</p>
                      <p className="text-[11px] text-[#888]">Continua em segundo plano</p>
                    </div>
                    <button
                      onClick={() => updateSchedule({ runOnAppClose: !schedule.runOnAppClose })}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                        schedule.runOnAppClose
                          ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                          : 'bg-[#222] text-[#888]'
                      }`}
                    >
                      {schedule.runOnAppClose ? 'Ativo' : 'Pausado'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#222]">
                    <div>
                      <p className="font-semibold text-[#fafafa]">Chave Mestre do Cofre</p>
                      <p className="text-[11px] text-green-400 font-medium">Cofre Local Blindado</p>
                    </div>
                    <button
                      onClick={onOpenSecurityModal}
                      className="text-[#888] hover:text-[#fafafa] underline cursor-pointer"
                    >
                      Gerenciar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* iOS Bottom Navigation Bar */}
          <div className="h-16 px-4 bg-[#0a0a0a] border-t border-[#222] flex items-center justify-around text-[#666] z-20">
            <button
              onClick={() => setMobileTab('home')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-medium cursor-pointer ${
                mobileTab === 'home' ? 'text-[#fafafa]' : 'hover:text-[#888]'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Início</span>
            </button>

            <button
              onClick={() => setMobileTab('media')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-medium cursor-pointer ${
                mobileTab === 'media' ? 'text-[#fafafa]' : 'hover:text-[#888]'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>Fotos</span>
            </button>

            <button
              onClick={() => setMobileTab('contacts')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-medium cursor-pointer ${
                mobileTab === 'contacts' ? 'text-[#fafafa]' : 'hover:text-[#888]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Contatos</span>
            </button>

            <button
              onClick={() => setMobileTab('settings')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-medium cursor-pointer ${
                mobileTab === 'settings' ? 'text-[#fafafa]' : 'hover:text-[#888]'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Ajustes</span>
            </button>
          </div>

          {/* iOS Home Indicator Bar */}
          <div className="h-4 flex items-center justify-center pb-1 bg-[#0a0a0a]">
            <div className="w-32 h-1 bg-[#333] rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
