import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Filter, 
  ExternalLink, 
  FileText, 
  HardHat, 
  MessageSquare, 
  Sparkles, 
  Truck, 
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import { BuildwiseApiClient } from '../../api/buildwiseApi';
import type { NotificationItem, NotificationCategory } from '../../types/communication';

interface NotificationsViewProps {
  userId?: string;
  refreshTrigger?: number;
  onBackToHome: () => void;
  onNavigateToContext?: (url?: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  userId,
  refreshTrigger,
  onBackToHome,
  onNavigateToContext
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);

  const fetchNotifications = async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await BuildwiseApiClient.getNotifications(userId, selectedCategory, unreadOnly);
      setNotifications(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId, selectedCategory, unreadOnly, refreshTrigger]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!userId) return;
    await BuildwiseApiClient.markNotificationRead(id, userId);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    if (!userId) return;
    await BuildwiseApiClient.markAllNotificationsRead(userId);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleDismiss = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    await BuildwiseApiClient.dismissNotification(id, userId);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getCategoryBadge = (category: NotificationCategory) => {
    switch (category) {
      case 'quotation':
        return { label: 'Quotation', bg: 'bg-amber-100 text-amber-900 border-amber-200', icon: FileText };
      case 'enquiry':
        return { label: 'Enquiry', bg: 'bg-blue-100 text-blue-900 border-blue-200', icon: HardHat };
      case 'message':
        return { label: 'Message', bg: 'bg-emerald-100 text-emerald-900 border-emerald-200', icon: MessageSquare };
      case 'milestone':
        return { label: 'Milestone', bg: 'bg-purple-100 text-purple-900 border-purple-200', icon: Sparkles };
      case 'supplier_enquiry':
        return { label: 'Supplier RFQ', bg: 'bg-teal-100 text-teal-900 border-teal-200', icon: Truck };
      default:
        return { label: 'System', bg: 'bg-slate-100 text-slate-800 border-slate-200', icon: Clock };
    }
  };

  const categories = [
    { id: 'all', label: 'All Notifications', icon: Layers },
    { id: 'quotation', label: 'Quotations', icon: FileText },
    { id: 'enquiry', label: 'Enquiries', icon: HardHat },
    { id: 'message', label: 'Messages', icon: MessageSquare },
    { id: 'milestone', label: 'Milestones', icon: Sparkles },
    { id: 'supplier_enquiry', label: 'Supplier Inquiries', icon: Truck },
  ];

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!userId) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <Bell className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Active User Persona Selected</h2>
        <p className="text-slate-600 max-w-md mx-auto mb-6 text-sm">
          Please select a persona (Customer Rahul, Contractor Carlos, or Supplier Sunil) using the switcher in the header to view your notifications.
        </p>
        <button
          onClick={onBackToHome}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors text-sm cursor-pointer"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Navigation & Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-xs ${
                unreadCount > 0 
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          </div>
        </div>

        {/* Header Hero Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold mb-2">
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span>Feature 8 · Centralized Communication Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Notification Centre
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Stay synchronized with live contractor quotations, site milestone logs, material inquiries, and direct messages.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center min-w-24">
              <span className="text-xl font-black text-slate-900">{notifications.length}</span>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center min-w-24">
              <span className="text-xl font-black text-amber-700">{unreadCount}</span>
              <span className="block text-[10px] text-amber-600 font-bold uppercase tracking-wider">Unread</span>
            </div>
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
            <button
              onClick={() => setUnreadOnly(prev => !prev)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                unreadOnly 
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' 
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Unread Only</span>
            </button>
          </div>
        </div>

        {/* Notification Stream Cards */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              Loading notification records...
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">No notifications match this filter</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                All caught up! Realtime notifications triggered by enquiries, quotations, and site updates will be listed here.
              </p>
            </div>
          ) : (
            notifications.map(item => {
              const badge = getCategoryBadge(item.category);
              const BadgeIcon = badge.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id)}
                  className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-4 group ${
                    !item.is_read 
                      ? 'border-amber-300 bg-amber-50/20 shadow-xs ring-1 ring-amber-500/10' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-xl border ${badge.bg} shrink-0 mt-0.5`}>
                      <BadgeIcon className="w-4 h-4" />
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        {!item.is_read && (
                          <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          {new Date(item.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <h3 className={`text-sm ${!item.is_read ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                    {item.action_url && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(item.id);
                          if (onNavigateToContext) onNavigateToContext(item.action_url);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <span>View Context</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!item.is_read && (
                      <button
                        onClick={(e) => handleMarkAsRead(item.id, e)}
                        title="Mark as read"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDismiss(item.id, e)}
                      title="Dismiss notification"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

