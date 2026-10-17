import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink, X, Info, Package, Truck, DollarSign, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { InAppNotification } from '../../types';
import { Link } from 'react-router-dom';

interface NotificationBellProps {
  role: 'admin' | 'seller' | 'customer';
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ role }) => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const endpoint = 
    role === 'admin' ? '/admin/notifications' :
    role === 'seller' ? '/seller/notifications' :
    '/customer/notifications';

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get(endpoint);
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000); // Poll periodically
    return () => clearInterval(interval);
  }, [role]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.put(`${endpoint}/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package size={14} className="text-brand-700" />;
      case 'shipping': return <Truck size={14} className="text-blue-700" />;
      case 'payout': return <DollarSign size={14} className="text-emerald-700" />;
      case 'kyc': return <ShieldAlert size={14} className="text-amber-700" />;
      default: return <Info size={14} className="text-charcoal-700" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-charcoal-700 hover:text-brand-900 rounded-lg hover:bg-ivory-200 transition-colors"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-warm-lg border border-ivory-300 z-50 overflow-hidden text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3 bg-ivory-100 border-b border-ivory-300 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-serif font-bold text-charcoal-900">
              <span>Marketplace Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-900">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-charcoal-400 hover:text-charcoal-700 p-1"
            >
              <X size={14} />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-ivory-200">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-charcoal-500">Checking notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-charcoal-500">
                <Bell size={24} className="mx-auto text-charcoal-300 mb-2 opacity-50" />
                <p className="font-semibold text-charcoal-700">No new notifications</p>
                <p className="text-[11px] text-charcoal-400 mt-0.5">All handloom marketplace alerts will appear here.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 flex gap-3 hover:bg-ivory-50 transition-colors ${
                    !notif.is_read ? 'bg-brand-50/40' : ''
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-full bg-ivory-200 shrink-0 h-fit">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 space-y-0.5 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`font-semibold text-charcoal-900 text-xs truncate ${!notif.is_read ? 'font-bold' : ''}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-charcoal-400 shrink-0 font-mono">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal-600 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      {notif.link ? (
                        <Link
                          to={notif.link}
                          onClick={() => setIsOpen(false)}
                          className="text-[10px] font-semibold text-brand-700 hover:underline flex items-center gap-0.5"
                        >
                          <span>View Details</span>
                          <ExternalLink size={10} />
                        </Link>
                      ) : <span />}
                      {!notif.is_read && (
                        <button
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          className="text-[10px] text-charcoal-500 hover:text-emerald-700 flex items-center gap-0.5 font-medium"
                        >
                          <Check size={11} />
                          <span>Mark read</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
