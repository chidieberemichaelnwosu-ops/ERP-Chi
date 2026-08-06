import React from 'react';
import { ArrowLeft, AlertOctagon } from 'lucide-react';

interface SuspendedAccountPageProps {
  onBackToLogin: () => void;
  userName?: string;
}

export const SuspendedAccountPage: React.FC<SuspendedAccountPageProps> = ({
  onBackToLogin,
  userName,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden transition-colors">
      
      <div className="relative z-10 w-full max-w-md bg-white border border-rose-200 rounded-3xl sm:rounded-[36px] shadow-2xl shadow-slate-200/80 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
        
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 border-2 border-rose-300 text-rose-600 flex items-center justify-center mx-auto shadow-md">
            <AlertOctagon className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-xs font-black uppercase tracking-wider">
              Account Status Notice
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Account Suspended
            </h2>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-900 leading-relaxed text-center space-y-2">
          {userName && (
            <p className="font-bold text-slate-900 text-sm">
              Hello, {userName}
            </p>
          )}
          <p>
            Your account access has been temporarily suspended or disabled by a Store Administrator.
          </p>
          <p className="text-rose-700 font-bold pt-1">
            If you believe this is an error, please contact your Store Owner or Administrator for assistance.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Login</span>
          </button>
        </div>

      </div>
    </div>
  );
};
