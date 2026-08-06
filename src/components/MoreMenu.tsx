import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Truck,
  Users,
  Receipt,
  Settings,
  ShieldCheck,
  Boxes,
  FileSpreadsheet,
  ChevronRight,
  User,
  Building,
  KeyRound,
  RefreshCw,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  ArrowRightLeft,
} from 'lucide-react';

export const MoreMenu: React.FC = () => {
  const {
    setActiveTab,
    userRole,
    primaryUserRole,
    userName,
    setUserRole,
    settings,
    setIsProfileModalOpen,
    setIsChangePasswordOpen,
    setIsLogoutConfirmOpen,
    triggerSync,
    unSyncedCount,
    appUsers,
  } = useApp();

  const canSwitchRoles = primaryUserRole === 'super_admin' || primaryUserRole === 'administrator';
  const isAdminOrSuper = userRole === 'super_admin' || userRole === 'administrator';

  const currentUser = appUsers.find(
    (u) => u.fullName.toLowerCase() === userName.toLowerCase() || u.fullName.toLowerCase().includes(userName.toLowerCase().split(' ')[0])
  );

  const getRoleBadgeLabel = (role: string) => {
    if (role === 'super_admin') return 'Super Administrator';
    if (role === 'administrator') return 'Administrator';
    if (role === 'manager') return 'Manager';
    return 'Sales Person';
  };

  const mainModules = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'Overview, sales summary & analytics',
      icon: LayoutDashboard,
      color: 'bg-purple-100 dark:bg-purple-950/60 text-[#6A1B9A] dark:text-purple-300',
      roles: ['super_admin', 'administrator', 'manager', 'salesperson'],
    },
    {
      id: 'sales',
      title: 'Sales & POS Terminal',
      subtitle: 'Checkout terminal & daily sales receipt',
      icon: ShoppingCart,
      color: 'bg-pink-100 dark:bg-pink-950/60 text-[#EC407A]',
      roles: ['super_admin', 'administrator', 'manager', 'salesperson'],
    },
    {
      id: 'transactions',
      title: 'Transactions & Audit Logs',
      subtitle: 'Sales history, receipt lookup & logs',
      icon: ArrowRightLeft,
      color: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600',
      roles: ['super_admin', 'administrator', 'manager', 'salesperson'],
    },
    {
      id: 'expenses',
      title: 'Daily Expense Tracker',
      subtitle: 'Log transport, generator fuel & rent',
      icon: Receipt,
      color: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600',
      roles: ['super_admin', 'administrator', 'manager', 'salesperson'],
    },
    {
      id: 'purchases',
      title: 'Purchases & Suppliers',
      subtitle: 'Record supplier invoices & restocks',
      icon: Truck,
      color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-600',
      roles: ['super_admin', 'administrator', 'manager'],
    },
    {
      id: 'customers',
      title: 'Customers & Debtors',
      subtitle: 'Track purchase history & customer debts',
      icon: Users,
      color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600',
      roles: ['super_admin', 'administrator', 'manager', 'salesperson'],
    },
    {
      id: 'inventory',
      title: 'Stock Control Logs',
      subtitle: 'Damaged goods, returns & stock in/out',
      icon: Boxes,
      color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600',
      roles: ['super_admin', 'administrator', 'manager'],
    },
    {
      id: 'reports',
      title: 'Reports & Export',
      subtitle: 'Generate PDF, Excel & CSV reports',
      icon: FileSpreadsheet,
      color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600',
      roles: ['super_admin', 'administrator', 'manager'],
    },
    {
      id: 'settings',
      title: 'Settings & User Roles',
      subtitle: 'Store details, currency, tax & backups',
      icon: Settings,
      color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200',
      roles: ['super_admin', 'administrator'],
    },
  ];

  const menuItems = mainModules.filter((item) => item.roles.includes(userRole));

  return (
    <div className="p-3 sm:p-6 max-w-2xl mx-auto space-y-5 pb-28">
      
      {/* USER PROFILE SUMMARY CARD */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          {currentUser?.profilePhoto ? (
            <img
              src={currentUser.profilePhoto}
              alt={userName}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#6A1B9A] shadow-md shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6A1B9A] to-[#EC407A] text-white font-black text-lg flex items-center justify-center uppercase shadow-md shrink-0">
              {userName ? userName[0] : 'U'}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base truncate">
              {userName || 'Active Staff User'}
            </h3>
            <span className="inline-block px-2.5 py-0.5 bg-purple-100 dark:bg-purple-950 text-[#6A1B9A] dark:text-purple-300 font-black text-[10px] uppercase tracking-wider rounded-full mt-0.5">
              {getRoleBadgeLabel(userRole)}
            </span>
          </div>
        </div>

        {canSwitchRoles && (
          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">
              Switch Role
            </span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any, 'More Menu Role Switcher')}
              className="px-2.5 py-1 bg-purple-50 dark:bg-slate-800 border border-purple-200 dark:border-slate-700 rounded-xl text-xs font-black text-[#6A1B9A] dark:text-purple-200 outline-none cursor-pointer"
            >
              {primaryUserRole === 'super_admin' && (
                <option value="super_admin">Super Admin</option>
              )}
              <option value="administrator">Administrator</option>
              <option value="manager">Manager</option>
              <option value="salesperson">Sales Person</option>
            </select>
          </div>
        )}
      </div>

      {/* ACCESSIBLE MODULES SECTION */}
      <div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
          Application Modules
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Features available for your assigned operational role.
        </p>
      </div>

      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="w-full bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-300 transition flex items-center justify-between group active:scale-98"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`p-3 rounded-2xl ${item.color} shrink-0`}>
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="text-left min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.subtitle}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#EC407A] transition shrink-0" />
            </button>
          );
        })}
      </div>

      {/* DIVIDER LINE AS SPECIFIED */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#F8F9FA] dark:bg-slate-950 px-3 text-slate-400 font-black tracking-widest text-[10px]">
            Account & Security Settings
          </span>
        </div>
      </div>

      {/* USER ACCOUNT OPTIONS LIST */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80 shadow-xs">
        
        {/* 1. My Profile */}
        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-[#6A1B9A] dark:text-purple-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">👤 My Profile</div>
              <p className="text-xs text-slate-400">View & edit personal contact details</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>

        {/* 2. Business Profile (Super Admin & Admin Only) */}
        {isAdminOrSuper && (
          <button
            onClick={() => setActiveTab('settings')}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-[#6A1B9A] dark:text-purple-300">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">🏢 Business Profile</div>
                <p className="text-xs text-slate-400">Manage store details, branding & receipts</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        )}

        {/* 3. Change Password */}
        <button
          onClick={() => setIsChangePasswordOpen(true)}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">🔒 Change Password</div>
              <p className="text-xs text-slate-400">Update security access credentials</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>

        {/* 4. Sync Data */}
        <button
          onClick={triggerSync}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">🔄 Sync Data</div>
              <p className="text-xs text-slate-400">
                {unSyncedCount > 0 ? `${unSyncedCount} unsynchronized records` : 'Cloud database synchronized'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>

        {/* 5. LOGOUT (Always at bottom, highlighted with red icon) */}
        <button
          onClick={() => setIsLogoutConfirmOpen(true)}
          className="w-full p-4 text-left flex items-center justify-between bg-rose-50/60 dark:bg-rose-950/40 hover:bg-rose-100/70 dark:hover:bg-rose-950/70 transition group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-600/20">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-sm text-rose-700 dark:text-rose-300">🚪 Logout</div>
              <p className="text-xs font-semibold text-rose-600/80 dark:text-rose-400/80">
                Safely sign out of active session
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-rose-500 group-hover:translate-x-1 transition" />
        </button>

      </div>
    </div>
  );
};
