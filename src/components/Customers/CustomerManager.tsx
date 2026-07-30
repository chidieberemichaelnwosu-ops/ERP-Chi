import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/export';
import {
  Users,
  Plus,
  Phone,
  Calendar,
  AlertTriangle,
  DollarSign,
  Search,
  CheckCircle2
} from 'lucide-react';

export const CustomerManager: React.FC = () => {
  const {
    customers,
    addCustomer,
    payCustomerDebt,
    settings,
  } = useApp();

  const symbol = settings.currencySymbol || '₦';

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');

  // Pay debt modal
  const [payingCustomerId, setPayingCustomerId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName) return;

    addCustomer({
      name: custName,
      phone: custPhone,
      email: custEmail,
    });

    setCustName('');
    setCustPhone('');
    setCustEmail('');
    setIsAddModalOpen(false);
  };

  const handlePayDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (payingCustomerId && payAmount > 0) {
      payCustomerDebt(payingCustomerId, payAmount);
      setPayingCustomerId(null);
      setPayAmount(0);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const totalOutstandingDebts = customers.reduce((acc, c) => acc + c.outstandingDebt, 0);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-rose-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-rose-500" />
            Customer Directory & Debt Tracker
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Maintain customer purchase histories and collect outstanding credit balances.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-rose-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-600 transition flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Add Customer
        </button>
      </div>

      {/* Debt Summary Banner */}
      <div className="bg-gradient-to-r from-rose-500 to-rose-600 p-6 rounded-[32px] text-white flex items-center justify-between shadow-md shadow-rose-200 dark:shadow-none">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-100">
            Total Outstanding Customer Debts
          </span>
          <h3 className="text-2xl sm:text-3xl font-black mt-1">
            {formatCurrency(totalOutstandingDebts, symbol)}
          </h3>
        </div>
        <AlertTriangle className="w-10 h-10 text-rose-200" />
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-3 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer by name or phone..."
          className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-white focus:border-rose-500 outline-none"
        />
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((c) => (
          <div
            key={c.id}
            className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700/80 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-extrabold text-rose-900 dark:text-white text-sm">{c.name}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" /> {c.phone || 'No phone'}
                </p>
              </div>

              {c.outstandingDebt > 0 ? (
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-extrabold">
                  Debt: {formatCurrency(c.outstandingDebt, symbol)}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-[10px] font-extrabold">
                  No Debt
                </span>
              )}
            </div>

            <div className="text-xs space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-700/80 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Total Purchases:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{formatCurrency(c.totalPurchases, symbol)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Last Purchase:</span>
                <span className="font-bold">{c.lastPurchaseDate || 'N/A'}</span>
              </div>
            </div>

            {c.outstandingDebt > 0 && (
              <button
                onClick={() => {
                  setPayingCustomerId(c.id);
                  setPayAmount(c.outstandingDebt);
                }}
                className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-2xl transition shadow-md shadow-rose-200 dark:shadow-none mt-2"
              >
                Receive Debt Payment
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-rose-100 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Add New Customer</h3>

            <form onSubmit={handleAddCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Customer Full Name
                </label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Mrs. Amina Bello"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="0803 123 4567"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl text-xs font-bold shadow-md hover:opacity-95"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Debt Modal */}
      {payingCustomerId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-rose-100 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Receive Debt Payment</h3>
            <form onSubmit={handlePayDebt} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Payment Amount ({symbol})
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-pink-600"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPayingCustomerId(null)}
                  className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-pink-600 text-white rounded-xl text-xs font-bold"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
