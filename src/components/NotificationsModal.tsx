import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Bell, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';

export const NotificationsModal: React.FC = () => {
  const {
    notifications,
    isNotificationOpen,
    setIsNotificationOpen,
    markNotificationRead,
    clearAllNotifications,
  } = useApp();

  if (!isNotificationOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm h-full shadow-2xl p-5 overflow-y-auto space-y-4 border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-pink-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Alerts & Notifications
            </h3>
          </div>
          <button
            onClick={() => setIsNotificationOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {notifications.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={clearAllNotifications}
              className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          </div>
        )}

        <div className="space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No new notifications or alerts.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                  n.read
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70'
                    : 'bg-rose-50/60 dark:bg-pink-950/30 border-rose-200 dark:border-pink-900'
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                      {n.title}
                    </h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(n.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
