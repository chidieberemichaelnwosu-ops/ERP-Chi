import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Phone, Mail, Building, ShieldCheck, CheckCircle2, AlertCircle, X, Camera } from 'lucide-react';

export const UserProfileModal: React.FC = () => {
  const {
    isProfileModalOpen,
    setIsProfileModalOpen,
    userName,
    userRole,
    settings,
    appUsers,
    updateUser,
    setUserName,
  } = useApp();

  const currentUser = appUsers.find((u) => u.fullName.toLowerCase().includes(userName.toLowerCase().split(' ')[0])) || appUsers[0];

  const [fullName, setFullName] = useState(currentUser?.fullName || userName);
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [branch, setBranch] = useState(currentUser?.branch || 'Main Store');
  const [photoUrl, setPhotoUrl] = useState(currentUser?.profilePhoto || '');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isProfileModalOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Full name cannot be empty.');
      return;
    }

    if (currentUser) {
      updateUser(currentUser.id, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        branch: branch.trim(),
        profilePhoto: photoUrl.trim() || undefined,
      });
    }

    setUserName(fullName.trim());
    setSuccessMsg('Profile details updated successfully!');

    setTimeout(() => {
      setIsProfileModalOpen(false);
      setSuccessMsg(null);
    }, 1000);
  };

  const getRoleBadgeLabel = (role: string) => {
    if (role === 'super_admin') return 'Super Administrator';
    if (role === 'administrator') return 'Administrator';
    if (role === 'manager') return 'Manager';
    return 'Sales Person';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[36px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#6A1B9A] via-purple-900 to-[#6A1B9A] p-6 text-white relative">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <User className="w-5 h-5 text-pink-300" />
              <span>My Profile</span>
            </h3>

            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* AVATAR & USER SUMMARY */}
          <div className="mt-4 flex items-center gap-4">
            <div className="relative shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md bg-white"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-pink-500 text-white font-black text-2xl flex items-center justify-center border-2 border-white/40 shadow-md uppercase">
                  {fullName ? fullName[0] : 'U'}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h4 className="text-lg font-black text-white truncate">{fullName}</h4>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500 text-white font-black text-[10px] uppercase tracking-wider">
                  {getRoleBadgeLabel(userRole)}
                </span>
                <span className="text-xs text-purple-200 font-semibold truncate">
                  {settings.businessName || 'GlossyERP'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

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
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none"
              />
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 801 234 5678"
                  className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@company.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Branch & Photo URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Branch Location
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="Main Store"
                  className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Profile Photo URL <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Camera className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-[#6A1B9A] outline-none"
                />
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="w-full py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition"
            >
              Close
            </button>
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-[#6A1B9A] hover:bg-[#5a1684] text-white font-black text-xs shadow-lg transition active:scale-95"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
