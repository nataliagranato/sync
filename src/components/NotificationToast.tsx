import React from 'react';
import { useSync } from '../context/SyncContext';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';

interface NotificationToastProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ isOpen, onClose }) => {
  const { notifications, dismissNotification, markAllNotificationsRead } = useSync();

  const unreadNotifications = notifications.filter(n => !n.read);

  if (!isOpen) {
    // Show only the latest floating toast if recent (first unread)
    const latestUnread = unreadNotifications[0];
    if (!latestUnread) return null;

    return (
      <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
        <div className="p-4 rounded-xl bg-[#111] border border-[#333] shadow-2xl flex items-start gap-3">
          {latestUnread.type === 'success' && (
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
          )}
          {latestUnread.type === 'info' && (
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          )}
          {latestUnread.type === 'warning' && (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}

          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-xs font-bold text-[#fafafa]">{latestUnread.title}</p>
            <p className="text-[11px] text-[#888] leading-relaxed">{latestUnread.message}</p>
            <span className="text-[10px] text-[#666] font-mono block pt-1">
              {latestUnread.timestamp}
            </span>
          </div>

          <button
            onClick={() => dismissNotification(latestUnread.id)}
            className="text-[#888] hover:text-[#fafafa] p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Full Drawer / Modal
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#111] border border-[#333] rounded-2xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl max-h-[85vh] flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#222]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#888]" />
            <h3 className="text-sm font-bold text-[#fafafa]">
              Notificações de Sincronização & Progresso
            </h3>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={markAllNotificationsRead}
              className="text-xs font-semibold text-[#888] hover:text-[#fafafa] flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Marcar lidas</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#888] hover:text-[#fafafa] p-1 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#666]">
              Nenhuma notificação registrada.
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className="p-3.5 rounded-lg bg-[#161616] border border-[#222] flex items-start gap-3 text-xs"
              >
                {notif.type === 'success' && (
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                )}
                {notif.type === 'info' && (
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                )}
                {notif.type === 'warning' && (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#fafafa]">{notif.title}</span>
                    <span className="text-[10px] text-[#666] font-mono">
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#888] leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                <button
                  onClick={() => dismissNotification(notif.id)}
                  className="text-[#666] hover:text-[#fafafa] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
