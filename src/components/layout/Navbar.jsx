import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Bell, ShieldCheck, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifs = async () => {
    try {
      if (user) {
        const data = await api.getNotifications();
        setNotifications(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand & Official Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5 shadow-md">
          <img
            src="/pjsofonic_crm.png"
            alt="PJSOFONIC CRM Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base tracking-tight text-white">
              PJSOFONIC <span className="text-indigo-400 font-semibold">CRM</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              ENTERPRISE
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="flex items-center space-x-1 text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              <span>EMS Auth Active</span>
            </span>
            <span>•</span>
            <span className="text-indigo-300 font-medium">
              {user?.role === 'ADMIN' ? 'Admin Portal' : 'Customer Portal'}
            </span>
          </div>
        </div>
      </div>

      {/* Right User & Notification Controls */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white relative transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 text-[10px] font-extrabold text-white flex items-center justify-center animate-pulse shadow-sm shadow-indigo-500">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl glass-panel p-4 z-50 shadow-2xl border border-slate-700">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2">
                <span className="font-bold text-sm text-slate-200">System Notifications</span>
                <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                  Real-time
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No recent notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs hover:border-slate-700">
                      <div className="font-bold text-slate-200 mb-1">{n.title}</div>
                      <div className="text-slate-400 leading-snug">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center space-x-3 bg-slate-950/40 p-1.5 pr-3 rounded-xl border border-slate-800">
          <img
            src="/pjsofonic_crm.png"
            alt="User Avatar"
            className="w-8 h-8 rounded-lg object-contain bg-slate-900 border border-slate-800 p-1"
          />
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-slate-200 leading-tight">{user?.name}</div>
            <div className="text-[10px] text-slate-400 flex items-center space-x-1">
              <span className={`w-1.5 h-1.5 rounded-full ${user?.role === 'ADMIN' ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
              <span className="uppercase font-semibold tracking-wider text-[9px]">{user?.role}</span>
              <span>•</span>
              <span className="truncate max-w-[100px]">{user?.company}</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Sign Out of CRM"
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-900/40 border border-slate-700/60 text-slate-300 hover:text-rose-300 transition-all flex items-center space-x-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-semibold hidden md:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
