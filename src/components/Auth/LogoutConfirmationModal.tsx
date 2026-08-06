import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LogOut, AlertTriangle, Loader2 } from 'lucide-react';

export const LogoutConfirmationModal: React.FC = () => {
  const { isLogoutConfirmOpen, setIsLogoutConfirmOpen, performLogout } = useApp();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isLogoutConfirmOpen) return null;

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await performLogout();
    } finally {
      setIsLoggingOut(false);
      setIsLogoutConfirmOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* ICON & TITLE */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-sm">
            <LogOut className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Logout
            </h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider mt-0.5">
              Confirm Account Session Exit
            </p>
          </div>
        </div>

        {/* CONFIRMATION MESSAGE */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed text-center">
          Are you sure you want to logout? Any unsynchronized data will remain safely stored and will be synchronized the next time you sign in.
        </div>

        {/* BUTTONS */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={() => setIsLogoutConfirmOpen(false)}
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs sm:text-sm transition active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleConfirmLogout}
            className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-600/20 transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Logging Out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
