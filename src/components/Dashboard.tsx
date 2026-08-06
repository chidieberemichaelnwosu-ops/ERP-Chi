import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../services/export';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  ShoppingBag,
  Award,
  Package,
  Wallet,
  AlertTriangle,
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Plus,
  RefreshCw,
  Sparkles,
  BarChart3,
  ReceiptText,
  Clock,
  CheckCircle2,
  Tag,
  Users
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
  CartesianGrid
} from 'recharts';

export const Dashboard: React.FC = () => {
  const {
    sales,
    expenses,
    products,
    customers,
    inventoryLogs,
    settings,
    setActiveTab,
    triggerSync,
    isSyncing,
    userRole,
    userName,
  } = useApp();

  const symbol = settings.currencySymbol || '₦';
  const todayStr = new Date().toISOString().split('T')[0];

  // Filter Today's data
  const todaySales = sales.filter((s) => s.date === todayStr);
  const todayExpenses = expenses.filter((e) => e.date === todayStr);

  // Calculations
  const todayRevenue = todaySales.reduce((acc, s) => acc + s.totalAmount, 0);
  const todayGrossProfit = todaySales.reduce((acc, s) => acc + s.grossProfit, 0);
  const todayExpenseTotal = todayExpenses.reduce((acc, e) => acc + e.amount, 0);
  const todayNetProfit = todayGrossProfit - todayExpenseTotal;
  const todayTransactionsCount = todaySales.length;

  const todayCashReceived = todaySales.reduce((acc, s) => acc + (s.amountPaid || 0), 0);
  const totalOutstandingDebts = customers.reduce((acc, c) => acc + c.outstandingDebt, 0);

  // Total products sold today
  const todayTotalUnitsSold = todaySales.reduce((acc, s) => {
    return acc + s.items.reduce((itemAcc, item) => itemAcc + item.quantity, 0);
  }, 0);

  // Low stock calculation
  const lowStockProducts = products.filter((p) => p.currentStock <= p.reorderLevel);
  const lowStockCount = lowStockProducts.length;

  // Last Sale Time formatted
  const sortedSalesDesc = [...sales].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const lastSale = sortedSalesDesc[0];
  const lastSaleTimeFormatted = lastSale
    ? new Date(lastSale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'No sales today';

  // ------------------------------------------------------------------
  // UNIVERSAL WELCOME CARD COMPONENT (REDESIGNED DYNAMIC HEADER)
  // ------------------------------------------------------------------
  const UniversalWelcomeCard = () => {
    const formattedDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Extract ONLY first name (cleaning any role annotations)
    const rawName = (userName || 'Chidi').replace(/\s*\(.*?\)\s*/g, '').trim();
    const firstName = rawName.split(' ')[0] || 'Chidi';

    // Role configuration & badge styling
    const getRoleBadge = () => {
      switch (userRole) {
        case 'super_admin':
          return {
            title: 'Super Administrator',
            badgeClass: 'bg-purple-500/30 text-purple-100 border-purple-400/40',
            dot: '🟣',
          };
        case 'administrator':
          return {
            title: 'Administrator',
            badgeClass: 'bg-blue-500/30 text-blue-100 border-blue-400/40',
            dot: '🔵',
          };
        case 'manager':
          return {
            title: 'Manager',
            badgeClass: 'bg-emerald-500/30 text-emerald-100 border-emerald-400/40',
            dot: '🟢',
          };
        case 'salesperson':
        default:
          return {
            title: 'Sales Person',
            badgeClass: 'bg-amber-500/30 text-amber-100 border-amber-400/40',
            dot: '🟠',
          };
      }
    };

    const roleBadge = getRoleBadge();
    const isBusinessConfigured = Boolean(
      settings.businessName &&
      settings.businessName.trim() !== '' &&
      settings.businessName !== 'Not Configured'
    );
    const canEditBusiness = userRole === 'super_admin' || userRole === 'administrator';

    return (
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 rounded-[32px] p-6 sm:p-8 text-white shadow-2xl border border-rose-700/40 relative overflow-hidden space-y-5">
        {/* Background Decorative Blur */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

        {/* Top Header Row: Title & Date */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/15 text-[11px] font-black tracking-wider uppercase text-rose-100 border border-white/10 backdrop-blur-md">
              RETAIL POS STORE
            </span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-rose-100/90 tracking-wide">
            {formattedDate}
          </span>
        </div>

        {/* Greeting Section */}
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Welcome back, <span className="text-rose-200">{firstName}</span>! 👋
          </h1>

          {/* Business & Role Context Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl pt-1">
            {/* Business Field */}
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <span className="text-[11px] font-bold text-rose-200 uppercase tracking-wider block">
                Business
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white">
                  {isBusinessConfigured ? settings.businessName : 'Not Configured'}
                </span>
                {!isBusinessConfigured && canEditBusiness && (
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] shadow-sm transition active:scale-95"
                  >
                    Complete Business Profile
                  </button>
                )}
              </div>
            </div>

            {/* Role Field */}
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <span className="text-[11px] font-bold text-rose-200 uppercase tracking-wider block">
                Role
              </span>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-bold border flex items-center gap-1.5 ${roleBadge.badgeClass}`}>
                  <span>{roleBadge.dot}</span>
                  <span>{roleBadge.title}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Tagline & Sync Button Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <p className="text-xs sm:text-sm text-rose-100/90 font-medium max-w-xl leading-relaxed italic">
              "Real-time sales, expenses, inventory tracking and business monitoring."
            </p>

            <button
              onClick={triggerSync}
              disabled={isSyncing}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white text-slate-950 hover:bg-rose-50 font-black text-xs sm:text-sm shadow-lg active:scale-95 transition flex items-center justify-center gap-2.5 shrink-0 border border-white/30 disabled:opacity-60 disabled:cursor-not-allowed"
              title="Sync Offline Data"
            >
              <RefreshCw className={`w-4 h-4 text-rose-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ------------------------------------------------------------------
  // QUICK ACTIONS COMPONENT (Balanced operational shortcuts without duplicate POS)
  // ------------------------------------------------------------------
  const QuickActionsGrid = () => {
    const isAdminOrManager = userRole === 'manager' || userRole === 'administrator' || userRole === 'super_admin';

    return (
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400">
          Quick Action Controls
        </h3>
        <div className={`grid grid-cols-1 ${isAdminOrManager ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'} gap-3 sm:gap-4`}>
          {/* 1. New Expense (Manager, Administrator & Super Admin) */}
          {isAdminOrManager && (
            <button
              onClick={() => setActiveTab('expenses')}
              className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-left hover:border-rose-500 active:scale-95 transition flex items-center gap-3 shadow-2xs hover:shadow-sm"
            >
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-xs block text-slate-900 dark:text-white truncate">New Expense</span>
                <span className="text-[10px] text-slate-400 truncate block">Log store overheads</span>
              </div>
            </button>
          )}

          {/* 2. Stock Control / Inventory */}
          <button
            onClick={() => setActiveTab('inventory')}
            className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-left hover:border-rose-500 active:scale-95 transition flex items-center gap-3 shadow-2xs hover:shadow-sm"
          >
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-xs block text-slate-900 dark:text-white truncate">Stock Control</span>
              <span className="text-[10px] text-slate-400 truncate block">Manage products & restocks</span>
            </div>
          </button>

          {/* 3. Customer Directory */}
          <button
            onClick={() => setActiveTab('customers')}
            className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-left hover:border-rose-500 active:scale-95 transition flex items-center gap-3 shadow-2xs hover:shadow-sm"
          >
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-xs block text-slate-900 dark:text-white truncate">Customers & Debts</span>
              <span className="text-[10px] text-slate-400 truncate block">View balances & history</span>
            </div>
          </button>

          {/* 4. View Transactions History */}
          <button
            onClick={() => setActiveTab('transactions')}
            className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-left hover:border-rose-500 active:scale-95 transition flex items-center gap-3 shadow-2xs hover:shadow-sm"
          >
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 shrink-0">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-xs block text-slate-900 dark:text-white truncate">All Transactions</span>
              <span className="text-[10px] text-slate-400 truncate block">Sales & expenses audit</span>
            </div>
          </button>
        </div>
      </div>
    );
  };

  // ------------------------------------------------------------------
  // RECENT ACTIVITY LIST (TOP 5 EVENTS ONLY)
  // ------------------------------------------------------------------
  const RecentActivitySection = () => {
    const activityItems = useMemo(() => {
      const items: Array<{
        id: string;
        timestamp: Date;
        type: 'sale' | 'expense' | 'inventory';
        title: string;
        subtitle: string;
        amount?: number;
        isPositive?: boolean;
      }> = [];

      sales.forEach((s) => {
        items.push({
          id: `sale-${s.id}`,
          timestamp: new Date(s.timestamp),
          type: 'sale',
          title: 'Sale recorded',
          subtitle: `${s.invoiceNumber} • ${s.items.length} item(s)`,
          amount: s.totalAmount,
          isPositive: true,
        });
      });

      expenses.forEach((e) => {
        items.push({
          id: `exp-${e.id}`,
          timestamp: new Date(e.timestamp),
          type: 'expense',
          title: 'Expense added',
          subtitle: `${e.category}: ${e.description}`,
          amount: e.amount,
          isPositive: false,
        });
      });

      (inventoryLogs || []).forEach((l) => {
        items.push({
          id: `inv-${l.id}`,
          timestamp: new Date(l.timestamp),
          type: 'inventory',
          title: 'Stock updated',
          subtitle: `${l.productName} (${l.type.replace('_', ' ')})`,
        });
      });

      return items
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5);
    }, [sales, expenses, inventoryLogs]);

    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700/60 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 gap-2">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-500" /> Recent Activity (5 Latest Events)
            </h3>
            <p className="text-xs text-slate-400">Live operational events across sales, expenses and inventory</p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="px-4 py-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-2xl font-extrabold text-xs transition flex items-center gap-1.5"
          >
            View All Transactions <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {activityItems.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No recent activity recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {activityItems.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                      act.type === 'sale'
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-600'
                        : act.type === 'expense'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600'
                    }`}
                  >
                    {act.type === 'sale' ? '🛒' : act.type === 'expense' ? '💸' : '📦'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 dark:text-white">{act.title}</span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {act.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block">{act.subtitle}</span>
                  </div>
                </div>

                {act.amount !== undefined && (
                  <div className="text-right shrink-0">
                    <span
                      className={`font-black text-sm block ${
                        act.isPositive ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {act.isPositive ? '+' : '-'}{formatCurrency(act.amount, symbol)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ------------------------------------------------------------------
  // 1. SALES PERSON DASHBOARD (MAXIMUM 4 ROLE CARDS)
  // ------------------------------------------------------------------
  if (userRole === 'salesperson') {
    return (
      <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 pb-28">
        {/* Universal Welcome Card */}
        <UniversalWelcomeCard />

        {/* MAXIMUM OF 4 ROLE CARDS FOR SALES PERSON */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Card 1: Today's Sales Amount */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Today's Sales</span>
              <div className="p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {formatCurrency(todayRevenue, symbol)}
            </div>
            <span className="text-[10px] text-teal-600 font-bold mt-1 block">Total cash & payments</span>
          </div>

          {/* Card 2: Number of Sales Completed */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Sales Completed</span>
              <div className="p-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {todayTransactionsCount}
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">Sales made today</span>
          </div>

          {/* Card 3: Recent Transactions Count */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Transactions Count</span>
              <div className="p-2 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
                <ReceiptText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {todaySales.length} Invoices
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">Logged in today's ledger</span>
          </div>

          {/* Card 4: Last Sale Time */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Last Sale Time</span>
              <div className="p-2 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {lastSaleTimeFormatted}
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">Most recent order</span>
          </div>
        </div>

        {/* Quick Action Controls */}
        <QuickActionsGrid />

        {/* 5 Recent Activities Feed */}
        <RecentActivitySection />
      </div>
    );
  }

  // ------------------------------------------------------------------
  // 2. MANAGER DASHBOARD (MAXIMUM 4 ROLE CARDS)
  // ------------------------------------------------------------------
  if (userRole === 'manager') {
    return (
      <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 pb-28">
        {/* Universal Welcome Card */}
        <UniversalWelcomeCard />

        {/* MAXIMUM OF 4 ROLE CARDS FOR MANAGER */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Today's Sales */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Today's Sales</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {formatCurrency(todayRevenue, symbol)}
            </div>
            <span className="text-[10px] text-teal-600 font-bold mt-1.5 block">{todaySales.length} Invoices</span>
          </div>

          {/* Card 2: Today's Expenses */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Today's Expenses</span>
            <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(todayExpenseTotal, symbol)}
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1.5 block">{todayExpenses.length} Logs</span>
          </div>

          {/* Card 3: Number of Sales Today */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Number of Sales</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {todayTransactionsCount}
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1.5 block">Total orders today</span>
          </div>

          {/* Card 4: Low Stock Alerts */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Low Stock Alerts</span>
            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
              {lowStockCount} Products
            </div>
            <span className="text-[10px] text-amber-600 font-bold mt-1.5 block">Requires reordering</span>
          </div>
        </div>

        {/* Quick Action Controls */}
        <QuickActionsGrid />

        {/* Low Stock Warning Box */}
        {lowStockCount > 0 && (
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-amber-200 dark:border-amber-900/50 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-amber-900 dark:text-amber-200 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Alerts ({lowStockCount})
              </h3>
              <button
                onClick={() => setActiveTab('inventory')}
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                Manage Inventory
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
              {lowStockProducts.slice(0, 3).map((p) => (
                <div key={p.id} className="py-2 flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{p.name}</span>
                  <span className="font-black text-amber-600">{p.currentStock} left</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5 Recent Activities Feed */}
        <RecentActivitySection />
      </div>
    );
  }

  // ------------------------------------------------------------------
  // 3. ADMINISTRATOR / SUPER ADMINISTRATOR DASHBOARD (MAXIMUM 4 ROLE CARDS)
  // ------------------------------------------------------------------

  // Best Selling Product calculation
  const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  sales.forEach((s) => {
    s.items.forEach((item) => {
      if (!productSalesMap[item.productName]) {
        productSalesMap[item.productName] = { name: item.productName, qty: 0, revenue: 0 };
      }
      productSalesMap[item.productName].qty += item.quantity;
      productSalesMap[item.productName].revenue += item.subtotal;
    });
  });

  const sortedTopProducts = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty);

  // Chart Data Preparation: Last 7 Days Trend
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const dailyTrendData = last7Days.map((dayDate) => {
    const daySales = sales.filter((s) => s.date === dayDate);
    const dayExp = expenses.filter((e) => e.date === dayDate);
    const rev = daySales.reduce((acc, s) => acc + s.totalAmount, 0);
    const gp = daySales.reduce((acc, s) => acc + s.grossProfit, 0);
    const ex = dayExp.reduce((acc, e) => acc + e.amount, 0);
    const np = gp - ex;

    const dateFormatted = new Date(dayDate).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'numeric',
      day: 'numeric',
    });

    return {
      date: dateFormatted,
      Sales: rev,
      Profit: Math.max(0, np),
      Expenses: ex,
    };
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 pb-28">
      {/* Universal Welcome Card */}
      <UniversalWelcomeCard />

      {/* EXACTLY 4 PRIMARY ROLE DASHBOARD CARDS FOR ADMIN / SUPER ADMIN */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            Today's Executive KPI Overview
          </h3>
          <span className="text-xs font-medium text-slate-400">Live Calculated</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {/* Card 1: Today's Sales */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Sales</span>
              <div className="p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(todayRevenue, symbol)}
            </div>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold flex items-center mt-2">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> {todaySales.length} Transactions
            </span>
          </div>

          {/* Card 2: Today's Expenses */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Expenses</span>
              <div className="p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              {formatCurrency(todayExpenseTotal, symbol)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-2 block">
              {todayExpenses.length} Expense Logs
            </span>
          </div>

          {/* Card 3: Today's Net Profit */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Net Profit</span>
              <div className="p-2 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-xl sm:text-2xl font-black tracking-tight ${todayNetProfit >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600'}`}>
              {formatCurrency(todayNetProfit, symbol)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-2 block">
              Gross: {formatCurrency(todayGrossProfit, symbol)}
            </span>
          </div>

          {/* Card 4: Low Stock Alerts */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</span>
              <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {lowStockCount} Products
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-2 block">
              Needs reordering
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Controls */}
      <QuickActionsGrid />

      {/* CHARTS SECTION */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-slate-100 dark:border-slate-700/60 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">
              7-Day Revenue & Profit Trend
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Daily income vs operational net profit</p>
          </div>
          <button
            onClick={() => setActiveTab('reports')}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-full"
          >
            Analytics <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                formatter={(val: any) => [`${symbol}${Number(val).toLocaleString()}`, '']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
                }}
              />
              <Area type="monotone" dataKey="Sales" stroke="#f43f5e" strokeWidth={3.5} fillOpacity={1} fill="url(#salesGrad)" />
              <Area type="monotone" dataKey="Profit" stroke="#14b8a6" strokeWidth={2.5} fillOpacity={1} fill="url(#profitGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5 RECENT ACTIVITIES FEED */}
      <RecentActivitySection />
    </div>
  );
};
