import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../supabaseClient';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ShoppingBag,
  BarChart3,
  ShieldCheck,
  Zap,
  Check
} from 'lucide-react';

interface SignInPageProps {
  onNavigateToSignUp: () => void;
  onNavigateToForgotPassword: () => void;
  onLoginSuccess: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  onNavigateToSignUp,
  onNavigateToForgotPassword,
  onLoginSuccess,
}) => {
  const {
    loginUser,
    settings,
    logoutNoticeMsg,
    setLogoutNoticeMsg,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Restore remembered email or pre-fill email from signup
  useEffect(() => {
    const signupEmail = sessionStorage.getItem('signup_success_email');
    if (signupEmail) {
      setEmail(signupEmail);
      setSuccessMsg('Your account has been created. Please check your email and verify your address before logging in.');
      sessionStorage.removeItem('signup_success_email');
      return;
    }

    const savedEmail = localStorage.getItem('glow_erp_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem('glow_erp_remember_email', email.trim());
      } else {
        localStorage.removeItem('glow_erp_remember_email');
      }

      // 1. Supabase Auth Sign In
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMsg(error.message || 'Incorrect email or password.');
        setIsLoading(false);
        return;
      }

      if (!data?.session) {
        setErrorMsg('Please check your email and confirm your account before logging in.');
        setIsLoading(false);
        return;
      }

      // 2. Local App Context Login & Status Sync
      const res = loginUser(email.trim(), password);

      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg('Logged in successfully!');
        if (logoutNoticeMsg) setLogoutNoticeMsg(null);

        setTimeout(() => {
          onLoginSuccess();
          window.location.href = '/';
        }, 300);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Incorrect email or password. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to autofill demo accounts for quick testing
  const handleQuickFillDemo = (demoEmail: string, demoPass: string = '1234') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 select-none transition-colors duration-200">
      
      {/* MAIN CONTAINER GRID */}
      <div className="w-full max-w-5xl bg-white rounded-3xl sm:rounded-[36px] shadow-2xl shadow-slate-200/80 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px] transition-all">
        
        {/* LEFT PANEL: RETAIL SHOWCASE ILLUSTRATION (Desktop/Tablet) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#6A1B9A] via-purple-800 to-[#EC407A] text-white p-8 xl:p-10 flex-col justify-between relative overflow-hidden">
          
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-900/40 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          {/* Header Branding */}
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-pink-300" />
              <span>Smart Retail Operating System</span>
            </div>
            
            <h2 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight pt-2">
              Cosmetics & Beauty Retail ERP
            </h2>
            <p className="text-xs font-medium text-purple-100/90 leading-relaxed max-w-sm">
              Streamline POS sales, inventory tracking, multi-branch operations, and profit analytics in one unified dashboard.
            </p>
          </div>

          {/* POS & Inventory Graphical Showcase */}
          <div className="relative z-10 my-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-md">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">Live Sales POS Terminal</div>
                  <div className="text-[10px] text-pink-200">Barcode ready • Fast checkout</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold">
                Online
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-purple-950/30 border border-white/10 space-y-1">
                <div className="text-[10px] text-purple-200 font-bold flex items-center gap-1">
                  <BarChart3 className="w-3 h-3 text-pink-300" />
                  <span>Sales Today</span>
                </div>
                <div className="font-black text-sm text-white">₦248,500</div>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-950/30 border border-white/10 space-y-1">
                <div className="text-[10px] text-purple-200 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-300" />
                  <span>Items Sold</span>
                </div>
                <div className="font-black text-sm text-white">142 Units</div>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-bold text-white flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-pink-300" />
                <span>Automated Low-Stock Threshold Alerts</span>
              </div>
              <div className="text-[11px] font-bold text-white flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-pink-300" />
                <span>Multi-User Role Audit & Authorization</span>
              </div>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="relative z-10 pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-purple-200 font-semibold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-pink-300" />
              Protected by Enterprise Security
            </span>
            <span>v2.5</span>
          </div>
        </div>

        {/* RIGHT PANEL: CLEAN WHITE SIGN IN FORM */}
        <div className="lg:col-span-7 p-6 sm:p-10 xl:p-12 flex flex-col justify-between bg-white space-y-6">
          
          <div className="space-y-6 max-w-md mx-auto w-full">
            
            {/* BRANDING LOGO & HEADER */}
            <div className="text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6A1B9A] to-[#EC407A] text-white flex items-center justify-center shadow-md shadow-purple-900/20 shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                    {settings.businessName && settings.businessName !== 'Not Configured'
                      ? settings.businessName
                      : 'Cosmetics ERP'}
                  </h1>
                  <p className="text-[11px] font-bold text-[#6A1B9A] uppercase tracking-wider">
                    Smart Retail Workspace
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Welcome Back 👋
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  Sign in with your staff credentials to continue.
                </p>
              </div>
            </div>

            {/* FEEDBACK MESSAGES */}
            {logoutNoticeMsg && (
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{logoutNoticeMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLogoutNoticeMsg(null)}
                  className="text-indigo-500 hover:text-indigo-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSignIn} className="space-y-4">
              
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
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

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={onNavigateToForgotPassword}
                    className="text-[11px] font-extrabold text-[#6A1B9A] hover:text-[#EC407A] transition"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#6A1B9A] focus:border-transparent outline-none transition min-h-[48px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* OPTIONS: Remember Me & Show Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#6A1B9A] focus:ring-[#6A1B9A]"
                  />
                  <span className="text-xs font-semibold text-slate-600">Remember Me</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-500 hover:text-slate-700">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-[#EC407A]"
                  />
                  <span>Show Password</span>
                </label>
              </div>

              {/* SIGN IN BUTTON */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#6A1B9A] via-purple-700 to-[#EC407A] hover:opacity-95 text-white font-black text-sm shadow-xl shadow-purple-900/20 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 min-h-[50px] cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* SECONDARY ACTION: CREATE ACCOUNT */}
            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-medium">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={onNavigateToSignUp}
                  className="font-black text-[#6A1B9A] hover:text-[#EC407A] underline underline-offset-4 ml-1 transition"
                >
                  Create an Account
                </button>
              </p>
            </div>

          </div>

          {/* QUICK DEMO ACCOUNTS ACCORDION / DEMO LOGINS */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 max-w-md mx-auto w-full">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>⚡ Quick Demo Logins</span>
              <span className="text-slate-400 font-normal">(Tap to autofill)</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickFillDemo('chidi@glossyerp.com')}
                className="p-2 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 text-left transition shadow-xs hover:border-purple-300"
              >
                <div className="font-bold text-slate-900 text-[11px] truncate">Super Admin</div>
                <div className="text-[10px] text-purple-700 font-semibold truncate">chidi@glossyerp.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFillDemo('amaka@glossyerp.com')}
                className="p-2 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 text-left transition shadow-xs hover:border-purple-300"
              >
                <div className="font-bold text-slate-900 text-[11px] truncate">Store Admin</div>
                <div className="text-[10px] text-pink-600 font-semibold truncate">amaka@glossyerp.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFillDemo('kelechi@glossyerp.com')}
                className="p-2 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 text-left transition shadow-xs hover:border-purple-300"
              >
                <div className="font-bold text-slate-900 text-[11px] truncate">Store Manager</div>
                <div className="text-[10px] text-purple-700 font-semibold truncate">kelechi@glossyerp.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFillDemo('blessing@glossyerp.com')}
                className="p-2 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 text-left transition shadow-xs hover:border-purple-300"
              >
                <div className="font-bold text-slate-900 text-[11px] truncate">Sales Person</div>
                <div className="text-[10px] text-teal-700 font-semibold truncate">blessing@glossyerp.com</div>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
