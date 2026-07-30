import React, { useState } from 'react';
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
  Sparkles
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
    settings,
    setActiveTab,
    triggerSync,
    isSyncing
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
  const bestSellerName = sortedTopProducts[0]?.name || 'N/A';
  const bestSellerQty = sortedTopProducts[0]?.qty || 0;

  // Period Income & Expense Calculations
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0,0,0,0);

  const weeklyIncome = sales
    .filter((s) => new Date(s.date) >= startOfWeek)
    .reduce((acc, s) => acc + s.totalAmount, 0);

  const monthlyIncome = sales
    .filter((s) => {
      const d = new Date(s.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((acc, s) => acc + s.totalAmount, 0);

  const annualIncome = sales
    .filter((s) => new Date(s.date).getFullYear() === now.getFullYear())
    .reduce((acc, s) => acc + s.totalAmount, 0);

  const weeklyExpense = expenses
    .filter((e) => new Date(e.date) >= startOfWeek)
    .reduce((acc, e) => acc + e.amount, 0);

  const monthlyExpense = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((acc, e) => acc + e.amount, 0);

  const annualExpense = expenses
    .filter((e) => new Date(e.date).getFullYear() === now.getFullYear())
    .reduce((acc, e) => acc + e.amount, 0);

  // Top Expense Category calculation
  const expCatMap: Record<string, number> = {};
  expenses.forEach((e) => {
    expCatMap[e.category] = (expCatMap[e.category] || 0) + e.amount;
  });
  const topExpCat = Object.entries(expCatMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Inventory value
  const currentStockCostValue = products.reduce((acc, p) => acc + p.currentStock * p.costPrice, 0);
  const currentStockRetailValue = products.reduce((acc, p) => acc + p.currentStock * p.sellingPrice, 0);
  const lowStockCount = products.filter((p) => p.currentStock <= p.reorderLevel).length;

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

  // Top Products Chart Data
  const topProductsChartData = sortedTopProducts.slice(0, 5).map((p) => ({
    name: p.name.length > 18 ? p.name.substring(0, 16) + '...' : p.name,
    Units: p.qty,
    Revenue: p.revenue,
  }));

  // Category Distribution
  const categoryMap: Record<string, number> = {};
  sales.forEach((s) => {
    s.items.forEach((item) => {
      const cat = item.category || 'Makeup';
      categoryMap[cat] = (categoryMap[cat] || 0) + item.subtotal;
    });
  });

  const categoryChartData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#ec4899', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#6366f1'];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-28">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-slate-900 rounded-[32px] p-6 sm:p-8 text-white shadow-xl shadow-rose-200/50 dark:shadow-none relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-widest uppercase text-white">
                Live Enterprise Summary
              </span>
              <span className="text-xs text-rose-100 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, Store Owner!
            </h2>
            <p className="text-rose-100 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
              Real-time daily sales, fast product entry, stock valuation, and customer account ledgers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('sales')}
              className="px-5 py-3 rounded-2xl bg-white text-rose-600 font-bold text-sm shadow-lg shadow-rose-900/10 hover:bg-rose-50 transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              New Sale POS
            </button>
            <button
              onClick={triggerSync}
              disabled={isSyncing}
              className="p-3 rounded-2xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition active:scale-95 border border-white/20"
              title="Refresh Metrics"
            >
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Decorative ambient blurred shapes */}
        <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      </div>

      {/* 10 CORE METRIC CARDS GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            Today's KPI Snapshot
          </h3>
          <span className="text-xs font-medium text-slate-400">Auto-calculated</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
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

          {/* Card 2: Today's Profit */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Profit</span>
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

          {/* Card 3: Today's Expenses */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expenses</span>
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

          {/* Card 4: Number of Transactions */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Orders</span>
              <div className="p-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {todayTransactionsCount}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-2 block">
              Invoices generated
            </span>
          </div>

          {/* Card 5: Best Selling Product */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-all col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Best Seller</span>
              <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate" title={bestSellerName}>
              {bestSellerName}
            </div>
            <span className="text-[11px] text-amber-600 font-bold mt-2 block">
              {bestSellerQty} units sold
            </span>
          </div>

          {/* Card 6: Total Products Sold */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Units Sold</span>
              <div className="p-2 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {todayTotalUnitsSold}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-2 block">
              Items handed out
            </span>
          </div>

          {/* Card 7: Cash Received */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cash Collected</span>
              <div className="p-2 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(todayCashReceived, symbol)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-2 block">
              Direct cash in hand
            </span>
          </div>

          {/* Card 8: Outstanding Debts */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Debts</span>
              <div className="p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              {formatCurrency(totalOutstandingDebts, symbol)}
            </div>
            <span className="text-[11px] text-rose-500 font-bold mt-2 block">
              Uncollected balance
            </span>
          </div>

          {/* Card 9: Low Stock Alert */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Alert</span>
              <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {lowStockCount}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-2 block">
              Products to reorder
            </span>
          </div>

          {/* Card 10: Current Stock Value */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Retail</span>
              <div className="p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(currentStockRetailValue, symbol)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-2 block">
              Cost: {formatCurrency(currentStockCostValue, symbol)}
            </span>
          </div>
        </div>
      </div>

      {/* INCOME vs EXPENSE EQUAL FINANCIAL SUMMARY PANEL */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-slate-100 dark:border-slate-700/60 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-4">
          <div>
            <h3 className="text-lg font-black text-rose-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              Balanced Financial Summary (Income vs Outflow)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Treating Income and Expenses as equal financial records across all operational periods.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-rose-50 text-rose-600 rounded-full dark:bg-rose-950/60 dark:text-rose-300">
            Top Expense Category: {topExpCat}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Income Breakdown */}
          <div className="p-5 rounded-3xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 space-y-3">
            <div className="flex items-center justify-between text-teal-800 dark:text-teal-300 font-black text-sm">
              <span className="flex items-center gap-1.5"><ArrowUpRight className="w-4 h-4" /> Income (Sales Receipts)</span>
              <span>Total Earned</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-teal-100/80 dark:border-teal-900/30">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Today's Income</span>
                <span className="font-extrabold text-teal-600 dark:text-teal-400 text-sm">{formatCurrency(todayRevenue, symbol)}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-teal-100/80 dark:border-teal-900/30">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Weekly Income</span>
                <span className="font-extrabold text-teal-600 dark:text-teal-400 text-sm">{formatCurrency(weeklyIncome, symbol)}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-teal-100/80 dark:border-teal-900/30">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Monthly Income</span>
                <span className="font-extrabold text-teal-600 dark:text-teal-400 text-sm">{formatCurrency(monthlyIncome, symbol)}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-teal-100/80 dark:border-teal-900/30">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Annual Income</span>
                <span className="font-extrabold text-teal-600 dark:text-teal-400 text-sm">{formatCurrency(annualIncome, symbol)}</span>
              </div>
            </div>
          </div>

          {/* Expenses Breakdown */}
          <div className="p-5 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-3">
            <div className="flex items-center justify-between text-rose-800 dark:text-rose-300 font-black text-sm">
              <span className="flex items-center gap-1.5"><ArrowDownRight className="w-4 h-4" /> Expenses (Operating Outflows)</span>
              <span>Total Spent</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-rose-100/80 dark:border-rose-900/30">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Today's Expenses</span>
                <span className="font-extrabold text-rose-600 dark:text-rose-400 text-sm">{formatCurrency(todayExpenseTotal, symbol)}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-rose-100/80 dark:border-rose-900/30">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Weekly Expenses</span>
                <span className="font-extrabold text-rose-600 dark:text-rose-400 text-sm">{formatCurrency(weeklyExpense, symbol)}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-rose-100/80 dark:border-rose-900/30">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Monthly Expenses</span>
                <span className="font-extrabold text-rose-600 dark:text-rose-400 text-sm">{formatCurrency(monthlyExpense, symbol)}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-rose-100/80 dark:border-rose-900/30">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Annual Expenses</span>
                <span className="font-extrabold text-rose-600 dark:text-rose-400 text-sm">{formatCurrency(annualExpense, symbol)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily & Weekly Sales Trend Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-slate-100 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-extrabold text-rose-900 dark:text-white text-lg tracking-tight">
                7-Day Revenue & Profit Performance
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Daily breakdown of store gross income vs profit</p>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-full"
            >
              Full Analytics <ChevronRight className="w-3.5 h-3.5" />
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

        {/* Category Performance Pie Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-slate-100 dark:border-slate-700/60 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-rose-900 dark:text-white text-lg tracking-tight mb-1">
              Category Share
            </h4>
            <p className="text-xs text-slate-400 mb-4">Sales breakdown by cosmetics line</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`${symbol}${Number(val).toLocaleString()}`, 'Sales']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-xs py-8">No category sales recorded yet</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            {categoryChartData.slice(0, 4).map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Selling Products Horizontal Bar Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-slate-100 dark:border-slate-700/60 shadow-xs">
        <h4 className="font-extrabold text-rose-900 dark:text-white text-lg tracking-tight mb-1">
          Top 5 Best Selling Cosmetics
        </h4>
        <p className="text-xs text-slate-400 mb-6">Ranked by total unit volume sold</p>

        <div className="h-60 w-full">
          {topProductsChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topProductsChartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip formatter={(val: any) => [val, 'Units Sold']} />
                <Bar dataKey="Units" fill="#f43f5e" radius={[0, 12, 12, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-slate-400 text-xs py-10">No best seller data recorded yet</div>
          )}
        </div>
      </div>
    </div>
  );
};
