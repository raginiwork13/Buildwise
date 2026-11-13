import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { BuildwiseApiClient } from '../../api/buildwiseApi';
import { NotificationDropdown } from './NotificationDropdown';

interface NotificationBellProps {
  userId: string;
  onOpenNotificationsPage: () => void;
  onNavigateToContext?: (url?: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  userId,
  onOpenNotificationsPage,
  onNavigateToContext
}) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Poll / fetch unread count whenever userId changes and periodically
  const fetchCount = async () => {
    if (!userId) return;
    try {
      const count = await BuildwiseApiClient.getUnreadCount(userId);
      setUnreadCount(count);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 4000);
    return () => clearInterval(interval);
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setDropdownOpen(prev => !prev)}
        aria-label="View notifications"
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black border border-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <NotificationDropdown
          userId={userId}
          onClose={() => setDropdownOpen(false)}
          onViewAll={() => {
            setDropdownOpen(false);
            onOpenNotificationsPage();
          }}
          onRefreshCount={fetchCount}
          onNavigateToContext={(url) => {
            setDropdownOpen(false);
            if (onNavigateToContext) onNavigateToContext(url);
          }}
        />
      )}
    </div>
  );
};

