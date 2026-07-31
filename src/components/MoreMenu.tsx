import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Truck,
  Users,
  Receipt,
  Settings,
  ShieldCheck,
  Package,
  Boxes,
  HelpCircle,
  FileSpreadsheet,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export const MoreMenu: React.FC = () => {
  const { setActiveTab, userRole, primaryUserRole, userName, setUserRole } = useApp();

  const canSwitchRoles = primaryUserRole === 'super_admin' || primaryUserRole === 'administrator';

  const allMenuItems = [
    {
      id: 'purchases',
      title: 'Purchases & Suppliers',
      subtitle: 'Record supplier invoices & restocks',
      icon: Truck,
      color: 'bg-purple-100 text-purple-600',
      roles: ['super_admin', 'administrator', 'manager'],
    },
    {
      id: 'customers',
      title: 'Customers & Debtors',
      subtitle: 'Track purchase history & customer debts',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      roles: ['super_admin', 'administrator', 'manager', 'salesperson'],
    },
    {
      id: 'expenses',
      title: 'Daily Expense Tracker',
      subtitle: 'Log transport, generator fuel & rent',
      icon: Receipt,
      color: 'bg-rose-100 text-rose-600',
      roles: ['super_admin', 'administrator', 'manager'],
    },
    {
      id: 'inventory',
      title: 'Stock Control Logs',
      subtitle: 'Damaged goods, returns & stock in/out',
      icon: Boxes,
      color: 'bg-emerald-100 text-emerald-600',
      roles: ['super_admin', 'administrator', 'manager'],
    },
    {
      id: 'reports',
      title: 'Reports & Export',
      subtitle: 'Generate PDF, Excel & CSV reports',
      icon: FileSpreadsheet,
      color: 'bg-amber-100 text-amber-600',
      roles: ['super_admin', 'administrator', 'manager'],
    },
    {
      id: 'settings',
      title: 'Settings & User Roles',
      subtitle: 'Store details, currency, tax & backups',
      icon: Settings,
      color: 'bg-slate-100 text-slate-600',
      roles: ['super_admin', 'administrator'],
    },
  ];

  const menuItems = allMenuItems.filter((item) => item.roles.includes(userRole));

  return (
    <div className="p-3 sm:p-6 max-w-2xl mx-auto space-y-4 pb-28">
      {/* Profile Header for Salesperson or All Users */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-rose-100 dark:border-slate-700 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white font-black text-lg flex items-center justify-center uppercase">
            {userName ? userName[0] : 'S'}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">{userName || 'Active Staff User'}</h3>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">{userRole}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">
            {canSwitchRoles ? 'Switch Active Role' : 'Assigned Role'}
          </span>
          {canSwitchRoles ? (
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any, 'More Menu Role Switcher')}
              className="px-3 py-1 bg-rose-50 dark:bg-slate-900 border border-rose-200 dark:border-slate-700 rounded-xl text-xs font-black text-rose-800 dark:text-rose-200 outline-none cursor-pointer"
            >
              {primaryUserRole === 'super_admin' && (
                <option value="super_admin">Super Administrator</option>
              )}
              <option value="administrator">Administrator</option>
              <option value="manager">Manager</option>
              <option value="salesperson">Sales Person</option>
            </select>
          ) : (
            <span className="px-3 py-1 bg-rose-50 dark:bg-slate-900 border border-rose-100 dark:border-slate-700 rounded-xl text-xs font-black text-rose-700 dark:text-rose-300 inline-block">
              {userRole === 'salesperson'
                ? 'Sales Person'
                : userRole === 'manager'
                ? 'Manager'
                : userRole === 'administrator'
                ? 'Administrator'
                : 'Super Administrator'}
            </span>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Accessible Modules
        </h2>
        <p className="text-xs text-slate-500">
          Features available for your role permission profile.
        </p>
      </div>

      <div className="space-y-2.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="w-full bg-white dark:bg-slate-800 p-4 rounded-3xl border border-rose-100 dark:border-slate-700/80 shadow-xs hover:border-pink-400 transition flex items-center justify-between group active:scale-98"
            >
              <div className="flex items-center gap-3.5">
                <div className={`p-3 rounded-2xl ${item.color}`}>
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400">{item.subtitle}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-pink-600 transition" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
