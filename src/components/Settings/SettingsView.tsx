import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Settings,
  Store,
  DollarSign,
  ShieldCheck,
  Database,
  Moon,
  Sun,
  Download,
  Upload,
  RefreshCw,
  FileText,
  UserCheck,
  Check,
  Sparkles,
  UserPlus,
  Lock,
  UserX,
  KeyRound,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface StaffUserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'disabled';
}

const INITIAL_STAFF_USERS: StaffUserItem[] = [
  { id: 'usr-1', name: 'Chidi Nwosu (Store Owner)', email: 'chidi@glossyerp.com', role: 'super_admin', status: 'active' },
  { id: 'usr-2', name: 'Amaka Eze (Operations Lead)', email: 'amaka@glossyerp.com', role: 'administrator', status: 'active' },
  { id: 'usr-3', name: 'Kelechi Okafor (Store Supervisor)', email: 'kelechi@glossyerp.com', role: 'manager', status: 'active' },
  { id: 'usr-4', name: 'Blessing Bello (POS Terminal)', email: 'blessing@glossyerp.com', role: 'salesperson', status: 'active' },
];

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    userRole,
    primaryUserRole,
    setUserRole,
    setPrimaryUserRole,
    auditLogs,
    exportDatabaseJSON,
    importDatabaseJSON,
    triggerSync,
    isSyncing,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'tax' | 'roles' | 'backup' | 'audit'>('general');

  // Staff User Management State
  const [staffUsers, setStaffUsers] = useState<StaffUserItem[]>(() => {
    try {
      const saved = localStorage.getItem('glow_erp_staff_users');
      return saved ? JSON.parse(saved) : INITIAL_STAFF_USERS;
    } catch {
      return INITIAL_STAFF_USERS;
    }
  });

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('salesperson');

  const saveStaffUsersList = (users: StaffUserItem[]) => {
    setStaffUsers(users);
    try {
      localStorage.setItem('glow_erp_staff_users', JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateStaffUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    // Security check: Administrator cannot create Super Admin or Administrator
    if (userRole === 'administrator' && (newUserRole === 'super_admin' || newUserRole === 'administrator')) {
      alert('Administrators can only assign Sales Person and Manager roles.');
      return;
    }

    const newUser: StaffUserItem = {
      id: `usr-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      status: 'active',
    };

    saveStaffUsersList([...staffUsers, newUser]);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('salesperson');
    setShowAddUserModal(false);
    alert(`Staff account for ${newUser.name} created successfully!`);
  };

  const handleChangeStaffRole = (userId: string, targetRole: UserRole) => {
    const targetUser = staffUsers.find(u => u.id === userId);
    if (!targetUser) return;

    // Security checks
    if (userRole === 'administrator') {
      if (targetUser.role === 'super_admin' || targetUser.role === 'administrator') {
        alert('Administrators cannot modify Super Administrator or Administrator accounts.');
        return;
      }
      if (targetRole === 'super_admin' || targetRole === 'administrator') {
        alert('Administrators can only assign Sales Person or Manager roles.');
        return;
      }
    }

    const updated = staffUsers.map(u => (u.id === userId ? { ...u, role: targetRole } : u));
    saveStaffUsersList(updated);
  };

  const handleToggleStaffStatus = (userId: string) => {
    const targetUser = staffUsers.find(u => u.id === userId);
    if (!targetUser) return;

    if (userRole === 'administrator' && (targetUser.role === 'super_admin' || targetUser.role === 'administrator')) {
      alert('Administrators cannot disable Super Administrator or Administrator accounts.');
      return;
    }

    const updated = staffUsers.map(u =>
      u.id === userId ? { ...u, status: (u.status === 'active' ? 'disabled' : 'active') as 'active' | 'disabled' } : u
    );
    saveStaffUsersList(updated);
  };

  const handleDeleteStaffUser = (userId: string) => {
    if (userRole !== 'super_admin') {
      alert('Only the Super Administrator has permission to delete staff user accounts.');
      return;
    }
    const targetUser = staffUsers.find(u => u.id === userId);
    if (targetUser?.role === 'super_admin') {
      alert('Cannot delete the primary Super Administrator account.');
      return;
    }
    if (confirm('Are you sure you want to remove this staff account?')) {
      saveStaffUsersList(staffUsers.filter(u => u.id !== userId));
    }
  };

  // Form State
  const [bName, setBName] = useState(settings.businessName);
  const [bAddress, setBAddress] = useState(settings.address);
  const [bPhone, setBPhone] = useState(settings.phone);
  const [bEmail, setBEmail] = useState(settings.email);
  const [enableTax, setEnableTax] = useState(settings.enableTax ?? false);
  const [taxName, setTaxName] = useState(settings.taxName || 'VAT');
  const [taxRate, setTaxRate] = useState(settings.taxRate || 7.5);
  const [displayTaxOnReceipt, setDisplayTaxOnReceipt] = useState(settings.displayTaxOnReceipt ?? false);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);
  const [jsonInput, setJsonInput] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName: bName,
      address: bAddress,
      phone: bPhone,
      email: bEmail,
      enableTax,
      taxName,
      taxRate,
      displayTaxOnReceipt,
      currencySymbol,
      receiptFooter,
    });
    alert('Settings updated successfully!');
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GlowERP_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = () => {
    if (!jsonInput.trim()) return;
    const success = importDatabaseJSON(jsonInput);
    if (success) {
      setImportStatus('Database restored successfully!');
      setJsonInput('');
    } else {
      setImportStatus('Failed to parse JSON backup file.');
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 pb-28">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-rose-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-rose-500" />
          Settings, Users & Backup
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure business details, currency, tax rates, user roles, data backups, and audit logs.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-full font-bold text-xs transition-all shrink-0 ${
            activeTab === 'general'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-none'
              : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700'
          }`}
        >
          Store Profile
        </button>
        <button
          onClick={() => setActiveTab('tax')}
          className={`px-4 py-2 rounded-full font-bold text-xs transition-all shrink-0 ${
            activeTab === 'tax'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-none'
              : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700'
          }`}
        >
          Tax Settings
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-full font-bold text-xs transition-all shrink-0 ${
            activeTab === 'roles'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-none'
              : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700'
          }`}
        >
          Roles & Permissions
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 rounded-full font-bold text-xs transition-all shrink-0 ${
            activeTab === 'backup'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-none'
              : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700'
          }`}
        >
          Backup & Cloud Sync
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-full font-bold text-xs transition-all shrink-0 ${
            activeTab === 'audit'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-none'
              : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700'
          }`}
        >
          Audit Logs
        </button>
      </div>

      {/* Tab 1: Store Profile */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-slate-100 dark:border-slate-700/80 shadow-xs space-y-4 max-w-2xl">
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Business Name
              </label>
              <input
                type="text"
                value={bName}
                onChange={(e) => setBName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:border-rose-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={bPhone}
                  onChange={(e) => setBPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-white focus:border-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={bEmail}
                  onChange={(e) => setBEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-white focus:border-rose-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Store Address
              </label>
              <input
                type="text"
                value={bAddress}
                onChange={(e) => setBAddress(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-white focus:border-rose-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="₦"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:border-rose-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Receipt Footer Disclaimer
              </label>
              <textarea
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-white focus:border-rose-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-rose-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-600 transition mt-2"
          >
            Save Store Profile
          </button>
        </form>
      )}

      {/* Tab 2: Tax Settings */}
      {activeTab === 'tax' && (
        <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-slate-100 dark:border-slate-700/80 shadow-xs space-y-6 max-w-2xl">
          <div>
            <h3 className="font-extrabold text-rose-900 dark:text-white text-base">
              Tax Configuration (Optional)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Tax in GlowERP is purely informational and will never automatically reduce or deduct from total sales, gross profit, or customer payments.
            </p>
          </div>

          <div className="space-y-4">
            {/* Enable/Disable Tax Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="font-extrabold text-xs text-slate-800 dark:text-white block">
                  Enable Tax Accounting
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Default: OFF. Enable to display tax calculations separately for reference.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableTax}
                  onChange={(e) => setEnableTax(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>

            {/* Tax Name & Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Tax Name
                </label>
                <input
                  type="text"
                  value={taxName}
                  onChange={(e) => setTaxName(e.target.value)}
                  placeholder="e.g. VAT"
                  disabled={!enableTax}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:border-rose-500 outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  disabled={!enableTax}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-white focus:border-rose-500 outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* Display Tax on Receipt */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="font-extrabold text-xs text-slate-800 dark:text-white block">
                  Display Tax on Printed Receipts
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Show informational tax line on customer receipts without altering the final amount paid.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={displayTaxOnReceipt}
                  onChange={(e) => setDisplayTaxOnReceipt(e.target.checked)}
                  disabled={!enableTax}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500 peer-disabled:opacity-50"></div>
              </label>
            </div>

            {/* Explanatory Notice Box */}
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-xs text-rose-900 dark:text-rose-200 space-y-1">
              <span className="font-extrabold block">Calculation Policy Guarantee:</span>
              <p className="text-[11px] leading-relaxed opacity-90">
                • Total Sale = Quantity × Unit Price<br />
                • Discount = Deducted from Total Sale<br />
                • Final Amount Received = Total Sale − Discount<br />
                No tax is subtracted from sales total or profit figures.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-rose-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-600 transition"
          >
            Save Tax Settings
          </button>
        </form>
      )}

      {/* Tab 3: Staff Roles & User Security Management */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* 1. SALES PERSON OR MANAGER READ-ONLY PROFILE SECURITY VIEW */}
          {(primaryUserRole === 'salesperson' || primaryUserRole === 'manager') && (
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-slate-100 dark:border-slate-700/80 shadow-xs space-y-4 max-w-3xl">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
                <div>
                  <h3 className="font-black text-rose-900 dark:text-white text-base flex items-center gap-2">
                    <Lock className="w-5 h-5 text-rose-500" /> Staff Security Profile
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Your assigned role permissions and access security parameters
                  </p>
                </div>
                <div className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/60 rounded-xl text-xs font-black text-rose-700 dark:text-rose-300">
                  Assigned Role: {primaryUserRole === 'salesperson' ? 'Sales Person' : 'Manager'} (Read-Only)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <span className="font-extrabold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> Enterprise Access Control Policy:
                </span>
                <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                  User roles are assigned strictly by the Super Administrator or Administrator. Managers and Sales Persons cannot switch roles or alter user permissions.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="font-extrabold text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Operational Permissions Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white block mb-1">Sales & POS Access</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {primaryUserRole === 'salesperson'
                        ? 'Full access to POS cash register, recording sales, selecting customers, printing receipts, and viewing personal daily logs.'
                        : 'Full access to POS terminal, inventory restock, store overhead expenses, and operational sales reports.'}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white block mb-1">Administrative Privileges</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Restricted. Role switching, staff user creation, system configuration, database backup restores, and security controls require Administrator authorization.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. ADMINISTRATOR / SUPER ADMINISTRATOR AUTHORIZED ROLE TESTING & MANAGEMENT */}
          {(primaryUserRole === 'administrator' || primaryUserRole === 'super_admin') && (
            <>
              {/* Role Switcher Card for Operational Support & Testing */}
              <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-slate-100 dark:border-slate-700/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                  <div>
                    <h3 className="font-extrabold text-rose-900 dark:text-white text-base flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-rose-500" />
                      Switch Operational Role (Interface & Permission Testing)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {primaryUserRole === 'super_admin'
                        ? 'Super Administrators can switch between all 4 roles to test interfaces and operational workflows.'
                        : 'Administrators can switch between Administrator, Manager, and Sales Person roles for operational support.'}
                    </p>
                  </div>

                  {userRole !== primaryUserRole && (
                    <div className="px-3.5 py-1.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-bold flex items-center gap-2">
                      <span>Testing Mode: <strong className="uppercase">{userRole}</strong></span>
                      <button
                        onClick={() => setUserRole(primaryUserRole, 'Returned to Primary Identity')}
                        className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-extrabold hover:bg-rose-700"
                      >
                        Reset to {primaryUserRole === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  {[
                    ...(primaryUserRole === 'super_admin'
                      ? [
                          {
                            id: 'super_admin',
                            title: 'Super Administrator',
                            desc: 'Unrestricted full access, user management, role assignments, system backups, and full audit logs.',
                          },
                        ]
                      : []),
                    {
                      id: 'administrator',
                      title: 'Administrator',
                      desc: 'Full operational access, staff creation, inventory management, store settings, and report exports.',
                    },
                    {
                      id: 'manager',
                      title: 'Manager',
                      desc: 'Sales processing, inventory stock control, supplier purchases, and operational reporting.',
                    },
                    {
                      id: 'salesperson',
                      title: 'Sales Person',
                      desc: 'Fast POS sales entry, customer search, receipt printing, and daily cashier summary.',
                    },
                  ].map((r) => {
                    const isSelected = userRole === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setUserRole(r.id as any, 'Settings Role Switcher Panel')}
                        className={`p-5 rounded-[24px] border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 shadow-md shadow-rose-100 dark:shadow-none scale-[1.02]'
                            : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-rose-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-sm">{r.title}</h4>
                          {isSelected && <Check className="w-4 h-4 text-rose-500 stroke-[3]" />}
                        </div>
                        <p className="text-[11px] mt-2 opacity-80 font-medium leading-relaxed">{r.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Staff Accounts & Role Management Table */}
              <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-slate-100 dark:border-slate-700/80 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                  <div>
                    <h3 className="font-black text-rose-900 dark:text-white text-base flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-rose-500" />
                      Staff Accounts & Role Assignments
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {primaryUserRole === 'super_admin'
                        ? 'Super Administrator Access: Full authority over staff accounts, role assignment, and system permissions.'
                        : 'Administrator Access: Create staff accounts and assign Sales Person or Manager roles.'}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddUserModal(!showAddUserModal)}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-md active:scale-95 transition flex items-center justify-center gap-2 shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add New Staff Account
                  </button>
                </div>

              {/* Add Staff Modal / Form */}
              {showAddUserModal && (
                <form onSubmit={handleCreateStaffUser} className="p-5 rounded-2xl bg-rose-50/50 dark:bg-slate-900 border border-rose-200 dark:border-slate-700 space-y-4">
                  <h4 className="font-extrabold text-sm text-rose-900 dark:text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-rose-500" /> Create New Staff User Account
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="john@store.com"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Assign Role
                      </label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-extrabold outline-none"
                      >
                        <option value="salesperson">Sales Person</option>
                        <option value="manager">Manager</option>
                        {userRole === 'super_admin' && (
                          <>
                            <option value="administrator">Administrator</option>
                            <option value="super_admin">Super Administrator</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-rose-700"
                    >
                      Save Account
                    </button>
                  </div>
                </form>
              )}

              {/* Staff Accounts Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-3.5">Staff Name & Email</th>
                      <th className="p-3.5">Assigned Role</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Security Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {staffUsers.map((usr) => {
                      const isSuperAdminUser = usr.role === 'super_admin';
                      const isAdminUser = usr.role === 'administrator';
                      const isLockedForCurrentAdmin =
                        primaryUserRole === 'administrator' && (isSuperAdminUser || isAdminUser);

                      return (
                        <tr key={usr.id} className="hover:bg-rose-50/20 dark:hover:bg-slate-700/30 transition">
                          <td className="p-3.5">
                            <span className="font-extrabold text-slate-900 dark:text-white block">
                              {usr.name}
                            </span>
                            <span className="text-[11px] text-slate-400">{usr.email}</span>
                          </td>

                          <td className="p-3.5">
                            {isLockedForCurrentAdmin ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-extrabold text-[11px]">
                                <Lock className="w-3 h-3 text-slate-400" />
                                {usr.role === 'super_admin' ? 'Super Admin' : 'Administrator'}
                              </span>
                            ) : (
                              <select
                                value={usr.role}
                                onChange={(e) => handleChangeStaffRole(usr.id, e.target.value as UserRole)}
                                className="px-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-800 dark:text-white outline-none cursor-pointer"
                              >
                                <option value="salesperson">Sales Person</option>
                                <option value="manager">Manager</option>
                                {primaryUserRole === 'super_admin' && (
                                  <>
                                    <option value="administrator">Administrator</option>
                                    <option value="super_admin">Super Administrator</option>
                                  </>
                                )}
                              </select>
                            )}
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                usr.status === 'active'
                                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                  : 'bg-slate-100 text-slate-500 border border-slate-300'
                              }`}
                            >
                              {usr.status}
                            </span>
                          </td>

                          <td className="p-3.5 text-right space-x-2">
                            <button
                              onClick={() => handleToggleStaffStatus(usr.id)}
                              disabled={isLockedForCurrentAdmin}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-[11px] disabled:opacity-40"
                              title={usr.status === 'active' ? 'Disable Account' : 'Enable Account'}
                            >
                              {usr.status === 'active' ? 'Disable' : 'Enable'}
                            </button>

                            <button
                              onClick={() => alert(`Password reset email sent to ${usr.email}`)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-bold text-[11px]"
                              title="Reset Password"
                            >
                              Reset Pass
                            </button>

                            {primaryUserRole === 'super_admin' && !isSuperAdminUser && (
                              <button
                                onClick={() => handleDeleteStaffUser(usr.id)}
                                className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg"
                                title="Delete Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        </div>
      )}

      {/* Tab 3: Backup & Cloud Sync */}
      {activeTab === 'backup' && (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-slate-100 dark:border-slate-700/80 shadow-xs space-y-6 max-w-2xl">
          <div>
            <h3 className="font-extrabold text-rose-900 dark:text-white text-base">
              Local Backup & Cloud Synchronization
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Download complete database backups in JSON format or restore past offline states.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadBackup}
              className="flex-1 py-3.5 px-4 bg-rose-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-600 transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download JSON Database Backup
            </button>

            <button
              onClick={triggerSync}
              disabled={isSyncing}
              className="flex-1 py-3.5 px-4 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-2xl hover:bg-slate-200 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Trigger Cloud Sync
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
              Restore Database from JSON Paste
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste JSON string here..."
              rows={4}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-mono"
            />
            <button
              onClick={handleImportJSON}
              className="px-4 py-2.5 bg-teal-600 text-white font-bold text-xs rounded-2xl hover:bg-teal-700 transition"
            >
              Restore Database
            </button>
            {importStatus && (
              <p className="text-xs font-bold text-teal-600 mt-1">{importStatus}</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700/80 shadow-xs p-6 space-y-4">
          <h3 className="font-extrabold text-rose-900 dark:text-white text-base">
            System Activity & Audit Logs
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4 sm:p-5">Timestamp</th>
                  <th className="p-4 sm:p-5">Role & User</th>
                  <th className="p-4 sm:p-5">Action</th>
                  <th className="p-4 sm:p-5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-rose-50/30 dark:hover:bg-slate-700/30 transition">
                    <td className="p-4 sm:p-5 text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 sm:p-5 font-extrabold text-slate-900 dark:text-slate-100 capitalize">
                      {log.userRole} ({log.userName})
                    </td>
                    <td className="p-4 sm:p-5 font-extrabold text-rose-600">{log.action}</td>
                    <td className="p-4 sm:p-5 text-slate-600 dark:text-slate-300 font-medium">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
