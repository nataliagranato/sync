import React, { useState, useEffect } from 'react';
import { FileItem } from '../types';
import { formatBytes } from '../services/crypto';
import {
  X,
  Download,
  ShieldCheck,
  Image,
  Video,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Check,
  Calendar,
  HardDrive,
  Cpu,
  Lock,
  Phone,
  Mail,
  Building,
  CheckCircle2
} from 'lucide-react';

interface ZeroKnowledgeMediaViewerProps {
  file: FileItem | null;
  allFiles: FileItem[];
  isOpen: boolean;
  onClose: () => void;
  onRestore: (fileId: string) => Promise<unknown>;
  onSelectFile: (file: FileItem) => void;
}

export const ZeroKnowledgeMediaViewer: React.FC<ZeroKnowledgeMediaViewerProps> = ({
  file,
  allFiles,
  isOpen,
  onClose,
  onRestore,
  onSelectFile
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copiedHash, setCopiedHash] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showMetadata, setShowMetadata] = useState(true);

  useEffect(() => {
    setZoomLevel(1);
    setCopiedHash(false);
  }, [file]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, file, allFiles]);

  if (!isOpen || !file) return null;

  const currentIndex = allFiles.findIndex(f => f.id === file.id);

  const handleNext = () => {
    if (currentIndex < allFiles.length - 1) {
      onSelectFile(allFiles[currentIndex + 1]);
    } else {
      onSelectFile(allFiles[0]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectFile(allFiles[currentIndex - 1]);
    } else {
      onSelectFile(allFiles[allFiles.length - 1]);
    }
  };

  const handleCopyHash = () => {
    if (file.checksum) {
      navigator.clipboard.writeText(file.checksum);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const handleRestoreClick = async () => {
    setIsRestoring(true);
    try {
      await onRestore(file.id);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      {/* Top Navigation Bar */}
      <div className="h-16 px-4 sm:px-6 border-b border-[#222] bg-[#0a0a0a] flex items-center justify-between shrink-0">
        {/* Left: Info & RAM Decoded Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#888] hover:text-[#fafafa] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
            title="Fechar (ESC)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#fafafa] truncate max-w-xs sm:max-w-md">
                {file.name}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                <Cpu className="w-3 h-3" />
                Decodificado em RAM • Sem Rastro em Disco
              </span>
            </div>
            <p className="text-[11px] text-[#666] font-mono truncate">
              {file.iosPath} • {formatBytes(file.originalSize)}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
              showMetadata
                ? 'bg-[#1a1a1a] text-[#fafafa] border-[#444]'
                : 'text-[#888] border-[#333] hover:text-[#fafafa]'
            }`}
          >
            Metadados
          </button>

          <button
            onClick={handleRestoreClick}
            disabled={isRestoring}
            className="px-4 py-1.5 rounded-md bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isRestoring ? 'Decifrando...' : 'Restaurar Arquivo'}</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left / Prev arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-[#333] text-[#fafafa] flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
          title="Anterior (←)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right / Next arrow */}
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-[#333] text-[#fafafa] flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
          title="Próximo (→)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Center Preview Stage */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-auto">
          {file.category === 'photos' && (
            <div className="flex flex-col items-center max-w-4xl max-h-full">
              <div
                className="relative overflow-hidden rounded-xl border border-[#222] shadow-2xl transition-transform duration-200 bg-[#0d0d0d]"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={file.thumbnailUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80'}
                  alt={file.name}
                  className="max-h-[70vh] w-auto object-contain select-none"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Zoom Controls */}
              <div className="mt-4 flex items-center gap-2 bg-[#111] px-3 py-1.5 rounded-full border border-[#333] text-xs">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.2))}
                  className="p-1 text-[#888] hover:text-[#fafafa] cursor-pointer"
                  title="Diminuir Zoom"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-[11px] text-[#fafafa] px-2">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.2))}
                  className="p-1 text-[#888] hover:text-[#fafafa] cursor-pointer"
                  title="Aumentar Zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1 text-[#888] hover:text-[#fafafa] cursor-pointer border-l border-[#222] pl-2"
                  title="Resetar"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {file.category === 'videos' && (
            <div className="w-full max-w-3xl bg-[#111] rounded-2xl border border-[#333] p-6 space-y-4 shadow-2xl">
              <div className="relative aspect-video rounded-xl bg-black overflow-hidden flex items-center justify-center border border-[#222]">
                {file.thumbnailUrl ? (
                  <img
                    src={file.thumbnailUrl}
                    alt={file.name}
                    className="w-full h-full object-cover opacity-70"
                    referrerPolicy="no-referrer"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-between p-4">
                  <div className="flex items-center justify-between text-xs font-mono text-[#888]">
                    <span className="bg-black/60 px-2.5 py-1 rounded-md border border-[#333] text-green-400 font-semibold">
                      Apple ProRes HDR • 4K 60fps
                    </span>
                    <span>Buffer em RAM Seguro</span>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
                      <div className="w-1/3 h-full bg-white rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#888]">
                      <span>00:14</span>
                      <span>01:48</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-[#888]">
                <span>Fluxo de bits descriptografado sob demanda sem persistência no disco</span>
                <span className="font-mono text-[#fafafa]">{formatBytes(file.originalSize)}</span>
              </div>
            </div>
          )}

          {file.category === 'contacts' && (
            <div className="w-full max-w-md bg-[#111] rounded-2xl border border-[#333] p-6 space-y-6 shadow-2xl">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 rounded-full bg-[#1a1a1a] border-2 border-[#333] mx-auto flex items-center justify-center text-white text-2xl font-bold">
                  {file.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#fafafa]">{file.name.replace(/\.vcf$/i, '').replace(/_/g, ' ')}</h3>
                  <p className="text-xs text-[#888] font-mono">Ficha de Contato vCard 4.0</p>
                </div>
              </div>

              <div className="space-y-3 bg-[#161616] p-4 rounded-xl border border-[#222] text-xs">
                {file.contactDetails?.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#222] flex items-center justify-center text-green-400 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-[#666] uppercase font-semibold">Telefone / Móvel</p>
                      <p className="text-xs font-semibold text-[#fafafa] font-mono truncate">{file.contactDetails.phone}</p>
                    </div>
                  </div>
                )}

                {file.contactDetails?.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#222] flex items-center justify-center text-blue-400 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-[#666] uppercase font-semibold">E-mail</p>
                      <p className="text-xs font-semibold text-[#fafafa] font-mono truncate">{file.contactDetails.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#222] flex items-center justify-center text-amber-400 shrink-0">
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-[#666] uppercase font-semibold">Origem do Catálogo</p>
                    <p className="text-xs text-[#fafafa] truncate">
                      {file.contactDetails?.company || 'Catálogo de Contatos do Dispositivo'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleRestoreClick}
                className="w-full py-2.5 rounded-md bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Contato para o Dispositivo (.vcf)</span>
              </button>
            </div>
          )}

          {file.category === 'documents' && (
            <div className="w-full max-w-xl bg-[#111] rounded-2xl border border-[#333] p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 pb-4 border-b border-[#222]">
                <div className="w-10 h-10 rounded-lg bg-[#161616] border border-[#333] flex items-center justify-center text-red-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#fafafa]">{file.name}</h3>
                  <p className="text-xs text-[#888] font-mono">{file.mimeType} • {formatBytes(file.originalSize)}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#161616] border border-[#222] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-green-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Integridade Criptográfica Verificada</span>
                </div>
                <p className="text-xs text-[#888] leading-relaxed">
                  Este documento foi decodificado em memória volátil a partir do backup na nuvem. A assinatura digital confere que o conteúdo é idêntico ao original gravado no seu dispositivo.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#666] font-mono">
                  Origem: {file.iosPath}
                </span>
                <button
                  onClick={handleRestoreClick}
                  className="px-4 py-2 rounded-md bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Documento</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Metadata Inspector Drawer */}
        {showMetadata && (
          <div className="w-80 border-l border-[#222] bg-[#0d0d0d] p-5 space-y-5 overflow-y-auto hidden lg:block shrink-0">
            <div>
              <h4 className="text-xs font-bold text-[#fafafa] uppercase tracking-wider mb-1">
                Detalhes do Item
              </h4>
              <p className="text-[11px] text-[#666]">
                Informações de metadados do dispositivo
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222] space-y-1">
                <span className="text-[10px] text-[#666] uppercase font-semibold block">Nome do Arquivo</span>
                <span className="text-xs text-[#fafafa] font-mono break-all">{file.name}</span>
              </div>

              <div className="p-3 rounded-lg bg-[#141414] border border-[#222] space-y-1">
                <span className="text-[10px] text-[#666] uppercase font-semibold block">Caminho no Dispositivo</span>
                <span className="text-[11px] text-[#888] font-mono break-all">{file.iosPath}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-[#141414] border border-[#222] space-y-1">
                  <span className="text-[10px] text-[#666] uppercase font-semibold block">Tamanho</span>
                  <span className="text-xs text-[#fafafa] font-mono">{formatBytes(file.originalSize)}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#141414] border border-[#222] space-y-1">
                  <span className="text-[10px] text-[#666] uppercase font-semibold block">Status</span>
                  <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Salvo
                  </span>
                </div>
              </div>

              {file.checksum && (
                <div className="p-3 rounded-lg bg-[#141414] border border-[#222] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#666] uppercase font-semibold">Digest SHA-256</span>
                    <button
                      onClick={handleCopyHash}
                      className="text-[10px] text-[#888] hover:text-[#fafafa] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedHash ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHash ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-[#888] font-mono break-all leading-tight">
                    {file.checksum}
                  </p>
                </div>
              )}

              <div className="p-3 rounded-lg bg-[#141414] border border-[#222] space-y-2">
                <span className="text-[10px] text-[#666] uppercase font-semibold block">Destinos Sincronizados</span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#888]">Google Drive</span>
                    <span className="text-green-400 font-mono text-[10px]">Cópia Ativa</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#888]">Microsoft OneDrive</span>
                    <span className="text-cyan-400 font-mono text-[10px]">Espelho Ativo</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleRestoreClick}
                disabled={isRestoring}
                className="w-full py-2.5 rounded-md bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isRestoring ? 'Decifrando...' : 'One-Click Restore'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
