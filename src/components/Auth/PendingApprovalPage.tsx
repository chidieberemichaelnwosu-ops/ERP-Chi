import React from 'react';
import { Clock, CheckCircle2, ArrowLeft, ShieldAlert, Mail, Building, User } from 'lucide-react';
import { UserRole } from '../../types';

interface PendingApprovalPageProps {
  onBackToLogin: () => void;
  pendingUser?: {
    fullName?: string;
    email?: string;
    requestedRole?: UserRole;
    businessName?: string;
    registrationDate?: string;
  } | null;
}

export const PendingApprovalPage: React.FC<PendingApprovalPageProps> = ({
  onBackToLogin,
  pendingUser,
}) => {
  const getRoleTitle = (r?: UserRole) => {
    if (r === 'administrator') return 'Administrator';
    if (r === 'manager') return 'Manager';
    if (r === 'salesperson') return 'Sales Person';
    return 'Staff User';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden transition-colors">
      
      <div className="relative z-10 w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl sm:rounded-[36px] shadow-2xl shadow-slate-200/80 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* HEADER ICON & BANNER */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-600 flex items-center justify-center mx-auto shadow-md relative">
            <Clock className="w-10 h-10 animate-pulse" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black uppercase tracking-wider">
              Registration Submitted 🎉
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Awaiting Approval
            </h2>
          </div>
        </div>

        {/* PRIMARY MESSAGE BOX */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 leading-relaxed text-center space-y-2">
          <p className="font-bold text-slate-900 text-sm">
            Your registration details have been received successfully.
          </p>
          <p>
            An Administrator must review and approve your account before you can sign in to access the store POS terminal and inventory system.
          </p>
          <p className="text-amber-700 font-bold pt-1">
            You will gain instant access as soon as your Store Admin approves your request.
          </p>
        </div>

        {/* REGISTRATION SUMMARY CARD */}
        {pendingUser && (
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2 text-xs">
            <div className="text-[10px] font-black uppercase text-purple-700 tracking-wider mb-1">
              Application Summary
            </div>
            
            {pendingUser.fullName && (
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-[#6A1B9A]" />
                  Full Name:
                </span>
                <span className="font-bold text-slate-900">{pendingUser.fullName}</span>
              </div>
            )}

            {pendingUser.email && (
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Mail className="w-3.5 h-3.5 text-[#EC407A]" />
                  Email:
                </span>
                <span className="font-semibold text-slate-800">{pendingUser.email}</span>
              </div>
            )}

            {pendingUser.businessName && (
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  Store / Branch:
                </span>
                <span className="font-semibold text-slate-800">{pendingUser.businessName}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-700">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Requested Role:
              </span>
              <span className="font-black text-[#6A1B9A] uppercase tracking-wider text-[11px]">
                {getRoleTitle(pendingUser.requestedRole)}
              </span>
            </div>
          </div>
        )}

        {/* BUTTON: BACK TO LOGIN */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#6A1B9A] via-purple-700 to-[#EC407A] hover:opacity-95 text-white font-black text-sm shadow-xl shadow-purple-900/20 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Login Page</span>
          </button>
        </div>

        {/* FOOTER NOTE */}
        <p className="text-center text-[11px] text-slate-500 font-medium">
          Already approved? Click <span className="font-bold text-[#6A1B9A] cursor-pointer hover:underline" onClick={onBackToLogin}>Return to Login</span> to sign in.
        </p>

      </div>
    </div>
  );
};
