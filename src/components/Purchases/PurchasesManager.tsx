import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/export';
import {
  Truck,
  Plus,
  DollarSign,
  Phone,
  MapPin,
  Mail,
  UserCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const PurchasesManager: React.FC = () => {
  const {
    suppliers,
    purchases,
    products,
    addPurchase,
    addSupplier,
    paySupplierBalance,
    settings,
  } = useApp();

  const symbol = settings.currencySymbol || '₦';

  const [activeSubTab, setActiveSubTab] = useState<'purchases' | 'suppliers'>('purchases');

  // New Purchase Modal State
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [purchaseQty, setPurchaseQty] = useState<number>(10);
  const [purchaseCost, setPurchaseCost] = useState<number>(1500);
  const [purchaseAmountPaid, setPurchaseAmountPaid] = useState<number>(15000);

  // New Supplier Modal State
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supName, setSupName] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supEmail, setSupEmail] = useState('');

  // Pay Supplier Modal
  const [payingSupplierId, setPayingSupplierId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);

  const handleRecordPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === selectedSupplierId);
    const prod = products.find((p) => p.id === selectedProductId);
    if (!sup || !prod) return;

    addPurchase({
      supplierId: sup.id,
      supplierName: sup.name,
      productId: prod.id,
      productName: prod.name,
      quantity: purchaseQty,
      costPrice: purchaseCost,
      amountPaid: purchaseAmountPaid,
    });

    setIsPurchaseModalOpen(false);
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName) return;

    addSupplier({
      name: supName,
      phone: supPhone,
      address: supAddress,
      email: supEmail,
      productsSupplied: ['Cosmetics'],
    });

    setSupName('');
    setSupPhone('');
    setSupAddress('');
    setSupEmail('');
    setIsSupplierModalOpen(false);
  };

  const handlePaySupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (payingSupplierId && payAmount > 0) {
      paySupplierBalance(payingSupplierId, payAmount);
      setPayingSupplierId(null);
      setPayAmount(0);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-rose-900 dark:text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-rose-500" />
            Purchases & Supplier Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Record supplier orders, automatically increase stock, and track supplier debt balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSupplierModalOpen(true)}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-2xl hover:bg-slate-200 transition"
          >
            + Add Supplier
          </button>
          <button
            onClick={() => setIsPurchaseModalOpen(true)}
            className="px-5 py-2.5 bg-rose-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-600 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            New Purchase
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('purchases')}
          className={`px-4 py-2 rounded-full font-bold text-xs transition-all ${
            activeSubTab === 'purchases'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-none'
              : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700'
          }`}
        >
          Purchase History ({purchases.length})
        </button>
        <button
          onClick={() => setActiveSubTab('suppliers')}
          className={`px-4 py-2 rounded-full font-bold text-xs transition-all ${
            activeSubTab === 'suppliers'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-none'
              : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700'
          }`}
        >
          Supplier Directory ({suppliers.length})
        </button>
      </div>

      {activeSubTab === 'purchases' ? (
        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4 sm:p-5">Date</th>
                  <th className="p-4 sm:p-5">Supplier</th>
                  <th className="p-4 sm:p-5">Product</th>
                  <th className="p-4 sm:p-5 text-center">Qty</th>
                  <th className="p-4 sm:p-5 text-right">Cost Price</th>
                  <th className="p-4 sm:p-5 text-right">Total Amount</th>
                  <th className="p-4 sm:p-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                      No purchase orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-rose-50/30 dark:hover:bg-slate-700/30 transition">
                      <td className="p-4 sm:p-5 text-slate-400">{p.date}</td>
                      <td className="p-4 sm:p-5 font-extrabold text-slate-900 dark:text-slate-100">
                        {p.supplierName}
                      </td>
                      <td className="p-4 sm:p-5 font-medium text-slate-800 dark:text-slate-200">{p.productName}</td>
                      <td className="p-4 sm:p-5 text-center font-extrabold">{p.quantity}</td>
                      <td className="p-4 sm:p-5 text-right font-medium text-slate-400">{formatCurrency(p.costPrice, symbol)}</td>
                      <td className="p-4 sm:p-5 text-right font-black text-rose-600">
                        {formatCurrency(p.totalAmount, symbol)}
                      </td>
                      <td className="p-4 sm:p-5 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            p.paymentStatus === 'paid'
                              ? 'bg-teal-50 text-teal-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700/80 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-extrabold text-rose-900 dark:text-white text-sm">{s.name}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {s.phone || 'No phone'}
                  </p>
                </div>
                {s.outstandingBalance > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-extrabold">
                    Owed {formatCurrency(s.outstandingBalance, symbol)}
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-700">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {s.address || 'Lagos, Nigeria'}
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {s.email || 'N/A'}
                </p>
              </div>

              {s.outstandingBalance > 0 && (
                <button
                  onClick={() => {
                    setPayingSupplierId(s.id);
                    setPayAmount(s.outstandingBalance);
                  }}
                  className="w-full py-2.5 bg-rose-50 text-rose-600 font-bold text-xs rounded-2xl hover:bg-rose-100 transition"
                >
                  Pay Balance
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Record Purchase Modal */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-rose-100 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Record Purchase</h3>

            <form onSubmit={handleRecordPurchase} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Supplier
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find((x) => x.id === e.target.value);
                    if (p) setPurchaseCost(p.costPrice);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={purchaseQty}
                    onChange={(e) => {
                      const q = Number(e.target.value);
                      setPurchaseQty(q);
                      setPurchaseAmountPaid(q * purchaseCost);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Cost Price ({symbol})
                  </label>
                  <input
                    type="number"
                    value={purchaseCost}
                    onChange={(e) => {
                      const c = Number(e.target.value);
                      setPurchaseCost(c);
                      setPurchaseAmountPaid(purchaseQty * c);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Amount Paid Now ({symbol})
                </label>
                <input
                  type="number"
                  value={purchaseAmountPaid}
                  onChange={(e) => setPurchaseAmountPaid(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-pink-600"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl text-xs font-bold shadow-md hover:opacity-95"
                >
                  Record Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-rose-100 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Add New Supplier</h3>

            <form onSubmit={handleAddSupplier} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Supplier Name
                </label>
                <input
                  type="text"
                  required
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  placeholder="e.g. Afriluxe Beauty Depot"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={supPhone}
                  onChange={(e) => setSupPhone(e.target.value)}
                  placeholder="0803 000 1111"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={supAddress}
                  onChange={(e) => setSupAddress(e.target.value)}
                  placeholder="Market plaza address"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl text-xs font-bold shadow-md hover:opacity-95"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Supplier Modal */}
      {payingSupplierId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-rose-100 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Pay Supplier Balance</h3>
            <form onSubmit={handlePaySupplier} className="space-y-3">
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
                  onClick={() => setPayingSupplierId(null)}
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
