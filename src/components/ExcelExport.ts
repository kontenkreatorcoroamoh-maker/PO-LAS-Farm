/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SalesOrder } from "../types";

export function exportOrderToExcel(order: SalesOrder): void {
  // We can write a beautifully formatted CSV or HTML-Excel table that opens perfectly in MS Excel with columns, styles and totals.
  // Standard CSV / Tab-Separated Value (TSV) is simple, but a basic XML/HTML spreadsheet allows formatting like background colors!
  // Let's generate a TSV (Tab Separated Values) which Excel loads flawlessly.
  
  let content = "";
  
  // Title
  content += "LAS FARM - PREMIUM KAMPUNG CHICKEN EGGS\t\t\t\t\t\t\t\n";
  content += "FORMULIR PESANAN BARANG (SALES ORDER)\t\t\t\t\t\t\t\n";
  content += `No. Transaksi:\t${order.orderNumber}\t\tTanggal Order:\t${order.orderDate}\t\t\n`;
  content += `Sales Executive:\t${order.salesName}\t\tStatus Pesanan:\t${order.status}\t\t\n`;
  content += `Periode Dari:\t${order.orderPeriodFrom}\t\tSampai Tanggal:\t${order.orderPeriodUntil}\t\t\n\n`;
  
  // Customer
  content += "INFORMASI PELANGGAN\t\t\t\t\t\t\t\n";
  content += `Nama Pembeli:\t${order.customerInfo.name}\t\tToko/Perusahaan:\t${order.customerInfo.storeName || "-"}\t\t\n`;
  content += `Alamat Kirim:\t${order.customerInfo.address}\t\tNo. WhatsApp:\t${order.customerInfo.whatsapp}\t\t\n`;
  content += `Lokasi GPS:\t${order.customerInfo.gpsLocation || "-"}\t\tMetode Bayar:\t${order.paymentMethod}\t\t\n\n`;
  
  // Delivery
  content += "INFORMASI PENGIRIMAN LOGISTIK\t\t\t\t\t\t\t\n";
  content += `Tanggal Kirim:\t${order.deliveryInfo.deliveryDate}\t\tWaktu Kirim:\t${order.deliveryInfo.deliveryTime}\t\t\n`;
  content += `Metode Kirim:\t${order.deliveryInfo.deliveryMethod}\t\tNama Penerima:\t${order.deliveryInfo.recipientName}\t\t\n`;
  content += `Telepon Penerima:\t${order.deliveryInfo.recipientPhone}\t\tCatatan Kirim:\t${order.deliveryInfo.deliveryNotes || "-"}\t\t\n\n`;

  // Item headers
  content += "RINCIAN BARANG PESANAN\t\t\t\t\t\t\t\n";
  content += "No\tNama Produk\tJumlah\tSatuan\tHarga Satuan (Rp)\tDiskon (Rp)\tSubtotal (Rp)\tCatatan Barang\n";
  
  order.items.forEach((item, index) => {
    content += `${index + 1}\t`;
    content += `${item.productName}\t`;
    content += `${item.quantity}\t`;
    content += `${item.unit}\t`;
    content += `${item.price}\t`;
    content += `${item.discount}\t`;
    content += `${item.subtotal}\t`;
    content += `${item.notes || "-"}\n`;
  });
  
  content += "\n";
  
  // Payment Summary
  content += "RINGKASAN PEMBAYARAN\t\t\t\t\t\t\t\n";
  content += `Subtotal Harga Barang:\t\t\t\t\t\tRp ${order.paymentSummary.subtotal}\t\n`;
  content += `Total Diskon Khusus:\t\t\t\t\t\t-Rp ${order.paymentSummary.discount}\t\n`;
  content += `Ongkos Kirim (Shipping):\t\t\t\t\t\tRp ${order.paymentSummary.shippingCost}\t\n`;
  content += `PPN Pajak (11%):\t\t\t\t\t\tRp ${order.paymentSummary.tax}\t\n`;
  content += `NILAI GRAND TOTAL:\t\t\t\t\t\tRp ${order.paymentSummary.grandTotal}\t\n\n`;
  
  // Metadata & Security Verification
  content += `Sistem ERP QR Code Verification Hash:\t${order.verificationCode}\t\tStatus Dokumen:\t${order.locked ? "LOCKED & DIGITALLY SIGNED" : "DRAFT"}\n`;
  content += `Generated At:\t${new Date().toISOString()}\n`;

  // Create downloadable blob
  const blob = new Blob([content], { type: "text/xls;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `las_farm_sales_order_${order.orderNumber}.xls`);
  link.click();
}
