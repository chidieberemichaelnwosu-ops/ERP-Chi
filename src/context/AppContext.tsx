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
  userRole: UserRole;
  userName: string;
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  isOffline: boolean;
  isSyncing: boolean;
  unSyncedCount: number;

  // Modals & Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;

  // Actions
  setUserRole: (role: UserRole) => void;
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;

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
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadFromStorage('glow_erp_notifications', [])
  );

  const [userRole, setUserRoleState] = useState<UserRole>('administrator');
  const [userName, setUserName] = useState<string>('Store Owner');

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);

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
      const existingIds = new Set(notifications.map((n) => n.id));
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
        }
      });

      if (newNotifs.length > 0) {
        setNotifications((prev) => [...newNotifs, ...prev]);
      }
    }
  }, [products]);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    if (role === 'administrator') setUserName('Store Owner');
    else if (role === 'manager') setUserName('Store Manager');
    else setUserName('Chioma (Salesperson)');

    logAudit('Role Switch', `Switched active user role to ${role}`);
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

  return (
    <AppContext.Provider
      value={{
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
        userRole,
        userName,
        auditLogs,
        notifications,
        isOffline,
        isSyncing,
        unSyncedCount,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        isNotificationOpen,
        setIsNotificationOpen,
        setUserRole,
        updateSettings,
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
