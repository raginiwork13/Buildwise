import React, { useState, useEffect } from 'react';
import { 
  CheckCheck, 
  FileText, 
  MessageSquare, 
  HardHat, 
  Truck, 
  Sparkles, 
  Clock, 
  ChevronRight,
  BellOff,
  X
} from 'lucide-react';
import { BuildwiseApiClient } from '../../api/buildwiseApi';
import type { NotificationItem, NotificationCategory } from '../../types/communication';

interface NotificationDropdownProps {
  userId: string;
  onClose: () => void;
  onViewAll: () => void;
  onRefreshCount: () => void;
  onNavigateToContext?: (url?: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  userId,
  onClose,
  onViewAll,
  onRefreshCount,
  onNavigateToContext
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const list = await BuildwiseApiClient.getNotifications(userId);
      setNotifications(list.slice(0, 5));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const handleMarkAllRead = async () => {
    await BuildwiseApiClient.markAllNotificationsRead(userId);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    onRefreshCount();
  };

  const handleClickItem = async (item: NotificationItem) => {
    if (!item.is_read) {
      await BuildwiseApiClient.markNotificationRead(item.id, userId);
      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n));
      onRefreshCount();
    }
    if (onNavigateToContext) {
      onNavigateToContext(item.action_url);
    }
    onClose();
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'quotation':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'enquiry':
        return <HardHat className="w-4 h-4 text-blue-600" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'milestone':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'supplier_enquiry':
        return <Truck className="w-4 h-4 text-teal-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatTimestamp = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 text-sm">Notifications</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
            Recent
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <BellOff className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-slate-600 font-medium">No notifications yet</div>
            <p className="text-[11px] text-slate-400">Marketplace activity and messages will appear here.</p>
          </div>
        ) : (
          notifications.map(item => (
            <div
              key={item.id}
              onClick={() => handleClickItem(item)}
              className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start ${
                !item.is_read ? 'bg-amber-50/30 font-medium' : 'text-slate-600'
              }`}
            >
              <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs shrink-0 mt-0.5">
                {getCategoryIcon(item.category)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-1">
                  <h4 className={`text-xs truncate ${!item.is_read ? 'font-bold text-slate-900' : 'text-slate-800'}`}>
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {formatTimestamp(item.created_at)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                  {item.message}
                </p>
              </div>

              {!item.is_read && (
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <button
          onClick={onViewAll}
          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Open Full Notification Center</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
