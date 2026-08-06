export type UserRole = 'super_admin' | 'administrator' | 'manager' | 'salesperson';
export type UserStatus = 'pending' | 'active' | 'disabled' | 'suspended' | 'rejected';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface AppUser {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  branch?: string;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  role: UserRole;
  requestedRole?: UserRole;
  status: UserStatus;
  registrationDate: string;
  rejectionReason?: string;
  password?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  sku: string;
  category: string;
  brand: string;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice: number;
  currentStock: number;
  reorderLevel: number;
  supplierId?: string;
  supplierName?: string;
  dateCreated: string;
  imageUrl?: string;
  timesSold?: number;
  lastSaleDate?: string;
  lastSellingPrice?: number;
  lastCostPrice?: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  category?: string;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  timestamp: string;
  date: string; // YYYY-MM-DD
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  costOfGoodsSold: number;
  grossProfit: number;
  amountPaid: number;
  changeGiven: number;
  outstandingDebt: number;
  customerName?: string;
  customerPhone?: string;
  customerId?: string;
  paymentMethod: 'cash' | 'pos' | 'transfer' | 'credit' | 'mobile_money';
  salespersonRole: UserRole;
  salespersonName: string;
  isSynced: boolean;
}

export interface InventoryAdjustment {
  id: string;
  productId: string;
  productName: string;
  type: 'stock_in' | 'stock_out' | 'adjustment' | 'damaged' | 'returned' | 'expired';
  quantity: number;
  reason: string;
  date: string;
  timestamp: string;
  costValue: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  productsSupplied: string[];
  outstandingBalance: number; // Balance owed to supplier
}

export interface Purchase {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  timestamp: string;
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  amountPaid: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalPurchases: number;
  outstandingDebt: number;
  lastPurchaseDate?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  isCustom?: boolean;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  category: string;
  description: string;
  amount: number;
  paidBy: string; // Cash, Bank Transfer, POS, Mobile Money
  paymentMethod: string;
  vendor?: string; // Vendor / Payee
  branch?: string; // Branch name
  notes?: string;
  receiptUrl?: string; // Attached receipt photo / document
  status?: 'paid' | 'pending';
}

export interface BusinessSettings {
  businessName: string;
  logoUrl?: string;
  address: string;
  phone: string;
  alternatePhone?: string;
  email: string;
  website?: string;
  city?: string;
  state?: string;
  country?: string;
  enableTax?: boolean;
  taxName?: string;
  taxRate: number; // percentage
  displayTaxOnReceipt?: boolean;
  currencySymbol: string; // e.g. ₦, $, €, GH₵, KSh
  currencyCode: string; // NGN, USD, EUR, GHS, KES
  receiptHeader?: string;
  receiptFooter: string;
  enableDarkMode: boolean;
  autoBackupCloud: boolean;
  lastBackupTime?: string;
  storeName?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userRole: UserRole;
  userName: string;
  action: string; // e.g. "Created Product", "Completed Sale #INV-1002"
  details: string;
}

export interface NotificationItem {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'large_expense' | 'debt_warning' | 'daily_summary' | 'user_registration';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionTab?: string;
}

export type ReportPeriod = 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'quarter' | 'year' | 'custom';
