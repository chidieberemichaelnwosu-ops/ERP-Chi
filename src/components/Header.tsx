import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../services/export';
import {
  Sparkles,
  Search,
  Bell,
  Wifi,
  WifiOff,
  RefreshCw,
  Sun,
  Moon,
  UserCheck,
  ChevronDown
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    settings,
    userRole,
    setUserRole,
    isOffline,
    isSyncing,
    unSyncedCount,
    triggerSync,
    notifications,
    setIsNotificationOpen,
    setIsSearchOpen,
    updateSettings,
  } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-xs px-4 sm:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200 dark:shadow-none shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="truncate">
            <h1 className="font-bold text-rose-900 dark:text-rose-100 text-base sm:text-xl leading-tight truncate tracking-tight">
              {settings.businessName || 'GlossyERP'}
            </h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium truncate flex items-center gap-1.5">
              <span className="font-bold text-rose-600 dark:text-rose-400">GlossyERP</span>
              <span className="text-slate-200 dark:text-slate-700">•</span>
              <span className="capitalize bg-rose-50 dark:bg-slate-800 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider">{userRole}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs sm:text-sm font-medium transition-all border border-slate-100 dark:border-slate-700"
            title="Search Products, Sales, Customers"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline text-slate-400">Search store...</span>
          </button>

          {/* Sync & Offline Status */}
          <div className="flex items-center">
            {isOffline ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200">
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Offline</span>
              </span>
            ) : (
              <button
                onClick={triggerSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-500/20 transition border border-teal-200/50 dark:border-teal-800/50"
                title="Cloud Status: Tap to Sync"
              >
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="hidden sm:inline">
                  {isSyncing ? 'Syncing...' : unSyncedCount > 0 ? `${unSyncedCount} Pending` : 'Cloud Synced'}
                </span>
                {unSyncedCount > 0 && (
                  <RefreshCw
                    className={`w-3 h-3 text-teal-600 ${isSyncing ? 'animate-spin' : ''}`}
                  />
                )}
              </button>
            )}
          </div>

          {/* Role Switcher */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-50 dark:bg-pink-950/40 border border-rose-100 dark:border-pink-900/50 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition">
              <UserCheck className="w-3.5 h-3.5" />
              <span className="capitalize hidden sm:inline">{userRole}</span>
              <ChevronDown className="w-3 h-3 text-rose-500" />
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 hidden group-hover:block z-50">
              <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Switch Role
              </div>
              <button
                onClick={() => setUserRole('super_admin')}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-rose-50 dark:hover:bg-slate-700 ${
                  userRole === 'super_admin' ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                Super Administrator
              </button>
              <button
                onClick={() => setUserRole('administrator')}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-rose-50 dark:hover:bg-slate-700 ${
                  userRole === 'administrator' ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                Administrator
              </button>
              <button
                onClick={() => setUserRole('manager')}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-rose-50 dark:hover:bg-slate-700 ${
                  userRole === 'manager' ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                Manager
              </button>
              <button
                onClick={() => setUserRole('salesperson')}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-rose-50 dark:hover:bg-slate-700 ${
                  userRole === 'salesperson' ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                Salesperson
              </button>
            </div>
          </div>

          {/* Notifications Trigger */}
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="relative p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition shadow-xs"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => updateSettings({ enableDarkMode: !settings.enableDarkMode })}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition shadow-xs"
            title={settings.enableDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {settings.enableDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-rose-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
