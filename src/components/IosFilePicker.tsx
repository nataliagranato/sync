import React, { useState, useRef } from 'react';
import { useSync } from '../context/SyncContext';
import { IosCategory, FileItem, StorageTarget } from '../types';
import { formatBytes } from '../services/crypto';
import { RestoreModal } from './RestoreModal';
import {
  Folder,
  Image,
  Video,
  Users,
  FileText,
  Upload,
  Plus,
  CheckCircle2,
  Lock,
  Smartphone,
  Trash2,
  Download,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Eye,
  Layers,
  Sparkles,
  FolderDown,
  RefreshCw
} from 'lucide-react';

export const IosFilePicker: React.FC = () => {
  const {
    files,
    addCustomFile,
    createQuickContact,
    createQuickNote,
    deleteFile,
    clearAllFiles,
    loadSampleFiles,
    startSync,
    isSyncing,
    deduplicationStats,
    toggleDeduplication,
    runDeduplicationScan,
    restoreFile,
    openViewer
  } = useSync();

  const [activeCategory, setActiveCategory] = useState<IosCategory | 'all'>('all');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [targetDestination, setTargetDestination] = useState<StorageTarget>('both');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isScanningDedup, setIsScanningDedup] = useState(false);
  const [restoringFileId, setRestoringFileId] = useState<string | null>(null);

  // New contact form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // New note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter files
  const filteredFiles = files.filter(f => {
    if (activeCategory === 'all') return true;
    return f.category === activeCategory;
  });

  const handleSelectAll = () => {
    if (selectedFileIds.length === filteredFiles.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(filteredFiles.map(f => f.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedFileIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(file => {
        addCustomFile(file);
      });
    }
  };

  const handleNativeFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(file => {
        addCustomFile(file);
      });
    }
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim()) return;
    createQuickContact(contactName, contactPhone, contactEmail);
    setContactName('');
    setContactPhone('');
    setContactEmail('');
    setShowContactModal(false);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    await createQuickNote(noteTitle, noteContent);
    setNoteTitle('');
    setNoteContent('');
    setShowNoteModal(false);
  };

  const handleTriggerDedupScan = async () => {
    setIsScanningDedup(true);
    try {
      await runDeduplicationScan();
    } finally {
      setIsScanningDedup(false);
    }
  };

  const handleRestoreSingle = async (fileId: string) => {
    setRestoringFileId(fileId);
    try {
      await restoreFile(fileId);
    } finally {
      setRestoringFileId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with quick stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-[#333] bg-[#111]">
        <div>
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-[#888]" />
            <h1 className="text-xl font-bold text-[#fafafa] tracking-tight">
              Sistema de Arquivos & Mídias do Dispositivo
            </h1>
          </div>
          <p className="text-xs text-[#888] mt-1">
            Selecione fotos da galeria, vídeos em alta definição, catálogo de contatos e documentos locais para backup seguro.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* File input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleNativeFileInput}
            multiple
            className="hidden"
          />

          <button
            id="btn-open-restore-modal"
            onClick={() => setShowRestoreModal(true)}
            className="px-4 py-2 rounded-md bg-[#161616] border border-[#333] text-[#fafafa] hover:border-[#555] hover:bg-[#222] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Recuperar arquivos salvos na nuvem"
          >
            <FolderDown className="w-3.5 h-3.5 text-blue-400" />
            <span>One-Click Restore</span>
          </button>

          <button
            id="btn-upload-local-file"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-md bg-[#161616] border border-[#333] text-[#fafafa] hover:border-[#555] hover:bg-[#222] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar Arquivo</span>
          </button>

          <button
            id="btn-add-contact-modal"
            onClick={() => setShowContactModal(true)}
            className="px-3.5 py-2 rounded-md bg-[#161616] border border-[#333] text-[#fafafa] hover:border-[#555] hover:bg-[#222] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-green-400" />
            <span>Novo Contato vCard</span>
          </button>

          <button
            id="btn-add-note-modal"
            onClick={() => setShowNoteModal(true)}
            className="px-3.5 py-2 rounded-md bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>Nova Nota / Documento</span>
          </button>
        </div>
      </div>

      {/* Deduplicação Inteligente no Dispositivo Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[#333] bg-[#141414] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1d1d1d] border border-[#333] flex items-center justify-center text-green-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-[#fafafa] tracking-tight">
                Deduplicação Inteligente no Dispositivo (Content-Addressable)
              </h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                deduplicationStats.enabled
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-[#222] text-[#888] border-[#333]'
              }`}>
                {deduplicationStats.enabled ? 'Ativa' : 'Pausada'}
              </span>
            </div>
            <p className="text-[11px] text-[#888] mt-0.5">
              Identifica arquivos idênticos por digest criptográfico antes do upload.
              Economia acumulada: <span className="text-[#fafafa] font-mono font-semibold">{formatBytes(deduplicationStats.savedBytes)}</span> ({deduplicationStats.skippedFilesCount} envios redundantes prevenidos).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={handleTriggerDedupScan}
            disabled={isScanningDedup}
            className="px-3.5 py-1.5 rounded-md bg-[#1d1d1d] border border-[#333] text-[#fafafa] hover:border-[#555] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Escanear fotos e arquivos por duplicatas locais"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanningDedup ? 'animate-spin' : ''}`} />
            <span>{isScanningDedup ? 'Verificando...' : 'Escanear Duplicatas'}</span>
          </button>

          <button
            onClick={toggleDeduplication}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
              deduplicationStats.enabled
                ? 'bg-[#111] text-[#888] border-[#333] hover:text-[#fafafa]'
                : 'bg-white text-black border-white hover:bg-zinc-200'
            }`}
          >
            {deduplicationStats.enabled ? 'Desativar' : 'Ativar'}
          </button>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border border-dashed border-[#333] hover:border-[#555] bg-[#111] hover:bg-[#161616]/70 rounded-2xl p-7 text-center cursor-pointer transition-all space-y-2"
      >
        <div className="w-10 h-10 rounded-full bg-[#161616] border border-[#333] flex items-center justify-center mx-auto text-[#888]">
          <Upload className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#fafafa]">
            Arraste fotos, vídeos ou contatos aqui, ou clique para navegar
          </p>
          <p className="text-xs text-[#666] mt-0.5">
            Suporta HEIC, JPEG, PNG, MOV, MP4, VCF (vCard), PDF e ZIP com proteção local
          </p>
        </div>
      </div>

      {/* Filter Category Tabs & Selection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Todos os Arquivos', icon: Folder, count: files.length },
            { id: 'photos', label: 'Fotos (HEIC)', icon: Image, count: files.filter(f => f.category === 'photos').length },
            { id: 'videos', label: 'Vídeos (4K)', icon: Video, count: files.filter(f => f.category === 'videos').length },
            { id: 'contacts', label: 'Contatos (vCard)', icon: Users, count: files.filter(f => f.category === 'contacts').length },
            { id: 'documents', label: 'Documentos', icon: FileText, count: files.filter(f => f.category === 'documents').length }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-black'
                    : 'bg-[#161616] text-[#888] border border-[#333] hover:text-[#fafafa] hover:border-[#444]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`font-mono text-[10px] ${isSelected ? 'text-zinc-600' : 'text-[#666]'}`}>({tab.count})</span>
              </button>
            );
          })}
        </div>

        {/* Selected files actions */}
        {selectedFileIds.length > 0 && (
          <div className="flex items-center gap-2.5 bg-[#161616] border border-[#333] px-3.5 py-1.5 rounded-lg animate-in fade-in">
            <span className="text-xs text-[#fafafa] font-mono font-medium">
              {selectedFileIds.length} selecionado(s)
            </span>
            <div className="h-3.5 w-px bg-[#333]"></div>

            {/* Target picker */}
            <select
              value={targetDestination}
              onChange={e => setTargetDestination(e.target.value as StorageTarget)}
              className="bg-[#111] border border-[#333] text-[11px] text-[#fafafa] rounded px-2.5 py-1 focus:outline-hidden"
            >
              <option value="both">Google Drive & OneDrive</option>
              <option value="google_drive">Apenas Google Drive</option>
              <option value="onedrive">Apenas OneDrive</option>
            </select>

            <button
              onClick={() => {
                startSync(selectedFileIds, targetDestination);
                setSelectedFileIds([]);
              }}
              disabled={isSyncing}
              className="px-3 py-1 rounded bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Sincronizar
            </button>
          </div>
        )}
      </div>

      {/* Files Table / Grid */}
      <div className="rounded-2xl border border-[#333] bg-[#111] overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-[#222] bg-[#161616]/70 flex items-center justify-between text-xs font-semibold text-[#888]">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedFileIds.length > 0 && selectedFileIds.length === filteredFiles.length}
              onChange={handleSelectAll}
              className="rounded border-[#333] bg-[#111] accent-white cursor-pointer w-4 h-4"
            />
            <span>Item / Origem no Dispositivo</span>
          </div>
          <div className="hidden sm:flex items-center space-x-8 text-[#888]">
            <span>Tamanho</span>
            <span>Status no Cofre</span>
            <span>Ações</span>
          </div>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-400">
              <Folder className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-[#fafafa]">
              Nenhum arquivo encontrado no inventário
            </p>
            <p className="text-[11px] text-[#888] max-w-sm mx-auto">
              Importe arquivos reais do seu dispositivo acima para protegê-los no cofre com criptografia AES-256.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                Selecionar do Computador / Celular
              </button>
              <button
                onClick={loadSampleFiles}
                className="px-3 py-1.5 rounded-lg bg-[#222] text-[#888] hover:text-[#fafafa] text-xs font-medium hover:bg-[#282828] transition-colors cursor-pointer border border-[#333]"
              >
                Carregar Arquivos de Amostra
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#222]">
            {filteredFiles.map(file => {
              const isSelected = selectedFileIds.includes(file.id);
              const isItemRestoring = restoringFileId === file.id;

              return (
                <div
                  key={file.id}
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    isSelected ? 'bg-[#161616]' : 'hover:bg-[#161616]/40'
                  }`}
                >
                  {/* Left: Thumbnail & File Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(file.id)}
                      className="rounded border-[#333] bg-[#111] accent-white cursor-pointer w-4 h-4 shrink-0"
                    />

                    {file.thumbnailUrl ? (
                      <div className="relative group cursor-pointer" onClick={() => openViewer(file)}>
                        <img
                          src={file.thumbnailUrl}
                          alt={file.name}
                          className="w-10 h-10 rounded-lg object-cover border border-[#333] shrink-0 group-hover:opacity-80 transition-opacity"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
                          <Eye className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => openViewer(file)}
                        className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center shrink-0 cursor-pointer hover:bg-[#222] text-[#888] hover:text-white transition-colors"
                      >
                        {file.category === 'photos' && <Image className="w-5 h-5" />}
                        {file.category === 'videos' && <Video className="w-5 h-5" />}
                        {file.category === 'contacts' && <Users className="w-5 h-5" />}
                        {file.category === 'documents' && <FileText className="w-5 h-5" />}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          onClick={() => openViewer(file)}
                          className="text-xs font-semibold text-[#fafafa] truncate max-w-xs sm:max-w-md hover:underline cursor-pointer"
                        >
                          {file.name}
                        </p>
                        {file.deduplicated && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Deduplicado
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#666] font-mono truncate">
                        {file.iosPath}
                      </p>
                      {file.contactDetails && (
                        <p className="text-[10px] text-[#888] mt-0.5 font-mono">
                          {file.contactDetails.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Metrics, Status, Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                    <span className="font-mono text-[#fafafa] text-[11px]">
                      {formatBytes(file.originalSize)}
                    </span>

                    {/* Status Badge */}
                    <div className="min-w-[120px] text-right">
                      {file.status === 'synced' ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-green-500 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Sincronizado</span>
                        </span>
                      ) : file.status === 'queued' ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-blue-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                          <span>Na Fila</span>
                        </span>
                      ) : file.status === 'encrypting' || file.status === 'uploading' ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-amber-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          <span>Protegendo</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#888]">
                          <Smartphone className="w-3 h-3 text-[#666]" />
                          <span>No Dispositivo</span>
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      {/* Zero Knowledge Viewer Button */}
                      <button
                        onClick={() => openViewer(file)}
                        className="p-1.5 rounded-md bg-[#161616] border border-[#333] text-[#888] hover:text-[#fafafa] hover:border-[#555] transition-colors cursor-pointer"
                        title="Visualizador Seguro em Memória (Zero-Knowledge)"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* One-Click Restore button if synced */}
                      {file.status === 'synced' && (
                        <button
                          onClick={() => handleRestoreSingle(file.id)}
                          disabled={isItemRestoring}
                          className="px-2.5 py-1 rounded-md bg-[#161616] border border-[#333] text-[#fafafa] hover:border-[#555] text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                          title="Restaurar e decifrar no dispositivo"
                        >
                          <Download className="w-3 h-3 text-green-400" />
                          <span>{isItemRestoring ? 'Decifrando...' : 'Restaurar'}</span>
                        </button>
                      )}

                      {file.status !== 'synced' && (
                        <button
                          onClick={() => startSync([file.id], 'both')}
                          disabled={isSyncing}
                          className="px-2.5 py-1 rounded-md bg-white text-black hover:bg-zinc-200 text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Fazer backup deste item"
                        >
                          Backup
                        </button>
                      )}

                      <button
                        onClick={() => deleteFile(file.id)}
                        className="p-1.5 text-[#666] hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remover item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Restore Modal */}
      <RestoreModal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        onOpenViewer={openViewer}
      />

      {/* Quick Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#333] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#fafafa] tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-green-400" />
                Adicionar Contato para Backup
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-[#888] hover:text-[#fafafa] text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#888]">
              Cria uma ficha vCard no armazenamento local que será protegida e sincronizada no Google Drive e OneDrive.
            </p>

            <form onSubmit={handleSaveContact} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#888] mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Natalia Granato"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#161616] border border-[#333] text-xs text-[#fafafa] focus:border-[#555] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#888] mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="+55 (11) 98765-4321"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#161616] border border-[#333] text-xs text-[#fafafa] focus:border-[#555] focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#888] mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="contato@exemplo.com"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#161616] border border-[#333] text-xs text-[#fafafa] focus:border-[#555] focus:outline-hidden font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 rounded-md bg-[#161616] border border-[#333] text-[#888] hover:text-[#fafafa] text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors cursor-pointer shadow-sm"
                >
                  Salvar Contato no Dispositivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#333] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#fafafa] tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Criar Documento / Nota Local
              </h3>
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-[#888] hover:text-[#fafafa] text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#888]">
              Cria um documento de texto real com cálculo de hash SHA-256 e armazena localmente no cofre antes da criptografia AES-GCM.
            </p>

            <form onSubmit={handleSaveNote} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#888] mb-1">
                  Título do Arquivo / Documento
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Minhas_Senhas_Anotacoes"
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#161616] border border-[#333] text-xs text-[#fafafa] focus:border-[#555] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#888] mb-1">
                  Conteúdo do Documento
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Escreva as anotações, chaves ou textos a serem protegidos no dispositivo..."
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#161616] border border-[#333] text-xs text-[#fafafa] focus:border-[#555] focus:outline-hidden font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 rounded-md bg-[#161616] border border-[#333] text-[#888] hover:text-[#fafafa] text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors cursor-pointer shadow-sm"
                >
                  Salvar Nota no Dispositivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

