import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  exportToCSV,
  exportToExcel,
  generatePDFReport
} from '../../services/export';
import { ReportPeriod } from '../../types';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Calendar,
  Sparkles,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const ReportsAnalytics: React.FC = () => {
  const {
    sales,
    expenses,
    products,
    customers,
    suppliers,
    purchases,
    settings,
  } = useApp();

  const symbol = settings.currencySymbol || '₦';

  const [period, setPeriod] = useState<ReportPeriod>('this_month');

  // Filter sales & expenses based on selected period
  const now = new Date();
  const filterByPeriod = (itemDateStr: string) => {
    const itemDate = new Date(itemDateStr);
    const today = new Date();

    if (period === 'today') {
      return itemDateStr === today.toISOString().split('T')[0];
    } else if (period === 'yesterday') {
      const yest = new Date();
      yest.setDate(yest.getDate() - 1);
      return itemDateStr === yest.toISOString().split('T')[0];
    } else if (period === 'this_week') {
      const diff = today.getDate() - today.getDay();
      const firstDayOfWeek = new Date(today.setDate(diff));
      return itemDate >= firstDayOfWeek;
    } else if (period === 'this_month') {
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    } else if (period === 'quarter') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const itemQuarter = Math.floor(itemDate.getMonth() / 3);
      return itemQuarter === currentQuarter && itemDate.getFullYear() === now.getFullYear();
    } else if (period === 'year') {
      return itemDate.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const periodSales = sales.filter((s) => filterByPeriod(s.date));
  const periodExpenses = expenses.filter((e) => filterByPeriod(e.date));

  // Calculations
  const periodRevenue = periodSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const periodGrossProfit = periodSales.reduce((acc, s) => acc + s.grossProfit, 0);
  const periodExpenseTotal = periodExpenses.reduce((acc, e) => acc + e.amount, 0);
  const periodNetProfit = periodGrossProfit - periodExpenseTotal;
  const periodProfitMargin = periodRevenue > 0 ? ((periodNetProfit / periodRevenue) * 100).toFixed(1) : '0';

  // Payment Method Breakdown
  const paymentMethodMap: Record<string, number> = {};
  periodSales.forEach((s) => {
    const pm = s.paymentMethod.toUpperCase();
    paymentMethodMap[pm] = (paymentMethodMap[pm] || 0) + s.totalAmount;
  });

  const paymentData = Object.entries(paymentMethodMap).map(([name, value]) => ({ name, value }));

  // Export handlers
  const handleExportCSV = () => {
    const exportData = periodSales.map((s) => ({
      InvoiceNumber: s.invoiceNumber,
      Date: s.date,
      Customer: s.customerName || 'Walk-in',
      PaymentMethod: s.paymentMethod,
      Subtotal: s.subtotal,
      Discount: s.discount,
      TotalAmount: s.totalAmount,
      GrossProfit: s.grossProfit,
    }));
    exportToCSV(exportData, `GlowERP_Sales_${period}`);
  };

  const handleExportExcel = () => {
    const exportData = periodSales.map((s) => ({
      'Invoice #': s.invoiceNumber,
      'Date': s.date,
      'Customer': s.customerName || 'Walk-in',
      'Payment Method': s.paymentMethod,
      'Total (₦)': s.totalAmount,
      'Gross Profit (₦)': s.grossProfit,
    }));
    exportToExcel(exportData, `GlowERP_Report_${period}`);
  };

  const handleExportPDF = () => {
    const summaryRows = [
      { label: 'Report Period', value: period.replace('_', ' ').toUpperCase() },
      { label: 'Total Revenue', value: formatCurrency(periodRevenue, symbol) },
      { label: 'Gross Profit', value: formatCurrency(periodGrossProfit, symbol) },
      { label: 'Total Expenses', value: formatCurrency(periodExpenseTotal, symbol) },
      { label: 'Net Profit', value: formatCurrency(periodNetProfit, symbol) },
      { label: 'Profit Margin', value: `${periodProfitMargin}%` },
    ];

    const tableHeaders = ['Invoice #', 'Date', 'Customer', 'Payment', 'Amount'];
    const tableData = periodSales.map((s) => [
      s.invoiceNumber,
      s.date,
      s.customerName || 'Walk-in',
      s.paymentMethod.toUpperCase(),
      formatCurrency(s.totalAmount, symbol),
    ]);

    generatePDFReport(`${period.replace('_', ' ').toUpperCase()} Business Report`, summaryRows, tableHeaders, tableData, settings);
  };

  const COLORS = ['#ec4899', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-rose-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-rose-500" />
            Executive Reports & Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate printable daily, weekly, monthly, quarterly, and annual financial statements.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold hover:bg-slate-200 transition flex items-center gap-1"
            title="Export CSV"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="p-2.5 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 rounded-2xl text-xs font-bold hover:bg-teal-100 transition flex items-center gap-1"
            title="Export Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-600" />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 bg-rose-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-600 transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Period Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'today', label: 'Daily Report' },
          { id: 'this_week', label: 'Weekly Report' },
          { id: 'this_month', label: 'Monthly Report' },
          { id: 'quarter', label: 'Quarterly Report' },
          { id: 'year', label: 'Annual Report' },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id as ReportPeriod)}
            className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
              period === p.id
                ? 'bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-none'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Financial Statement KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Period Revenue</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(periodRevenue, symbol)}
          </h3>
          <p className="text-[11px] text-teal-600 font-bold mt-1">
            {periodSales.length} Transactions recorded
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Profit</span>
          <h3 className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
            {formatCurrency(periodGrossProfit, symbol)}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Revenue minus COGS</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Expenses</span>
          <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(periodExpenseTotal, symbol)}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">{periodExpenses.length} Expense logs</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Profit & Margin</span>
          <h3 className={`text-2xl font-black mt-1 ${periodNetProfit >= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-rose-600'}`}>
            {formatCurrency(periodNetProfit, symbol)}
          </h3>
          <p className="text-[11px] font-extrabold text-rose-600 mt-1">
            Profit Margin: {periodProfitMargin}%
          </p>
        </div>
      </div>

      {/* Payment Method Distribution Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700/80 shadow-xs">
        <h4 className="font-extrabold text-rose-900 dark:text-white text-base mb-1">
          Payment Method Revenue Breakdown
        </h4>
        <p className="text-xs text-slate-400 mb-4">Cash vs POS vs Transfer vs Credit share</p>

        <div className="h-56 w-full flex items-center justify-center">
          {paymentData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label={(entry) => `${entry.name}: ${symbol}${entry.value.toLocaleString()}`}
                >
                  {paymentData.map((_, i) => (
                    <Cell key={i} fill={['#f43f5e', '#fb7185', '#fda4af', '#14b8a6', '#0d9488'][i % 5]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${symbol}${Number(val).toLocaleString()}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-slate-400 text-xs py-8">No data for selected period</div>
          )}
        </div>
      </div>
    </div>
  );
};
