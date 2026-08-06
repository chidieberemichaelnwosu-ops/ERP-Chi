import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { supabase } from '../../supabaseClient';
import {
  Lock,
  Mail,
  User,
  Phone,
  Building,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  Sparkles,
  ArrowLeft,
  Check,
  MapPin,
  Briefcase,
  Loader2,
  Users,
  ShoppingBag,
  CheckCircle2
} from 'lucide-react';

interface SignUpPageProps {
  onNavigateToSignIn: () => void;
  onSignUpSuccess: (pendingUserData: any) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({
  onNavigateToSignIn,
  onSignUpSuccess,
}) => {
  const { registerUser } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Personal Information
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Business Information
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');

  // Role Selection (Allowed: Administrator, Manager, Sales Person)
  const [requestedRole, setRequestedRole] = useState<UserRole>('salesperson');
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Feedback Messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    // Validation
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
      setErrorMsg('Please complete all required fields in both Personal and Store sections.');
      return;
    }

    if (!agreedTerms) {
      setErrorMsg('You must agree to the Terms of Service to register.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Password and Confirm Password do not match.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    // Explicitly enforce no Super Administrator registration
    if (requestedRole === 'super_admin') {
      setErrorMsg('Registration as Super Administrator is restricted.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Supabase Auth Sign Up
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMsg(error.message || 'Registration failed.');
        setIsLoading(false);
        return;
      }

      // 2. Local State Registration
      const regRes = registerUser({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
        businessName: businessName.trim(),
        businessAddress: businessAddress.trim(),
        businessPhone: businessPhone.trim(),
        businessEmail: businessEmail.trim() || undefined,
        branch: businessName.trim(),
        requestedRole,
      });

      if (!regRes.success) {
        setErrorMsg(regRes.message);
        setIsLoading(false);
        return;
      }

      // 3. Save signup email for pre-filling Sign In form and redirect without auto-login
      sessionStorage.setItem('signup_success_email', email.trim());
      onNavigateToSignIn();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to process registration. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleCards: {
    id: UserRole;
    title: string;
    badge: string;
    description: string;
    icon: any;
    color: string;
  }[] = [
    {
      id: 'administrator',
      title: 'Administrator',
      badge: 'Store Owner',
      description: 'Full store oversight, staff approvals & system settings.',
      icon: ShieldCheck,
      color: 'border-pink-200 bg-pink-50/50 text-pink-700',
    },
    {
      id: 'manager',
      title: 'Manager',
      badge: 'Store Manager',
      description: 'Manages inventory, supplier orders & expense tracking.',
      icon: Briefcase,
      color: 'border-purple-200 bg-purple-50/50 text-purple-700',
    },
    {
      id: 'salesperson',
      title: 'Sales Person',
      badge: 'POS Terminal',
      description: 'Barcode checkout, recording sales & issuing receipts.',
      icon: Users,
      color: 'border-teal-200 bg-teal-50/50 text-teal-700',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 select-none py-10 transition-colors duration-200">
      
      <div className="w-full max-w-5xl bg-white rounded-3xl sm:rounded-[36px] shadow-2xl shadow-slate-200/80 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
        
        {/* LEFT PANEL: SHOWCASE ILLUSTRATION (Desktop/Tablet) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#6A1B9A] via-purple-800 to-[#EC407A] text-white p-8 xl:p-10 flex-col justify-between relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-900/40 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          {/* Header Branding */}
          <div className="relative z-10 space-y-3">
            <button
              type="button"
              onClick={onNavigateToSignIn}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold hover:bg-white/25 transition shadow-sm mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>

            <h2 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight">
              Join Your Retail Staff Network
            </h2>
            <p className="text-xs font-medium text-purple-100/90 leading-relaxed max-w-sm">
              Register your staff profile and store branch details. Once submitted, your Store Administrator will review your account access request.
            </p>
          </div>

          {/* Info Card */}
          <div className="relative z-10 my-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-white">Multi-Role Store Access</div>
                <div className="text-[10px] text-pink-200">Owner • Manager • Cashier</div>
              </div>
            </div>

            <p className="text-xs text-purple-100 leading-snug">
              Access real-time inventory counts, process fast barcode checkouts, and generate instant sales reports from any tablet or browser.
            </p>
          </div>

          {/* Footer Metadata */}
          <div className="relative z-10 pt-2 border-t border-white/15 text-[11px] text-purple-200 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-pink-300" />
              Admin Verification Guard
            </span>
            <span>Step 1 of 2</span>
          </div>
        </div>

        {/* RIGHT PANEL: CLEAN WHITE REGISTRATION FORM */}
        <div className="lg:col-span-7 p-6 sm:p-8 xl:p-10 bg-white space-y-6">
          
          {/* MOBILE BACK BUTTON */}
          <div className="flex items-center justify-between lg:hidden border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={onNavigateToSignIn}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
            <span className="text-xs font-extrabold text-[#6A1B9A]">Staff Registration</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Create Staff Account
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Register your profile and store branch details to request system access.
            </p>
          </div>

          {infoMsg && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-start gap-2.5 animate-in fade-in shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{infoMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignUpSubmit} className="space-y-5">
            
            {/* SECTION 1: PERSONAL INFORMATION */}
            <div className="space-y-3">
              <div className="border-b border-slate-100 pb-1.5">
                <h3 className="text-xs font-black text-[#6A1B9A] uppercase tracking-wider flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  <span>1. Personal Information</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Blessing Okafor"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#6A1B9A] focus:border-transparent outline-none transition min-h-[46px]"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="blessing@company.com"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#6A1B9A] focus:border-transparent outline-none transition min-h-[46px]"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
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
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#6A1B9A] focus:border-transparent outline-none transition min-h-[46px]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
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
                      className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#6A1B9A] focus:border-transparent outline-none transition min-h-[46px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
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
                      className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#6A1B9A] focus:border-transparent outline-none transition min-h-[46px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: BUSINESS / STORE INFORMATION */}
            <div className="space-y-3">
              <div className="border-b border-slate-100 pb-1.5">
                <h3 className="text-xs font-black text-[#EC407A] uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-3.5 h-3.5" />
                  <span>2. Store & Branch Information</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Business Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Store / Business Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Glossy Glam Cosmetics"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#6A1B9A] focus:border-transparent outline-none transition min-h-[46px]"
                    />
                  </div>
                </div>

                {/* Business Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Store Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      placeholder="Branch location address"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#6A1B9A] focus:border-transparent outline-none transition min-h-[46px]"
                    />
                  </div>
                </div>

                {/* Business Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Store Contact Phone <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#6A1B9A] focus:border-transparent outline-none transition min-h-[46px]"
                    />
                  </div>
                </div>

                {/* Business Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Store Email <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      placeholder="store@company.com"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#6A1B9A] focus:border-transparent outline-none transition min-h-[46px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: ROLE SELECTION CARDS */}
            <div className="space-y-2.5">
              <div className="border-b border-slate-100 pb-1.5">
                <h3 className="text-xs font-black text-teal-700 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>3. Select Your Operational Role</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {roleCards.map((card) => {
                  const isSelected = requestedRole === card.id;

                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setRequestedRole(card.id)}
                      className={`p-3.5 rounded-2xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-[#6A1B9A] bg-purple-50/80 ring-2 ring-[#6A1B9A]/30 shadow-sm'
                          : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${card.color}`}>
                            {card.badge}
                          </span>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-[#6A1B9A] text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-900">{card.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug font-medium">
                          {card.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TERMS CHECKBOX */}
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#6A1B9A] focus:ring-[#6A1B9A]"
                />
                <span className="text-xs text-slate-600 font-medium leading-relaxed">
                  I agree to the Store Operational Terms & Conditions. My account will be routed to an Administrator for review.
                </span>
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#6A1B9A] via-purple-700 to-[#EC407A] hover:opacity-95 text-white font-black text-sm shadow-xl shadow-purple-900/20 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 min-h-[50px] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Submitting Registration...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>

          </form>

          {/* FOOTER ACTION */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToSignIn}
                className="font-black text-[#6A1B9A] hover:text-[#EC407A] underline underline-offset-4 ml-1 transition"
              >
                Sign In to existing account
              </button>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
