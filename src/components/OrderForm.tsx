/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  SalesOrder, OrderItem, CustomerInfo, PaymentMethod, 
  OrderStatus, DeliveryInfo, PaymentSummary, User, UserRole, Product 
} from "../types";
import { getProductsFromStorage, getCompanySettingsFromStorage } from "../data";
import { exportOrderToPdf } from "./PdfExport";
import { exportOrderToExcel } from "./ExcelExport";
import { 
  ArrowLeft, Plus, Trash2, ShieldAlert, CheckCircle, Save, Lock, 
  Share2, Printer, Check, Trash, Eye, Egg, ShieldCheck, Mail, Phone, MapPin, DollarSign, Calendar,
  FileText, FileSpreadsheet
} from "lucide-react";

interface OrderFormProps {
  orderToEdit: SalesOrder | null;
  currentUser: User;
  onBack: () => void;
  onSave: (order: SalesOrder) => void;
}

export default function OrderForm({ orderToEdit, currentUser, onBack, onSave }: OrderFormProps) {
  const productsList = getProductsFromStorage();
  const companySettings = getCompanySettingsFromStorage();
  
  // States for form inputs
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [salesName, setSalesName] = useState("");
  const [orderPeriodFrom, setOrderPeriodFrom] = useState("");
  const [orderPeriodUntil, setOrderPeriodUntil] = useState("");
  
  const [customerName, setCustomerName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [customerGps, setCustomerGps] = useState("");
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(OrderStatus.NEW);
  
  const [items, setItems] = useState<OrderItem[]>([]);
  
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("09:00");
  const [deliveryMethod, setDeliveryMethod] = useState<"Pickup" | "LAS Farm Delivery" | "Courier">("LAS Farm Delivery");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [isTaxEnabled, setIsTaxEnabled] = useState(false);
  const [generalNotes, setGeneralNotes] = useState("");
  
  // Signatures State (Base64 strings)
  const [customerSig, setCustomerSig] = useState<{ name: string; pngBase64: string; signedAt: string }>({ name: "", pngBase64: "", signedAt: "" });
  const [adminSig, setAdminSig] = useState<{ name: string; pngBase64: string; signedAt: string }>({ name: "", pngBase64: "", signedAt: "" });
  const [managerSig, setManagerSig] = useState<{ name: string; pngBase64: string; signedAt: string }>({ name: "", pngBase64: "", signedAt: "" });
  
  // Lock state
  const [isLocked, setIsLocked] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // Signature canvas refs
  const customerCanvasRef = useRef<HTMLCanvasElement>(null);
  const adminCanvasRef = useRef<HTMLCanvasElement>(null);
  const managerCanvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize or populate form
  useEffect(() => {
    if (orderToEdit) {
      // Edit mode
      setOrderNumber(orderToEdit.orderNumber);
      setOrderDate(orderToEdit.orderDate);
      setSalesName(orderToEdit.salesName);
      setOrderPeriodFrom(orderToEdit.orderPeriodFrom);
      setOrderPeriodUntil(orderToEdit.orderPeriodUntil);
      
      setCustomerName(orderToEdit.customerInfo.name);
      setStoreName(orderToEdit.customerInfo.storeName);
      setCustomerAddress(orderToEdit.customerInfo.address);
      setCustomerWhatsapp(orderToEdit.customerInfo.whatsapp);
      setCustomerGps(orderToEdit.customerInfo.gpsLocation || "");
      
      setPaymentMethod(orderToEdit.paymentMethod);
      setOrderStatus(orderToEdit.status);
      setItems(orderToEdit.items);
      
      setDeliveryDate(orderToEdit.deliveryInfo.deliveryDate);
      setDeliveryTime(orderToEdit.deliveryInfo.deliveryTime);
      setDeliveryMethod(orderToEdit.deliveryInfo.deliveryMethod);
      setRecipientName(orderToEdit.deliveryInfo.recipientName);
      setRecipientPhone(orderToEdit.deliveryInfo.recipientPhone);
      setDeliveryNotes(orderToEdit.deliveryInfo.deliveryNotes);
      
      setShippingCost(orderToEdit.paymentSummary.shippingCost);
      setIsTaxEnabled(orderToEdit.paymentSummary.tax > 0);
      setGeneralNotes(orderToEdit.generalNotes);
      
      setCustomerSig({
        name: orderToEdit.signatures.customer.name,
        pngBase64: orderToEdit.signatures.customer.pngBase64 || "",
        signedAt: orderToEdit.signatures.customer.signedAt || ""
      });
      setAdminSig({
        name: orderToEdit.signatures.admin.name,
        pngBase64: orderToEdit.signatures.admin.pngBase64 || "",
        signedAt: orderToEdit.signatures.admin.signedAt || ""
      });
      setManagerSig({
        name: orderToEdit.signatures.manager.name,
        pngBase64: orderToEdit.signatures.manager.pngBase64 || "",
        signedAt: orderToEdit.signatures.manager.signedAt || ""
      });
      
      setIsLocked(orderToEdit.locked);
      setVerificationCode(orderToEdit.verificationCode);
    } else {
      // Create mode
      const today = "2026-07-18"; // Matching user metadata
      setOrderDate(today);
      setSalesName(currentUser.name);
      setOrderPeriodFrom(today);
      
      // Auto-increment order period (+7 days)
      const untilDate = "2026-07-25";
      setOrderPeriodUntil(untilDate);
      
      // Delivery date (+1 day)
      setDeliveryDate("2026-07-19");
      
      // Generate Order Number: SO-YYYYMMDD-XXX
      const randStr = Math.floor(100 + Math.random() * 900).toString();
      setOrderNumber(`SO-20260718-${randStr}`);
      
      // Seed item
      setItems([
        {
          id: `item-${Date.now()}-1`,
          productName: productsList[0].name,
          quantity: 10,
          unit: productsList[0].unit,
          price: productsList[0].price,
          discount: 0,
          subtotal: productsList[0].price * 10,
          notes: ""
        }
      ]);

      setVerificationCode(`LAS-VERIFY-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
    }
  }, [orderToEdit, currentUser]);

  // Autofill recipient details based on customer name on first edit
  useEffect(() => {
    if (!recipientName && customerName) {
      setRecipientName(customerName);
    }
    if (!recipientPhone && customerWhatsapp) {
      setRecipientPhone(customerWhatsapp);
    }
  }, [customerName, customerWhatsapp]);

  // Handle automatic calculations
  const paymentSummary: PaymentSummary = React.useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    const discount = items.reduce((acc, item) => acc + (item.discount * item.quantity), 0);
    const tax = isTaxEnabled ? Math.round((subtotal - discount) * (companySettings.taxRate / 100)) : 0;
    const grandTotal = Math.max((subtotal - discount) + shippingCost + tax, 0);

    return {
      subtotal,
      discount,
      shippingCost,
      tax,
      grandTotal
    };
  }, [items, shippingCost, isTaxEnabled, companySettings.taxRate]);

  // Check if all three signatures exist to trigger auto-lock
  useEffect(() => {
    const hasCustomer = !!customerSig.pngBase64;
    const hasAdmin = !!adminSig.pngBase64;
    const hasManager = !!managerSig.pngBase64;
    
    if (hasCustomer && hasAdmin && hasManager && !isLocked) {
      setIsLocked(true);
      // Confetti effect simulated by alert or high-end visual lock banner
    }
  }, [customerSig, adminSig, managerSig, isLocked]);

  // Operations for editable order table
  const handleAddRow = () => {
    if (isLocked) return;
    const defaultProd = productsList[0];
    const newRow: OrderItem = {
      id: `item-${Date.now()}-${items.length + 1}`,
      productName: defaultProd.name,
      quantity: 5,
      unit: defaultProd.unit,
      price: defaultProd.price,
      discount: 0,
      subtotal: defaultProd.price * 5,
      notes: ""
    };
    setItems([...items, newRow]);
  };

  const handleDeleteRow = (id: string) => {
    if (isLocked) return;
    if (items.length <= 1) {
      alert("Aturan Sistem ERP: Penjualan harus memiliki minimal 1 produk pesanan.");
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof OrderItem, value: any) => {
    if (isLocked) return;
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // If product name changes, autofill details
        if (field === "productName") {
          const matchedProd = productsList.find(p => p.name === value);
          if (matchedProd) {
            updatedItem.unit = matchedProd.unit;
            updatedItem.price = matchedProd.price;
          }
        }
        
        // Re-calculate subtotal
        const qty = Number(updatedItem.quantity) || 0;
        const prc = Number(updatedItem.price) || 0;
        const disc = Number(updatedItem.discount) || 0;
        updatedItem.subtotal = Math.max((prc - disc) * qty, 0);
        
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);
  };

  // HTML5 Canvas Drawing handlers for Signature Drawing
  const initializeCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = "#0b3a20"; // Dark Farm Green
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleCanvasInitOnRef = (panel: "customer" | "admin" | "manager") => {
    let canvas: HTMLCanvasElement | null = null;
    if (panel === "customer") canvas = customerCanvasRef.current;
    if (panel === "admin") canvas = adminCanvasRef.current;
    if (panel === "manager") canvas = managerCanvasRef.current;
    if (canvas) {
      initializeCanvas(canvas);
    }
  };

  // Drawing state
  const isDrawing = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      // Touch Event
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      // Mouse Event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    if (isLocked) return;
    isDrawing.current = true;
    const coords = getCoordinates(e, canvas);
    lastX.current = coords.x;
    lastY.current = coords.y;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    if (!isDrawing.current || isLocked) return;
    
    // Prevent scrolling on touch screens
    if (e.cancelable) {
      e.preventDefault();
    }

    const ctx = canvas.getContext("2d");
    if (ctx) {
      const coords = getCoordinates(e, canvas);
      ctx.beginPath();
      ctx.moveTo(lastX.current, lastY.current);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      lastX.current = coords.x;
      lastY.current = coords.y;
    }
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearSignature = (panel: "customer" | "admin" | "manager") => {
    let canvas: HTMLCanvasElement | null = null;
    if (panel === "customer") {
      canvas = customerCanvasRef.current;
      setCustomerSig({ name: "", pngBase64: "", signedAt: "" });
    }
    if (panel === "admin") {
      canvas = adminCanvasRef.current;
      setAdminSig({ name: "", pngBase64: "", signedAt: "" });
    }
    if (panel === "manager") {
      canvas = managerCanvasRef.current;
      setManagerSig({ name: "", pngBase64: "", signedAt: "" });
    }
    if (canvas) {
      initializeCanvas(canvas);
    }
  };

  const saveSignature = (panel: "customer" | "admin" | "manager") => {
    let canvas: HTMLCanvasElement | null = null;
    let signerName = "";
    
    if (panel === "customer") {
      canvas = customerCanvasRef.current;
      signerName = customerName || "Customer";
    }
    if (panel === "admin") {
      canvas = adminCanvasRef.current;
      signerName = adminSig.name || currentUser.name;
    }
    if (panel === "manager") {
      canvas = managerCanvasRef.current;
      signerName = managerSig.name || "Manager Siti";
    }

    if (canvas) {
      // Check if canvas is blank
      const blankCanvas = document.createElement("canvas");
      blankCanvas.width = canvas.width;
      blankCanvas.height = canvas.height;
      
      const isBlank = canvas.toDataURL() === blankCanvas.toDataURL();
      if (isBlank) {
        alert("Kanvas kosong. Gambarlah tanda tangan sebelum menyimpannya.");
        return;
      }

      const base64Png = canvas.toDataURL("image/png");
      const signedAt = new Date().toISOString();

      if (panel === "customer") {
        setCustomerSig({ name: signerName, pngBase64: base64Png, signedAt });
      }
      if (panel === "admin") {
        setAdminSig({ name: signerName, pngBase64: base64Png, signedAt });
      }
      if (panel === "manager") {
        setManagerSig({ name: signerName, pngBase64: base64Png, signedAt });
      }

      alert(`Tanda tangan ${panel.toUpperCase()} berhasil dikonfirmasi secara aman!`);
    }
  };

  // Handle top level save form submit
  const handleSaveOrder = () => {
    if (!customerName || !customerAddress || !customerWhatsapp) {
      alert("Error: Silakan lengkapi Informasi Customer (Nama, Alamat, WhatsApp) sebelum menyimpan.");
      return;
    }

    if (items.length === 0) {
      alert("Error: Rincian pesanan kosong. Tambahkan minimal 1 produk.");
      return;
    }

    // Build Sales Order package
    const salesOrderPayload: SalesOrder = {
      id: orderToEdit ? orderToEdit.id : `so-id-${Date.now()}`,
      orderNumber,
      orderDate,
      salesName,
      orderPeriodFrom,
      orderPeriodUntil,
      customerInfo: {
        name: customerName,
        storeName,
        address: customerAddress,
        whatsapp: customerWhatsapp,
        gpsLocation: customerGps || undefined
      },
      paymentMethod,
      status: orderStatus,
      items,
      deliveryInfo: {
        deliveryDate,
        deliveryTime,
        deliveryMethod,
        recipientName: recipientName || customerName,
        recipientPhone: recipientPhone || customerWhatsapp,
        deliveryNotes
      },
      paymentSummary,
      generalNotes,
      signatures: {
        customer: customerSig,
        admin: adminSig,
        manager: managerSig
      },
      locked: isLocked,
      verificationCode,
      createdAt: orderToEdit ? orderToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(salesOrderPayload);
  };

  const handleShareWhatsApp = () => {
    const text = `*LAS FARM Premium Kampung Chicken Eggs*\n*Sales Order: ${orderNumber}*\n\nPelanggan: ${customerName}\nToko: ${storeName || "-"}\nNilai Transaksi: *Rp ${paymentSummary.grandTotal.toLocaleString("id-ID")}*\nStatus: ${orderStatus}\n\nTerima kasih atas pesanan Anda di LAS Farm!`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${customerWhatsapp.replace(/\+/g, "")}&text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleShareEmail = () => {
    const mailto = `mailto:?subject=Sales Order ${orderNumber} - LAS Farm&body=Kepada Yth. ${customerName},\n\nBerikut rincian order Anda dengan nomor transaksi ${orderNumber} senilai Rp ${paymentSummary.grandTotal.toLocaleString("id-ID")}.\n\nTerima kasih,\nLAS Farm Sales Team`;
    window.open(mailto, "_blank");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-20" id="sales-order-form-page">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-stone-200 dark:border-stone-800 pb-4 gap-4 no-print">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-extrabold text-emerald-950 dark:text-emerald-400">
              {orderToEdit ? "Edit Sales Order" : "Formulir Pesanan Baru"}
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {orderToEdit ? "Memperbarui data pesanan yang sudah tercatat" : "Mendaftarkan pesanan ayam kampung premium baru"}
            </p>
          </div>
        </div>

        {/* Export and Actions panel */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            <Printer className="h-4 w-4" />
            <span>Print Cetak</span>
          </button>
          
          <button
            onClick={() => exportOrderToPdf({
              id: orderToEdit?.id || "temp",
              orderNumber, orderDate, salesName, orderPeriodFrom, orderPeriodUntil,
              customerInfo: { name: customerName, storeName, address: customerAddress, whatsapp: customerWhatsapp, gpsLocation: customerGps || undefined },
              paymentMethod, status: orderStatus, items,
              deliveryInfo: { deliveryDate, deliveryTime, deliveryMethod, recipientName, recipientPhone, deliveryNotes },
              paymentSummary, generalNotes,
              signatures: { customer: customerSig, admin: adminSig, manager: managerSig },
              locked: isLocked, verificationCode, createdAt: "", updatedAt: ""
            })}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold border border-emerald-100 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 transition"
          >
            <FileText className="h-4 w-4" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => exportOrderToExcel({
              id: orderToEdit?.id || "temp",
              orderNumber, orderDate, salesName, orderPeriodFrom, orderPeriodUntil,
              customerInfo: { name: customerName, storeName, address: customerAddress, whatsapp: customerWhatsapp, gpsLocation: customerGps || undefined },
              paymentMethod, status: orderStatus, items,
              deliveryInfo: { deliveryDate, deliveryTime, deliveryMethod, recipientName, recipientPhone, deliveryNotes },
              paymentSummary, generalNotes,
              signatures: { customer: customerSig, admin: adminSig, manager: managerSig },
              locked: isLocked, verificationCode, createdAt: "", updatedAt: ""
            })}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold border border-amber-100 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-500 rounded-xl hover:bg-amber-100 transition"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Excel</span>
          </button>

          {customerWhatsapp && (
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition"
            >
              <Share2 className="h-4 w-4" />
              <span>WhatsApp</span>
            </button>
          )}
        </div>
      </div>

      {/* Lock Notification banner */}
      {isLocked && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-900 rounded-2xl p-4 flex items-center space-x-3 text-amber-900 dark:text-amber-300">
          <Lock className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-500" />
          <div>
            <h4 className="font-bold text-sm">Dokumen Sales Order Terkunci secara Digital (Locked & Certified)</h4>
            <p className="text-xs">
              Seluruh tanda tangan (Customer, Admin, Manager) telah terisi secara lengkap. Formulir ini telah diverifikasi dengan kode pengesahan digital <strong className="font-mono text-emerald-800 dark:text-amber-500">{verificationCode}</strong> dan tidak dapat diubah kembali demi keamanan data.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Info fields on left, totals & signatures on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side (2/3 width): Data Entries */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main ERP Form Header Box */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            
            {/* LAS Farm Brand Logo & Subtitles inside the form header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Egg className="h-7 w-7 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="font-display font-black text-xl text-emerald-950 dark:text-emerald-400">{companySettings.name}</h3>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider font-mono">{companySettings.tagline}</p>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <h2 className="text-sm font-black text-emerald-900 dark:text-amber-500 uppercase tracking-widest font-mono">FORMULIR PESANAN BARANG</h2>
                <span className="text-xs font-semibold text-stone-500">Sales Order Document</span>
              </div>
            </div>

            {/* Auto generated SO block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Nomor Sales Order (SO)</label>
                <input
                  type="text"
                  disabled
                  value={orderNumber}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 px-4 font-mono font-bold text-emerald-900 dark:text-amber-500 dark:border-stone-800 dark:bg-stone-950 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Tanggal Dokumen</label>
                <input
                  type="date"
                  disabled
                  value={orderDate}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 px-4 text-stone-700 dark:text-stone-300 dark:border-stone-800 dark:bg-stone-950 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Nama Petugas Sales</label>
                <input
                  type="text"
                  disabled={isLocked || currentUser.role === UserRole.MANAGER}
                  value={salesName}
                  onChange={(e) => setSalesName(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 py-3 px-4 font-medium outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 focus:border-emerald-800"
                />
              </div>
            </div>

            {/* ORDER PERIOD Section */}
            <div className="pt-2">
              <span className="block text-[10px] font-extrabold text-amber-600 uppercase tracking-widest mb-2 font-mono">PERIODE PESANAN (ORDER PERIOD)</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Dari Tanggal (From Date)</label>
                  <input
                    type="date"
                    disabled={isLocked}
                    value={orderPeriodFrom}
                    onChange={(e) => setOrderPeriodFrom(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 py-3 px-4 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 focus:border-emerald-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Sampai Tanggal (Until Date)</label>
                  <input
                    type="date"
                    disabled={isLocked}
                    value={orderPeriodUntil}
                    onChange={(e) => setOrderPeriodUntil(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 py-3 px-4 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 focus:border-emerald-800 font-medium"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* CUSTOMER INFORMATION Section */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-sm text-emerald-950 dark:text-emerald-400 uppercase tracking-wider border-b border-stone-100 dark:border-stone-800 pb-3 flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-amber-600" />
              <span>Informasi Pelanggan (Customer Information)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Nama Pelanggan (Customer Name) *</label>
                <input
                  type="text"
                  required
                  disabled={isLocked}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Bapak Ahmad / Ibu Lilik"
                  className="w-full rounded-xl border border-stone-200 py-3.5 px-4 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 focus:border-emerald-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Nama Toko / Perusahaan (Store/Company)</label>
                <input
                  type="text"
                  disabled={isLocked}
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Toko Kelontong Jaya Makmur"
                  className="w-full rounded-xl border border-stone-200 py-3.5 px-4 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 focus:border-emerald-800 font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Alamat Lengkap Pengiriman (Delivery Address) *</label>
                <textarea
                  rows={2}
                  required
                  disabled={isLocked}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Masukkan alamat jalan, nomor, kecamatan, kota, dan patokan lengkap..."
                  className="w-full rounded-xl border border-stone-200 py-3 px-4 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 focus:border-emerald-800 font-medium resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">No. WhatsApp (Aktif) *</label>
                <input
                  type="tel"
                  required
                  disabled={isLocked}
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(e.target.value)}
                  placeholder="+62812345678"
                  className="w-full rounded-xl border border-stone-200 py-3.5 px-4 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 focus:border-emerald-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Titik Koordinat GPS Location (Optional)</label>
                <input
                  type="text"
                  disabled={isLocked}
                  value={customerGps}
                  onChange={(e) => setCustomerGps(e.target.value)}
                  placeholder="Contoh: -7.250445, 112.768845"
                  className="w-full rounded-xl border border-stone-200 py-3.5 px-4 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 focus:border-emerald-800 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* EDITABLE ORDER DETAILS TABLE */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-display font-bold text-sm text-emerald-950 dark:text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                <Egg className="h-5 w-5 text-emerald-700" />
                <span>Rincian Produk Pesanan (Order Details)</span>
              </h3>
              
              {!isLocked && (
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="flex items-center space-x-1 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 dark:text-emerald-400 font-bold text-xs rounded-lg border border-emerald-100 dark:border-emerald-950"
                  id="add-product-row-btn"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  <span>Tambah Produk</span>
                </button>
              )}
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto rounded-xl border border-stone-100 dark:border-stone-800">
              <table className="w-full text-left border-collapse font-sans text-xs min-w-[700px]">
                <thead>
                  <tr className="bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 font-bold border-b border-stone-100 dark:border-stone-800">
                    <th className="py-2.5 px-3 text-center w-12">No</th>
                    <th className="py-2.5 px-3 w-1/3">Nama Produk</th>
                    <th className="py-2.5 px-3 text-center w-20">Qty</th>
                    <th className="py-2.5 px-3 w-20">Satuan</th>
                    <th className="py-2.5 px-3 text-right w-28">Harga (Rp)</th>
                    <th className="py-2.5 px-3 text-right w-24">Diskon (Rp)</th>
                    <th className="py-2.5 px-3 text-right w-32">Subtotal</th>
                    {!isLocked && <th className="py-2.5 px-3 text-center w-12">Hapus</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="align-middle">
                      {/* No */}
                      <td className="py-3 px-3 text-center font-bold text-stone-400">{idx + 1}</td>
                      
                      {/* Product Name Select Dropdown */}
                      <td className="py-3 px-3 space-y-1">
                        <select
                          disabled={isLocked}
                          value={item.productName}
                          onChange={(e) => handleItemChange(item.id, "productName", e.target.value)}
                          className="w-full rounded-lg border border-stone-200 py-2 px-2 text-xs outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 font-semibold"
                        >
                          {productsList.map(p => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          disabled={isLocked}
                          value={item.notes}
                          onChange={(e) => handleItemChange(item.id, "notes", e.target.value)}
                          placeholder="Catatan khusus produk..."
                          className="w-full bg-stone-50 dark:bg-stone-950/40 rounded py-1 px-1.5 text-[10px] text-stone-500 dark:text-stone-400 border-none outline-none font-medium"
                        />
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          min="1"
                          disabled={isLocked}
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                          className="w-full rounded-lg border border-stone-200 py-2 text-center text-xs outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 font-bold"
                        />
                      </td>

                      {/* Unit */}
                      <td className="py-3 px-3 font-medium text-stone-500 dark:text-stone-400 text-center">{item.unit}</td>

                      {/* Price */}
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          disabled={isLocked}
                          value={item.price}
                          onChange={(e) => handleItemChange(item.id, "price", Number(e.target.value))}
                          className="w-full rounded-lg border border-stone-200 py-2 text-right text-xs outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 font-bold"
                        />
                      </td>

                      {/* Discount per unit */}
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          min="0"
                          disabled={isLocked}
                          value={item.discount}
                          onChange={(e) => handleItemChange(item.id, "discount", Number(e.target.value))}
                          className="w-full rounded-lg border border-stone-200 py-2 text-right text-xs outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 text-amber-600 font-bold"
                        />
                      </td>

                      {/* Subtotal */}
                      <td className="py-3 px-3 text-right font-extrabold text-emerald-900 dark:text-amber-500">
                        Rp {item.subtotal.toLocaleString("id-ID")}
                      </td>

                      {/* Delete */}
                      {!isLocked && (
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(item.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg transition"
                          >
                            <Trash className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* DELIVERY INFORMATION Section */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-sm text-emerald-950 dark:text-emerald-400 uppercase tracking-wider border-b border-stone-100 dark:border-stone-800 pb-3 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-emerald-700" />
              <span>Informasi Logistik Pengiriman (Delivery Information)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Tanggal Kirim (Delivery Date) *</label>
                <input
                  type="date"
                  required
                  disabled={isLocked}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 py-3.5 px-4 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 focus:border-emerald-800 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Waktu Estimasi Kirim (Delivery Time)</label>
                <input
                  type="time"
                  disabled={isLocked}
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 py-3.5 px-4 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 focus:border-emerald-800 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Metode Pengiriman (Method)</label>
                <select
                  disabled={isLocked}
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value as any)}
                  className="w-full rounded-xl border border-stone-200 py-3.5 px-4 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 focus:border-emerald-800 font-semibold"
                >
                  <option value="LAS Farm Delivery">LAS Farm Delivery</option>
                  <option value="Pickup">Pickup (Ambil Sendiri)</option>
                  <option value="Courier">Kurir Eksternal (Courier)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Nama Penerima Lapangan *</label>
                <input
                  type="text"
                  required
                  disabled={isLocked}
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Nama penerima di lokasi"
                  className="w-full rounded-xl border border-stone-200 py-3.5 px-4 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 focus:border-emerald-800 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">No. Telp Penerima Lapangan *</label>
                <input
                  type="tel"
                  required
                  disabled={isLocked}
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="No telp penerima"
                  className="w-full rounded-xl border border-stone-200 py-3.5 px-4 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 focus:border-emerald-800 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Catatan Khusus Supir (Delivery Notes)</label>
                <input
                  type="text"
                  disabled={isLocked}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Kirim lewat pintu belakang, dsb..."
                  className="w-full rounded-xl border border-stone-200 py-3.5 px-4 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 focus:border-emerald-800 font-medium"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Side (1/3 width): Summary, Payments, Digital Signatures */}
        <div className="space-y-6">
          
          {/* PAYMENT METHOD & STATUS Section */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <h4 className="font-display text-xs font-extrabold uppercase tracking-widest text-emerald-950 dark:text-emerald-400 border-b border-stone-100 dark:border-stone-800 pb-2 flex items-center space-x-2">
              <DollarSign className="h-4.5 w-4.5 text-amber-600" />
              <span>Metode & Status Orderan</span>
            </h4>

            {/* Radio Buttons for Payment Method */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Metode Pembayaran (Payment Method)</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.values(PaymentMethod).map(method => (
                  <label 
                    key={method} 
                    className={`flex items-center space-x-2 p-2.5 rounded-xl border cursor-pointer transition ${
                      paymentMethod === method 
                        ? "bg-emerald-800/5 text-emerald-800 border-emerald-800/20 dark:bg-amber-500/5 dark:text-amber-500 dark:border-amber-500/20 font-bold" 
                        : "border-stone-200 text-stone-600 dark:border-stone-800 dark:text-stone-400 hover:bg-stone-50"
                    }`}
                  >
                    <input
                      type="radio"
                      disabled={isLocked}
                      name="payment_method"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="text-emerald-800 dark:text-amber-500"
                    />
                    <span>{method}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Order Status selector */}
            <div className="space-y-2 pt-2">
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Status Orderan (Order Status)</label>
              <select
                disabled={isLocked}
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                className="w-full rounded-xl border border-stone-200 py-2.5 px-3 text-xs outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 focus:border-emerald-800 font-bold"
              >
                {Object.values(OrderStatus).map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* PAYMENT SUMMARY Section */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <h4 className="font-display text-xs font-extrabold uppercase tracking-widest text-emerald-950 dark:text-emerald-400 border-b border-stone-100 dark:border-stone-800 pb-2">
              RINGKASAN PEMBAYARAN (BILL SUMMARY)
            </h4>

            <div className="space-y-3 font-sans text-xs">
              
              <div className="flex justify-between items-center">
                <span className="text-stone-400 font-medium">Subtotal Harga Barang</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">Rp {paymentSummary.subtotal.toLocaleString("id-ID")}</span>
              </div>

              <div className="flex justify-between items-center text-amber-600">
                <span className="font-medium">Total Diskon Khusus</span>
                <span className="font-bold">- Rp {paymentSummary.discount.toLocaleString("id-ID")}</span>
              </div>

              {/* Shipping input */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 font-medium">Ongkos Kirim (Shipping)</span>
                  <input
                    type="number"
                    disabled={isLocked}
                    value={shippingCost}
                    onChange={(e) => setShippingCost(Number(e.target.value) || 0)}
                    className="w-28 text-right font-bold rounded-lg border border-stone-200 py-1 px-2 text-xs outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* General Notes text area */}
              <div className="pt-2">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Catatan Tambahan (General Notes)</label>
                <textarea
                  rows={2}
                  disabled={isLocked}
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Tuliskan memo atau informasi invoice tambahan disini..."
                  className="w-full rounded-xl border border-stone-200 py-2 px-3 text-xs outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 focus:border-emerald-800 resize-none font-medium"
                />
              </div>

              {/* Grand Total - LARGE PREMIUM GREEN BOX */}
              <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 dark:from-emerald-900 dark:to-emerald-950 border border-amber-500/20 p-4 rounded-xl text-center shadow-lg relative overflow-hidden mt-4">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                  NILAI GRAND TOTAL
                </span>
                <strong className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Rp {paymentSummary.grandTotal.toLocaleString("id-ID")}
                </strong>
                <span className="block text-[9px] text-emerald-300 font-mono mt-1 font-semibold uppercase tracking-wider">
                  Sistem ERP Digital LAS Farm
                </span>
              </div>

            </div>
          </div>

          {/* DIGITAL SIGNATURES PANEL */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <h4 className="font-display text-xs font-extrabold uppercase tracking-widest text-emerald-950 dark:text-emerald-400 border-b border-stone-100 dark:border-stone-800 pb-2 flex items-center space-x-2">
              <ShieldCheck className="h-4.5 w-4.5 text-amber-600" />
              <span>Tanda Tangan Digital (Digital Signatures)</span>
            </h4>

            {/* 3 panels for signatures */}
            <div className="space-y-4 font-sans text-xs">
              
              {/* PANEL 1: Customer */}
              <div className="border border-stone-100 dark:border-stone-800 rounded-xl p-3 bg-stone-50/50 dark:bg-stone-900 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-700 dark:text-stone-300">Pihak Customer (Pelanggan)</span>
                  {customerSig.pngBase64 && <span className="text-[10px] font-bold text-emerald-600 uppercase">✓ Signed</span>}
                </div>

                {!customerSig.pngBase64 ? (
                  <div className="space-y-2">
                    <canvas
                      ref={customerCanvasRef}
                      onMouseDown={(e) => startDrawing(e, customerCanvasRef.current!)}
                      onMouseMove={(e) => draw(e, customerCanvasRef.current!)}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={(e) => startDrawing(e, customerCanvasRef.current!)}
                      onTouchMove={(e) => draw(e, customerCanvasRef.current!)}
                      onTouchEnd={stopDrawing}
                      className="signature-canvas w-full h-24 rounded-lg"
                      id="customer-canvas"
                    />
                    <div className="flex justify-between items-center gap-2">
                      <button
                        type="button"
                        onClick={() => clearSignature("customer")}
                        className="py-1 px-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded text-[10px]"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => saveSignature("customer")}
                        className="py-1 px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded text-[10px]"
                      >
                        Simpan Tanda Tangan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center bg-white dark:bg-stone-950 border border-stone-100 dark:border-stone-850 p-2 rounded-lg">
                    <img src={customerSig.pngBase64} alt="Customer Sig" className="max-h-16 object-contain" />
                    <span className="text-[9px] text-stone-400 mt-1 font-mono font-bold">Signed: {customerSig.name}</span>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => clearSignature("customer")}
                        className="text-[9px] text-rose-500 font-bold hover:underline mt-1.5"
                      >
                        Ubah Tanda Tangan
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* PANEL 2: Admin */}
              <div className="border border-stone-100 dark:border-stone-800 rounded-xl p-3 bg-stone-50/50 dark:bg-stone-900 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-700 dark:text-stone-300">Admin LAS Farm</span>
                  {adminSig.pngBase64 && <span className="text-[10px] font-bold text-emerald-600 uppercase">✓ Signed</span>}
                </div>

                {!adminSig.pngBase64 ? (
                  <div className="space-y-2">
                    <canvas
                      ref={adminCanvasRef}
                      onMouseDown={(e) => startDrawing(e, adminCanvasRef.current!)}
                      onMouseMove={(e) => draw(e, adminCanvasRef.current!)}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={(e) => startDrawing(e, adminCanvasRef.current!)}
                      onTouchMove={(e) => draw(e, adminCanvasRef.current!)}
                      onTouchEnd={stopDrawing}
                      className="signature-canvas w-full h-24 rounded-lg"
                      id="admin-canvas"
                    />
                    <div className="flex justify-between items-center gap-2">
                      <button
                        type="button"
                        onClick={() => clearSignature("admin")}
                        className="py-1 px-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded text-[10px]"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => saveSignature("admin")}
                        className="py-1 px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded text-[10px]"
                      >
                        Simpan Tanda Tangan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center bg-white dark:bg-stone-950 border border-stone-100 dark:border-stone-850 p-2 rounded-lg">
                    <img src={adminSig.pngBase64} alt="Admin Sig" className="max-h-16 object-contain" />
                    <span className="text-[9px] text-stone-400 mt-1 font-mono font-bold">Signed: {adminSig.name}</span>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => clearSignature("admin")}
                        className="text-[9px] text-rose-500 font-bold hover:underline mt-1.5"
                      >
                        Ubah Tanda Tangan
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* PANEL 3: Manager */}
              <div className="border border-stone-100 dark:border-stone-800 rounded-xl p-3 bg-stone-50/50 dark:bg-stone-900 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-700 dark:text-stone-300">Manager Otorisasi</span>
                  {managerSig.pngBase64 && <span className="text-[10px] font-bold text-emerald-600 uppercase">✓ Signed</span>}
                </div>

                {!managerSig.pngBase64 ? (
                  <div className="space-y-2">
                    <canvas
                      ref={managerCanvasRef}
                      onMouseDown={(e) => startDrawing(e, managerCanvasRef.current!)}
                      onMouseMove={(e) => draw(e, managerCanvasRef.current!)}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={(e) => startDrawing(e, managerCanvasRef.current!)}
                      onTouchMove={(e) => draw(e, managerCanvasRef.current!)}
                      onTouchEnd={stopDrawing}
                      className="signature-canvas w-full h-24 rounded-lg"
                      id="manager-canvas"
                    />
                    <div className="flex justify-between items-center gap-2">
                      <button
                        type="button"
                        onClick={() => clearSignature("manager")}
                        className="py-1 px-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded text-[10px]"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => saveSignature("manager")}
                        className="py-1 px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded text-[10px]"
                      >
                        Simpan Tanda Tangan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center bg-white dark:bg-stone-950 border border-stone-100 dark:border-stone-850 p-2 rounded-lg">
                    <img src={managerSig.pngBase64} alt="Manager Sig" className="max-h-16 object-contain" />
                    <span className="text-[9px] text-stone-400 mt-1 font-mono font-bold">Signed: {managerSig.name}</span>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => clearSignature("manager")}
                        className="text-[9px] text-rose-500 font-bold hover:underline mt-1.5"
                      >
                        Ubah Tanda Tangan
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Floating Save / Done Actions bar at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-stone-900/95 border-t border-stone-200 dark:border-stone-850 py-3.5 shadow-2xl backdrop-blur-md no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-3 border border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300 font-bold text-sm rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            Kembali ke Dashboard
          </button>
          
          <button
            type="button"
            onClick={handleSaveOrder}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 dark:from-amber-600 dark:to-amber-500 text-white dark:text-stone-950 font-bold text-sm px-6 py-3.5 rounded-xl shadow-xl hover:shadow-emerald-950/10 transition active:scale-98"
            id="floating-save-order-btn"
          >
            <Save className="h-5 w-5 shrink-0" />
            <span>{isLocked ? "Simpan Perubahan Dokumen" : "Simpan Sales Order ERP"}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
