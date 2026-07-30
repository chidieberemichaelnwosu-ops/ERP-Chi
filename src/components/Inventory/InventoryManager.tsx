import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/export';
import {
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertOctagon,
  RotateCcw,
  Clock,
  Plus,
  ShieldAlert
} from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const {
    products,
    inventoryLogs,
    adjustStock,
    settings,
  } = useApp();

  const symbol = settings.currencySymbol || '₦';

  // Adjustment Modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [type, setType] = useState<'stock_in' | 'stock_out' | 'adjustment' | 'damaged' | 'returned' | 'expired'>('stock_in');
  const [reason, setReason] = useState('Routine count check');

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || quantity <= 0) return;

    adjustStock(selectedProduct, quantity, type, reason);
    setIsOpen(false);
  };

  const totalCostVal = products.reduce((acc, p) => acc + p.currentStock * p.costPrice, 0);
  const totalRetailVal = products.reduce((acc, p) => acc + p.currentStock * p.sellingPrice, 0);
  const totalStockUnits = products.reduce((acc, p) => acc + p.currentStock, 0);

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-pink-600" />
            Inventory & Stock Control
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Log stock in/out, damaged products, returns, and track total inventory valuation.
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:opacity-95 transition flex items-center gap-2 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Record Stock Adjustment
        </button>
      </div>

      {/* Stock Value KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-rose-100 dark:border-slate-700/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Inventory Value (Retail)</span>
          <h3 className="text-xl font-black text-pink-600 dark:text-pink-400 mt-1">
            {formatCurrency(totalRetailVal, symbol)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Expected sales revenue</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-rose-100 dark:border-slate-700/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Inventory Value (Cost)</span>
          <h3 className="text-xl font-black text-slate-800 dark:text-white mt-1">
            {formatCurrency(totalCostVal, symbol)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Capital invested in stock</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-rose-100 dark:border-slate-700/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Stock Units</span>
          <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {totalStockUnits} Items
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Across all cosmetic categories</p>
        </div>
      </div>

      {/* Inventory Adjustment History Log */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-rose-100 dark:border-slate-700/80 shadow-xs p-5 space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">
          Stock Movement & Audit Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase">
                <th className="p-3">Date & Time</th>
                <th className="p-3">Product Name</th>
                <th className="p-3">Movement Type</th>
                <th className="p-3 text-center">Quantity</th>
                <th className="p-3">Reason / Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {inventoryLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    No manual inventory adjustments logged yet.
                  </td>
                </tr>
              ) : (
                inventoryLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-3 text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-100">
                      {log.productName}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                        {log.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold">
                      {log.quantity}
                    </td>
                    <td className="p-3 text-slate-500">
                      {log.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Form Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-rose-100 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Record Stock Adjustment
            </h3>

            <form onSubmit={handleAdjust} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Select Product
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.currentStock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Movement Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                  >
                    <option value="stock_in">Stock In (Restock)</option>
                    <option value="stock_out">Stock Out (Usage)</option>
                    <option value="damaged">Damaged Goods</option>
                    <option value="returned">Returned Goods</option>
                    <option value="expired">Expired Goods</option>
                    <option value="adjustment">Manual Count Adjustment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Reason / Notes
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Broken glass bottle during unpacking"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl text-xs font-bold shadow-md hover:opacity-95"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
