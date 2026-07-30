import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../services/export';
import { Search, X, Boxes, ShoppingBag, Users, Truck } from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    products,
    sales,
    customers,
    suppliers,
    isSearchOpen,
    setIsSearchOpen,
    setActiveTab,
    settings,
  } = useApp();

  const symbol = settings.currencySymbol || '₦';
  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingProducts = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.barcode.includes(q) ||
          p.brand.toLowerCase().includes(q)
      )
    : [];

  const matchingSales = q
    ? sales.filter(
        (s) =>
          s.invoiceNumber.toLowerCase().includes(q) ||
          (s.customerName && s.customerName.toLowerCase().includes(q))
      )
    : [];

  const matchingCustomers = q
    ? customers.filter(
        (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
      )
    : [];

  const matchingSuppliers = q
    ? suppliers.filter(
        (s) => s.name.toLowerCase().includes(q) || s.phone.includes(q)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 overflow-y-auto pt-16">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-5 shadow-2xl border border-rose-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="relative w-full mr-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, invoice #, customers, suppliers..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white outline-hidden"
            />
          </div>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {!query.trim() ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Type to search across the entire ERP system.
            </div>
          ) : (
            <>
              {/* Products */}
              {matchingProducts.length > 0 && (
                <div>
                  <h5 className="text-[11px] font-bold uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                    <Boxes className="w-3.5 h-3.5 text-pink-600" /> Products ({matchingProducts.length})
                  </h5>
                  <div className="space-y-1">
                    {matchingProducts.slice(0, 4).map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setActiveTab('inventory');
                        }}
                        className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between cursor-pointer hover:bg-rose-50"
                      >
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100">{p.name}</span>
                        <span className="font-black text-xs text-pink-600">{formatCurrency(p.sellingPrice, symbol)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sales */}
              {matchingSales.length > 0 && (
                <div>
                  <h5 className="text-[11px] font-bold uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-pink-600" /> Invoices ({matchingSales.length})
                  </h5>
                  <div className="space-y-1">
                    {matchingSales.slice(0, 4).map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setActiveTab('sales');
                        }}
                        className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between cursor-pointer hover:bg-rose-50"
                      >
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100">{s.invoiceNumber} - {s.customerName || 'Walk-in'}</span>
                        <span className="font-black text-xs text-slate-900 dark:text-white">{formatCurrency(s.totalAmount, symbol)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers */}
              {matchingCustomers.length > 0 && (
                <div>
                  <h5 className="text-[11px] font-bold uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-pink-600" /> Customers ({matchingCustomers.length})
                  </h5>
                  <div className="space-y-1">
                    {matchingCustomers.slice(0, 4).map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setActiveTab('customers');
                        }}
                        className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between cursor-pointer hover:bg-rose-50"
                      >
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100">{c.name}</span>
                        <span className="text-xs text-slate-500">{c.phone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchingProducts.length === 0 && matchingSales.length === 0 && matchingCustomers.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No matching records found.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
