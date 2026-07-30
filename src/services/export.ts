import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Sale, Expense, Product, BusinessSettings } from '../types';

export const formatCurrency = (amount: number, symbol = '₦'): string => {
  return `${symbol}${Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const exportToCSV = (data: Record<string, any>[], filename: string) => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  data.forEach((row) => {
    const values = headers.map((header) => {
      const val = row[header] ?? '';
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (data: Record<string, any>[], filename: string, sheetName = 'Report') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const generatePDFReport = (
  title: string,
  summaryRows: { label: string; value: string }[],
  tableHeaders: string[],
  tableData: (string | number)[][],
  settings: BusinessSettings
) => {
  const doc = new jsPDF();
  const symbol = settings.currencySymbol || '₦';

  // Title & Header
  doc.setFontSize(18);
  doc.setTextColor(219, 39, 119); // Cosmetic pink
  doc.text(settings.businessName || 'Glow Beauty Cosmetics', 14, 18);

  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(title, 14, 25);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 31);

  // Divider
  doc.setDrawColor(230, 230, 230);
  doc.line(14, 35, 196, 35);

  let currentY = 42;

  // Summary Grid
  if (summaryRows.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Key Performance Metrics', 14, currentY);
    currentY += 6;

    doc.setFontSize(10);
    summaryRows.forEach((item) => {
      doc.setTextColor(100, 100, 100);
      doc.text(`${item.label}:`, 14, currentY);
      doc.setTextColor(0, 0, 0);
      doc.text(`${item.value}`, 80, currentY);
      currentY += 6;
    });

    currentY += 4;
    doc.line(14, currentY, 196, currentY);
    currentY += 8;
  }

  // Draw Table
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('Breakdown Details', 14, currentY);
  currentY += 8;

  // Render Table Header
  doc.setFillColor(243, 244, 246);
  doc.rect(14, currentY, 182, 8, 'F');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  const colWidth = 182 / tableHeaders.length;
  tableHeaders.forEach((h, idx) => {
    doc.text(h, 16 + idx * colWidth, currentY + 5.5);
  });

  currentY += 10;

  // Render Table Rows
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);

  tableData.forEach((row, rowIdx) => {
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
    }
    row.forEach((cell, colIdx) => {
      const text = String(cell);
      doc.text(text.length > 25 ? text.substring(0, 23) + '...' : text, 16 + colIdx * colWidth, currentY);
    });
    currentY += 6;
  });

  // Save PDF
  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};

export const printInvoiceHtml = (sale: Sale, settings: BusinessSettings) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const symbol = settings.currencySymbol || '₦';

  const itemsHtml = sale.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.unitPrice, symbol)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.subtotal, symbol)}</td>
    </tr>
  `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - ${sale.invoiceNumber}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; max-width: 480px; margin: 0 auto; color: #333; }
          .header { text-align: center; margin-bottom: 20px; }
          .business-title { font-size: 20px; font-weight: bold; color: #db2777; margin-bottom: 4px; }
          .subtitle { font-size: 12px; color: #666; margin-bottom: 2px; }
          .divider { border-bottom: 2px dashed #e5e7eb; margin: 15px 0; }
          .info-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
          th { text-align: left; padding: 8px; background: #f9fafb; border-bottom: 1px solid #ddd; }
          .total-section { font-size: 13px; margin-top: 15px; }
          .grand-total { font-size: 16px; font-weight: bold; color: #db2777; }
          .footer { text-align: center; font-size: 11px; color: #888; margin-top: 25px; line-height: 1.4; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="business-title">${settings.businessName}</div>
          <div class="subtitle">${settings.address}</div>
          <div class="subtitle">Tel: ${settings.phone}</div>
        </div>

        <div class="divider"></div>

        <div class="info-row">
          <span><strong>Invoice #:</strong> ${sale.invoiceNumber}</span>
          <span>${new Date(sale.timestamp).toLocaleString()}</span>
        </div>
        <div class="info-row">
          <span><strong>Customer:</strong> ${sale.customerName || 'Walk-in Customer'}</span>
          <span><strong>Payment:</strong> ${sale.paymentMethod.toUpperCase()}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="divider"></div>

        <div class="total-section">
          <div class="info-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(sale.subtotal, symbol)}</span>
          </div>
          ${
            sale.discount > 0
              ? `<div class="info-row"><span>Discount:</span><span>-${formatCurrency(sale.discount, symbol)}</span></div>`
              : ''
          }
          ${
            settings.enableTax && settings.displayTaxOnReceipt
              ? `<div class="info-row" style="color: #6b7280; font-style: italic;"><span>${settings.taxName || 'VAT'} (${settings.taxRate}% - Ref Only):</span><span>${formatCurrency(sale.tax > 0 ? sale.tax : (sale.totalAmount * (settings.taxRate || 0)) / 100, symbol)}</span></div>`
              : ''
          }
          <div class="info-row grand-total" style="margin-top: 6px;">
            <span>Total Amount:</span>
            <span>${formatCurrency(sale.totalAmount, symbol)}</span>
          </div>
          <div class="info-row" style="margin-top: 4px;">
            <span>Amount Paid:</span>
            <span>${formatCurrency(sale.amountPaid, symbol)}</span>
          </div>
          ${
            sale.changeGiven > 0
              ? `<div class="info-row"><span>Change:</span><span>${formatCurrency(sale.changeGiven, symbol)}</span></div>`
              : ''
          }
          ${
            sale.outstandingDebt > 0
              ? `<div class="info-row" style="color: #dc2626;"><span>Balance Due:</span><span>${formatCurrency(sale.outstandingDebt, symbol)}</span></div>`
              : ''
          }
        </div>

        <div class="divider"></div>

        <div class="footer">
          <p>${settings.receiptFooter}</p>
          <p style="font-size: 10px; margin-top: 10px;">Powered by GlowERP - Cosmetics POS</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
