/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { SalesOrder } from "../types";
import { getCompanySettingsFromStorage } from "../data";

export async function exportOrderToPdf(order: SalesOrder): Promise<void> {
  const company = getCompanySettingsFromStorage();

  // Create a hidden wrapper container styled specifically for A4 format
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "794px"; // Standard A4 pixel width at 96 DPI
  container.style.padding = "40px";
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#1c1917";
  container.style.fontFamily = "'Plus Jakarta Sans', 'Inter', sans-serif";
  container.className = "pdf-export-canvas";

  // Generate QR Code URL
  const qrData = `LAS-SO-VERIFY|${order.orderNumber}|Date:${order.orderDate}|Total:Rp ${order.paymentSummary.grandTotal.toLocaleString("id-ID")}|Code:${order.verificationCode}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrData)}`;

  // Structure the inner HTML beautifully with Green and Gold Theme
  container.innerHTML = `
    <!-- Top Gold Accent Line -->
    <div style="height: 6px; background: linear-gradient(to right, #0b3a20 0%, #0b3a20 60%, #ca8a04 60%, #ca8a04 100%); margin-bottom: 24px;"></div>

    <!-- Premium Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;">
      <div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 38px; height: 38px; background: #0b3a20; border: 1px solid #ca8a04; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #facc15; font-size: 22px; font-weight: bold;">
            🥚
          </div>
          <div>
            <h1 style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800; tracking: -0.5px; color: #0b3a20;">
              ${company.name}
            </h1>
            <span style="display: block; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #ca8a04; font-family: monospace;">
              ${company.tagline}
            </span>
          </div>
        </div>
        <p style="margin: 6px 0 0 0; font-size: 11px; color: #78716c; line-height: 1.4;">
          ${company.address}<br/>
          Tel: ${company.phone} | Email: ${company.email}
        </p>
      </div>
      <div style="text-align: right;">
        <span style="display: inline-block; padding: 4px 10px; background: #0b3a20; color: #ffffff; font-size: 11px; font-weight: bold; border-radius: 4px; letter-spacing: 1px; margin-bottom: 8px;">
          SALES ORDER
        </span>
        <h2 style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 700; color: #1c1917;">
          ${order.orderNumber}
        </h2>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #78716c;">
          Tanggal: <strong>${order.orderDate}</strong>
        </p>
      </div>
    </div>

    <div style="border-bottom: 1px solid #e7e5e4; margin-bottom: 20px;"></div>

    <!-- Title Bar -->
    <div style="text-align: center; margin-bottom: 24px;">
      <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #0b3a20; letter-spacing: 1px;">
        FORMULIR PESANAN BARANG (SALES ORDER)
      </h3>
      <p style="margin: 3px 0 0 0; font-size: 11px; color: #ca8a04; font-weight: bold; font-family: monospace;">
        SISTEM ERP DIGITAL - LAS FARM
      </p>
    </div>

    <!-- Two-Column Information Block -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
      <!-- Column Left: Customer -->
      <div style="background: #fcfbf9; border-left: 3px solid #ca8a04; padding: 12px 16px; border-radius: 0 8px 8px 0;">
        <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; color: #854d0e; text-transform: uppercase; letter-spacing: 0.5px;">
          INFORMASI PELANGGAN
        </h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; line-height: 1.5;">
          <tr>
            <td style="width: 90px; color: #78716c; padding-bottom: 4px;">Nama Pembeli:</td>
            <td style="font-weight: bold; color: #1c1917; padding-bottom: 4px;">${order.customerInfo.name}</td>
          </tr>
          <tr>
            <td style="color: #78716c; padding-bottom: 4px;">Perusahaan/Toko:</td>
            <td style="font-weight: bold; color: #1c1917; padding-bottom: 4px;">${order.customerInfo.storeName || "-"}</td>
          </tr>
          <tr>
            <td style="color: #78716c; padding-bottom: 4px; vertical-align: top;">Alamat Kirim:</td>
            <td style="color: #1c1917; padding-bottom: 4px;">${order.customerInfo.address}</td>
          </tr>
          <tr>
            <td style="color: #78716c; padding-bottom: 4px;">No. WhatsApp:</td>
            <td style="color: #1c1917; padding-bottom: 4px;">${order.customerInfo.whatsapp}</td>
          </tr>
          ${order.customerInfo.gpsLocation ? `
          <tr>
            <td style="color: #78716c;">Titik GPS:</td>
            <td style="color: #1c1917; font-family: monospace; font-size: 10px;">${order.customerInfo.gpsLocation}</td>
          </tr>` : ""}
        </table>
      </div>

      <!-- Column Right: Metadata -->
      <div style="background: #f4f6f5; border-left: 3px solid #0b3a20; padding: 12px 16px; border-radius: 0 8px 8px 0;">
        <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; color: #0b3a20; text-transform: uppercase; letter-spacing: 0.5px;">
          Rincian Transaksi
        </h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; line-height: 1.5;">
          <tr>
            <td style="width: 100px; color: #78716c; padding-bottom: 4px;">Sales Executive:</td>
            <td style="font-weight: bold; color: #1c1917; padding-bottom: 4px;">${order.salesName}</td>
          </tr>
          <tr>
            <td style="color: #78716c; padding-bottom: 4px;">Metode Bayar:</td>
            <td style="font-weight: bold; color: #0b3a20; padding-bottom: 4px;">${order.paymentMethod}</td>
          </tr>
          <tr>
            <td style="color: #78716c; padding-bottom: 4px;">Periode Pesanan:</td>
            <td style="font-weight: bold; color: #1c1917; padding-bottom: 4px;">${order.orderPeriodFrom} s/d ${order.orderPeriodUntil}</td>
          </tr>
          <tr>
            <td style="color: #78716c; padding-bottom: 4px;">Metode Kirim:</td>
            <td style="color: #1c1917; padding-bottom: 4px;">${order.deliveryInfo.deliveryMethod}</td>
          </tr>
          <tr>
            <td style="color: #78716c;">Status Order:</td>
            <td style="padding-bottom: 4px;">
              <span style="font-weight: bold; padding: 1px 6px; background: #ca8a04; color: #ffffff; border-radius: 3px; font-size: 10px;">
                ${order.status}
              </span>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Delivery Logistics Details -->
    <div style="background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 10px 14px; margin-bottom: 24px; font-size: 11px;">
      <div style="display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 15px;">
        <div>
          <span style="color: #78716c; display: block; font-size: 10px; text-transform: uppercase; font-weight: bold; margin-bottom: 2px;">Rencana Pengiriman</span>
          <strong>${order.deliveryInfo.deliveryDate}</strong> pada jam <strong>${order.deliveryInfo.deliveryTime || "08:00 - 17:00"}</strong>
        </div>
        <div>
          <span style="color: #78716c; display: block; font-size: 10px; text-transform: uppercase; font-weight: bold; margin-bottom: 2px;">Penerima Lapangan</span>
          <strong>${order.deliveryInfo.recipientName || order.customerInfo.name}</strong> (${order.deliveryInfo.recipientPhone || order.customerInfo.whatsapp})
        </div>
        <div>
          <span style="color: #78716c; display: block; font-size: 10px; text-transform: uppercase; font-weight: bold; margin-bottom: 2px;">Catatan Kirim</span>
          <span style="color: #44403c;">${order.deliveryInfo.deliveryNotes || "-"}</span>
        </div>
      </div>
    </div>

    <!-- Order Items Table -->
    <div style="margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>
          <tr style="background-color: #0b3a20; color: #ffffff; text-align: left;">
            <th style="padding: 10px 8px; border-radius: 4px 0 0 0; width: 40px; text-align: center;">No</th>
            <th style="padding: 10px 8px;">Nama Produk</th>
            <th style="padding: 10px 8px; text-align: right; width: 80px;">Jumlah</th>
            <th style="padding: 10px 8px; width: 80px;">Satuan</th>
            <th style="padding: 10px 8px; text-align: right; width: 90px;">Harga Satuan</th>
            <th style="padding: 10px 8px; text-align: right; width: 80px;">Diskon</th>
            <th style="padding: 10px 8px; text-align: right; width: 100px; border-radius: 0 4px 0 0;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((item, idx) => `
            <tr style="border-bottom: 1px solid #e7e5e4; background-color: ${idx % 2 === 0 ? "#ffffff" : "#fcfcfb"};">
              <td style="padding: 10px 8px; text-align: center; font-weight: bold; color: #78716c;">${idx + 1}</td>
              <td style="padding: 10px 8px;">
                <div style="font-weight: bold; color: #1c1917;">${item.productName}</div>
                ${item.notes ? `<span style="font-size: 9px; color: #ca8a04; display: block; margin-top: 2px;">* ${item.notes}</span>` : ""}
              </td>
              <td style="padding: 10px 8px; text-align: right; font-weight: bold;">${item.quantity}</td>
              <td style="padding: 10px 8px; color: #44403c;">${item.unit}</td>
              <td style="padding: 10px 8px; text-align: right;">Rp ${item.price.toLocaleString("id-ID")}</td>
              <td style="padding: 10px 8px; text-align: right; color: #ca8a04;">Rp ${item.discount.toLocaleString("id-ID")}</td>
              <td style="padding: 10px 8px; text-align: right; font-weight: bold; color: #0b3a20;">Rp ${item.subtotal.toLocaleString("id-ID")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>

    <!-- Calculations and Notes Row -->
    <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 30px; margin-bottom: 30px; align-items: flex-start;">
      <!-- Left side: General Notes -->
      <div>
        <span style="color: #78716c; display: block; font-size: 10px; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">
          Catatan Tambahan (Notes)
        </span>
        <div style="border: 1px solid #e7e5e4; border-radius: 6px; padding: 10px; min-height: 80px; font-size: 11px; line-height: 1.5; color: #44403c; background: #fafaf9;">
          ${order.generalNotes || "Tidak ada catatan tambahan."}
        </div>
      </div>

      {/* Right side: Detailed Payment Summary Box */}
      <div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; line-height: 1.6; margin-bottom: 12px;">
          <tr>
            <td style="color: #78716c; padding-bottom: 4px;">Total Harga Barang:</td>
            <td style="text-align: right; font-weight: 500; padding-bottom: 4px;">Rp ${order.paymentSummary.subtotal.toLocaleString("id-ID")}</td>
          </tr>
          <tr>
            <td style="color: #78716c; padding-bottom: 4px;">Diskon Khusus:</td>
            <td style="text-align: right; color: #ca8a04; font-weight: 500; padding-bottom: 4px;">- Rp ${order.paymentSummary.discount.toLocaleString("id-ID")}</td>
          </tr>
          <tr>
            <td style="color: #78716c; padding-bottom: 6px; border-bottom: 1px solid #e7e5e4;">Ongkos Kirim (Shipping):</td>
            <td style="text-align: right; font-weight: 500; padding-bottom: 6px; border-bottom: 1px solid #e7e5e4;">Rp ${order.paymentSummary.shippingCost.toLocaleString("id-ID")}</td>
          </tr>
        </table>
        
        <!-- Large Premium Green Grand Total Box -->
        <div style="background: #0b3a20; border: 1.5px solid #ca8a04; border-radius: 8px; padding: 12px; text-align: center; color: #ffffff;">
          <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #facc15; display: block; margin-bottom: 4px;">
            NILAI KONTRAK (GRAND TOTAL)
          </span>
          <strong style="font-family: 'Outfit', sans-serif; font-size: 20px; text-shadow: 1px 1px 1px rgba(0,0,0,0.2);">
            Rp ${order.paymentSummary.grandTotal.toLocaleString("id-ID")}
          </strong>
        </div>
      </div>
    </div>

    <!-- Signatures Panel Title -->
    <div style="border-bottom: 1px solid #e7e5e4; margin-bottom: 16px; padding-bottom: 4px;">
      <span style="font-size: 10px; font-weight: bold; color: #0b3a20; text-transform: uppercase; letter-spacing: 1px;">
        PENGESAHAN DOKUMEN (DIGITAL SIGNATURES)
      </span>
    </div>

    <!-- Signature Panels -->
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 30px; text-align: center;">
      <!-- Panel 1: Customer -->
      <div style="border: 1px solid #e7e5e4; border-radius: 8px; padding: 10px; background: #fafaf9; display: flex; flex-direction: column; justify-content: space-between; height: 130px;">
        <span style="font-size: 10px; font-weight: bold; color: #854d0e; display: block; border-bottom: 1px solid #f0eee9; padding-bottom: 3px;">
          Pihak Pelanggan (Customer)
        </span>
        <div style="flex-grow: 1; display: flex; align-items: center; justify-content: center; padding: 5px;">
          ${order.signatures.customer.pngBase64 ? 
            `<img src="${order.signatures.customer.pngBase64}" style="max-height: 55px; max-width: 100%; object-fit: contain;" />` : 
            `<span style="font-size: 9px; color: #a8a29e; font-style: italic;">Belum Ditandatangani</span>`
          }
        </div>
        <div style="border-top: 1px solid #f0eee9; padding-top: 3px;">
          <strong style="font-size: 11px; display: block; color: #1c1917;">${order.signatures.customer.name || "( Nama Terang )"}</strong>
          ${order.signatures.customer.signedAt ? `<span style="font-size: 8px; color: #78716c; font-family: monospace;">Signed At: ${new Date(order.signatures.customer.signedAt).toLocaleDateString("id-ID")}</span>` : ""}
        </div>
      </div>

      <!-- Panel 2: Admin -->
      <div style="border: 1px solid #e7e5e4; border-radius: 8px; padding: 10px; background: #fafaf9; display: flex; flex-direction: column; justify-content: space-between; height: 130px;">
        <span style="font-size: 10px; font-weight: bold; color: #0b3a20; display: block; border-bottom: 1px solid #f0eee9; padding-bottom: 3px;">
          Petugas Admin LAS Farm
        </span>
        <div style="flex-grow: 1; display: flex; align-items: center; justify-content: center; padding: 5px;">
          ${order.signatures.admin.pngBase64 ? 
            `<img src="${order.signatures.admin.pngBase64}" style="max-height: 55px; max-width: 100%; object-fit: contain;" />` : 
            `<span style="font-size: 9px; color: #a8a29e; font-style: italic;">Belum Ditandatangani</span>`
          }
        </div>
        <div style="border-top: 1px solid #f0eee9; padding-top: 3px;">
          <strong style="font-size: 11px; display: block; color: #1c1917;">${order.signatures.admin.name || "Budi Santoso"}</strong>
          ${order.signatures.admin.signedAt ? `<span style="font-size: 8px; color: #78716c; font-family: monospace;">Signed At: ${new Date(order.signatures.admin.signedAt).toLocaleDateString("id-ID")}</span>` : ""}
        </div>
      </div>

      <!-- Panel 3: Manager -->
      <div style="border: 1px solid #e7e5e4; border-radius: 8px; padding: 10px; background: #fafaf9; display: flex; flex-direction: column; justify-content: space-between; height: 130px;">
        <span style="font-size: 10px; font-weight: bold; color: #0b3a20; display: block; border-bottom: 1px solid #f0eee9; padding-bottom: 3px;">
          Otorisasi Manager LAS Farm
        </span>
        <div style="flex-grow: 1; display: flex; align-items: center; justify-content: center; padding: 5px;">
          ${order.signatures.manager.pngBase64 ? 
            `<img src="${order.signatures.manager.pngBase64}" style="max-height: 55px; max-width: 100%; object-fit: contain;" />` : 
            `<span style="font-size: 9px; color: #a8a29e; font-style: italic;">Belum Ditandatangani</span>`
          }
        </div>
        <div style="border-top: 1px solid #f0eee9; padding-top: 3px;">
          <strong style="font-size: 11px; display: block; color: #1c1917;">${order.signatures.manager.name || "Siti Rahma"}</strong>
          ${order.signatures.manager.signedAt ? `<span style="font-size: 8px; color: #78716c; font-family: monospace;">Signed At: ${new Date(order.signatures.manager.signedAt).toLocaleDateString("id-ID")}</span>` : ""}
        </div>
      </div>
    </div>

    <!-- Verification Section with QR Code -->
    <div style="display: flex; gap: 15px; border: 1.5px solid #ca8a04; border-radius: 10px; background: #fdfcf7; padding: 12px 16px; align-items: center; justify-content: space-between; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 15px;">
        <!-- QR Code Placeholder Image -->
        <div style="width: 72px; height: 72px; background: #ffffff; border: 1px solid #e7e5e4; border-radius: 6px; padding: 4px; display: flex; align-items: center; justify-content: center;">
          <img src="${qrUrl}" style="width: 64px; height: 64px;" />
        </div>
        <div>
          <h5 style="margin: 0; font-size: 12px; font-weight: bold; color: #0b3a20; display: flex; align-items: center; gap: 4px;">
            🔒 VERIFIED BY LAS FARM SECURITY ERP
          </h5>
          <p style="margin: 4px 0 0 0; font-size: 10px; color: #57534e; line-height: 1.4;">
            Dokumen ini sah dan terdaftar dalam sistem ERP cloud LAS Farm.<br/>
            Diverifikasi secara digital melalui QR Code dengan kode identifikasi:<br/>
            <span style="font-family: monospace; font-weight: bold; color: #ca8a04;">${order.verificationCode}</span>
          </p>
        </div>
      </div>
      <div style="text-align: right; font-size: 9px; color: #a8a29e; font-family: monospace;">
        SECURE CLOUD DOCS v1.2<br/>
        ID: ${order.id}
      </div>
    </div>

    <!-- Footer of A4 -->
    <div style="border-top: 1px solid #e7e5e4; padding-top: 10px; text-align: center; font-size: 10px; color: #a8a29e; font-family: 'Outfit', sans-serif;">
      <strong>LAS Farm Premium Kampung Chicken Eggs</strong> — CV. Lestari Agro Sentosa<br/>
      Kualitas Terbaik dari Alam untuk Keluarga Anda. Terima kasih atas kepercayaan Anda!
    </div>
  `;

  document.body.appendChild(container);

  // Wait for dynamic external images (QR Code API) to fully load in DOM before rendering to canvas
  await new Promise((resolve) => setTimeout(resolve, 800));

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // Double quality for crystal clear text
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    
    // Create A4 PDF (Portrait, pt, standard dimensions 595.28 x 841.89)
    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    
    // Save generated PDF
    pdf.save(`las_farm_sales_order_${order.orderNumber}.pdf`);
  } catch (error) {
    console.error("PDF generation failed:", error);
    alert("Error generating PDF. Please check network connection and try again.");
  } finally {
    // Cleanup temporary element
    document.body.removeChild(container);
  }
}
