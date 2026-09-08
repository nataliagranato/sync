import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  FolderLock,
  Clock,
  HardDrive,
  History
} from 'lucide-react';
import { useSync } from '../context/SyncContext';

export type TabKey = 'overview' | 'queue' | 'files' | 'scheduler' | 'storage' | 'history';

interface VercelTabsProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const VercelTabs: React.FC<VercelTabsProps> = ({ activeTab, onSelectTab }) => {
  const { uploadQueue, files } = useSync();

  const pendingCount = files.filter(f => f.status === 'local' || f.status === 'queued').length;
  const activeJobs = uploadQueue.filter(j => j.stage !== 'completed' && j.stage !== 'error').length;

  const tabs: { id: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string | number }[] = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    {
      id: 'queue',
      label: 'Uploads em Tempo Real',
      icon: UploadCloud,
      badge: activeJobs > 0 ? `${activeJobs} ativo(s)` : undefined
    },
    {
      id: 'files',
      label: 'Arquivos do Dispositivo',
      icon: FolderLock,
      badge: pendingCount > 0 ? `${pendingCount} pendente(s)` : undefined
    },
    { id: 'scheduler', label: 'Agendamento Automático', icon: Clock },
    { id: 'storage', label: 'Gerenciar Nuvens', icon: HardDrive },
    { id: 'history', label: 'Histórico & Auditoria', icon: History }
  ];

  return (
    <div className="border-b border-[#333] bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar" aria-label="Tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#111] text-white shadow-sm border border-[#444]'
                    : 'text-[#888] hover:text-[#fafafa] hover:bg-[#111]/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#666]'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                        : 'bg-[#1a1a1a] text-[#888] border border-[#333]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
