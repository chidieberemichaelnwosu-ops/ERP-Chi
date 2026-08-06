import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { supabaseSignUp, supabaseSignIn, isSupabaseConfigured } from '../../lib/supabase';
import {
  Lock,
  Mail,
  User,
  Phone,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  X,
  Sparkles,
  ArrowRight,
  Clock,
  Briefcase,
  Check,
  MapPin,
  Globe,
  Loader2
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const {
    registerUser,
    loginUser,
    appUsers,
    setUserRole,
    setPrimaryUserRole,
    setUserName,
    settings,
    logoutNoticeMsg,
    setLogoutNoticeMsg,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Success screen state after sign up
  const [isRegisteredSuccess, setIsRegisteredSuccess] = useState(false);

  // Sign Up Form State - Personal Information
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sign Up Form State - Business Information
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');

  // Role Selection (Default: Sales Person)
  const [requestedRole, setRequestedRole] = useState<UserRole>('salesperson');

  // Terms Checkbox
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Feedback Messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-restore Remembered Email
  useEffect(() => {
    const savedEmail = localStorage.getItem('glow_erp_remember_email');
    if (savedEmail) {
      setLoginEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg('Incorrect email or password.');
      return;
    }

    setIsLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem('glow_erp_remember_email', loginEmail.trim());
      } else {
        localStorage.removeItem('glow_erp_remember_email');
      }

      // Try Supabase Auth if configured
      if (isSupabaseConfigured()) {
        const supRes = await supabaseSignIn(loginEmail.trim(), loginPassword);
        if (!supRes.success) {
          setErrorMsg(supRes.message);
          setIsLoading(false);
          return;
        }
      }

      // Local App Context Login & Validation
      const res = loginUser(loginEmail.trim(), loginPassword);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg('Logged in successfully!');
        setTimeout(() => {
          if (onClose) onClose();
        }, 500);
      }
    } catch (err: any) {
      setErrorMsg('Incorrect email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword ||
      !businessName.trim() ||
      !businessAddress.trim() ||
      !businessPhone.trim()
    ) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (!agreedTerms) {
      setErrorMsg('You must agree to the Terms and Conditions to proceed.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify password entry.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. If Supabase configured, attempt Supabase Auth Sign Up
      if (isSupabaseConfigured()) {
        const supRes = await supabaseSignUp({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          phone: phone.trim(),
          requestedRole,
          branch: businessName.trim(),
        });
        if (!supRes.success) {
          console.warn('Supabase SignUp note:', supRes.message);
        }
      }

      // 2. Register in App Context & Store
      const res = registerUser({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
        businessName: businessName.trim(),
        businessAddress: businessAddress.trim(),
        businessPhone: businessPhone.trim(),
        businessEmail: businessEmail.trim() || email.trim(),
        requestedRole,
      });

      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        // Show success screen
        setIsRegisteredSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg('An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoSwitch = (usrEmail: string) => {
    const targetUser = appUsers.find((u) => u.email.toLowerCase() === usrEmail.toLowerCase());
    if (targetUser) {
      if (targetUser.status === 'pending') {
        setErrorMsg('Your account is awaiting approval from an Administrator.');
        return;
      }
      if (targetUser.status === 'suspended' || targetUser.status === 'disabled') {
        setErrorMsg('Your account has been suspended. Please contact your Administrator.');
        return;
      }
      if (targetUser.status === 'rejected') {
        setErrorMsg('Your registration was not approved.');
        return;
      }

      setPrimaryUserRole(targetUser.role);
      setUserRole(targetUser.role, `Switched profile to ${targetUser.fullName}`);
      setUserName(targetUser.fullName);
      setSuccessMsg(`Switched active user to ${targetUser.fullName} (${targetUser.role.toUpperCase()})`);
      setTimeout(() => {
        if (onClose) onClose();
      }, 500);
    }
  };

  const handleForgotPassword = () => {
    if (!loginEmail.trim()) {
      setErrorMsg('Please enter your email address above to receive password reset instructions.');
      return;
    }
    alert(`Password reset instructions have been sent to ${loginEmail.trim()}. Please check your email inbox.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#F8F9FA] dark:bg-slate-900 w-full max-w-xl rounded-[28px] sm:rounded-[36px] border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100">
        
        {/* BRAND HEADER BAR */}
        <div className="bg-gradient-to-r from-[#6A1B9A] via-purple-900 to-[#6A1B9A] p-6 sm:p-8 text-white relative overflow-hidden flex items-center justify-between border-b border-purple-800/40">
          {/* Subtle Glow Circle */}
          <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-[#EC407A]/20 blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3.5 relative z-10">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Business Logo"
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20 shadow-md bg-white shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#EC407A] to-purple-400 p-0.5 shadow-lg shrink-0">
                <div className="w-full h-full bg-[#6A1B9A] rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-pink-300" />
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">
                  {settings.businessName && settings.businessName !== 'Not Configured'
                    ? settings.businessName
                    : 'Cosmetics ERP'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#EC407A] text-white text-[10px] font-black tracking-wider uppercase">
                  POS Portal
                </span>
              </div>
              <p className="text-xs text-purple-100/80 font-medium mt-0.5">
                Modern Retail ERP & Multi-Role Authentication
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95 relative z-10 shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* REGISTRATION SUCCESS VIEW */}
        {isRegisteredSuccess ? (
          <div className="p-8 sm:p-12 text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                🎉 Registration Successful
              </h3>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Your account has been submitted successfully.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                An Administrator will review your registration. You will receive access once your account is approved.
              </p>
            </div>

            <button
              onClick={() => {
                setIsRegisteredSuccess(false);
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="w-full max-w-xs py-4 rounded-2xl bg-[#6A1B9A] hover:bg-[#5a1684] text-white font-black text-sm shadow-xl transition active:scale-95 inline-flex items-center justify-center gap-2"
            >
              <span>Return to Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            {/* TOGGLE TAB NAVIGATION */}
            <div className="grid grid-cols-2 p-2 bg-slate-200/60 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-3 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-[#6A1B9A] dark:text-purple-300 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4 text-[#EC407A]" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-3 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-[#6A1B9A] dark:text-purple-300 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4 text-[#EC407A]" />
                <span>Create Business Account</span>
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* FEEDBACK MESSAGES */}
              {logoutNoticeMsg && (
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                    <span>{logoutNoticeMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLogoutNoticeMsg(null)}
                    className="text-indigo-400 hover:text-indigo-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-start gap-3 shadow-xs animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-start gap-3 shadow-xs animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{successMsg}</span>
                </div>
              )}

              {/* ==================== SIGN IN PAGE ==================== */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                      Welcome Back 👋
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Sign in to continue managing your business.
                    </p>
                  </div>

                  <div className="space-y-4 pt-1">
                    {/* Email Field */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="w-full pl-11 pr-4 py-3 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-11 pr-11 py-3 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me & Forgot Password Row */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded-md text-[#6A1B9A] focus:ring-[#6A1B9A] border-slate-300 cursor-pointer"
                        />
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Remember Me</span>
                      </label>

                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="font-bold text-[#EC407A] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 py-3 bg-[#6A1B9A] hover:bg-[#5a1684] text-white rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-purple-900/20 active:scale-95 transition flex items-center justify-center gap-2.5 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-pink-300" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4 text-pink-300" />
                      </>
                    )}
                  </button>

                  {/* Below Button Switch */}
                  <div className="text-center pt-2">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setMode('signup');
                          setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className="font-extrabold text-[#EC407A] hover:underline"
                      >
                        Create Account
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* ==================== SIGN UP PAGE ==================== */}
              {mode === 'signup' && (
                <form onSubmit={handleSignUpSubmit} className="space-y-6">
                  <div className="space-y-1 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                      Create Business Account
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Complete the information below to request access.
                    </p>
                  </div>

                  {/* SECTION 1: PERSONAL INFORMATION */}
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#6A1B9A] dark:text-purple-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#EC407A]" /> Personal Information
                    </h4>

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full pl-10 pr-4 py-3 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none"
                        />
                      </div>
                    </div>

                    {/* Email Address & Phone Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@company.com"
                            className="w-full pl-10 pr-3 py-3 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Phone Number <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+234 801 234 5678"
                            className="w-full pl-10 pr-3 py-3 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password & Confirm Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-3 py-3 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Confirm Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-3 py-3 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: BUSINESS INFORMATION */}
                  <div className="space-y-3.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#6A1B9A] dark:text-purple-300 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#EC407A]" /> Business Information
                    </h4>

                    {/* Business Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Business Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Glow Beauty Cosmetics Store"
                        className="w-full px-4 py-3 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none"
                      />
                    </div>

                    {/* Business Address */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Business Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          value={businessAddress}
                          onChange={(e) => setBusinessAddress(e.target.value)}
                          placeholder="Plot 12 Admiralty Way, Lekki Phase 1, Lagos"
                          className="w-full pl-10 pr-4 py-3 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none"
                        />
                      </div>
                    </div>

                    {/* Business Phone & Business Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Business Phone <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="tel"
                            required
                            value={businessPhone}
                            onChange={(e) => setBusinessPhone(e.target.value)}
                            placeholder="+234 803 888 9900"
                            className="w-full pl-10 pr-3 py-3 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Business Email <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                          <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="email"
                            value={businessEmail}
                            onChange={(e) => setBusinessEmail(e.target.value)}
                            placeholder="store@glowbeauty.ng"
                            className="w-full pl-10 pr-3 py-3 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: SELECT ROLE (CARDS INSTEAD OF DROPDOWN) */}
                  <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#6A1B9A] dark:text-purple-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#EC407A]" /> Select Requested Role
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">Card Selection</span>
                    </div>

                    {/* THREE ROLE CARDS (SUPER ADMIN EXCLUDED AS SPECIFIED) */}
                    <div className="grid grid-cols-1 gap-2.5">
                      {/* 1. Administrator */}
                      <div
                        onClick={() => setRequestedRole('administrator')}
                        className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3 relative ${
                          requestedRole === 'administrator'
                            ? 'bg-purple-50/80 dark:bg-purple-950/40 border-[#6A1B9A] shadow-md'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                            requestedRole === 'administrator'
                              ? 'border-[#6A1B9A] bg-[#6A1B9A] text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {requestedRole === 'administrator' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Administrator</span>
                            <span className="px-2 py-0.2 rounded-full bg-purple-200 dark:bg-purple-900 text-[#6A1B9A] dark:text-purple-200 text-[9px] font-black uppercase">
                              Branch Admin
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                            Full store management, inventory control, audit logs, staff approvals, and settings.
                          </p>
                        </div>
                      </div>

                      {/* 2. Manager */}
                      <div
                        onClick={() => setRequestedRole('manager')}
                        className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3 relative ${
                          requestedRole === 'manager'
                            ? 'bg-purple-50/80 dark:bg-purple-950/40 border-[#6A1B9A] shadow-md'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                            requestedRole === 'manager'
                              ? 'border-[#6A1B9A] bg-[#6A1B9A] text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {requestedRole === 'manager' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Manager</span>
                            <span className="px-2 py-0.2 rounded-full bg-pink-100 dark:bg-pink-950 text-[#EC407A] text-[9px] font-black uppercase">
                              Store Operations
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                            Stock purchases, inventory adjustments, supplier balances, expenses & sales oversight.
                          </p>
                        </div>
                      </div>

                      {/* 3. Sales Person */}
                      <div
                        onClick={() => setRequestedRole('salesperson')}
                        className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3 relative ${
                          requestedRole === 'salesperson'
                            ? 'bg-purple-50/80 dark:bg-purple-950/40 border-[#6A1B9A] shadow-md'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                            requestedRole === 'salesperson'
                              ? 'border-[#6A1B9A] bg-[#6A1B9A] text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {requestedRole === 'salesperson' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Sales Person</span>
                            <span className="px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-black uppercase">
                              POS Cashier
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                            Fast retail POS checkout terminal, receipt printing, customer credit logs, and daily sales.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: TERMS AND CONDITIONS CHECKBOX */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        required
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="w-4 h-4 rounded-md text-[#6A1B9A] focus:ring-[#6A1B9A] border-slate-300 cursor-pointer mt-0.5"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                        I agree to the Terms and Conditions
                      </span>
                    </label>
                  </div>

                  {/* CREATE ACCOUNT BUTTON */}
                  <button
                    type="submit"
                    disabled={isLoading || !agreedTerms}
                    className="w-full h-12 py-3 bg-[#6A1B9A] hover:bg-[#5a1684] text-white rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-purple-900/20 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-pink-300" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 text-pink-300" />
                        <span>Create Account</span>
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Already registered?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setMode('login');
                          setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className="font-extrabold text-[#EC407A] hover:underline"
                      >
                        Sign In Here
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* QUICK DEMO ACCOUNTS SWITCHER */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Quick Demo Login Profiles
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {appUsers.slice(0, 4).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickDemoSwitch(u.email)}
                      className={`p-2.5 rounded-2xl text-left border transition text-xs flex flex-col justify-between ${
                        u.status === 'pending'
                          ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 text-amber-900 dark:text-amber-200'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-[#EC407A]'
                      }`}
                    >
                      <div className="font-bold truncate text-[11px]">{u.fullName}</div>
                      <div className="flex items-center justify-between text-[10px] mt-1">
                        <span className="uppercase font-black text-[#6A1B9A] dark:text-purple-300">
                          {u.role.replace('_', ' ')}
                        </span>
                        {u.status === 'pending' ? (
                          <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded text-[8px] font-black uppercase flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> Pending
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">● Active</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
