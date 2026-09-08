import React, { useState } from 'react';
import { useSync } from '../context/SyncContext';
import { formatBytes } from '../services/crypto';
import {
  HardDrive,
  CheckCircle2,
  LogOut,
  Check,
  Loader2,
  AlertCircle,
  User,
  ShieldCheck,
  RefreshCw,
  Settings2
} from 'lucide-react';

interface OneDriveAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OneDriveAuthModal: React.FC<OneDriveAuthModalProps> = ({ isOpen, onClose }) => {
  const { storageProviders, connectOneDrive, disconnectOneDrive, addNotification } = useSync();
  const oneDrive = storageProviders.find(p => p.id === 'onedrive');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [customClientId, setCustomClientId] = useState('');

  if (!isOpen) return null;

  const isConnected = !!oneDrive?.connected && !!oneDrive?.accountEmail;

  const handleConnect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const email = emailInput.trim() || 'usuario.onedrive@outlook.com';
      const name = nameInput.trim() || email.split('@')[0].replace('.', ' ');

      await connectOneDrive({
        accountEmail: email,
        accountName: name,
        clientId: customClientId.trim() || undefined
      });

      addNotification({
        type: 'success',
        title: 'OneDrive Conectado',
        message: `Autenticado com sucesso na conta Microsoft (${email}).`
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Falha ao conectar com o Microsoft OneDrive.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await disconnectOneDrive();
      addNotification({
        type: 'info',
        title: 'OneDrive Desconectado',
        message: 'A sincronização com a conta Microsoft foi pausada.'
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="modal-onedrive-auth-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="modal-onedrive-auth-content"
        className="bg-[#111] border border-[#333] rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 text-[#fafafa]"
      >
        {/* Header with Microsoft Logo */}
        <div className="flex items-center justify-between pb-3 border-b border-[#222]">
          <div className="flex items-center gap-2.5">
            {/* Official Microsoft 4-color grid */}
            <div className="w-5 h-5 grid grid-cols-2 gap-0.5 shrink-0">
              <div className="bg-[#F25022] rounded-[1px]"></div>
              <div className="bg-[#7FBA00] rounded-[1px]"></div>
              <div className="bg-[#00A4EF] rounded-[1px]"></div>
              <div className="bg-[#FFB900] rounded-[1px]"></div>
            </div>
            <h3 className="text-sm font-bold tracking-tight">
              Autenticação com Microsoft OneDrive
            </h3>
          </div>
          <button
            id="btn-close-onedrive-modal"
            onClick={onClose}
            className="text-[#888] hover:text-[#fafafa] p-1 text-xs cursor-pointer rounded-md hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Error banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Connected State */}
        {isConnected ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#161616] border border-[#333] flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center shrink-0 text-cyan-400">
                <HardDrive className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold truncate">{oneDrive.userAccount || 'OneDrive Conectado'}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                </div>
                <p className="text-[11px] text-[#888] truncate font-mono">{oneDrive.accountEmail}</p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-cyan-400 font-semibold font-mono">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Microsoft Graph v1.0 Conectado</span>
                </div>
              </div>
            </div>

            {/* Quota details */}
            <div className="p-4 rounded-xl bg-[#161616] border border-[#333] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#888]">Armazenamento OneDrive</span>
                <span className="font-mono text-[#fafafa]">
                  {formatBytes(oneDrive.usedSpaceBytes)} / {formatBytes(oneDrive.totalSpaceBytes)}
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (oneDrive.usedSpaceBytes / oneDrive.totalSpaceBytes) * 100)}%`
                  }}
                ></div>
              </div>
              <p className="text-[10px] text-[#666]">
                Pasta de backup configurada: <span className="font-mono text-zinc-300">{oneDrive.syncFolder}</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#161616] border border-[#262626] text-[11px] text-[#888] space-y-1.5">
              <span className="font-semibold text-[#fafafa]">Permissões Ativas:</span>
              <ul className="space-y-1 text-[10.5px]">
                <li className="flex items-center gap-2 text-zinc-300">
                  <Check className="w-3 h-3 text-cyan-400" />
                  <span>Files.ReadWrite (Acesso isolado à pasta Sync_Vault)</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-300">
                  <Check className="w-3 h-3 text-cyan-400" />
                  <span>User.Read (Identificação do proprietário)</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                id="btn-switch-onedrive"
                onClick={() => {
                  disconnectOneDrive();
                  setEmailInput('');
                  setNameInput('');
                }}
                disabled={isLoading}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Trocar de Conta</span>
              </button>

              <button
                id="btn-disconnect-onedrive"
                onClick={handleDisconnect}
                disabled={isLoading}
                className="px-3.5 py-1.5 rounded-md bg-[#161616] border border-rose-900/60 text-rose-300 hover:bg-rose-950/40 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Desconectar</span>
              </button>
            </div>
          </div>
        ) : (
          /* Unconnected State */
          <div className="space-y-4">
            <p className="text-xs text-[#aaa] leading-relaxed">
              Conecte sua conta Microsoft (Outlook, Hotmail, Live ou Microsoft 365) para habilitar o armazenamento e backup espelhado no Microsoft OneDrive.
            </p>

            {/* Main Form */}
            <form onSubmit={handleConnect} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#888] mb-1">
                  E-mail da Conta Microsoft (OneDrive)
                </label>
                <input
                  type="email"
                  required
                  placeholder="exemplo@outlook.com ou @hotmail.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#161616] border border-[#333] text-xs text-[#fafafa] focus:outline-hidden focus:border-cyan-500 font-mono placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#888] mb-1">
                  Nome do Titular
                </label>
                <input
                  type="text"
                  placeholder="Nome de exibição (ex: Natalia Granato)"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#161616] border border-[#333] text-xs text-[#fafafa] focus:outline-hidden focus:border-cyan-500 placeholder:text-zinc-600"
                />
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-[10.5px] text-[#777] hover:text-[#bbb] flex items-center gap-1 cursor-pointer"
                >
                  <Settings2 className="w-3 h-3" />
                  <span>{showAdvanced ? 'Ocultar configurações do Azure' : 'Configurar Azure App ID (Opcional)'}</span>
                </button>
              </div>

              {showAdvanced && (
                <div className="p-3 rounded-lg bg-[#161616] border border-[#262626] space-y-1.5 animate-in fade-in-50">
                  <label className="block text-[10.5px] font-semibold text-[#888]">
                    Client ID / Application ID do Azure AD (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={customClientId}
                    onChange={e => setCustomClientId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#111] border border-[#333] text-[11px] text-[#fafafa] font-mono focus:outline-hidden"
                  />
                  <p className="text-[10px] text-[#666]">
                    Se você possuir um aplicativo registrado no portal do Microsoft Entra/Azure, pode inserir o App ID aqui.
                  </p>
                </div>
              )}

              {/* Submit button */}
              <button
                id="btn-submit-onedrive-connect"
                type="submit"
                disabled={isLoading}
                className="w-full p-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2.5 shadow-md cursor-pointer disabled:opacity-60 active:scale-[0.99] mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Conectando ao OneDrive...</span>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 grid grid-cols-2 gap-0.5 shrink-0">
                      <div className="bg-white rounded-[1px]"></div>
                      <div className="bg-white rounded-[1px]"></div>
                      <div className="bg-white rounded-[1px]"></div>
                      <div className="bg-white rounded-[1px]"></div>
                    </div>
                    <span>Autenticar e Conectar Microsoft OneDrive</span>
                  </>
                )}
              </button>
            </form>

            <div className="p-3 rounded-xl bg-[#161616] border border-[#222] text-[11px] text-[#777] space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Integração com Microsoft Graph</span>
              </div>
              <p className="text-[10.5px] text-zinc-500">
                Seus arquivos enviados para o OneDrive são cifrados com chave AES-GCM local no seu dispositivo antes de qualquer transferência.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
