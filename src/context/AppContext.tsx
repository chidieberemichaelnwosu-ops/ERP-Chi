import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Product,
  Sale,
  Expense,
  Customer,
  Supplier,
  Purchase,
  InventoryAdjustment,
  BusinessSettings,
  UserRole,
  UserStatus,
  AppUser,
  AuditLog,
  NotificationItem,
  ProductCategory,
  ExpenseCategory
} from '../types';
import {
  loadFromStorage,
  saveToStorage,
  INITIAL_PRODUCTS,
  INITIAL_SALES,
  INITIAL_EXPENSES,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_SETTINGS,
  DEFAULT_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES
} from '../services/storage';
import { findBestMatchingProduct } from '../utils/productMatching';
import { supabaseSignOut } from '../lib/supabase';
import { supabase } from '../supabaseClient';

const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr-1',
    fullName: 'Chidi Nwosu (Super Admin)',
    phone: '08012345678',
    email: 'chidi@glossyerp.com',
    branch: 'Main Store',
    role: 'super_admin',
    requestedRole: 'super_admin',
    status: 'active',
    registrationDate: '2026-07-01T09:00:00.000Z'
  },
  {
    id: 'usr-2',
    fullName: 'Amaka Eze (Store Admin)',
    phone: '08023456789',
    email: 'amaka@glossyerp.com',
    branch: 'Main Store',
    role: 'administrator',
    requestedRole: 'administrator',
    status: 'active',
    registrationDate: '2026-07-05T10:15:00.000Z'
  },
  {
    id: 'usr-3',
    fullName: 'Kelechi Okafor (Store Manager)',
    phone: '08034567890',
    email: 'kelechi@glossyerp.com',
    branch: 'Lekki Branch',
    role: 'manager',
    requestedRole: 'manager',
    status: 'active',
    registrationDate: '2026-07-10T14:30:00.000Z'
  },
  {
    id: 'usr-4',
    fullName: 'Blessing Bello (Sales Person)',
    phone: '08045678901',
    email: 'blessing@glossyerp.com',
    branch: 'Main Store',
    role: 'salesperson',
    requestedRole: 'salesperson',
    status: 'active',
    registrationDate: '2026-07-15T11:45:00.000Z'
  },
  {
    id: 'usr-5',
    fullName: 'John Doe (Pending Demo)',
    phone: '08056789012',
    email: 'john@glossyerp.com',
    branch: 'Ikeja Branch',
    role: 'salesperson',
    requestedRole: 'salesperson',
    status: 'pending',
    registrationDate: '2026-07-31T08:00:00.000Z'
  }
];

interface AppContextType {
  // State
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  customers: Customer[];
  suppliers: Supplier[];
  purchases: Purchase[];
  inventoryLogs: InventoryAdjustment[];
  settings: BusinessSettings;
  categories: ProductCategory[];
  expenseCategories: ExpenseCategory[];
  appUsers: AppUser[];
  userRole: UserRole;
  primaryUserRole: UserRole;
  userName: string;
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  isOffline: boolean;
  isSyncing: boolean;
  unSyncedCount: number;
  pendingApprovalsCount: number;

  // Modals & Navigation & Route Guard
  currentRoute: 'splash' | 'login' | 'register' | 'forgot-password' | 'pending-approval' | 'suspended' | 'rejected' | 'app';
  setCurrentRoute: (route: 'splash' | 'login' | 'register' | 'forgot-password' | 'pending-approval' | 'suspended' | 'rejected' | 'app') => void;
  currentUser: AppUser | null;
  pendingUserReg: {
    fullName?: string;
    email?: string;
    requestedRole?: UserRole;
    businessName?: string;
    registrationDate?: string;
  } | null;
  setPendingUserReg: (data: any) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isPendingApprovalsOpen: boolean;
  setIsPendingApprovalsOpen: (open: boolean) => void;
  isLogoutConfirmOpen: boolean;
  setIsLogoutConfirmOpen: (open: boolean) => void;
  isChangePasswordOpen: boolean;
  setIsChangePasswordOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  logoutNoticeMsg: string | null;
  setLogoutNoticeMsg: (msg: string | null) => void;

  // Actions
  setUserRole: (role: UserRole, reason?: string) => void;
  setPrimaryUserRole: (role: UserRole) => void;
  setUserName: (name: string) => void;
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  performLogout: () => Promise<void>;
  changeUserPassword: (currentPass: string, newPass: string) => { success: boolean; message: string };

  // Auth & User Management Actions
  registerUser: (userData: {
    fullName: string;
    phone: string;
    email: string;
    password?: string;
    businessName?: string;
    businessAddress?: string;
    businessPhone?: string;
    businessEmail?: string;
    branch?: string;
    requestedRole: UserRole;
  }) => { success: boolean; message: string };

  loginUser: (
    email: string,
    password?: string
  ) => { success: boolean; message: string; status?: UserStatus };

  approveUser: (userId: string, assignedRole: UserRole, branch?: string) => void;
  rejectUser: (userId: string, reason?: string) => void;
  updateUserStatus: (userId: string, status: UserStatus) => void;
  updateUser: (userId: string, updates: Partial<AppUser>) => void;
  deleteUser: (userId: string) => void;
  resetUserPassword: (userId: string) => void;

  // Product Actions
  addProduct: (product: Partial<Product>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  findOrCreateProductByName: (name: string, sellingPrice: number, costPrice?: number, category?: string) => Product;

  // Sales Actions
  completeSale: (saleData: {
    items: {
      productId?: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      unitCost?: number;
      discount?: number;
      category?: string;
    }[];
    discount: number;
    customerName?: string;
    customerPhone?: string;
    paymentMethod: 'cash' | 'pos' | 'transfer' | 'credit' | 'mobile_money';
    amountPaid: number;
  }) => Sale;

  // Expense Actions
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addExpenseCategory: (name: string, description?: string) => void;
  updateExpenseCategory: (id: string, name: string, description?: string) => void;
  deleteExpenseCategory: (id: string) => void;

  // Customer Actions
  addCustomer: (customer: Omit<Customer, 'id' | 'totalPurchases' | 'outstandingDebt'>) => Customer;
  payCustomerDebt: (customerId: string, amount: number) => void;

  // Supplier Actions
  addSupplier: (supplier: Omit<Supplier, 'id' | 'outstandingBalance'>) => void;
  paySupplierBalance: (supplierId: string, amount: number) => void;

  // Purchase Actions
  addPurchase: (purchase: {
    supplierId: string;
    supplierName: string;
    productId: string;
    productName: string;
    quantity: number;
    costPrice: number;
    amountPaid: number;
  }) => void;

  // Stock Adjustment
  adjustStock: (
    productId: string,
    quantity: number,
    type: 'stock_in' | 'stock_out' | 'adjustment' | 'damaged' | 'returned' | 'expired',
    reason: string
  ) => void;

  // System Helpers
  triggerSync: () => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => boolean;
  logAudit: (action: string, details: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State initialization
  const [products, setProducts] = useState<Product[]>(() =>
    loadFromStorage('glow_erp_products', INITIAL_PRODUCTS)
  );
  const [sales, setSales] = useState<Sale[]>(() =>
    loadFromStorage('glow_erp_sales', INITIAL_SALES)
  );
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    loadFromStorage('glow_erp_expenses', INITIAL_EXPENSES)
  );
  const [customers, setCustomers] = useState<Customer[]>(() =>
    loadFromStorage('glow_erp_customers', INITIAL_CUSTOMERS)
  );
  const [suppliers, setSuppliers] = useState<Supplier[]>(() =>
    loadFromStorage('glow_erp_suppliers', INITIAL_SUPPLIERS)
  );
  const [purchases, setPurchases] = useState<Purchase[]>(() =>
    loadFromStorage('glow_erp_purchases', [])
  );
  const [inventoryLogs, setInventoryLogs] = useState<InventoryAdjustment[]>(() =>
    loadFromStorage('glow_erp_inventory_logs', [])
  );
  const [settings, setSettings] = useState<BusinessSettings>(() =>
    loadFromStorage('glow_erp_settings', INITIAL_SETTINGS)
  );
  const [categories, setCategories] = useState<ProductCategory[]>(() =>
    loadFromStorage('glow_erp_categories', DEFAULT_CATEGORIES)
  );
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(() =>
    loadFromStorage('glow_erp_expense_categories', DEFAULT_EXPENSE_CATEGORIES.map((cat, idx) => ({
      id: `exp-cat-${idx + 1}`,
      name: cat,
      isCustom: false,
    })))
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    loadFromStorage('glow_erp_audit_logs', [
      {
        id: 'log-1',
        timestamp: new Date().toISOString(),
        userRole: 'administrator',
        userName: 'Store Owner',
        action: 'System Boot',
        details: 'GlowERP initialized successfully'
      }
    ])
  );

  const [appUsers, setAppUsers] = useState<AppUser[]>(() =>
    loadFromStorage('glow_erp_app_users', INITIAL_USERS)
  );

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = loadFromStorage<NotificationItem[]>('glow_erp_notifications', []);
    if (saved.length > 0) {
      const seen = new Set<string>();
      return saved.filter((item) => {
        if (!item.id || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
    }
    // Initial notification for pending user demo
    return [
      {
        id: 'notif-demo-1',
        type: 'user_registration',
        title: 'New User Registration',
        message: 'New User Registration: John Doe has requested a Sales Person account.',
        timestamp: new Date().toISOString(),
        read: false,
        actionTab: 'pending_approvals',
      },
    ];
  });

  const [primaryUserRole, setPrimaryUserRoleState] = useState<UserRole>(() => {
    return loadFromStorage<UserRole>('glow_erp_primary_user_role', 'super_admin');
  });
  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    return loadFromStorage<UserRole>('glow_erp_user_role', 'super_admin');
  });
  const [userName, setUserName] = useState<string>('');

  // Authentication Route & Session State
  const [currentRoute, setCurrentRoute] = useState<'splash' | 'login' | 'register' | 'forgot-password' | 'pending-approval' | 'suspended' | 'rejected' | 'app'>('splash');
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [pendingUserReg, setPendingUserReg] = useState<any | null>(null);

  // Save roles and users to storage
  useEffect(() => saveToStorage('glow_erp_primary_user_role', primaryUserRole), [primaryUserRole]);
  useEffect(() => saveToStorage('glow_erp_user_role', userRole), [userRole]);
  useEffect(() => saveToStorage('glow_erp_app_users', appUsers), [appUsers]);

  // Launch Splash Screen & Authentication Session Guard
  useEffect(() => {
    const checkSessionAndInit = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setCurrentRoute('login');
          return;
        }
      } catch (err) {
        console.warn('Session verification exception:', err);
      }

      const activeUserId = loadFromStorage<string | null>('glow_erp_active_user_id', null);
      if (activeUserId) {
        const foundUser = appUsers.find((u) => u.id === activeUserId);
        if (foundUser) {
          if (foundUser.status === 'active') {
            setCurrentUser(foundUser);
            setUserName(foundUser.fullName);
            setUserRoleState(foundUser.role);
            setPrimaryUserRoleState(foundUser.role);
            setCurrentRoute('app');
            return;
          } else if (foundUser.status === 'pending') {
            setPendingUserReg({
              fullName: foundUser.fullName,
              email: foundUser.email,
              requestedRole: foundUser.requestedRole || foundUser.role,
              businessName: foundUser.branch,
            });
            setCurrentRoute('pending-approval');
            return;
          } else if (foundUser.status === 'disabled' || foundUser.status === 'suspended') {
            setCurrentRoute('suspended');
            return;
          } else if (foundUser.status === 'rejected') {
            setCurrentRoute('rejected');
            return;
          }
        }
      }

      // If Supabase session exists but no specific active local user record matched:
      const defaultActiveUser = appUsers.find((u) => u.status === 'active') || appUsers[0];
      if (defaultActiveUser) {
        setCurrentUser(defaultActiveUser);
        setUserName(defaultActiveUser.fullName);
        setUserRoleState(defaultActiveUser.role);
        setPrimaryUserRoleState(defaultActiveUser.role);
        setCurrentRoute('app');
        return;
      }

      // Default fallback to Login
      setCurrentRoute('login');
    };

    const timer = setTimeout(() => {
      checkSessionAndInit();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isPendingApprovalsOpen, setIsPendingApprovalsOpen] = useState<boolean>(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState<boolean>(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [logoutNoticeMsg, setLogoutNoticeMsg] = useState<string | null>(null);

  const pendingApprovalsCount = appUsers.filter((u) => u.status === 'pending').length;

  const registerUser = (userData: {
    fullName: string;
    phone: string;
    email: string;
    password?: string;
    businessName?: string;
    businessAddress?: string;
    businessPhone?: string;
    businessEmail?: string;
    branch?: string;
    requestedRole: UserRole;
  }): { success: boolean; message: string } => {
    const existing = appUsers.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      return {
        success: false,
        message: 'An account with this email address already exists in the ERP system.'
      };
    }

    const targetRequestedRole = userData.requestedRole === 'super_admin' ? 'salesperson' : userData.requestedRole;

    const newUser: AppUser = {
      id: `usr-${Date.now()}`,
      fullName: userData.fullName,
      phone: userData.phone,
      email: userData.email,
      password: userData.password,
      businessName: userData.businessName,
      businessAddress: userData.businessAddress,
      businessPhone: userData.businessPhone,
      businessEmail: userData.businessEmail,
      branch: userData.branch || 'Main Store',
      role: targetRequestedRole,
      requestedRole: targetRequestedRole,
      status: 'pending',
      registrationDate: new Date().toISOString()
    };

    setAppUsers((prev) => [newUser, ...prev]);

    setPendingUserReg({
      fullName: newUser.fullName,
      email: newUser.email,
      requestedRole: targetRequestedRole,
      businessName: newUser.businessName || newUser.branch,
      registrationDate: newUser.registrationDate,
    });

    const roleTitleMap: Record<UserRole, string> = {
      salesperson: 'Sales Person',
      manager: 'Manager',
      administrator: 'Administrator',
      super_admin: 'Super Administrator',
    };

    const roleTitle = roleTitleMap[targetRequestedRole] || 'Sales Person';

    // Immediate notification inside ERP
    const newNotification: NotificationItem = {
      id: `notif-user-${newUser.id}`,
      type: 'user_registration',
      title: 'New User Registration',
      message: `${newUser.fullName} has requested access as ${roleTitle}.`,
      timestamp: new Date().toISOString(),
      read: false,
      actionTab: 'pending_approvals'
    };

    setNotifications((prev) => [newNotification, ...prev]);

    // If business details were provided and store settings are empty/unconfigured, populate them
    if (userData.businessName && (!settings.businessName || settings.businessName === 'Not Configured')) {
      updateSettings({
        businessName: userData.businessName,
        address: userData.businessAddress || settings.address,
        phone: userData.businessPhone || settings.phone,
        email: userData.businessEmail || settings.email,
      });
    }

    logAudit(
      'User Registration Submitted',
      `New user application submitted by ${newUser.fullName} (${newUser.email}) for role ${targetRequestedRole}`
    );

    setCurrentRoute('pending-approval');

    return {
      success: true,
      message: 'Your account has been submitted successfully. An Administrator will review your registration.'
    };
  };

  const loginUser = (
    email: string,
    password?: string
  ): { success: boolean; message: string; status?: UserStatus } => {
    const user = appUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return {
        success: false,
        message: 'Incorrect email or password.'
      };
    }

    if (password && user.password && user.password !== password) {
      return {
        success: false,
        message: 'Incorrect email or password.'
      };
    }

    if (user.status === 'pending') {
      setPendingUserReg({
        fullName: user.fullName,
        email: user.email,
        requestedRole: user.requestedRole || user.role,
        businessName: user.branch,
      });
      setCurrentRoute('pending-approval');
      return {
        success: false,
        status: 'pending',
        message: 'Your account is awaiting approval from an Administrator.'
      };
    }

    if (user.status === 'rejected') {
      setCurrentRoute('rejected');
      return {
        success: false,
        status: 'rejected',
        message: 'Your registration was not approved.'
      };
    }

    if (user.status === 'disabled' || user.status === 'suspended') {
      setCurrentRoute('suspended');
      return {
        success: false,
        status: user.status,
        message: 'Your account has been suspended. Please contact your Administrator.'
      };
    }

    // Active User Login
    setCurrentUser(user);
    setPrimaryUserRoleState(user.role);
    setUserRoleState(user.role);
    setUserName(user.fullName);
    saveToStorage('glow_erp_active_user_id', user.id);
    setCurrentRoute('app');
    setActiveTab('dashboard');

    logAudit(
      'User Logged In',
      `${user.fullName} (${user.email}) logged in successfully as ${user.role}`
    );

    return {
      success: true,
      message: 'Logged in successfully!'
    };
  };

  const approveUser = (userId: string, assignedRole: UserRole, branch?: string) => {
    if (primaryUserRole === 'administrator' && assignedRole === 'super_admin') {
      alert('Security Restriction: Administrators cannot assign the Super Administrator role.');
      return;
    }

    const targetUser = appUsers.find((u) => u.id === userId);
    if (!targetUser) return;

    setAppUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: 'active',
              role: assignedRole,
              branch: branch || u.branch || 'Main Store'
            }
          : u
      )
    );

    logAudit(
      'Approved User Account',
      `Approved user ${targetUser.fullName} (${targetUser.email}). Assigned Role: ${assignedRole}, Branch: ${branch || targetUser.branch}`
    );
  };

  const rejectUser = (userId: string, reason?: string) => {
    const targetUser = appUsers.find((u) => u.id === userId);
    if (!targetUser) return;

    setAppUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: 'rejected',
              rejectionReason: reason
            }
          : u
      )
    );

    logAudit(
      'Rejected User Registration',
      `Rejected registration for ${targetUser.fullName} (${targetUser.email}). Reason: ${reason || 'No reason specified'}`
    );
  };

  const updateUserStatus = (userId: string, status: UserStatus) => {
    const targetUser = appUsers.find((u) => u.id === userId);
    if (!targetUser) return;

    if (primaryUserRole === 'administrator' && targetUser.role === 'super_admin') {
      alert('Security Violation: Administrators cannot modify Super Administrator accounts.');
      return;
    }

    setAppUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status } : u))
    );

    logAudit(
      'User Status Changed',
      `Changed status of ${targetUser.fullName} (${targetUser.email}) to ${status}`
    );
  };

  const updateUser = (userId: string, updates: Partial<AppUser>) => {
    const targetUser = appUsers.find((u) => u.id === userId);
    if (!targetUser) return;

    if (primaryUserRole === 'administrator') {
      if (targetUser.role === 'super_admin' || updates.role === 'super_admin') {
        alert('Security Violation: Administrators cannot grant or alter Super Administrator privileges.');
        return;
      }
    }

    setAppUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    );

    logAudit(
      'Updated User Account',
      `Updated profile details for ${targetUser.fullName} (${targetUser.email})`
    );
  };

  const deleteUser = (userId: string) => {
    const targetUser = appUsers.find((u) => u.id === userId);
    if (!targetUser) return;

    if (primaryUserRole === 'administrator' && targetUser.role === 'super_admin') {
      alert('Security Violation: Administrators cannot delete Super Administrator accounts.');
      return;
    }

    setAppUsers((prev) => prev.filter((u) => u.id !== userId));

    logAudit(
      'Deleted User Account',
      `Deleted staff user ${targetUser.fullName} (${targetUser.email})`
    );
  };

  const resetUserPassword = (userId: string) => {
    const targetUser = appUsers.find((u) => u.id === userId);
    if (!targetUser) return;

    logAudit(
      'Reset User Password',
      `Reset password for user ${targetUser.fullName} (${targetUser.email})`
    );
    alert(`Password reset confirmation generated for ${targetUser.fullName}.`);
  };

  // Sync & Network status
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Sync to LocalStorage on change
  useEffect(() => saveToStorage('glow_erp_products', products), [products]);
  useEffect(() => saveToStorage('glow_erp_sales', sales), [sales]);
  useEffect(() => saveToStorage('glow_erp_expenses', expenses), [expenses]);
  useEffect(() => saveToStorage('glow_erp_customers', customers), [customers]);
  useEffect(() => saveToStorage('glow_erp_suppliers', suppliers), [suppliers]);
  useEffect(() => saveToStorage('glow_erp_purchases', purchases), [purchases]);
  useEffect(() => saveToStorage('glow_erp_inventory_logs', inventoryLogs), [inventoryLogs]);
  useEffect(() => saveToStorage('glow_erp_settings', settings), [settings]);
  useEffect(() => saveToStorage('glow_erp_categories', categories), [categories]);
  useEffect(() => saveToStorage('glow_erp_expense_categories', expenseCategories), [expenseCategories]);
  useEffect(() => saveToStorage('glow_erp_audit_logs', auditLogs), [auditLogs]);
  useEffect(() => saveToStorage('glow_erp_notifications', notifications), [notifications]);

  // Dark mode effect
  useEffect(() => {
    if (settings.enableDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.enableDarkMode]);

  // Handle Online / Offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      triggerSync();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Low stock checker effect
  useEffect(() => {
    const lowStockItems = products.filter((p) => p.currentStock <= p.reorderLevel);
    if (lowStockItems.length > 0) {
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const newNotifs: NotificationItem[] = [];

        lowStockItems.forEach((p) => {
          const notifId = `notif-stock-${p.id}`;
          if (!existingIds.has(notifId)) {
            newNotifs.push({
              id: notifId,
              type: p.currentStock === 0 ? 'out_of_stock' : 'low_stock',
              title: p.currentStock === 0 ? `Out of Stock: ${p.name}` : `Low Stock Alert: ${p.name}`,
              message: `Current stock is ${p.currentStock} units (Reorder level: ${p.reorderLevel}).`,
              timestamp: new Date().toISOString(),
              read: false,
            });
            existingIds.add(notifId);
          }
        });

        if (newNotifs.length === 0) return prev;
        return [...newNotifs, ...prev];
      });
    }
  }, [products]);

  const setUserRole = (targetRole: UserRole, reason?: string) => {
    // Security enforcement: Managers and Sales Persons cannot switch roles
    if (primaryUserRole === 'salesperson' || primaryUserRole === 'manager') {
      alert('Role switching is restricted. Sales Persons and Managers are not authorized to switch roles.');
      return;
    }

    // Security enforcement: Administrator cannot switch to or impersonate Super Administrator
    if (primaryUserRole === 'administrator' && targetRole === 'super_admin') {
      alert('Security Alert: Administrators cannot switch to or impersonate the Super Administrator role.');
      return;
    }

    const previousRole = userRole;
    setUserRoleState(targetRole);

    let newName = userName;
    if (targetRole === 'super_admin') newName = 'Chidi (Super Admin)';
    else if (targetRole === 'administrator') newName = 'Amaka (Store Admin)';
    else if (targetRole === 'manager') newName = 'Kelechi (Store Manager)';
    else if (targetRole === 'salesperson') newName = 'Blessing (Sales Person)';
    setUserName(newName);

    // Record audit log entry: User performing action, original role, switched role, timestamp, reason
    const reasonDetail = reason ? ` (Reason: ${reason})` : '';
    logAudit(
      'Role Switch',
      `Switched active role from ${previousRole} to ${targetRole}${reasonDetail}`
    );
  };

  const setPrimaryUserRole = (targetRole: UserRole) => {
    setPrimaryUserRoleState(targetRole);
    setUserRoleState(targetRole);

    let newName = userName;
    if (targetRole === 'super_admin') newName = 'Chidi (Super Admin)';
    else if (targetRole === 'administrator') newName = 'Amaka (Store Admin)';
    else if (targetRole === 'manager') newName = 'Kelechi (Store Manager)';
    else if (targetRole === 'salesperson') newName = 'Blessing (Sales Person)';
    setUserName(newName);

    logAudit('Primary Identity Change', `Primary account identity changed to ${targetRole}`);
  };

  const logAudit = (action: string, details: string) => {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      userRole,
      userName,
      action,
      details,
    };
    setAuditLogs((prev) => [log, ...prev].slice(0, 100)); // keep last 100 logs
  };

  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      logAudit('Updated Settings', 'Business configuration settings were modified');
      return updated;
    });
  };

  const triggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setSales((prev) => prev.map((s) => ({ ...s, isSynced: true })));
      setIsSyncing(false);
      logAudit('Cloud Sync', 'All pending offline sales and logs synced successfully');
    }, 1200);
  };

  const addProduct = (prodData: Partial<Product>): Product => {
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: prodData.name || 'Unnamed Cosmetic Product',
      barcode: prodData.barcode || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      sku: prodData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: prodData.category || 'Makeup',
      brand: prodData.brand || 'Generic',
      costPrice: Number(prodData.costPrice || 0),
      sellingPrice: Number(prodData.sellingPrice || 0),
      wholesalePrice: Number(prodData.wholesalePrice || prodData.sellingPrice || 0),
      currentStock: Number(prodData.currentStock || 0),
      reorderLevel: Number(prodData.reorderLevel || 5),
      supplierId: prodData.supplierId,
      supplierName: prodData.supplierName,
      dateCreated: new Date().toISOString().split('T')[0],
      imageUrl: prodData.imageUrl,
    };

    setProducts((prev) => [newProd, ...prev]);
    logAudit('Created Product', `Added ${newProd.name} (Stock: ${newProd.currentStock})`);
    return newProd;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          logAudit('Updated Product', `Updated details for ${p.name}`);
          return updated;
        }
        return p;
      })
    );
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (target) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      logAudit('Deleted Product', `Removed ${target.name} from catalog`);
    }
  };

  const findOrCreateProductByName = (
    name: string,
    sellingPrice: number,
    costPrice?: number,
    category?: string
  ): Product => {
    const cleanName = name.trim();
    const existing = findBestMatchingProduct(cleanName, products);

    if (existing) {
      // Keep selling price and cost price updated in product memory
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === existing.id) {
            return {
              ...p,
              sellingPrice: sellingPrice > 0 ? sellingPrice : p.sellingPrice,
              costPrice: costPrice !== undefined && costPrice >= 0 ? costPrice : p.costPrice,
              lastSellingPrice: sellingPrice > 0 ? sellingPrice : p.lastSellingPrice || p.sellingPrice,
              lastCostPrice: costPrice !== undefined && costPrice >= 0 ? costPrice : p.lastCostPrice || p.costPrice,
              category: category || p.category,
            };
          }
          return p;
        })
      );
      return existing;
    }

    // Automatically create product if missing!
    const autoCreatedProduct = addProduct({
      name: cleanName,
      sellingPrice: sellingPrice > 0 ? sellingPrice : 1000,
      costPrice: costPrice !== undefined && costPrice >= 0 ? costPrice : Math.round((sellingPrice || 1000) * 0.65),
      wholesalePrice: Math.round((sellingPrice || 1000) * 0.85),
      category: category || 'Makeup',
      currentStock: 100, // Default generous initial stock so sales flow smoothly
      reorderLevel: 10,
      brand: 'Cosmetic Store',
      timesSold: 0,
      lastSellingPrice: sellingPrice,
      lastCostPrice: costPrice,
    });

    logAudit(
      'Auto Created Product',
      `Product "${cleanName}" auto-created in memory during sale with Selling Price ₦${sellingPrice}`
    );

    return autoCreatedProduct;
  };

  const completeSale = (saleData: {
    items: {
      productId?: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      unitCost?: number;
      discount?: number;
      category?: string;
    }[];
    discount: number;
    customerName?: string;
    customerPhone?: string;
    paymentMethod: 'cash' | 'pos' | 'transfer' | 'credit' | 'mobile_money';
    amountPaid: number;
  }): Sale => {
    const invoiceNumber = `INV-${1000 + sales.length + 1}`;
    const timestamp = new Date().toISOString();
    const date = timestamp.split('T')[0];

    let totalCogs = 0;
    let subtotal = 0;

    // Process items and check/deduct stock
    const processedItems = saleData.items.map((item) => {
      let product: Product;

      if (item.productId) {
        const found = products.find((p) => p.id === item.productId);
        product = found || findOrCreateProductByName(item.productName, item.unitPrice, item.unitCost, item.category);
      } else {
        product = findOrCreateProductByName(item.productName, item.unitPrice, item.unitCost, item.category);
      }

      const cost = item.unitCost !== undefined ? item.unitCost : product.costPrice;
      const price = item.unitPrice !== undefined ? item.unitPrice : product.sellingPrice;
      const itemDiscount = item.discount || 0;
      const itemSubtotal = Math.max(0, price * item.quantity - itemDiscount);

      totalCogs += cost * item.quantity;
      subtotal += itemSubtotal;

      // Automatically deduct stock and update Smart Memory!
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === product.id) {
            return {
              ...p,
              sellingPrice: price,
              costPrice: cost,
              lastSellingPrice: price,
              lastCostPrice: cost,
              lastSaleDate: date,
              timesSold: (p.timesSold || 0) + item.quantity,
              currentStock: Math.max(0, p.currentStock - item.quantity),
            };
          }
          return p;
        })
      );

      return {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitCost: cost,
        unitPrice: price,
        discount: itemDiscount,
        subtotal: itemSubtotal,
        category: product.category,
      };
    });

    const overallDiscount = saleData.discount || 0;
    // Sales Calculation: Final Amount Received = Total Sale - Discount (No tax added or deducted)
    const finalTotal = Math.max(0, subtotal - overallDiscount);
    // Tax is purely informational if enabled
    const taxAmount = settings.enableTax ? (finalTotal * (settings.taxRate || 0)) / 100 : 0;
    const grossProfit = finalTotal - totalCogs;

    const amountPaid = saleData.amountPaid || 0;
    const changeGiven = amountPaid > finalTotal ? amountPaid - finalTotal : 0;
    const outstandingDebt = amountPaid < finalTotal ? finalTotal - amountPaid : 0;

    // Handle Customer record & Debt tracking
    let customerId: string | undefined;
    const custName = saleData.customerName?.trim() || 'Walk-in Customer';

    if (custName !== 'Walk-in Customer') {
      const existingCust = customers.find(
        (c) => c.name.toLowerCase() === custName.toLowerCase()
      );

      if (existingCust) {
        customerId = existingCust.id;
        setCustomers((prev) =>
          prev.map((c) => {
            if (c.id === existingCust.id) {
              return {
                ...c,
                totalPurchases: c.totalPurchases + finalTotal,
                outstandingDebt: c.outstandingDebt + outstandingDebt,
                lastPurchaseDate: date,
              };
            }
            return c;
          })
        );
      } else {
        const newCust: Customer = {
          id: `cust-${Date.now()}`,
          name: custName,
          phone: saleData.customerPhone || '',
          totalPurchases: finalTotal,
          outstandingDebt: outstandingDebt,
          lastPurchaseDate: date,
        };
        setCustomers((prev) => [newCust, ...prev]);
        customerId = newCust.id;
      }
    }

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNumber,
      timestamp,
      date,
      items: processedItems,
      subtotal,
      discount: overallDiscount,
      tax: taxAmount,
      totalAmount: finalTotal,
      costOfGoodsSold: totalCogs,
      grossProfit,
      amountPaid,
      changeGiven,
      outstandingDebt,
      customerName: custName,
      customerPhone: saleData.customerPhone,
      customerId,
      paymentMethod: saleData.paymentMethod,
      salespersonRole: userRole,
      salespersonName: userName,
      isSynced: !isOffline,
    };

    setSales((prev) => [newSale, ...prev]);
    logAudit(
      'Completed Sale',
      `Invoice ${invoiceNumber} created. Total: ₦${finalTotal.toLocaleString()} (${saleData.paymentMethod})`
    );

    return newSale;
  };

  const addExpense = (expData: Omit<Expense, 'id' | 'timestamp'>) => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);
    logAudit(
      'Added Expense',
      `Category: ${newExp.category}, Amount: ₦${newExp.amount.toLocaleString()}`
    );

    if (newExp.amount >= 20000) {
      setNotifications((prev) => [
        {
          id: `notif-exp-${newExp.id}`,
          type: 'large_expense',
          title: 'Large Expense Logged',
          message: `An expense of ₦${newExp.amount.toLocaleString()} was logged under ${newExp.category}.`,
          timestamp: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ]);
    }
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    logAudit('Updated Expense', `Updated expense #${id}`);
  };

  const deleteExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id);
    if (target) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      logAudit('Deleted Expense', `Removed expense #${id} (₦${target.amount})`);
    }
  };

  const addExpenseCategory = (name: string, description?: string) => {
    if (!name.trim()) return;
    const exists = expenseCategories.some((c) => c.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) return;

    const newCat: ExpenseCategory = {
      id: `exp-cat-${Date.now()}`,
      name: name.trim(),
      description,
      isCustom: true,
    };
    setExpenseCategories((prev) => [...prev, newCat]);
    logAudit('Created Expense Category', `Added custom category: ${name}`);
  };

  const updateExpenseCategory = (id: string, name: string, description?: string) => {
    setExpenseCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: name.trim(), description } : c))
    );
    logAudit('Updated Expense Category', `Updated category ID: ${id}`);
  };

  const deleteExpenseCategory = (id: string) => {
    const target = expenseCategories.find((c) => c.id === id);
    if (target) {
      setExpenseCategories((prev) => prev.filter((c) => c.id !== id));
      logAudit('Deleted Expense Category', `Removed category: ${target.name}`);
    }
  };

  const addCustomer = (
    cData: Omit<Customer, 'id' | 'totalPurchases' | 'outstandingDebt'>
  ): Customer => {
    const newC: Customer = {
      ...cData,
      id: `cust-${Date.now()}`,
      totalPurchases: 0,
      outstandingDebt: 0,
    };
    setCustomers((prev) => [newC, ...prev]);
    logAudit('Added Customer', `Created customer record for ${newC.name}`);
    return newC;
  };

  const payCustomerDebt = (customerId: string, amount: number) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const updatedDebt = Math.max(0, c.outstandingDebt - amount);
          logAudit(
            'Customer Debt Payment',
            `${c.name} paid ₦${amount.toLocaleString()}. Remaining Debt: ₦${updatedDebt.toLocaleString()}`
          );
          return { ...c, outstandingDebt: updatedDebt };
        }
        return c;
      })
    );
  };

  const addSupplier = (sData: Omit<Supplier, 'id' | 'outstandingBalance'>) => {
    const newS: Supplier = {
      ...sData,
      id: `sup-${Date.now()}`,
      outstandingBalance: 0,
    };
    setSuppliers((prev) => [newS, ...prev]);
    logAudit('Added Supplier', `Registered supplier ${newS.name}`);
  };

  const paySupplierBalance = (supplierId: string, amount: number) => {
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          const updatedBal = Math.max(0, s.outstandingBalance - amount);
          logAudit(
            'Supplier Payment',
            `Paid ₦${amount.toLocaleString()} to ${s.name}. Remaining Balance Owed: ₦${updatedBal.toLocaleString()}`
          );
          return { ...s, outstandingBalance: updatedBal };
        }
        return s;
      })
    );
  };

  const addPurchase = (purchaseData: {
    supplierId: string;
    supplierName: string;
    productId: string;
    productName: string;
    quantity: number;
    costPrice: number;
    amountPaid: number;
  }) => {
    const totalAmount = purchaseData.quantity * purchaseData.costPrice;
    const unpaidBalance = Math.max(0, totalAmount - purchaseData.amountPaid);
    const paymentStatus =
      purchaseData.amountPaid >= totalAmount
        ? 'paid'
        : purchaseData.amountPaid > 0
        ? 'partial'
        : 'unpaid';

    const newPurchase: Purchase = {
      id: `pur-${Date.now()}`,
      supplierId: purchaseData.supplierId,
      supplierName: purchaseData.supplierName,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      productId: purchaseData.productId,
      productName: purchaseData.productName,
      quantity: purchaseData.quantity,
      costPrice: purchaseData.costPrice,
      totalAmount,
      paymentStatus,
      amountPaid: purchaseData.amountPaid,
    };

    setPurchases((prev) => [newPurchase, ...prev]);

    // Automatically increase product stock!
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === purchaseData.productId) {
          return {
            ...p,
            currentStock: p.currentStock + purchaseData.quantity,
            costPrice: purchaseData.costPrice,
          };
        }
        return p;
      })
    );

    // Update supplier balance if unpaid
    if (unpaidBalance > 0 && purchaseData.supplierId) {
      setSuppliers((prev) =>
        prev.map((s) => {
          if (s.id === purchaseData.supplierId) {
            return {
              ...s,
              outstandingBalance: s.outstandingBalance + unpaidBalance,
            };
          }
          return s;
        })
      );
    }

    logAudit(
      'Recorded Purchase',
      `Restocked ${purchaseData.quantity} units of ${purchaseData.productName} from ${purchaseData.supplierName}`
    );
  };

  const adjustStock = (
    productId: string,
    quantity: number,
    type: 'stock_in' | 'stock_out' | 'adjustment' | 'damaged' | 'returned' | 'expired',
    reason: string
  ) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    let delta = quantity;
    if (type === 'damaged' || type === 'expired' || type === 'stock_out') {
      delta = -Math.abs(quantity);
    } else if (type === 'stock_in' || type === 'returned') {
      delta = Math.abs(quantity);
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            currentStock: Math.max(0, p.currentStock + delta),
          };
        }
        return p;
      })
    );

    const log: InventoryAdjustment = {
      id: `inv-${Date.now()}`,
      productId,
      productName: target.name,
      type,
      quantity: Math.abs(quantity),
      reason,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      costValue: target.costPrice * Math.abs(quantity),
    };

    setInventoryLogs((prev) => [log, ...prev]);
    logAudit('Stock Adjustment', `${type.toUpperCase()}: ${Math.abs(quantity)} units of ${target.name} (${reason})`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const exportDatabaseJSON = (): string => {
    const dbDump = {
      products,
      sales,
      expenses,
      customers,
      suppliers,
      purchases,
      inventoryLogs,
      settings,
      categories,
      auditLogs,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    return JSON.stringify(dbDump, null, 2);
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.products) setProducts(data.products);
      if (data.sales) setSales(data.sales);
      if (data.expenses) setExpenses(data.expenses);
      if (data.customers) setCustomers(data.customers);
      if (data.suppliers) setSuppliers(data.suppliers);
      if (data.purchases) setPurchases(data.purchases);
      if (data.inventoryLogs) setInventoryLogs(data.inventoryLogs);
      if (data.settings) setSettings(data.settings);
      if (data.categories) setCategories(data.categories);
      logAudit('Restored Database', 'System restored state from JSON backup');
      return true;
    } catch (err) {
      console.error('Failed to import database JSON:', err);
      return false;
    }
  };

  const unSyncedCount = sales.filter((s) => !s.isSynced).length;

  const performLogout = async () => {
    if (navigator.onLine) {
      triggerSync();
    }
    await supabaseSignOut();
    saveToStorage('glow_erp_active_user_id', null);
    setCurrentUser(null);
    setUserName('');
    setLogoutNoticeMsg('You have been logged out successfully.');
    setCurrentRoute('login');
    setIsAuthModalOpen(false);
    setIsLogoutConfirmOpen(false);
    logAudit('User Logout', `User ${userName} signed out of system`);
  };

  const changeUserPassword = (currentPass: string, newPass: string) => {
    const targetUser = appUsers.find(
      (u) => u.fullName.toLowerCase() === userName.toLowerCase() || u.email.toLowerCase().includes(userName.toLowerCase().split(' ')[0])
    );
    if (targetUser) {
      updateUser(targetUser.id, { password: newPass });
    }
    logAudit('Password Update', `User ${userName} updated security password`);
    return { success: true, message: 'Password changed successfully!' };
  };

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        setCurrentRoute,
        currentUser,
        pendingUserReg,
        setPendingUserReg,
        products,
        sales,
        expenses,
        customers,
        suppliers,
        purchases,
        inventoryLogs,
        settings,
        categories,
        expenseCategories,
        appUsers,
        userRole,
        primaryUserRole,
        userName,
        auditLogs,
        notifications,
        isOffline,
        isSyncing,
        unSyncedCount,
        pendingApprovalsCount,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        isNotificationOpen,
        setIsNotificationOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isPendingApprovalsOpen,
        setIsPendingApprovalsOpen,
        isLogoutConfirmOpen,
        setIsLogoutConfirmOpen,
        isChangePasswordOpen,
        setIsChangePasswordOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        logoutNoticeMsg,
        setLogoutNoticeMsg,
        setUserRole,
        setPrimaryUserRole,
        setUserName,
        updateSettings,
        performLogout,
        changeUserPassword,
        registerUser,
        loginUser,
        approveUser,
        rejectUser,
        updateUserStatus,
        updateUser,
        deleteUser,
        resetUserPassword,
        addProduct,
        updateProduct,
        deleteProduct,
        findOrCreateProductByName,
        completeSale,
        addExpense,
        updateExpense,
        deleteExpense,
        addExpenseCategory,
        updateExpenseCategory,
        deleteExpenseCategory,
        addCustomer,
        payCustomerDebt,
        addSupplier,
        paySupplierBalance,
        addPurchase,
        adjustStock,
        triggerSync,
        markNotificationRead,
        clearAllNotifications,
        exportDatabaseJSON,
        importDatabaseJSON,
        logAudit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
