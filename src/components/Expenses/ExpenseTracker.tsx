import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  exportToCSV,
  exportToExcel,
  generatePDFReport,
} from '../../services/export';
import { Expense } from '../../types';
import {
  Receipt,
  Plus,
  Trash2,
  Filter,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Search,
  Calendar,
  Building2,
  FileText,
  FileSpreadsheet,
  Download,
  Printer,
  Upload,
  Eye,
  Tag,
  PieChart as PieChartIcon,
  BarChart3,
  Edit2,
  FolderPlus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  CreditCard,
  UserCheck,
  Maximize2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';

export const ExpenseTracker: React.FC = () => {
  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    expenseCategories,
    addExpenseCategory,
    deleteExpenseCategory,
    sales,
    purchases,
    suppliers,
    settings,
  } = useApp();

  const symbol = settings.currencySymbol || '₦';

  // Navigation Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'list' | 'categories' | 'analytics' | 'reports' | 'cashflow'>('dashboard');

  // Modals & View States
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('All');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'quarter' | 'year'>('month');

  // Form State
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState<string>('Generator Fuel');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState<number | ''>('');
  const [formPaidBy, setFormPaidBy] = useState('Cash');
  const [formVendor, setFormVendor] = useState('');
  const [formBranch, setFormBranch] = useState('Main Branch');
  const [formNotes, setFormNotes] = useState('');
  const [formReceipt, setFormReceipt] = useState<string>('');

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Set default category if formCategory not in list
  React.useEffect(() => {
    if (expenseCategories.length > 0 && !expenseCategories.some(c => c.name === formCategory)) {
      setFormCategory(expenseCategories[0].name);
    }
  }, [expenseCategories]);

  // Handle Image Upload
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('File size too large. Please select an image under 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormReceipt(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Form for Create
  const handleOpenCreateModal = () => {
    setEditingExpense(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormCategory(expenseCategories[0]?.name || 'Generator Fuel');
    setFormDescription('');
    setFormAmount('');
    setFormPaidBy('Cash');
    setFormVendor('');
    setFormBranch('Main Branch');
    setFormNotes('');
    setFormReceipt('');
    setIsRecordModalOpen(true);
  };

  // Open Form for Edit
  const handleOpenEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setFormDate(exp.date);
    setFormCategory(exp.category);
    setFormDescription(exp.description);
    setFormAmount(exp.amount);
    setFormPaidBy(exp.paidBy || 'Cash');
    setFormVendor(exp.vendor || '');
    setFormBranch(exp.branch || 'Main Branch');
    setFormNotes(exp.notes || '');
    setFormReceipt(exp.receiptUrl || '');
    setIsRecordModalOpen(true);
  };

  // Submit Expense Form
  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription || !formAmount || Number(formAmount) <= 0) return;

    const payload = {
      date: formDate,
      category: formCategory,
      description: formDescription,
      amount: Number(formAmount),
      paidBy: formPaidBy,
      paymentMethod: formPaidBy.toLowerCase().replace(/\s+/g, '_'),
      vendor: formVendor || undefined,
      branch: formBranch || 'Main Branch',
      notes: formNotes || undefined,
      receiptUrl: formReceipt || undefined,
      status: 'paid' as const,
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, payload);
    } else {
      addExpense(payload);
    }

    setIsRecordModalOpen(false);
  };

  // Add Category Handler
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addExpenseCategory(newCatName.trim(), newCatDesc.trim() || undefined);
    setNewCatName('');
    setNewCatDesc('');
    setIsCategoryModalOpen(false);
  };

  // Date Filtering logic
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const expDate = new Date(exp.date);

      // Search matching
      const matchSearch =
        !searchTerm ||
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.vendor && exp.vendor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category matching
      const matchCat = selectedCategory === 'All' || exp.category === selectedCategory;

      // Branch matching
      const matchBranch = selectedBranch === 'All' || (exp.branch || 'Main Branch') === selectedBranch;

      // Payment method matching
      const matchPayment = selectedPaymentMethod === 'All' || exp.paidBy === selectedPaymentMethod;

      // Date Range matching
      let matchDate = true;
      if (dateRange === 'today') {
        matchDate = exp.date === todayStr;
      } else if (dateRange === 'week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0,0,0,0);
        matchDate = expDate >= startOfWeek;
      } else if (dateRange === 'month') {
        matchDate = expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
      } else if (dateRange === 'quarter') {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const expQuarter = Math.floor(expDate.getMonth() / 3);
        matchDate = expQuarter === currentQuarter && expDate.getFullYear() === now.getFullYear();
      } else if (dateRange === 'year') {
        matchDate = expDate.getFullYear() === now.getFullYear();
      }

      return matchSearch && matchCat && matchBranch && matchPayment && matchDate;
    });
  }, [expenses, searchTerm, selectedCategory, selectedBranch, selectedPaymentMethod, dateRange, todayStr, now]);

  // Dashboard calculations
  const todayExpenseTotal = useMemo(() => {
    return expenses
      .filter((e) => e.date === todayStr)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, todayStr]);

  const weekExpenseTotal = useMemo(() => {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0,0,0,0);
    return expenses
      .filter((e) => new Date(e.date) >= startOfWeek)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, now]);

  const monthExpenseTotal = useMemo(() => {
    return expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, now]);

  const quarterExpenseTotal = useMemo(() => {
    const currentQuarter = Math.floor(now.getMonth() / 3);
    return expenses
      .filter((e) => {
        const d = new Date(e.date);
        return Math.floor(d.getMonth() / 3) === currentQuarter && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, now]);

  const yearExpenseTotal = useMemo(() => {
    return expenses
      .filter((e) => new Date(e.date).getFullYear() === now.getFullYear())
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, now]);

  // Outstanding payables (e.g. supplier balances)
  const outstandingBills = useMemo(() => {
    return suppliers.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0);
  }, [suppliers]);

  // Highest and Most Frequent Expense Category
  const categoryStats = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    expenses.forEach((e) => {
      if (!map[e.category]) map[e.category] = { total: 0, count: 0 };
      map[e.category].total += e.amount;
      map[e.category].count += 1;
    });

    const entries = Object.entries(map);
    if (entries.length === 0) {
      return { highestCat: 'N/A', highestVal: 0, frequentCat: 'N/A', frequentCount: 0 };
    }

    const sortedByVal = [...entries].sort((a, b) => b[1].total - a[1].total);
    const sortedByCount = [...entries].sort((a, b) => b[1].count - a[1].count);

    return {
      highestCat: sortedByVal[0][0],
      highestVal: sortedByVal[0][1].total,
      frequentCat: sortedByCount[0][0],
      frequentCount: sortedByCount[0][1].count,
    };
  }, [expenses]);

  // Average Daily Expense calculation
  const avgDailyExpense = useMemo(() => {
    if (expenses.length === 0) return 0;
    const uniqueDates = new Set(expenses.map((e) => e.date)).size;
    const totalAll = expenses.reduce((sum, e) => sum + e.amount, 0);
    return uniqueDates > 0 ? totalAll / uniqueDates : 0;
  }, [expenses]);

  // Chart Data: Category Breakdown
  const categoryChartData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredExpenses]);

  // Chart Data: Payment Method Breakdown
  const paymentMethodChartData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      const pm = e.paidBy || 'Cash';
      map[pm] = (map[pm] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredExpenses]);

  // Chart Data: Expense Trends (Last 7 Days)
  const trendChartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return days.map((dateStr) => {
      const dayExp = expenses.filter((e) => e.date === dateStr);
      const daySales = sales.filter((s) => s.date === dateStr);
      const expTotal = dayExp.reduce((sum, e) => sum + e.amount, 0);
      const salesTotal = daySales.reduce((sum, s) => sum + s.totalAmount, 0);

      const formatted = new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'numeric',
        day: 'numeric',
      });

      return {
        date: formatted,
        Expenses: expTotal,
        Sales: salesTotal,
      };
    });
  }, [expenses, sales]);

  // Cash Flow Calculations
  const cashFlowStats = useMemo(() => {
    // Cash In: Sales + Debt Payments received
    const salesIn = sales.reduce((sum, s) => sum + (s.amountPaid || 0), 0);
    
    // Cash Out: Expenses + Purchases Paid
    const expOut = expenses.reduce((sum, e) => sum + e.amount, 0);
    const purchaseOut = purchases.reduce((sum, p) => sum + (p.amountPaid || 0), 0);

    const totalCashIn = salesIn;
    const totalCashOut = expOut + purchaseOut;
    const netCashFlow = totalCashIn - totalCashOut;
    const openingBalance = 50000; // Standard store opening cash reserve
    const closingBalance = openingBalance + netCashFlow;

    return {
      openingBalance,
      salesIn,
      totalCashIn,
      expOut,
      purchaseOut,
      totalCashOut,
      netCashFlow,
      closingBalance,
    };
  }, [sales, expenses, purchases]);

  // Export handlers
  const handleExportCSV = () => {
    const exportData = filteredExpenses.map((e) => ({
      ID: e.id,
      Date: e.date,
      Category: e.category,
      Description: e.description,
      Amount: e.amount,
      PaymentMethod: e.paidBy,
      Vendor: e.vendor || 'N/A',
      Branch: e.branch || 'Main Branch',
      Notes: e.notes || '',
    }));
    exportToCSV(exportData, `GlowERP_Expenses_${dateRange}`);
  };

  const handleExportExcel = () => {
    const exportData = filteredExpenses.map((e) => ({
      'Expense ID': e.id,
      'Date': e.date,
      'Category': e.category,
      'Description': e.description,
      'Amount (₦)': e.amount,
      'Payment Method': e.paidBy,
      'Vendor/Payee': e.vendor || 'N/A',
      'Branch': e.branch || 'Main Branch',
      'Notes': e.notes || '',
    }));
    exportToExcel(exportData, `GlowERP_Expenses_${dateRange}`);
  };

  const handleExportPDF = () => {
    const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const summaryRows = [
      { label: 'Filter Period', value: dateRange.toUpperCase() },
      { label: 'Selected Category', value: selectedCategory },
      { label: 'Selected Branch', value: selectedBranch },
      { label: 'Total Expense Items', value: `${filteredExpenses.length} Records` },
      { label: 'Total Expenses Cost', value: formatCurrency(totalAmount, symbol) },
    ];

    const tableHeaders = ['Date', 'Category', 'Description', 'Vendor', 'Method', 'Amount'];
    const tableData = filteredExpenses.map((e) => [
      e.date,
      e.category,
      e.description,
      e.vendor || 'N/A',
      e.paidBy,
      formatCurrency(e.amount, symbol),
    ]);

    generatePDFReport(`Expense & Outflow Audit Statement`, summaryRows, tableHeaders, tableData, settings);
  };

  const CHART_COLORS = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-rose-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-rose-500" />
            Expense Management & Outflow Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log and audit all operational expenses, overheads, rent, fuel, salaries, vendor payments, and cash flows.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-2xl hover:bg-slate-200 transition flex items-center gap-1.5"
          >
            <FolderPlus className="w-4 h-4 text-rose-500" />
            <span className="hidden sm:inline">Add Custom Category</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-rose-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-600 transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Record New Expense
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100 dark:border-slate-800">
        {[
          { id: 'dashboard', label: 'Expense Dashboard', icon: BarChart3 },
          { id: 'list', label: 'All Recorded Expenses', icon: FileText },
          { id: 'categories', label: 'Expense Categories', icon: Tag },
          { id: 'analytics', label: 'Expense Analytics & Charts', icon: PieChartIcon },
          { id: 'reports', label: 'Reports & Exports', icon: Download },
          { id: 'cashflow', label: 'Cash Flow Statement', icon: Wallet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-none'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXPENSE DASHBOARD */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPI Snapshot Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Today */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Today's Expenses</span>
              <div className="text-xl font-black text-rose-600 dark:text-rose-400">
                {formatCurrency(todayExpenseTotal, symbol)}
              </div>
              <span className="text-[10px] text-slate-400 font-medium mt-1.5 block">
                Logged today
              </span>
            </div>

            {/* This Week */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">This Week's Expenses</span>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {formatCurrency(weekExpenseTotal, symbol)}
              </div>
              <span className="text-[10px] text-slate-400 font-medium mt-1.5 block">
                Current week total
              </span>
            </div>

            {/* This Month */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">This Month's Expenses</span>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {formatCurrency(monthExpenseTotal, symbol)}
              </div>
              <span className="text-[10px] text-slate-400 font-medium mt-1.5 block">
                Current month total
              </span>
            </div>

            {/* This Quarter */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">This Quarter</span>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {formatCurrency(quarterExpenseTotal, symbol)}
              </div>
              <span className="text-[10px] text-slate-400 font-medium mt-1.5 block">
                Q{Math.floor(now.getMonth() / 3) + 1} Expenses
              </span>
            </div>

            {/* This Year */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">This Year</span>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {formatCurrency(yearExpenseTotal, symbol)}
              </div>
              <span className="text-[10px] text-slate-400 font-medium mt-1.5 block">
                Annual aggregate
              </span>
            </div>
          </div>

          {/* SECONDARY HIGHLIGHT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Highest Category */}
            <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white p-5 rounded-[28px] shadow-md shadow-rose-200 dark:shadow-none flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-100 block">Highest Expense Category</span>
                <h4 className="text-lg font-black mt-1 truncate max-w-[180px]">{categoryStats.highestCat}</h4>
                <p className="text-xs text-rose-100 mt-1 font-semibold">{formatCurrency(categoryStats.highestVal, symbol)} total</p>
              </div>
              <TrendingUp className="w-8 h-8 text-rose-200 shrink-0" />
            </div>

            {/* Most Frequent Category */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">Most Frequent Category</span>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1 truncate max-w-[180px]">{categoryStats.frequentCat}</h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">{categoryStats.frequentCount} transaction logs</p>
              </div>
              <Tag className="w-8 h-8 text-rose-500 shrink-0" />
            </div>

            {/* Average Daily Expense */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">Average Daily Expense</span>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1">{formatCurrency(avgDailyExpense, symbol)}</h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">Per active operational day</p>
              </div>
              <DollarSign className="w-8 h-8 text-teal-500 shrink-0" />
            </div>

            {/* Outstanding Payables */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">Outstanding Payables</span>
                <h4 className="text-lg font-black text-amber-600 dark:text-amber-400 mt-1">{formatCurrency(outstandingBills, symbol)}</h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">Supplier balances owed</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500 shrink-0" />
            </div>
          </div>

          {/* DASHBOARD CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales vs Expense 7-Day Trend */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700/60 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-rose-900 dark:text-white text-base">7-Day Outflow vs Sales Trend</h3>
                  <p className="text-xs text-slate-400">Comparing store sales receipts against operating expenses</p>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="saleGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip formatter={(val: any) => [`${symbol}${Number(val).toLocaleString()}`, '']} />
                    <Area type="monotone" dataKey="Sales" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#saleGrad)" />
                    <Area type="monotone" dataKey="Expenses" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#expGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Share Breakdown */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700/60 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-rose-900 dark:text-white text-base mb-0.5">Top Expense Categories</h3>
                <p className="text-xs text-slate-400 mb-4">Proportional cost breakdown</p>
              </div>

              <div className="h-52 w-full">
                {categoryChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {categoryChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => [`${symbol}${Number(val).toLocaleString()}`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-slate-400 text-xs py-10">No expenses logged yet</div>
                )}
              </div>

              <div className="space-y-1.5 mt-2">
                {categoryChartData.slice(0, 3).map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[120px]">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(item.value, symbol)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL RECORDED EXPENSES TABLE & FILTERS */}
      {activeSubTab === 'list' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search description, vendor, notes..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-white outline-none focus:border-rose-500"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto scrollbar-none">
              {/* Date Filter */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none max-w-[140px] truncate"
              >
                <option value="All">All Categories</option>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>

              {/* Payment Method Filter */}
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="All">All Payment Methods</option>
                <option value="Cash">Cash</option>
                <option value="Transfer">Bank Transfer</option>
                <option value="POS">POS Account</option>
                <option value="Mobile Money">Mobile Money</option>
              </select>

              {/* Reset */}
              {(searchTerm || selectedCategory !== 'All' || selectedPaymentMethod !== 'All' || dateRange !== 'month') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setSelectedPaymentMethod('All');
                    setDateRange('month');
                  }}
                  className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl text-xs font-bold shrink-0 hover:bg-rose-100"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4 sm:p-5">Date</th>
                    <th className="p-4 sm:p-5">Category</th>
                    <th className="p-4 sm:p-5">Description & Vendor</th>
                    <th className="p-4 sm:p-5">Method</th>
                    <th className="p-4 sm:p-5 text-right">Amount</th>
                    <th className="p-4 sm:p-5 text-center">Receipt</th>
                    <th className="p-4 sm:p-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                        No expense records matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((e) => (
                      <tr key={e.id} className="hover:bg-rose-50/30 dark:hover:bg-slate-700/30 transition">
                        <td className="p-4 sm:p-5 text-slate-500 font-medium whitespace-nowrap">{e.date}</td>
                        <td className="p-4 sm:p-5 font-extrabold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                          {e.category}
                        </td>
                        <td className="p-4 sm:p-5 text-slate-800 dark:text-slate-100">
                          <span className="font-bold block text-sm">{e.description}</span>
                          {e.vendor && <span className="text-[11px] text-slate-400 font-medium">Payee: {e.vendor}</span>}
                          {e.notes && <span className="text-[11px] text-slate-400 italic block">Note: {e.notes}</span>}
                        </td>
                        <td className="p-4 sm:p-5 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[10px] uppercase">
                            {e.paidBy}
                          </span>
                        </td>
                        <td className="p-4 sm:p-5 text-right font-black text-rose-600 dark:text-rose-400 text-sm whitespace-nowrap">
                          {formatCurrency(e.amount, symbol)}
                        </td>
                        <td className="p-4 sm:p-5 text-center whitespace-nowrap">
                          {e.receiptUrl ? (
                            <button
                              onClick={() => setSelectedReceiptUrl(e.receiptUrl!)}
                              className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 rounded-xl font-bold text-[10px] hover:bg-teal-100 transition inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> View
                            </button>
                          ) : (
                            <span className="text-slate-300 text-[10px] italic">None</span>
                          )}
                        </td>
                        <td className="p-4 sm:p-5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditModal(e)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition"
                              title="Edit Expense"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteExpense(e.id)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM EXPENSE CATEGORIES */}
      {activeSubTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700/60 shadow-xs">
            <div>
              <h3 className="font-extrabold text-rose-900 dark:text-white text-base">Master Expense Categories</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Create and manage custom expense heads for precise overhead tracking.
              </p>
            </div>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-4 py-2.5 bg-rose-500 text-white rounded-2xl text-xs font-bold shadow-md hover:bg-rose-600 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add Category
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseCategories.map((cat) => {
              const catCount = expenses.filter((e) => e.category === cat.name).length;
              const catTotal = expenses.filter((e) => e.category === cat.name).reduce((sum, e) => sum + e.amount, 0);

              return (
                <div
                  key={cat.id}
                  className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 dark:text-white text-sm">{cat.name}</span>
                      {cat.isCustom && (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-extrabold uppercase rounded-full">
                          Custom
                        </span>
                      )}
                    </div>
                    {cat.description && <p className="text-xs text-slate-400">{cat.description}</p>}
                    <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(catTotal, symbol)} ({catCount} logs)
                    </div>
                  </div>

                  {cat.isCustom && (
                    <button
                      onClick={() => deleteExpenseCategory(cat.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: ANALYTICS & CHARTS */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown Bar Chart */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700/60 shadow-xs">
              <h3 className="font-extrabold text-rose-900 dark:text-white text-base mb-1">Expense Breakdown by Category</h3>
              <p className="text-xs text-slate-400 mb-6">Total spend allocated to each operating category</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={0} angle={-25} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip formatter={(val: any) => [`${symbol}${Number(val).toLocaleString()}`, 'Total Spend']} />
                    <Bar dataKey="value" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment Method Distribution */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700/60 shadow-xs">
              <h3 className="font-extrabold text-rose-900 dark:text-white text-base mb-1">Expenses by Payment Channel</h3>
              <p className="text-xs text-slate-400 mb-6">How expenses were settled (Cash vs Transfer vs POS)</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentMethodChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => [`${symbol}${Number(val).toLocaleString()}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS & EXPORTS */}
      {activeSubTab === 'reports' && (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-slate-100 dark:border-slate-700/60 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div>
              <h3 className="font-extrabold text-rose-900 dark:text-white text-lg">Expense Statements & Audits</h3>
              <p className="text-xs text-slate-400 mt-0.5">Export detailed financial logs to PDF, Excel, or CSV formats.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-2xl hover:bg-slate-200 transition flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-slate-500" /> Export CSV
              </button>
              <button
                onClick={handleExportExcel}
                className="px-4 py-2.5 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold text-xs rounded-2xl hover:bg-teal-100 transition flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4 text-teal-600" /> Export Excel
              </button>
              <button
                onClick={handleExportPDF}
                className="px-5 py-2.5 bg-rose-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-600 transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download PDF Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 font-bold block mb-1">Total Audit Records</span>
              <span className="text-xl font-black text-slate-900 dark:text-white">{filteredExpenses.length} Items</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 font-bold block mb-1">Total Spend Value</span>
              <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                {formatCurrency(filteredExpenses.reduce((sum, e) => sum + e.amount, 0), symbol)}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 font-bold block mb-1">Current Filter Period</span>
              <span className="text-xl font-black text-slate-900 dark:text-white uppercase">{dateRange}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CASH FLOW STATEMENT */}
      {activeSubTab === 'cashflow' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 text-white p-6 sm:p-8 rounded-[32px] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase text-rose-200">
                  Comprehensive Cash Flow Tracker
                </span>
                <h3 className="text-2xl font-black mt-2">Store Cash In vs Cash Out</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-lg">
                  Real-time reconciliation of money received from sales versus payments out for expenses and inventory.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block font-bold uppercase">Estimated Closing Balance</span>
                <span className="text-2xl sm:text-3xl font-black text-teal-400 mt-1 block">
                  {formatCurrency(cashFlowStats.closingBalance, symbol)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CASH IN */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700/60 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
                  <ArrowUpRight className="w-5 h-5" />
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Cash Inflow</h4>
                </div>
                <span className="text-base font-black text-teal-600 dark:text-teal-400">
                  +{formatCurrency(cashFlowStats.totalCashIn, symbol)}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Sales Collections</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(cashFlowStats.salesIn, symbol)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Opening Store Reserves</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(cashFlowStats.openingBalance, symbol)}</span>
                </div>
              </div>
            </div>

            {/* CASH OUT */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700/60 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <ArrowDownRight className="w-5 h-5" />
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Cash Outflow</h4>
                </div>
                <span className="text-base font-black text-rose-600 dark:text-rose-400">
                  -{formatCurrency(cashFlowStats.totalCashOut, symbol)}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Operating Expenses</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(cashFlowStats.expOut, symbol)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Supplier Inventory Purchases</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(cashFlowStats.purchaseOut, symbol)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECORD / EDIT EXPENSE MODAL */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[32px] p-6 sm:p-8 shadow-2xl border border-rose-100 dark:border-slate-800 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                {editingExpense ? 'Edit Expense Record' : 'Log New Store Expense'}
              </h3>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Expense Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-white focus:border-rose-500 outline-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Expense Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-white focus:border-rose-500 outline-none"
                  >
                    {expenseCategories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Expense Description *</label>
                <input
                  type="text"
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Generator diesel or dispatch delivery fee"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-white focus:border-rose-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Amount ({symbol}) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="2500"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-extrabold text-rose-600 focus:border-rose-500 outline-none"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={formPaidBy}
                    onChange={(e) => setFormPaidBy(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-white focus:border-rose-500 outline-none"
                  >
                    <option value="Cash">Cash Register</option>
                    <option value="Transfer">Bank Transfer</option>
                    <option value="POS">POS Account</option>
                    <option value="Mobile Money">Mobile Money</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Vendor / Payee */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Vendor / Payee (Optional)</label>
                  <input
                    type="text"
                    value={formVendor}
                    onChange={(e) => setFormVendor(e.target.value)}
                    placeholder="e.g. TotalEnergies or Landlord"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-white focus:border-rose-500 outline-none"
                  />
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Branch</label>
                  <input
                    type="text"
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    placeholder="Main Branch"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-white focus:border-rose-500 outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Notes (Optional)</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="Additional remarks or transaction reference..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-white focus:border-rose-500 outline-none"
                />
              </div>

              {/* Attach Receipt */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Attach Receipt / Photo (Optional)</label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-200 transition flex items-center gap-2">
                    <Upload className="w-4 h-4 text-rose-500" /> Upload File
                    <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
                  </label>
                  {formReceipt && (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
                      <img src={formReceipt} alt="Receipt preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormReceipt('')}
                        className="absolute top-0 right-0 bg-black/70 text-white text-[10px] p-0.5"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-200 dark:shadow-none hover:opacity-95 transition"
                >
                  {editingExpense ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CUSTOM CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] p-6 shadow-2xl border border-rose-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Add Custom Expense Category</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Security & Vigilante"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Brief explanation..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-white outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md hover:bg-rose-600"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT LIGHTBOX MODAL */}
      {selectedReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-3xl p-4 overflow-hidden border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Attached Expense Receipt</span>
              <button
                onClick={() => setSelectedReceiptUrl(null)}
                className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-black/40 rounded-2xl p-2">
              <img src={selectedReceiptUrl} alt="Receipt" className="max-w-full max-h-[60vh] object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
