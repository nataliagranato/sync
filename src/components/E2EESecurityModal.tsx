import React, { useState } from 'react';
import { useSync } from '../context/SyncContext';
import {
  ShieldCheck,
  Key,
  Copy,
  Check,
  RefreshCw,
  Lock,
  Unlock,
  Terminal,
  Layers,
  Sparkles
} from 'lucide-react';
import { encryptBuffer, decryptBuffer, sha256Hex, buf2hex } from '../services/crypto';

interface E2EESecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const E2EESecurityModal: React.FC<E2EESecurityModalProps> = ({ isOpen, onClose }) => {
  const {
    cryptoConfig,
    masterPassphrase,
    setMasterPassphrase,
    regenerateRecoveryKey,
    addNotification
  } = useSync();

  const [copiedPhrase, setCopiedPhrase] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [tempPassphrase, setTempPassphrase] = useState(masterPassphrase);

  // Live cryptographic sandbox test state
  const [testInput, setTestInput] = useState('Foto de Família em Alta Resolução + Documento de Identidade');
  const [encryptedPayload, setEncryptedPayload] = useState<{
    ciphertextHex: string;
    ivHex: string;
    hashHex: string;
  } | null>(null);
  const [decryptedResult, setDecryptedResult] = useState<string | null>(null);
  const [isTestingCrypto, setIsTestingCrypto] = useState(false);

  if (!isOpen) return null;

  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(cryptoConfig.recoveryPhrase);
    setCopiedPhrase(true);
    setTimeout(() => setCopiedPhrase(false), 2000);
  };

  const handleSavePassphrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempPassphrase.trim()) return;
    setMasterPassphrase(tempPassphrase);
    addNotification({
      type: 'success',
      title: 'Proteção Atualizada',
      message: 'Sua chave de proteção foi salva. Todos os novos backups estarão protegidos com ela.'
    });
  };

  const handleTestLiveEncryption = async () => {
    try {
      setIsTestingCrypto(true);
      setDecryptedResult(null);

      const buffer = new TextEncoder().encode(testInput).buffer as ArrayBuffer;
      const res = await encryptBuffer(buffer, masterPassphrase);

      setEncryptedPayload({
        ciphertextHex: buf2hex(res.ciphertext),
        ivHex: res.ivHex,
        hashHex: res.hashHex
      });

      // Now decrypt to prove roundtrip
      const decBuffer = await decryptBuffer(res.ciphertext, res.ivHex, res.saltHex, masterPassphrase);
      const decText = new TextDecoder().decode(decBuffer);
      setDecryptedResult(decText);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTestingCrypto(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#111] border border-[#333] rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-600/20 flex items-center justify-center text-green-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#fafafa] tracking-tight">
                Criptografia de Ponta a Ponta (E2EE)
              </h3>
              <p className="text-[11px] text-[#888] font-mono">
                Padrão Zero-Knowledge • AES-GCM-256 / PBKDF2
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#888] hover:text-[#fafafa] p-1 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Technical architecture explanation */}
        <div className="p-5 rounded-xl bg-[#161616] border border-[#333] space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-green-400 font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Como o Sync protege os dados do seu dispositivo</span>
          </div>
          <p className="text-xs text-[#888] leading-relaxed">
            Ao contrário de backups comuns em que o provedor possui a chave de acesso, o Sync executa a proteção inteiramente dentro do seu próprio dispositivo, garantindo privacidade absoluta. A arte de proteger seus dados com a simplicidade que você sempre quis.
          </p>
          <div className="grid grid-cols-3 gap-2.5 pt-2 text-[10px] font-mono text-[#888]">
            <div className="p-3 rounded-lg bg-[#111] border border-[#222]">
              <span className="text-[#666] block">Algoritmo:</span>
              <span className="text-[#fafafa] font-bold">AES-GCM 256-bit</span>
            </div>
            <div className="p-3 rounded-lg bg-[#111] border border-[#222]">
              <span className="text-[#666] block">Derivação:</span>
              <span className="text-[#fafafa] font-bold">PBKDF2 (100k iterações)</span>
            </div>
            <div className="p-3 rounded-lg bg-[#111] border border-[#222]">
              <span className="text-[#666] block">Vetor Único:</span>
              <span className="text-[#fafafa] font-bold">IV 96-bit por arquivo</span>
            </div>
          </div>
        </div>

        {/* Master Passphrase Editor */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#fafafa]">
            Frase-Senha Mestre do Cofre
          </label>
          <p className="text-xs text-[#888]">
            Usada para derivar a chave de cifragem simétrica no seu dispositivo. Nunca enviada a nenhum servidor.
          </p>
          <form onSubmit={handleSavePassphrase} className="flex gap-2.5">
            <input
              type={showPassphrase ? 'text' : 'password'}
              value={tempPassphrase}
              onChange={e => setTempPassphrase(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-md bg-[#161616] border border-[#333] text-xs text-[#fafafa] font-mono focus:outline-hidden focus:border-[#555]"
            />
            <button
              type="button"
              onClick={() => setShowPassphrase(!showPassphrase)}
              className="px-3.5 py-2 rounded-md bg-[#161616] border border-[#333] text-xs font-semibold text-[#888] hover:text-[#fafafa] cursor-pointer"
            >
              {showPassphrase ? 'Ocultar' : 'Exibir'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-white text-black text-xs font-semibold hover:bg-zinc-200 cursor-pointer shadow-sm"
            >
              Salvar
            </button>
          </form>
        </div>

        {/* BIP39 Recovery Phrase */}
        <div className="p-5 rounded-xl bg-[#161616] border border-[#333] space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-[#fafafa]">
                Frase de Recuperação de Emergência (12 Palavras)
              </span>
            </div>
            <button
              onClick={regenerateRecoveryKey}
              className="text-[11px] text-[#888] hover:text-[#fafafa] flex items-center gap-1 cursor-pointer font-semibold"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Gerar Nova</span>
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 font-mono text-[11px]">
            {cryptoConfig.recoveryPhrase.split(' ').map((word, i) => (
              <div
                key={i}
                className="p-2 rounded bg-[#111] border border-[#222] flex items-center justify-between text-[#fafafa]"
              >
                <span className="text-[#666] text-[9px]">{i + 1}.</span>
                <span>{word}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#666]">
              Guarde em local seguro. Permite restaurar seus backups caso esqueça a senha.
            </span>
            <button
              onClick={handleCopyPhrase}
              className="px-3.5 py-1.5 rounded-md bg-[#111] border border-[#333] text-xs font-semibold text-[#fafafa] hover:border-[#555] flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {copiedPhrase ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPhrase ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Live Cryptographic Sandbox Tester */}
        <div className="p-5 rounded-xl bg-[#161616] border border-[#333] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#fafafa] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Teste ao Vivo: Web Crypto API em Ação
            </span>
            <button
              onClick={handleTestLiveEncryption}
              disabled={isTestingCrypto}
              className="px-3.5 py-1.5 rounded-md bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
            >
              {isTestingCrypto ? 'Processando...' : 'Executar Cifragem & Decifragem'}
            </button>
          </div>

          <input
            type="text"
            value={testInput}
            onChange={e => setTestInput(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-[#111] border border-[#333] text-xs text-[#fafafa] font-mono focus:outline-hidden focus:border-[#555]"
            placeholder="Texto para testar criptografia"
          />

          {encryptedPayload && (
            <div className="p-3.5 rounded-lg bg-[#0a0a0a] border border-[#222] font-mono text-[10px] space-y-1.5 text-[#888]">
              <div className="truncate">
                <span className="text-[#666]">Ciphertext (HEX): </span>
                <span className="text-amber-400">{encryptedPayload.ciphertextHex.substring(0, 48)}...</span>
              </div>
              <div className="truncate">
                <span className="text-[#666]">IV Aleatório (12 bytes): </span>
                <span className="text-green-400">{encryptedPayload.ivHex}</span>
              </div>
              <div className="truncate">
                <span className="text-[#666]">Digest SHA-256: </span>
                <span className="text-blue-400">{encryptedPayload.hashHex}</span>
              </div>
              {decryptedResult && (
                <div className="pt-2 border-t border-[#222] flex items-center gap-2">
                  <span className="text-green-400 font-bold">Decifrado com Sucesso:</span>
                  <span className="text-[#fafafa]">"{decryptedResult}"</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
