import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../services/export';
import { Sale, Product } from '../types';
import { InvoiceModal } from './Invoices/InvoiceModal';
import {
  getMatchingSuggestions,
  findBestMatchingProduct,
  getSimilarityRatio
} from '../utils/productMatching';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Banknote,
  Smartphone,
  User,
  Tag,
  Printer,
  ShoppingBag,
  Brain,
  Zap,
  Clock,
  History,
  AlertCircle,
  Check
} from 'lucide-react';

interface CartItem {
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  category: string;
  stockAvailable?: number;
  isAutoCreated?: boolean;
}

export const DailySales: React.FC = () => {
  const {
    products,
    customers,
    completeSale,
    settings,
    categories,
    addProduct,
  } = useApp();

  const symbol = settings.currencySymbol || '₦';

  // Fast Direct Item Entry State
  const [typedName, setTypedName] = useState('');
  const [typedQty, setTypedQty] = useState<number | ''>(1);
  const [typedPrice, setTypedPrice] = useState<number | ''>('');
  const [typedCost, setTypedCost] = useState<number | ''>('');
  const [typedCategory, setTypedCategory] = useState('Makeup');
  const [typedStock, setTypedStock] = useState<number | ''>('');

  // Selected matched product reference (if matched)
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  // Cart & Checkout State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'pos' | 'transfer' | 'credit' | 'mobile_money'>('cash');
  const [overallDiscount, setOverallDiscount] = useState<number>(0);
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');

  // Completed sale modal state
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const suggestionRef = useRef<HTMLDivElement>(null);

  // Type-ahead auto-complete suggestions
  const suggestions = useMemo(() => {
    return getMatchingSuggestions(typedName, products, 6);
  }, [typedName, products]);

  // Handle typing in product name field with intelligent matching
  const handleNameChange = (val: string) => {
    setTypedName(val);
    setIsSuggestionOpen(true);

    if (!val.trim()) {
      setMatchedProduct(null);
      setTypedPrice('');
      setTypedCost('');
      setTypedStock('');
      return;
    }

    // Check for exact or high-confidence fuzzy duplicate match
    const bestMatch = findBestMatchingProduct(val, products);
    if (bestMatch) {
      setMatchedProduct(bestMatch);
      // Auto-populate prices and stock from smart memory, but allow editing!
      if (typedPrice === '' || typedPrice === 0) {
        setTypedPrice(bestMatch.lastSellingPrice || bestMatch.sellingPrice);
      }
      if (typedCost === '' || typedCost === 0) {
        setTypedCost(bestMatch.lastCostPrice || bestMatch.costPrice);
      }
      setTypedCategory(bestMatch.category || 'Makeup');
      setTypedStock(bestMatch.currentStock);
    } else {
      setMatchedProduct(null);
      // First-time product entry defaults
      if (typeof typedPrice === 'number' && typedPrice > 0 && (typedCost === '' || typedCost === 0)) {
        setTypedCost(Math.round(typedPrice * 0.65));
      }
    }
  };

  // Select a suggestion from type-ahead list
  const handleSelectSuggestion = (p: Product) => {
    setTypedName(p.name);
    setMatchedProduct(p);
    setTypedPrice(p.lastSellingPrice || p.sellingPrice);
    setTypedCost(p.lastCostPrice || p.costPrice);
    setTypedCategory(p.category || 'Makeup');
    setTypedStock(p.currentStock);
    setIsSuggestionOpen(false);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setIsSuggestionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fast add direct item to cart
  const handleAddDirectItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typedName.trim()) return;

    const qty = typeof typedQty === 'number' && typedQty > 0 ? typedQty : 1;

    // Determine final price and cost
    let finalPrice = typeof typedPrice === 'number' && typedPrice > 0 ? typedPrice : 0;
    let finalCost = typeof typedCost === 'number' && typedCost >= 0 ? typedCost : 0;

    if (matchedProduct) {
      if (finalPrice <= 0) finalPrice = matchedProduct.sellingPrice;
      if (finalCost <= 0) finalCost = matchedProduct.costPrice;
    } else {
      if (finalPrice <= 0) finalPrice = 1000; // Default sensible fallback if not typed
      if (finalCost <= 0) finalCost = Math.round(finalPrice * 0.65);
    }

    let itemProductId = matchedProduct?.id;
    let isAutoCreated = !matchedProduct;

    // Check if item already in cart
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          (itemProductId && i.productId === itemProductId) ||
          i.productName.toLowerCase().trim() === typedName.toLowerCase().trim()
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += qty;
        updated[existingIdx].unitPrice = finalPrice;
        updated[existingIdx].unitCost = finalCost;
        return updated;
      }

      return [
        ...prev,
        {
          productId: itemProductId,
          productName: matchedProduct ? matchedProduct.name : typedName.trim(),
          quantity: qty,
          unitPrice: finalPrice,
          unitCost: finalCost,
          category: typedCategory,
          stockAvailable: matchedProduct ? matchedProduct.currentStock : (typeof typedStock === 'number' ? typedStock : 100),
          isAutoCreated,
        },
      ];
    });

    // Reset Fast Entry Inputs for next quick item entry
    setTypedName('');
    setTypedQty(1);
    setTypedPrice('');
    setTypedCost('');
    setTypedStock('');
    setMatchedProduct(null);
    setIsSuggestionOpen(false);
  };

  // Cart Calculations: Total Sale = subtotal, Discount = overallDiscount, Final Amount Received = Total Sale - Discount
  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const grandTotal = Math.max(0, subtotal - overallDiscount);
  // Tax is purely informational if enabled
  const taxAmount = settings.enableTax ? (grandTotal * (settings.taxRate || 0)) / 100 : 0;

  const parsedAmountPaid = amountPaidInput === '' ? grandTotal : Number(amountPaidInput);
  const changeDue = parsedAmountPaid > grandTotal ? parsedAmountPaid - grandTotal : 0;
  const debtAmount = parsedAmountPaid < grandTotal ? grandTotal - parsedAmountPaid : 0;

  const updateCartQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prev) => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const sale = completeSale({
      items: cart.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unitCost: item.unitCost,
        category: item.category,
      })),
      discount: overallDiscount,
      customerName,
      customerPhone,
      paymentMethod,
      amountPaid: parsedAmountPaid,
    });

    setCompletedSale(sale);

    // Reset Form
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setOverallDiscount(0);
    setAmountPaidInput('');
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 pb-28">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-rose-900 dark:text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-rose-500 fill-rose-500" />
            Intelligent Fast POS & Direct Product Entry
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Type any product name directly. Intelligent memory auto-suggests prices or saves new items automatically!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold text-xs flex items-center gap-1.5 border border-rose-200/60 dark:border-rose-900/40">
            <Brain className="w-4 h-4 text-rose-500" />
            Smart Memory Active
          </span>
        </div>
      </div>

      {/* SECTION 1: DIRECT FREE-TEXT PRODUCT ENTRY (NO DROPDOWN SELECTION REQUIRED) */}
      <div className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-[32px] border border-slate-100 dark:border-slate-700/80 shadow-sm relative space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-rose-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            Direct Product Entry
          </label>
          <span className="text-[11px] font-bold text-slate-400">
            No dropdown selection required • Type product name directly
          </span>
        </div>

        <form onSubmit={handleAddDirectItem} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Product Name Field with Auto-Complete Suggestions */}
          <div className="sm:col-span-5 relative" ref={suggestionRef}>
            <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-300 mb-1">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={typedName}
                onChange={(e) => handleNameChange(e.target.value)}
                onFocus={() => setIsSuggestionOpen(true)}
                placeholder="Type item name (e.g. Nivea Soft Cream)..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-rose-500 rounded-2xl text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white outline-none shadow-2xs transition"
                autoComplete="off"
              />
              {typedName && (
                <button
                  type="button"
                  onClick={() => handleNameChange('')}
                  className="absolute right-3 top-3 text-[10px] font-bold text-slate-400 hover:text-slate-600 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Type-Ahead / Inline Suggestions Dropdown */}
            {isSuggestionOpen && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                <div className="px-3 py-2 bg-rose-50/60 dark:bg-slate-900/60 text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Smart Memory Suggestions</span>
                  <span>Tap to Autofill</span>
                </div>
                {suggestions.map((p) => {
                  const isExact = p.name.toLowerCase().trim() === typedName.toLowerCase().trim();
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectSuggestion(p)}
                      className="p-3 hover:bg-rose-50/50 dark:hover:bg-slate-700/60 cursor-pointer transition flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          {p.name}
                          {isExact && (
                            <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded-md font-bold">
                              Exact Match
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                          <span>Cat: {p.category}</span>
                          <span>•</span>
                          <span>Stock: {p.currentStock}</span>
                          {p.timesSold ? <span>• Sold: {p.timesSold}x</span> : null}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-black text-xs text-rose-600 dark:text-rose-400">
                          {formatCurrency(p.sellingPrice, symbol)}
                        </div>
                        <div className="text-[9px] text-slate-400">Cost: {formatCurrency(p.costPrice, symbol)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-300 mb-1">
              Qty
            </label>
            <input
              type="number"
              min="1"
              value={typedQty}
              onChange={(e) => setTypedQty(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-rose-500 rounded-2xl text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white outline-none shadow-2xs text-center"
            />
          </div>

          {/* Selling Price */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-300 mb-1">
              Selling Price ({symbol})
            </label>
            <input
              type="number"
              value={typedPrice}
              onChange={(e) => setTypedPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder={matchedProduct ? matchedProduct.sellingPrice.toString() : 'Auto/Enter'}
              className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-rose-500 rounded-2xl text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white outline-none shadow-2xs"
            />
          </div>

          {/* Cost Price */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-300 mb-1">
              Cost Price ({symbol})
            </label>
            <input
              type="number"
              value={typedCost}
              onChange={(e) => setTypedCost(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder={matchedProduct ? matchedProduct.costPrice.toString() : 'Auto/Enter'}
              className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-rose-500 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 dark:text-white outline-none shadow-2xs"
            />
          </div>

          {/* Add Item Button */}
          <div className="sm:col-span-1">
            <button
              type="submit"
              disabled={!typedName.trim()}
              className={`w-full py-3 px-3 rounded-2xl font-extrabold text-xs text-white shadow-md flex items-center justify-center gap-1 transition-all ${
                typedName.trim()
                  ? 'bg-rose-500 shadow-rose-200 dark:shadow-none hover:bg-rose-600 active:scale-95'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Add
            </button>
          </div>
        </form>

        {/* Smart Memory / Status Indicator Banner */}
        {typedName.trim() && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
            {matchedProduct ? (
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold bg-teal-50 dark:bg-teal-950/40 px-3.5 py-1.5 rounded-xl border border-teal-200/60 dark:border-teal-900/40">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  Recognized: <strong>{matchedProduct.name}</strong> • Available Stock: {matchedProduct.currentStock} units
                  {matchedProduct.timesSold ? ` • Sold ${matchedProduct.timesSold} times` : ''}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold bg-rose-50 dark:bg-rose-950/40 px-3.5 py-1.5 rounded-xl border border-rose-200/60 dark:border-rose-900/40">
                <Sparkles className="w-4 h-4 text-rose-500 animate-pulse shrink-0" />
                <span>
                  First-Time Entry: <strong>"{typedName.trim()}"</strong> will be auto-saved to product memory upon completing sale!
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Cart Items & Line Item Adjustments (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 pb-3.5">
            <h3 className="font-extrabold text-rose-900 dark:text-white text-base flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-500" />
              Current Sale Items
            </h3>
            <span className="text-xs bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-3.5 py-1 rounded-full font-bold">
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {/* Cart Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5 text-center">Qty</th>
                  <th className="p-3.5 text-right">Unit Price</th>
                  <th className="p-3.5 text-right">Unit Cost</th>
                  <th className="p-3.5 text-right">Subtotal</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 font-medium">
                      No items added to cart yet. Type any product name above to add!
                    </td>
                  </tr>
                ) : (
                  cart.map((item, idx) => (
                    <tr key={idx} className="hover:bg-rose-50/30 dark:hover:bg-slate-700/30 transition">
                      <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">
                        {item.productName}
                        {item.isAutoCreated && (
                          <span className="ml-2 text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold inline-block">
                            New Product
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => updateCartQty(idx, item.quantity - 1)}
                            className="text-slate-400 hover:text-rose-600 p-0.5"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-extrabold text-xs">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(idx, item.quantity + 1)}
                            className="text-slate-400 hover:text-teal-600 p-0.5"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(item.unitPrice, symbol)}
                      </td>
                      <td className="p-3.5 text-right text-slate-400 font-medium">
                        {formatCurrency(item.unitCost, symbol)}
                      </td>
                      <td className="p-3.5 text-right font-black text-rose-600">
                        {formatCurrency(item.unitPrice * item.quantity, symbol)}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => removeFromCart(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Quick Product Memory Catalog Grid (For visual browsing & quick tap) */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700/80">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Quick Product Memory Catalog</span>
              <span className="text-[11px] font-medium text-slate-400">{products.length} Items Saved</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {products.slice(0, 9).map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectSuggestion(p)}
                  className="p-3 bg-slate-50 dark:bg-slate-900/60 hover:bg-rose-50 dark:hover:bg-slate-700/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 cursor-pointer transition flex items-center justify-between gap-1.5"
                >
                  <div className="min-w-0">
                    <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{formatCurrency(p.sellingPrice, symbol)}</p>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Customer Details, Payment Method & Receipt Checkout (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 pb-3.5">
            <h3 className="font-extrabold text-rose-900 dark:text-white text-base flex items-center gap-2">
              <Printer className="w-4 h-4 text-rose-500" />
              Checkout & Payment
            </h3>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4">
            {/* Customer Picker / Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Customer Name (Optional)
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Walk-in Customer or Mrs. Amina"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-white focus:border-rose-500 outline-none"
                  list="customer-suggestions"
                />
                <datalist id="customer-suggestions">
                  {customers.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'cash', label: 'Cash', icon: Banknote },
                  { id: 'pos', label: 'POS Card', icon: CreditCard },
                  { id: 'transfer', label: 'Transfer', icon: Smartphone },
                  { id: 'credit', label: 'Debt/Credit', icon: Tag },
                  { id: 'mobile_money', label: 'MoMo', icon: Smartphone },
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                        isSelected
                          ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200 dark:shadow-none'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount Paid & Discount */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Discount ({symbol})
                </label>
                <input
                  type="number"
                  value={overallDiscount || ''}
                  onChange={(e) => setOverallDiscount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Amount Paid ({symbol})
                </label>
                <input
                  type="number"
                  value={amountPaidInput}
                  onChange={(e) => setAmountPaidInput(e.target.value)}
                  placeholder={grandTotal.toString()}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Summary Totals Box */}
            <div className="bg-rose-50/80 dark:bg-rose-950/30 p-4 rounded-2xl space-y-2 text-xs text-slate-700 dark:text-slate-200 font-medium">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal, symbol)}</span>
              </div>
              {overallDiscount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Discount:</span>
                  <span>-{formatCurrency(overallDiscount, symbol)}</span>
                </div>
              )}
              {settings.enableTax && (
                <div className="flex justify-between text-slate-400 text-[11px] italic">
                  <span>{settings.taxName || 'Tax'} ({settings.taxRate}% - Ref Only):</span>
                  <span>{formatCurrency(taxAmount, symbol)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-rose-900 dark:text-white text-base pt-2 border-t border-rose-200/80 dark:border-rose-900/60">
                <span>Grand Total:</span>
                <span className="text-rose-600 dark:text-rose-400">
                  {formatCurrency(grandTotal, symbol)}
                </span>
              </div>

              {changeDue > 0 && (
                <div className="flex justify-between text-teal-600 font-bold text-xs pt-1">
                  <span>Change Due:</span>
                  <span>{formatCurrency(changeDue, symbol)}</span>
                </div>
              )}

              {debtAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold text-xs pt-1">
                  <span>Outstanding Debt:</span>
                  <span>{formatCurrency(debtAmount, symbol)}</span>
                </div>
              )}
            </div>

            {/* Complete Sale Button */}
            <button
              type="submit"
              disabled={cart.length === 0}
              className={`w-full py-4 rounded-2xl font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 ${
                cart.length > 0
                  ? 'bg-rose-500 shadow-rose-200 dark:shadow-none hover:bg-rose-600'
                  : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none'
              }`}
            >
              <Printer className="w-5 h-5" />
              Complete Sale & Print Receipt
            </button>
          </form>
        </div>
      </div>

      {/* Completed Sale Printable Receipt Modal */}
      {completedSale && (
        <InvoiceModal
          sale={completedSale}
          onClose={() => setCompletedSale(null)}
        />
      )}
    </div>
  );
};
