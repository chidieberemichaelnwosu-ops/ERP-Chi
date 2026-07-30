import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  ShoppingBag,
  BarChart3,
  Plus,
  Menu,
  Boxes
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Sales POS', icon: ShoppingBag },
    { id: 'inventory', label: 'Products', icon: Boxes },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'more', label: 'More', icon: Menu },
  ];

  return (
    <>
      {/* Floating Quick Action (+ Sale) Button for Mobile */}
      <div className="fixed bottom-20 right-4 sm:right-8 z-40">
        <button
          onClick={() => setActiveTab('sales')}
          className="w-14 h-14 rounded-full bg-rose-500 text-white shadow-xl shadow-rose-200 dark:shadow-none flex items-center justify-center hover:bg-rose-600 hover:scale-105 active:scale-95 transition-all group"
          title="Quick New Sale"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>

      {/* Android Material Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 shadow-xl px-2 sm:px-6 py-2 transition-colors">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all min-w-[64px] ${
                  isActive
                    ? 'text-rose-600 dark:text-rose-400 font-bold scale-105'
                    : 'text-slate-400 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-1.5 rounded-2xl transition-colors ${
                    isActive ? 'bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-none' : 'bg-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                </div>
                <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
