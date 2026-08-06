import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building, MapPin, Phone, Mail, Globe, Image, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export const BusinessProfileGuard: React.FC = () => {
  const { settings, updateSettings, primaryUserRole, userRole, setActiveTab } = useApp();

  const isAdminOrSuperAdmin = primaryUserRole === 'administrator' || primaryUserRole === 'super_admin' || userRole === 'administrator' || userRole === 'super_admin';

  const isIncomplete =
    !settings.businessName ||
    settings.businessName === 'Not Configured' ||
    !settings.address ||
    settings.address === 'Not Configured' ||
    !settings.phone ||
    settings.phone === 'Not Configured';

  const [businessName, setBusinessName] = useState(settings.businessName === 'Not Configured' ? '' : settings.businessName || '');
  const [address, setAddress] = useState(settings.address === 'Not Configured' ? '' : settings.address || '');
  const [phone, setPhone] = useState(settings.phone === 'Not Configured' ? '' : settings.phone || '');
  const [email, setEmail] = useState(settings.email === 'Not Configured' ? '' : settings.email || '');
  const [website, setWebsite] = useState(settings.website || '');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAdminOrSuperAdmin || !isIncomplete) {
    return null;
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!businessName.trim() || !address.trim() || !phone.trim()) {
      setErrorMsg('Please fill in all required fields: Business Name, Business Address, and Phone Number.');
      return;
    }

    updateSettings({
      businessName: businessName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim() || 'info@company.com',
      website: website.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
    });

    setActiveTab('dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#6A1B9A]/95 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[36px] border border-white/20 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#6A1B9A] to-purple-900 p-8 text-white text-center relative border-b border-purple-800/40">
          <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-inner">
            <Building className="w-8 h-8 text-pink-300" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Complete Business Profile
          </h2>
          <p className="text-xs text-purple-100/90 font-medium mt-1 max-w-sm mx-auto">
            Before accessing the Cosmetics ERP dashboard, please configure your store's required business profile information.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 space-y-4">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Business Name (Required) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Business Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Glossy Beauty Cosmetics Store"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none"
              />
            </div>
          </div>

          {/* Business Address (Required) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Business Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Plot 12 Admiralty Way, Lekki Phase 1, Lagos"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none"
              />
            </div>
          </div>

          {/* Phone Number (Required) */}
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
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none"
              />
            </div>
          </div>

          {/* Optional: Email & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@glossybeauty.com"
                  className="w-full pl-10 pr-3 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Website URL <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://glossybeauty.ng"
                  className="w-full pl-10 pr-3 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Optional: Logo URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Logo Image URL <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Image className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 mt-2 bg-[#6A1B9A] hover:bg-[#5a1684] text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl active:scale-95 transition flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-pink-300" />
            <span>Save Profile & Launch ERP Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
