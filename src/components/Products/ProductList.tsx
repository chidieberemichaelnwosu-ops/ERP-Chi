import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/export';
import { Product } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  QrCode,
  AlertTriangle,
  X,
  Sparkles,
  Check
} from 'lucide-react';

export const ProductList: React.FC = () => {
  const {
    products,
    categories,
    suppliers,
    addProduct,
    updateProduct,
    deleteProduct,
    settings,
    userRole,
  } = useApp();

  const symbol = settings.currencySymbol || '₦';

  // State
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [qrProduct, setQrProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Makeup',
    brand: '',
    costPrice: 0,
    sellingPrice: 0,
    wholesalePrice: 0,
    currentStock: 0,
    reorderLevel: 5,
    supplierName: '',
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Makeup',
      brand: 'GlowGlam',
      costPrice: 1500,
      sellingPrice: 3000,
      wholesalePrice: 2500,
      currentStock: 20,
      reorderLevel: 5,
      supplierName: suppliers[0]?.name || '',
    });
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData(p);
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }

    setIsAddModalOpen(false);
  };

  // Filter logic
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCat === 'All' || p.category === selectedCat;
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 pb-28">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-rose-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-rose-500" />
            Product Catalog & Inventory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage cosmetic prices, barcodes, reorder thresholds, and suppliers.
          </p>
        </div>

        {userRole !== 'salesperson' && (
          <button
            onClick={handleOpenAdd}
            className="px-5 py-3 bg-rose-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-600 transition flex items-center gap-2 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Add New Product
          </button>
        )}
      </div>

      {/* Search & Category Filter Chips */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, barcode, SKU, or brand..."
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-white focus:border-rose-500 outline-none shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCat('All')}
            className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
              selectedCat === 'All'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-none'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            All Products ({products.length})
          </button>
          {categories.map((c) => {
            const count = products.filter((p) => p.category === c.name).length;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.name)}
                className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
                  selectedCat === c.name
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-none'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {c.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid Table */}
      <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4 sm:p-5">Product Info</th>
                <th className="p-4 sm:p-5">Category</th>
                {(userRole === 'administrator' || userRole === 'super_admin') && (
                  <th className="p-4 sm:p-5 text-right">Cost Price</th>
                )}
                <th className="p-4 sm:p-5 text-right">Selling Price</th>
                <th className="p-4 sm:p-5 text-center">Current Stock</th>
                <th className="p-4 sm:p-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-800 dark:text-slate-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.currentStock <= p.reorderLevel;
                  return (
                    <tr key={p.id} className="hover:bg-rose-50/30 dark:hover:bg-slate-700/30 transition">
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 font-black flex items-center justify-center shrink-0 text-sm">
                            {p.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-slate-900 dark:text-white truncate max-w-xs">
                              {p.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>Brand: {p.brand}</span>
                              <span>•</span>
                              <span>SKU: {p.sku}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5">
                        <span className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider">
                          {p.category}
                        </span>
                      </td>

                      {(userRole === 'administrator' || userRole === 'super_admin') && (
                        <td className="p-4 sm:p-5 text-right font-medium text-slate-400">
                          {formatCurrency(p.costPrice, symbol)}
                        </td>
                      )}

                      <td className="p-4 sm:p-5 text-right font-black text-rose-600 dark:text-rose-400">
                        {formatCurrency(p.sellingPrice, symbol)}
                      </td>

                      <td className="p-4 sm:p-5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold ${
                            p.currentStock === 0
                              ? 'bg-red-100 text-red-700'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-teal-50 text-teal-700'
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3" />}
                          {p.currentStock} units
                        </span>
                      </td>

                      <td className="p-4 sm:p-5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setQrProduct(p)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Show QR Code / Barcode"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {userRole !== 'salesperson' && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                title="Edit Product"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteProduct(p.id)}
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-rose-100 dark:border-slate-800 my-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingProduct ? 'Edit Cosmetic Product' : 'Add New Cosmetic Product'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Matte Velvet Lipstick #05"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category || 'Makeup'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. GlowGlam"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Cost Price ({symbol})
                  </label>
                  <input
                    type="number"
                    value={formData.costPrice || 0}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Selling Price ({symbol})
                  </label>
                  <input
                    type="number"
                    value={formData.sellingPrice || 0}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-pink-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Wholesale ({symbol})
                  </label>
                  <input
                    type="number"
                    value={formData.wholesalePrice || 0}
                    onChange={(e) => setFormData({ ...formData, wholesalePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    value={formData.currentStock || 0}
                    onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Reorder Alert Level
                  </label>
                  <input
                    type="number"
                    value={formData.reorderLevel || 5}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code / Barcode Popup Modal */}
      {qrProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl border border-rose-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              {qrProduct.name}
            </h4>
            <div className="p-4 bg-white rounded-2xl inline-block border border-slate-200">
              <QRCodeSVG value={`PROD-${qrProduct.id}-${qrProduct.barcode}`} size={140} />
            </div>
            <p className="text-xs font-mono text-slate-500">
              Barcode / SKU: {qrProduct.barcode || qrProduct.sku}
            </p>
            <button
              onClick={() => setQrProduct(null)}
              className="w-full py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
