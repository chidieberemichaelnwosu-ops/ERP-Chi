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
  ChevronRight
} from 'lucide-react';

export const MoreMenu: React.FC = () => {
  const { setActiveTab } = useApp();

  const menuItems = [
    {
      id: 'purchases',
      title: 'Purchases & Suppliers',
      subtitle: 'Record supplier invoices & restocks',
      icon: Truck,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'customers',
      title: 'Customers & Debtors',
      subtitle: 'Track purchase history & customer debts',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'expenses',
      title: 'Daily Expense Tracker',
      subtitle: 'Log transport, generator fuel & rent',
      icon: Receipt,
      color: 'bg-rose-100 text-rose-600',
    },
    {
      id: 'inventory',
      title: 'Stock Control Logs',
      subtitle: 'Damaged goods, returns & stock in/out',
      icon: Boxes,
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      id: 'reports',
      title: 'Reports & Export',
      subtitle: 'Generate PDF, Excel & CSV reports',
      icon: FileSpreadsheet,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      id: 'settings',
      title: 'Settings & User Roles',
      subtitle: 'Store details, currency, tax & backups',
      icon: Settings,
      color: 'bg-slate-100 text-slate-600',
    },
  ];

  return (
    <div className="p-3 sm:p-6 max-w-2xl mx-auto space-y-4 pb-28">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          All Modules & Utilities
        </h2>
        <p className="text-xs text-slate-500">
          Quickly jump to secondary tools and business administration features.
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
