import React, { useState } from 'react';
import { Mail, ArrowLeft, KeyRound, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your staff email address.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden transition-colors">
      
      <div className="relative z-10 w-full max-w-md bg-white border border-slate-200/80 rounded-3xl sm:rounded-[36px] shadow-2xl shadow-slate-200/80 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6A1B9A] to-[#EC407A] text-white flex items-center justify-center mx-auto shadow-md shadow-purple-900/20">
            <KeyRound className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Reset Password
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Enter your registered staff email address to receive reset instructions
            </p>
          </div>
        </div>

        {isSubmitted ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium space-y-3 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <p className="font-bold text-slate-900 text-sm">
              Instructions Sent!
            </p>
            <p className="text-slate-600 leading-relaxed">
              If an account is associated with <span className="text-[#6A1B9A] font-bold">{email}</span>, you will receive password reset instructions shortly.
            </p>
            <button
              onClick={onBackToLogin}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-[#6A1B9A] hover:bg-[#5c1687] text-white font-bold text-xs transition shadow-sm cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Staff Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#6A1B9A] focus:border-transparent outline-none transition min-h-[48px]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-[#6A1B9A] to-[#EC407A] hover:opacity-95 text-white font-black text-xs shadow-lg shadow-purple-900/20 transition active:scale-[0.98] disabled:opacity-50 min-h-[48px] cursor-pointer"
            >
              {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
