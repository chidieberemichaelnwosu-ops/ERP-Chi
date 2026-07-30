import React from 'react';
import { Sale } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatCurrency, printInvoiceHtml } from '../../services/export';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Printer,
  Share2,
  CheckCircle2,
  Sparkles,
  Download,
  Copy
} from 'lucide-react';

interface InvoiceModalProps {
  sale: Sale;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ sale, onClose }) => {
  const { settings } = useApp();
  const symbol = settings.currencySymbol || '₦';

  const receiptDataQr = JSON.stringify({
    inv: sale.invoiceNumber,
    total: sale.totalAmount,
    date: sale.date,
    store: settings.businessName,
  });

  const handlePrint = () => {
    printInvoiceHtml(sale, settings);
  };

  const handleShareWhatsApp = () => {
    const text = `*${settings.businessName}* Receipt\nInvoice: ${sale.invoiceNumber}\nDate: ${new Date(sale.timestamp).toLocaleString()}\nTotal: ${formatCurrency(sale.totalAmount, symbol)}\nCustomer: ${sale.customerName || 'Customer'}\nPayment: ${sale.paymentMethod.toUpperCase()}\n\nThank you for your patronising Glow Beauty Cosmetics!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-rose-100 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-base">Transaction Completed</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto font-sans text-slate-800 dark:text-slate-100">
          {/* Store Info */}
          <div className="text-center space-y-1">
            <h4 className="font-black text-xl text-pink-600 dark:text-pink-400">
              {settings.businessName}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{settings.address}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tel: {settings.phone}</p>
          </div>

          <div className="border-b border-dashed border-slate-300 dark:border-slate-700 my-2" />

          {/* Invoice Meta */}
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice Number:</span>
              <span className="font-bold">{sale.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date & Time:</span>
              <span className="font-medium">{new Date(sale.timestamp).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-bold">{sale.customerName || 'Walk-in Customer'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Method:</span>
              <span className="font-bold uppercase text-pink-600">{sale.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Served By:</span>
              <span>{sale.salespersonName}</span>
            </div>
          </div>

          <div className="border-b border-dashed border-slate-300 dark:border-slate-700 my-2" />

          {/* Itemized Table */}
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                <th className="text-left py-1">Item</th>
                <th className="text-center py-1">Qty</th>
                <th className="text-right py-1">Price</th>
                <th className="text-right py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-1.5 font-medium pr-1">{item.productName}</td>
                  <td className="py-1.5 text-center font-bold">{item.quantity}</td>
                  <td className="py-1.5 text-right">{formatCurrency(item.unitPrice, symbol)}</td>
                  <td className="py-1.5 text-right font-bold">{formatCurrency(item.subtotal, symbol)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="space-y-1 text-xs pt-2">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span>{formatCurrency(sale.subtotal, symbol)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>Discount:</span>
                <span>-{formatCurrency(sale.discount, symbol)}</span>
              </div>
            )}
            {settings.enableTax && settings.displayTaxOnReceipt && (
              <div className="flex justify-between text-slate-400 italic text-[11px]">
                <span>{settings.taxName || 'VAT'} ({settings.taxRate}% - Ref Only):</span>
                <span>{formatCurrency(sale.tax > 0 ? sale.tax : (sale.totalAmount * (settings.taxRate || 0)) / 100, symbol)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>Grand Total:</span>
              <span className="text-pink-600 dark:text-pink-400">
                {formatCurrency(sale.totalAmount, symbol)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300 font-semibold pt-1">
              <span>Amount Paid:</span>
              <span>{formatCurrency(sale.amountPaid, symbol)}</span>
            </div>

            {sale.changeGiven > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Change Returned:</span>
                <span>{formatCurrency(sale.changeGiven, symbol)}</span>
              </div>
            )}

            {sale.outstandingDebt > 0 && (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Debt Owed:</span>
                <span>{formatCurrency(sale.outstandingDebt, symbol)}</span>
              </div>
            )}
          </div>

          <div className="border-b border-dashed border-slate-300 dark:border-slate-700 my-2" />

          {/* QR Code Verification */}
          <div className="flex flex-col items-center justify-center space-y-1 py-1">
            <QRCodeSVG value={receiptDataQr} size={80} level="M" />
            <span className="text-[10px] text-slate-400 font-mono">Scan to verify invoice</span>
          </div>

          <p className="text-[11px] text-center text-slate-500 italic mt-2">
            {settings.receiptFooter}
          </p>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
          <button
            onClick={handleShareWhatsApp}
            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <Share2 className="w-4 h-4" />
            WhatsApp
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-95 transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
