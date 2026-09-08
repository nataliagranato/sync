import React, { useState } from 'react';
import { useSync } from '../context/SyncContext';
import {
  CheckCircle2,
  ExternalLink,
  LogOut,
  Check,
  Loader2,
  AlertCircle,
  User,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    loginWithGoogle,
    logoutGoogle,
    isAuthLoading,
    authError,
    clearAuthError
  } = useSync();

  const [showManualForm, setShowManualForm] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRealGoogleLogin = async () => {
    setLocalError(null);
    clearAuthError();
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.warn('Login attempt handled in modal:', err);
      const errCode = err?.code || '';
      if (errCode === 'auth/popup-blocked') {
        setLocalError(
          'O navegador bloqueou a janela pop-up do Google. Por favor, permita pop-ups para este site na barra de endereços ou abra o app em uma nova aba.'
        );
      } else if (errCode === 'auth/popup-closed-by-user') {
        setLocalError('A janela do Google foi fechada antes de concluir o login. Clique abaixo para tentar novamente.');
      } else if (err?.message) {
        setLocalError(err.message);
      }
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail) return;
    loginWithGoogle(manualEmail, manualName || manualEmail.split('@')[0]);
    onClose();
  };

  return (
    <div
      id="modal-google-auth-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="modal-google-auth-content"
        className="bg-[#111] border border-[#333] rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 text-[#fafafa]"
      >
        {/* Header with Google Logo */}
        <div className="flex items-center justify-between pb-3 border-b border-[#222]">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <h3 className="text-sm font-bold tracking-tight">
              Autenticação com Google
            </h3>
          </div>
          <button
            id="btn-close-google-modal"
            onClick={onClose}
            className="text-[#888] hover:text-[#fafafa] p-1 text-xs cursor-pointer rounded-md hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Feedback / Error banner if popup fails or blocked */}
        {(localError || authError) && (
          <div
            id="banner-auth-error"
            className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-200 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-semibold text-amber-300">Atenção ao abrir o Google</p>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                {localError || authError}
              </p>
            </div>
          </div>
        )}

        {/* Current status: Authenticated */}
        {user.isGoogleAuthenticated ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#161616] border border-[#333] flex items-center gap-3.5">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/50 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-[#fafafa]">
                  <User className="w-6 h-6 text-zinc-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold truncate">{user.name}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </div>
                <p className="text-[11px] text-[#888] truncate font-mono">{user.email || 'Conta vinculada'}</p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-semibold font-mono">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Autenticado via Google Identity</span>
                </div>
              </div>
            </div>

            {/* Storage details */}
            <div className="p-4 rounded-xl bg-[#161616] border border-[#333] space-y-2.5 text-xs">
              <span className="font-semibold text-[#fafafa]">Configuração de Segurança:</span>
              <ul className="space-y-2 text-[11px] text-[#888]">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Sessão oficial com tokens protegidos do Google</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Criptografia ponta a ponta (E2EE AES-GCM-256) ativa</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Metadados e registros sincronizados com seu ID único</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                id="btn-switch-account-modal"
                onClick={handleRealGoogleLogin}
                disabled={isAuthLoading}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAuthLoading ? 'animate-spin' : ''}`} />
                <span>Trocar de Conta Google</span>
              </button>

              <button
                id="btn-logout-google-modal"
                onClick={async () => {
                  await logoutGoogle();
                  onClose();
                }}
                disabled={isAuthLoading}
                className="px-3.5 py-1.5 rounded-md bg-[#161616] border border-rose-900/60 text-rose-300 hover:bg-rose-950/40 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        ) : (
          /* Unauthenticated State */
          <div className="space-y-4">
            <p className="text-xs text-[#aaa] leading-relaxed">
              Faça login com sua conta do Google para autenticar sua sessão e habilitar a sincronização segura dos seus arquivos na nuvem.
            </p>

            {/* REAL GOOGLE POP-UP BUTTON */}
            <button
              id="btn-google-real-popup-login"
              onClick={handleRealGoogleLogin}
              disabled={isAuthLoading}
              className="w-full p-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-all flex items-center justify-center gap-3 shadow-md cursor-pointer disabled:opacity-70 active:scale-[0.99]"
            >
              {isAuthLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Abrindo janela do Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  <span>Continuar com o Google (Pop-up Oficial)</span>
                </>
              )}
            </button>

            <div className="bg-[#161616] border border-[#262626] rounded-xl p-3 text-[11px] text-[#888] space-y-1.5">
              <p className="flex items-center gap-1.5 text-zinc-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                Pop-up Oficial Google Accounts
              </p>
              <p className="text-[10.5px] leading-relaxed text-zinc-400">
                Uma janela pop-up será aberta para você autorizar o acesso aos arquivos de backup no Google Drive.
              </p>
            </div>

            {/* Google unverified app warning instructions */}
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3 space-y-1.5 text-xs text-amber-200/90">
              <div className="flex items-center gap-1.5 font-semibold text-amber-300 text-[11.5px]">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Apareceu "O Google não verificou este app"?</span>
              </div>
              <p className="text-[10.5px] text-amber-200/80 leading-relaxed">
                Como este aplicativo está em ambiente de desenvolvimento/teste e solicita acesso ao Google Drive, o Google exibe uma tela de proteção padrão. Para continuar:
              </p>
              <ol className="text-[10.5px] list-decimal list-inside space-y-0.5 text-amber-200/90 pl-0.5">
                <li>Clique no link <strong className="text-white">Avançado</strong> (no canto inferior esquerdo).</li>
                <li>Clique em <strong className="text-white">Acessar ... (não seguro)</strong>.</li>
                <li>Marque a permissão do Google Drive e clique em <strong className="text-white">Continuar</strong>.</li>
              </ol>
            </div>

            {/* Toggle fallback manual input for sandbox testing */}
            <div className="pt-2 border-t border-[#222]">
              <button
                type="button"
                onClick={() => setShowManualForm(!showManualForm)}
                className="text-[11px] text-[#777] hover:text-[#bbb] underline cursor-pointer transition-colors"
              >
                {showManualForm
                  ? 'Ocultar opções alternativas'
                  : 'Problemas com pop-up? Clique para opções alternativas'}
              </button>
            </div>

            {showManualForm && (
              <form onSubmit={handleManualLogin} className="space-y-3 pt-1 animate-in fade-in-50">
                <div>
                  <label className="block text-[11px] font-semibold text-[#888] mb-1">
                    E-mail Google
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="seu.email@gmail.com"
                    value={manualEmail}
                    onChange={e => setManualEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#161616] border border-[#333] text-xs text-[#fafafa] focus:outline-hidden focus:border-[#555] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#888] mb-1">
                    Nome de Exibição
                  </label>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#161616] border border-[#333] text-xs text-[#fafafa] focus:outline-hidden focus:border-[#555]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                  >
                    Conectar Manualmente
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
