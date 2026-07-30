import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Sale, Expense } from '../../types';
import { formatCurrency } from '../../services/export';
import {
  Search,
  Filter,
  Calendar,
  Printer,
  Eye,
  Receipt,
  ReceiptText,
  ShoppingBag,
  TrendingDown,
  User,
  CreditCard,
  X,
  ChevronDown,
  Download,
  Clock,
  Tag
} from 'lucide-react';

type DatePreset = 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'custom' | 'all';

export const TransactionsView: React.FC = () => {
  const {
    sales,
    expenses,
    settings,
    categories,
    expenseCategories,
    userRole
  } = useApp();

  const symbol = settings.currencySymbol || '₦';

  // Active Tab: 'sales' or 'expenses'
  const [activeSubTab, setActiveSubTab] = useState<'sales' | 'expenses'>('sales');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [salesPersonFilter, setSalesPersonFilter] = useState<string>('all');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('all');

  // Modals for details
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Helper for Date Range Filter
  const filterByDate = (timestampStr: string) => {
    const itemDate = new Date(timestampStr);
    const now = new Date();

    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

    switch (datePreset) {
      case 'today': {
        return itemDate >= startOfDay(now) && itemDate <= endOfDay(now);
      }
      case 'yesterday': {
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        return itemDate >= startOfDay(y) && itemDate <= endOfDay(y);
      }
      case 'week': {
        const firstDayOfWeek = new Date(now);
        firstDayOfWeek.setDate(now.getDate() - now.getDay());
        return itemDate >= startOfDay(firstDayOfWeek);
      }
      case 'month': {
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return itemDate >= startOfDay(firstDayOfMonth);
      }
      case 'quarter': {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const firstDayOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
        return itemDate >= startOfDay(firstDayOfQuarter);
      }
      case 'year': {
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
        return itemDate >= startOfDay(firstDayOfYear);
      }
      case 'custom': {
        if (!customStartDate && !customEndDate) return true;
        const start = customStartDate ? startOfDay(new Date(customStartDate)) : new Date(0);
        const end = customEndDate ? endOfDay(new Date(customEndDate)) : new Date(2099, 11, 31);
        return itemDate >= start && itemDate <= end;
      }
      case 'all':
      default:
        return true;
    }
  };

  // Unique Sales Persons list
  const salesPersonsList = useMemo(() => {
    const names = new Set<string>();
    sales.forEach((s) => {
      if (s.salesPersonName) names.add(s.salesPersonName);
    });
    return Array.from(names);
  }, [sales]);

  // Filtered Sales
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      // Date filter
      if (!filterByDate(sale.timestamp)) return false;

      // Payment method filter
      if (paymentMethodFilter !== 'all' && sale.paymentMethod !== paymentMethodFilter) {
        return false;
      }

      // Salesperson filter
      if (salesPersonFilter !== 'all' && sale.salesPersonName !== salesPersonFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const invoiceMatch = sale.invoiceNumber.toLowerCase().includes(q);
        const customerMatch = sale.customerName?.toLowerCase().includes(q);
        const itemMatch = sale.items.some((i) => i.productName.toLowerCase().includes(q));
        const personMatch = sale.salesPersonName?.toLowerCase().includes(q);
        if (!invoiceMatch && !customerMatch && !itemMatch && !personMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [sales, datePreset, customStartDate, customEndDate, paymentMethodFilter, salesPersonFilter, searchQuery]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // Date filter
      if (!filterByDate(exp.timestamp)) return false;

      // Expense category filter
      if (expenseCategoryFilter !== 'all' && exp.category !== expenseCategoryFilter) {
        return false;
      }

      // Payment method filter
      if (paymentMethodFilter !== 'all' && exp.paymentMethod !== paymentMethodFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const categoryMatch = exp.category.toLowerCase().includes(q);
        const descMatch = exp.description.toLowerCase().includes(q);
        const userMatch = exp.recordedBy?.toLowerCase().includes(q);
        if (!categoryMatch && !descMatch && !userMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [expenses, datePreset, customStartDate, customEndDate, expenseCategoryFilter, paymentMethodFilter, searchQuery]);

  // Total sales volume in view
  const totalSalesVolume = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
  // Total expenses volume in view
  const totalExpensesVolume = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  // Print Receipt Handler
  const handlePrintReceipt = (sale: Sale) => {
    setSelectedSale(sale);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-6 pb-28">
      {/* Page Header & Purpose Statement */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-wider">
              Complete Business Audit History
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Transactions Audit Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Searchable log of all customer receipts and operational expense disbursements.
          </p>
        </div>

        {/* Primary Sub-Tab Selector */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center shrink-0">
          <button
            onClick={() => setActiveSubTab('sales')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 ${
              activeSubTab === 'sales'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            Sales Receipts ({sales.length})
          </button>

          <button
            onClick={() => setActiveSubTab('expenses')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 ${
              activeSubTab === 'expenses'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            Expenses Log ({expenses.length})
          </button>
        </div>
      </div>

      {/* Date Range Preset Pills */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-[28px] border border-slate-100 dark:border-slate-700/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-rose-500" />
            Filter By Time Period
          </span>
          <span className="text-xs font-black text-rose-600 dark:text-rose-400">
            {activeSubTab === 'sales'
              ? `${filteredSales.length} Invoices (${formatCurrency(totalSalesVolume, symbol)})`
              : `${filteredExpenses.length} Expenses (${formatCurrency(totalExpensesVolume, symbol)})`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'quarter', label: 'This Quarter' },
              { id: 'year', label: 'This Year' },
              { id: 'custom', label: 'Custom Range' },
            ] as const
          ).map((preset) => (
            <button
              key={preset.id}
              onClick={() => setDatePreset(preset.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                datePreset === preset.id
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Date Pickers */}
        {datePreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Secondary Search & Dropdown Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeSubTab === 'sales'
                ? 'Search invoice #, customer or products...'
                : 'Search expense category or description...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </div>

        {/* Payment Method Filter */}
        <div>
          <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">All Payment Methods</option>
            <option value="cash">Cash Payment</option>
            <option value="pos">POS Card Terminal</option>
            <option value="transfer">Bank Transfer</option>
            <option value="credit">Customer Credit / Debt</option>
            <option value="mobile_money">Mobile Money</option>
          </select>
        </div>

        {/* Role Specific Filter */}
        {activeSubTab === 'sales' ? (
          <div>
            <select
              value={salesPersonFilter}
              onChange={(e) => setSalesPersonFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="all">All Sales Persons / Cashiers</option>
              {salesPersonsList.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <select
              value={expenseCategoryFilter}
              onChange={(e) => setExpenseCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="all">All Expense Categories</option>
              {expenseCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* CONTENT LIST: SALES HISTORY */}
      {activeSubTab === 'sales' && (
        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700/60 shadow-xs overflow-hidden">
          {filteredSales.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <ReceiptText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-bold">No sales receipts match your selected filters.</p>
              <p className="text-xs text-slate-400">Try adjusting the search query or date range preset above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-700 text-slate-400 font-extrabold uppercase tracking-wider">
                    <th className="p-4 sm:p-5">Invoice # & Date</th>
                    <th className="p-4 sm:p-5">Products / Items</th>
                    <th className="p-4 sm:p-5 text-center">Payment</th>
                    <th className="p-4 sm:p-5 text-right">Total Amount</th>
                    <th className="p-4 sm:p-5">Cashier</th>
                    <th className="p-4 sm:p-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition">
                      <td className="p-4 sm:p-5">
                        <span className="font-black text-slate-900 dark:text-white block text-sm">
                          {sale.invoiceNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(sale.timestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      <td className="p-4 sm:p-5 max-w-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                          {sale.items.map((i) => i.productName).join(', ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {sale.items.reduce((acc, i) => acc + i.quantity, 0)} total items
                        </span>
                      </td>

                      <td className="p-4 sm:p-5 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-[10px] uppercase">
                          {sale.paymentMethod}
                        </span>
                      </td>

                      <td className="p-4 sm:p-5 text-right">
                        <span className="font-black text-rose-600 dark:text-rose-400 text-sm block">
                          {formatCurrency(sale.totalAmount, symbol)}
                        </span>
                      </td>

                      <td className="p-4 sm:p-5">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block">
                          {sale.salesPersonName || 'Store Cashier'}
                        </span>
                      </td>

                      <td className="p-4 sm:p-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
                            title="View Receipt Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrintReceipt(sale)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
                            title="Print Thermal Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CONTENT LIST: EXPENSES HISTORY */}
      {activeSubTab === 'expenses' && (
        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700/60 shadow-xs overflow-hidden">
          {filteredExpenses.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <TrendingDown className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-bold">No expenses found for selected filters.</p>
              <p className="text-xs text-slate-400">Try adjusting search keywords or category filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-700 text-slate-400 font-extrabold uppercase tracking-wider">
                    <th className="p-4 sm:p-5">Category & Description</th>
                    <th className="p-4 sm:p-5">Date & Time</th>
                    <th className="p-4 sm:p-5 text-center">Payment</th>
                    <th className="p-4 sm:p-5 text-right">Amount</th>
                    <th className="p-4 sm:p-5">Recorded By</th>
                    <th className="p-4 sm:p-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition">
                      <td className="p-4 sm:p-5">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase inline-block mb-1">
                          {exp.category}
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-white block">
                          {exp.description}
                        </span>
                      </td>

                      <td className="p-4 sm:p-5 text-slate-400">
                        {new Date(exp.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="p-4 sm:p-5 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                          {exp.paymentMethod || 'cash'}
                        </span>
                      </td>

                      <td className="p-4 sm:p-5 text-right font-black text-rose-600 dark:text-rose-400 text-sm">
                        {formatCurrency(exp.amount, symbol)}
                      </td>

                      <td className="p-4 sm:p-5 font-bold text-slate-700 dark:text-slate-300">
                        {exp.recordedBy || 'Manager'}
                      </td>

                      <td className="p-4 sm:p-5 text-center">
                        <button
                          onClick={() => setSelectedExpense(exp)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
                          title="View Expense Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SALE / RECEIPT DETAIL MODAL */}
      {selectedSale && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100 dark:border-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Sales Receipt Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Frame */}
            <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 font-mono text-xs">
              <div className="text-center space-y-1">
                <h4 className="font-extrabold text-sm uppercase tracking-wider">{settings.storeName || 'RETAIL POS STORE'}</h4>
                <p className="text-[10px] text-slate-500">{settings.address || 'Standard Store Location'}</p>
                <p className="text-[10px] text-slate-500">Tel: {settings.phone || '+234 800 000 0000'}</p>
                <div className="border-b border-dashed border-slate-300 dark:border-slate-700 my-2" />
                <p className="text-[11px] font-bold">INVOICE: {selectedSale.invoiceNumber}</p>
                <p className="text-[10px] text-slate-400">
                  {new Date(selectedSale.timestamp).toLocaleString()}
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold border-b border-slate-200 dark:border-slate-800 pb-1">
                  <span>ITEM</span>
                  <span>QTY x PRICE = TOTAL</span>
                </div>
                {selectedSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate pr-2">{item.productName}</span>
                    <span className="shrink-0 font-bold">
                      {item.quantity} x {formatCurrency(item.unitPrice, symbol)} = {formatCurrency(item.quantity * item.unitPrice, symbol)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-b border-dashed border-slate-300 dark:border-slate-700 my-2" />

              {/* Totals */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedSale.totalAmount + (selectedSale.discount || 0), symbol)}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(selectedSale.discount, symbol)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-300 dark:border-slate-700">
                  <span>GRAND TOTAL:</span>
                  <span>{formatCurrency(selectedSale.totalAmount, symbol)}</span>
                </div>
                <div className="flex justify-between text-slate-500 pt-1">
                  <span>Payment Method:</span>
                  <span className="uppercase font-bold">{selectedSale.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Cashier:</span>
                  <span>{selectedSale.salesPersonName || 'Store Cashier'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePrintReceipt(selectedSale)}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Thermal Receipt
              </button>
              <button
                onClick={() => setSelectedSale(null)}
                className="px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-2xl hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPENSE DETAIL MODAL */}
      {selectedExpense && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-500" /> Expense Voucher Details
              </h3>
              <button
                onClick={() => setSelectedExpense(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Category</span>
                <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-extrabold text-xs inline-block mt-0.5">
                  {selectedExpense.category}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Description / Notes</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5 text-sm">
                  {selectedExpense.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Amount Paid</span>
                  <span className="font-black text-rose-600 dark:text-rose-400 text-lg">
                    {formatCurrency(selectedExpense.amount, symbol)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Payment Channel</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                    {selectedExpense.paymentMethod || 'cash'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Date & Logged By</span>
                <span className="text-slate-600 dark:text-slate-400 block font-medium">
                  {new Date(selectedExpense.timestamp).toLocaleString()} • Staff: {selectedExpense.recordedBy || 'Manager'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedExpense(null)}
              className="w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs rounded-2xl mt-4 hover:opacity-90 transition"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
