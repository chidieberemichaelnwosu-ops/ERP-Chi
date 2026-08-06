import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Sparkles,
  Search,
  Bell,
  WifiOff,
  RefreshCw,
  Sun,
  Moon,
  UserCheck,
  ChevronDown,
  ShieldCheck,
  Clock,
  User,
  Building,
  Settings,
  KeyRound,
  LogOut,
  CheckCircle2,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    settings,
    userRole,
    primaryUserRole,
    setUserRole,
    userName,
    isOffline,
    isSyncing,
    unSyncedCount,
    triggerSync,
    notifications,
    setIsNotificationOpen,
    setIsSearchOpen,
    updateSettings,
    pendingApprovalsCount,
    setIsPendingApprovalsOpen,
    setIsAuthModalOpen,
    setIsLogoutConfirmOpen,
    setIsChangePasswordOpen,
    setIsProfileModalOpen,
    setActiveTab,
    appUsers,
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const canSwitchRoles = primaryUserRole === 'super_admin' || primaryUserRole === 'administrator';
  const canApproveUsers = primaryUserRole === 'super_admin' || primaryUserRole === 'administrator';
  const isAdminOrSuper = userRole === 'super_admin' || userRole === 'administrator';

  const currentUser = appUsers.find(
    (u) => u.fullName.toLowerCase() === userName.toLowerCase() || u.fullName.toLowerCase().includes(userName.toLowerCase().split(' ')[0])
  );

  const getRoleDisplayTitle = (r: UserRole) => {
    if (r === 'super_admin') return 'Super Administrator';
    if (r === 'administrator') return 'Administrator';
    if (r === 'manager') return 'Manager';
    return 'Sales Person';
  };

  const availableSwitchRoles: { id: UserRole; label: string }[] =
    primaryUserRole === 'super_admin'
      ? [
          { id: 'super_admin', label: 'Super Administrator' },
          { id: 'administrator', label: 'Administrator' },
          { id: 'manager', label: 'Manager' },
          { id: 'salesperson', label: 'Sales Person' },
        ]
      : primaryUserRole === 'administrator'
      ? [
          { id: 'administrator', label: 'Administrator' },
          { id: 'manager', label: 'Manager' },
          { id: 'salesperson', label: 'Sales Person' },
        ]
      : [];

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-xs px-3 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#6A1B9A] to-[#EC407A] rounded-2xl flex items-center justify-center text-white shadow-md shadow-purple-900/10 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="truncate">
            <h1 className="font-black text-slate-900 dark:text-white text-base sm:text-lg leading-tight truncate tracking-tight">
              {settings.businessName && settings.businessName !== 'Not Configured'
                ? settings.businessName
                : 'Cosmetics ERP'}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate flex items-center gap-1.5">
              <span className="font-bold text-[#6A1B9A] dark:text-purple-300">{userName || 'Active Staff'}</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="bg-purple-100 dark:bg-purple-950/80 text-[#6A1B9A] dark:text-purple-200 px-2 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider">
                {getRoleDisplayTitle(userRole)}
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Pending Approvals Badge Button for Super Admin & Admin */}
          {canApproveUsers && pendingApprovalsCount > 0 && (
            <button
              onClick={() => setIsPendingApprovalsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500 text-slate-950 text-xs font-black shadow-md hover:bg-amber-400 transition animate-pulse"
              title="Review Pending User Registration Approvals"
            >
              <Clock className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Approvals ({pendingApprovalsCount})</span>
              <span className="sm:hidden">({pendingApprovalsCount})</span>
            </button>
          )}

          {/* Quick Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition"
            title="Search Products, Sales, Customers"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline text-slate-400">Search store...</span>
          </button>

          {/* Sync & Offline Status */}
          <div className="flex items-center">
            {isOffline ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200">
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Offline</span>
              </span>
            ) : (
              <button
                onClick={triggerSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-teal-500/10 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-500/20 transition border border-teal-200/50 dark:border-teal-800/50"
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

          {/* Role Tester Dropdown (Super Admin & Admin Only) */}
          {canSwitchRoles && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-[#6A1B9A] dark:text-purple-200 text-xs font-extrabold hover:bg-purple-100 transition"
                title="Switch Operational Role for Testing"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#EC407A]" />
                <span className="truncate">{getRoleDisplayTitle(userRole)}</span>
                <ChevronDown className="w-3 h-3 text-[#EC407A]" />
              </button>

              {isRoleDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsRoleDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50">
                    <div className="px-3.5 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Switch Role View
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {availableSwitchRoles.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => {
                            setUserRole(r.id, 'Header Switcher');
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs font-bold flex items-center justify-between transition ${
                            userRole === r.id
                              ? 'bg-purple-50 dark:bg-slate-700 text-[#6A1B9A] dark:text-purple-300'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <span>{r.label}</span>
                          {userRole === r.id && <span className="w-2 h-2 rounded-full bg-[#EC407A]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Notifications Trigger */}
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="relative p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EC407A] text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => updateSettings({ enableDarkMode: !settings.enableDarkMode })}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title={settings.enableDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {settings.enableDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#6A1B9A]" />
            )}
          </button>

          {/* ================= USER PROFILE DROPDOWN MENU ================= */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition active:scale-95"
              title="User Menu & Profile Options"
            >
              {currentUser?.profilePhoto ? (
                <img
                  src={currentUser.profilePhoto}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover border border-purple-300"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6A1B9A] to-[#EC407A] text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {userName ? userName[0].toUpperCase() : 'U'}
                </div>
              )}
              <span className="hidden lg:inline text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                {userName.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in zoom-in-95 duration-150">
                  
                  {/* USER INFO HEADER CARD */}
                  <div className="p-4 bg-gradient-to-br from-[#6A1B9A]/10 via-purple-500/5 to-[#EC407A]/10 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    {currentUser?.profilePhoto ? (
                      <img
                        src={currentUser.profilePhoto}
                        alt={userName}
                        className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-md shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#6A1B9A] to-[#EC407A] text-white font-black text-sm flex items-center justify-center shadow-md shrink-0">
                        {userName ? userName[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-black text-sm text-slate-900 dark:text-white truncate">
                        {userName}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-2 py-0.2 rounded-full bg-[#6A1B9A] text-white text-[9px] font-black uppercase tracking-wider">
                          {getRoleDisplayTitle(userRole)}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {settings.businessName && settings.businessName !== 'Not Configured'
                          ? settings.businessName
                          : 'Cosmetics ERP'}
                      </p>
                    </div>
                  </div>

                  {/* MENU ITEMS */}
                  <div className="p-2 space-y-1">
                    {/* 1. My Profile */}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition"
                    >
                      <User className="w-4 h-4 text-[#6A1B9A] dark:text-purple-300 shrink-0" />
                      <span>My Profile</span>
                    </button>

                    {/* 2. Business Profile (Super Admin & Admin Only) */}
                    {isAdminOrSuper && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveTab('settings');
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition"
                      >
                        <Building className="w-4 h-4 text-[#6A1B9A] dark:text-purple-300 shrink-0" />
                        <span>Business Profile</span>
                      </button>
                    )}

                    {/* 3. System Settings (Super Admin & Admin Only) */}
                    {isAdminOrSuper && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveTab('settings');
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition"
                      >
                        <Settings className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>Settings</span>
                      </button>
                    )}

                    {/* 4. Sync Data */}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        triggerSync();
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>Sync Data</span>
                      </div>
                      {unSyncedCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-extrabold">
                          {unSyncedCount}
                        </span>
                      )}
                    </button>

                    {/* 5. Change Password */}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsChangePasswordOpen(true);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition"
                    >
                      <KeyRound className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Change Password</span>
                    </button>

                    {/* 6. Switch User Portal */}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition border-t border-slate-100 dark:border-slate-800/80 my-1 pt-2.5"
                    >
                      <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>Switch Account Portal</span>
                    </button>

                    {/* 7. LOGOUT (Always at bottom, highlighted with red icon) */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsLogoutConfirmOpen(true);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-2xl text-xs font-black text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-3 transition group"
                      >
                        <LogOut className="w-4 h-4 text-rose-600 group-hover:scale-110 transition shrink-0" />
                        <span>Logout</span>
                      </button>
                    </div>

                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
