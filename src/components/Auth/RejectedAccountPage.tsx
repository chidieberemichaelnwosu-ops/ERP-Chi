import React from 'react';
import { XCircle, ArrowLeft } from 'lucide-react';

interface RejectedAccountPageProps {
  onBackToLogin: () => void;
  userName?: string;
}

export const RejectedAccountPage: React.FC<RejectedAccountPageProps> = ({
  onBackToLogin,
  userName,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden transition-colors">
      
      <div className="relative z-10 w-full max-w-md bg-white border border-slate-200 rounded-3xl sm:rounded-[36px] shadow-2xl shadow-slate-200/80 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
        
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-600 flex items-center justify-center mx-auto shadow-md">
            <XCircle className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-black uppercase tracking-wider">
              Registration Status
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Registration Rejected
            </h2>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-900 leading-relaxed text-center space-y-2">
          {userName && (
            <p className="font-bold text-slate-900 text-sm">
              Hello, {userName}
            </p>
          )}
          <p>
            Your request for account registration was not approved by the Store Administrator.
          </p>
          <p className="text-amber-800 font-bold pt-1">
            Please contact your manager or re-register with valid staff credentials.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#6A1B9A] via-purple-700 to-[#EC407A] hover:opacity-95 text-white font-black text-sm shadow-xl shadow-purple-900/20 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Login</span>
          </button>
        </div>

      </div>
    </div>
  );
};
