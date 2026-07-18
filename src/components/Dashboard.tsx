/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { SalesOrder, OrderStatus, User, UserRole, Customer } from "../types";
import { 
  Plus, Search, Filter, Calendar, DollarSign, RefreshCw, 
  ChevronRight, FileText, Download, TrendingUp, CheckCircle, 
  Clock, AlertCircle, Trash2, Edit2, ShieldAlert, Key, Globe, FileSpreadsheet, Eye,
  MapPin, Users, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { exportOrderToExcel } from "./ExcelExport";
import { exportOrderToPdf } from "./PdfExport";
import { getCustomersFromStorage, saveCustomersToStorage } from "../data";

interface DashboardProps {
  orders: SalesOrder[];
  currentUser: User;
  onNewOrder: () => void;
  onEditOrder: (order: SalesOrder) => void;
  onDeleteOrder: (orderId: string) => void;
  onRefresh: () => void;
}

export default function Dashboard({ 
  orders, 
  currentUser, 
  onNewOrder, 
  onEditOrder, 
  onDeleteOrder,
  onRefresh 
}: DashboardProps) {
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [salesFilter, setSalesFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [minSalesFilter, setMinSalesFilter] = useState<number>(0);

  // Tab state for the main list
  const [activeTab, setActiveTab] = useState<"ORDERS" | "CUSTOMERS">("ORDERS");

  // Customer Management States
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editCustomerStoreName, setEditCustomerStoreName] = useState("");
  const [editCustomerAddress, setEditCustomerAddress] = useState("");
  const [editCustomerWhatsapp, setEditCustomerWhatsapp] = useState("");
  const [editCustomerGps, setEditCustomerGps] = useState("");

  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerStore, setNewCustomerStore] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");
  const [newCustomerWhatsapp, setNewCustomerWhatsapp] = useState("");
  const [newCustomerGps, setNewCustomerGps] = useState("");
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [showClearCustomersConfirm, setShowClearCustomersConfirm] = useState(false);

  // Load customers
  useEffect(() => {
    setCustomers(getCustomersFromStorage());
  }, [orders]);

  const isCustomerUsedInOrders = (customer: Customer) => {
    return orders.some(o => 
      o.customerInfo.name.trim().toLowerCase() === customer.name.trim().toLowerCase() ||
      (customer.storeName && o.customerInfo.storeName && o.customerInfo.storeName.trim().toLowerCase() === customer.storeName.trim().toLowerCase())
    );
  };

  const handleDeleteCustomer = (id: string) => {
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    saveCustomersToStorage(updated);
  };

  const handleClearAllCustomers = () => {
    setCustomers([]);
    saveCustomersToStorage([]);
    setShowClearCustomersConfirm(false);
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName) {
      alert("Error: Silakan lengkapi Nama pelanggan.");
      return;
    }
    const newCust: Customer = {
      id: `cust-id-${Date.now()}`,
      name: newCustomerName,
      storeName: newCustomerStore,
      address: newCustomerAddress,
      whatsapp: newCustomerWhatsapp,
      gpsLocation: newCustomerGps
    };
    const updated = [...customers, newCust];
    setCustomers(updated);
    saveCustomersToStorage(updated);
    // Clear
    setNewCustomerName("");
    setNewCustomerStore("");
    setNewCustomerAddress("");
    setNewCustomerWhatsapp("");
    setNewCustomerGps("");
    setIsAddingCustomer(false);
  };

  const handleEditCustomer = (cust: Customer) => {
    setEditingCustomerId(cust.id);
    setEditCustomerName(cust.name);
    setEditCustomerStoreName(cust.storeName || "");
    setEditCustomerAddress(cust.address || "");
    setEditCustomerWhatsapp(cust.whatsapp || "");
    setEditCustomerGps(cust.gpsLocation || "");
  };

  const handleSaveEditedCustomer = (id: string) => {
    if (!editCustomerName) {
      alert("Error: Nama pelanggan tidak boleh kosong!");
      return;
    }
    const updated = customers.map(c => {
      if (c.id === id) {
        return {
          ...c,
          name: editCustomerName,
          storeName: editCustomerStoreName,
          address: editCustomerAddress,
          whatsapp: editCustomerWhatsapp,
          gpsLocation: editCustomerGps
        };
      }
      return c;
    });
    setCustomers(updated);
    saveCustomersToStorage(updated);
    setEditingCustomerId(null);
  };

  // Filtered customer list based on search term
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.storeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.address || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.whatsapp || "").includes(searchTerm)
    );
  }, [customers, searchTerm]);

  // Get current date representation in Local Time (2026-07-18)
  const todayStr = "2026-07-18";

  // Calculate high-fidelity ERP stats
  const stats = useMemo(() => {
    let total = orders.length;
    let todayOrders = orders.filter(o => o.orderDate === todayStr).length;
    let inProcess = orders.filter(o => o.status === OrderStatus.PROCESSING || o.status === OrderStatus.PARTIAL || o.status === OrderStatus.NEW).length;
    let completed = orders.filter(o => o.status === OrderStatus.COMPLETED).length;
    
    // Sum monthly sales (excluding cancelled orders)
    let monthlySalesSum = orders
      .filter(o => o.status !== OrderStatus.CANCELLED)
      .reduce((acc, o) => acc + o.paymentSummary.grandTotal, 0);

    return {
      total,
      todayOrders,
      inProcess,
      completed,
      monthlySalesSum
    };
  }, [orders, todayStr]);

  // Unique lists for filtering dropdowns
  const salesNames = useMemo(() => {
    const names = new Set<string>();
    orders.forEach(o => {
      if (o.salesName) names.add(o.salesName);
    });
    return Array.from(names);
  }, [orders]);

  // Handle Search and Filter logic
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search Customer Name, Store Name, Order Number, Whatsapp
      const matchesSearch = 
        order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.whatsapp.includes(searchTerm);

      // Filter by Status
      const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;

      // Filter by Sales Name
      const matchesSales = salesFilter === "ALL" || order.salesName === salesFilter;

      // Filter by Date
      const matchesDate = !dateFilter || order.orderDate === dateFilter;

      // Filter by minimum sales value
      const matchesMinSales = order.paymentSummary.grandTotal >= minSalesFilter;

      return matchesSearch && matchesStatus && matchesSales && matchesDate && matchesMinSales;
    });
  }, [orders, searchTerm, statusFilter, salesFilter, dateFilter, minSalesFilter]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.NEW:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
      case OrderStatus.PROCESSING:
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
      case OrderStatus.PARTIAL:
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20";
      case OrderStatus.COMPLETED:
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
      case OrderStatus.CANCELLED:
        return "bg-stone-500/10 text-stone-600 dark:text-stone-400 border border-stone-500/20";
      default:
        return "bg-stone-100 text-stone-600";
    }
  };

  // Premium Custom Inline SVG Chart rendering orders trend (Daily comparison for visual appeal)
  const chartData = useMemo(() => {
    // Group orders by date of the last 7 days from today (2026-07-18)
    const dates = ["2026-07-12", "2026-07-13", "2026-07-14", "2026-07-15", "2026-07-16", "2026-07-17", "2026-07-18"];
    return dates.map(d => {
      const dayOrders = orders.filter(o => o.orderDate === d && o.status !== OrderStatus.CANCELLED);
      const totalAmount = dayOrders.reduce((acc, o) => acc + o.paymentSummary.grandTotal, 0);
      return {
        date: d.split("-")[2] + " Jul",
        total: totalAmount / 1000, // Show in Thousands Rp
        count: dayOrders.length
      };
    });
  }, [orders]);

  // Max value of chartData for scaling SVGs
  const maxChartValue = useMemo(() => {
    const maxVal = Math.max(...chartData.map(d => d.total), 1);
    return maxVal * 1.1; // Add 10% head padding
  }, [chartData]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="dashboard-container">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-400 tracking-tight">
            Dashboard Utama
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Selamat datang, <strong className="text-stone-800 dark:text-stone-200">{currentUser.name}</strong> ({currentUser.role}). Pantau pesanan hari ini di bawah ini.
          </p>
        </div>
        
        {/* Call to Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="p-3 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl transition"
            title="Refresh Database"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
          
          {currentUser.role !== UserRole.MANAGER && (
            <button
              onClick={onNewOrder}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 dark:from-amber-600 dark:to-amber-500 text-white dark:text-stone-950 font-bold text-sm px-5 py-3 rounded-xl shadow-lg hover:shadow-emerald-900/10 transition active:scale-98"
              id="dashboard-new-order-btn"
            >
              <Plus className="h-5 w-5 shrink-0" />
              <span>Buat Pesanan Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards (Bento-like grid layout) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4" id="kpi-dashboard-grid">
        
        {/* Total Orders Card */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-4 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Total Pesanan</span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg"><FileText className="h-4 w-4" /></span>
          </div>
          <p className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">{stats.total}</p>
          <span className="text-[10px] text-stone-400 font-medium">Sepanjang Sejarah</span>
        </div>

        {/* Today's Orders Card */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-4 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Order Hari Ini</span>
            <span className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg"><Clock className="h-4 w-4" /></span>
          </div>
          <p className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">{stats.todayOrders}</p>
          <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider font-mono">Tgl: {todayStr.split("-")[2]} Jul 2026</span>
        </div>

        {/* Orders In Process Card */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-4 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Sedang Diproses</span>
            <span className="p-1.5 bg-blue-500/10 text-blue-600 rounded-lg"><AlertCircle className="h-4 w-4" /></span>
          </div>
          <p className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">{stats.inProcess}</p>
          <span className="text-[10px] text-stone-400 font-medium">Menunggu Kirim / Baru</span>
        </div>

        {/* Completed Orders Card */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-4 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Selesai Dikirim</span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg"><CheckCircle className="h-4 w-4" /></span>
          </div>
          <p className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">{stats.completed}</p>
          <span className="text-[10px] text-emerald-600 font-medium font-bold">100% Aman Terbayar</span>
        </div>

        {/* Monthly Sales Card (Large Grand Total Green Box representation) */}
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-emerald-800 to-emerald-950 border border-amber-500/20 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 text-emerald-700/25 pointer-events-none">
            <DollarSign className="h-28 w-28" />
          </div>
          <div className="flex justify-between items-center mb-2 z-10 relative">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Omset Penjualan</span>
            <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg"><TrendingUp className="h-4 w-4" /></span>
          </div>
          <p className="font-display text-xl sm:text-2xl font-black text-white tracking-tight z-10 relative">
            Rp {stats.monthlySalesSum.toLocaleString("id-ID")}
          </p>
          <span className="text-[10px] text-amber-300 font-mono font-bold uppercase tracking-widest z-10 relative block">
            KONTRAK BERJALAN
          </span>
        </div>
      </div>

      {/* Grid: Graphic Analytics & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Advanced Search & Orders / Customers List */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4 gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => { setActiveTab("ORDERS"); setSearchTerm(""); }}
                className={`font-display text-base font-extrabold pb-2 border-b-2 transition flex items-center space-x-1.5 ${
                  activeTab === "ORDERS"
                    ? "text-emerald-950 dark:text-emerald-400 border-emerald-800 dark:border-amber-500"
                    : "text-stone-400 dark:text-stone-500 border-transparent hover:text-stone-600"
                }`}
              >
                <FileText className="h-4.5 w-4.5" />
                <span>Sales Orders ({filteredOrders.length})</span>
              </button>
              <button
                onClick={() => { setActiveTab("CUSTOMERS"); setSearchTerm(""); }}
                className={`font-display text-base font-extrabold pb-2 border-b-2 transition ml-4 flex items-center space-x-1.5 ${
                  activeTab === "CUSTOMERS"
                    ? "text-emerald-950 dark:text-emerald-400 border-emerald-800 dark:border-amber-500"
                    : "text-stone-400 dark:text-stone-500 border-transparent hover:text-stone-600"
                }`}
              >
                <Users className="h-4.5 w-4.5" />
                <span>Pelanggan ({filteredCustomers.length})</span>
              </button>
            </div>

            {activeTab === "CUSTOMERS" && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsAddingCustomer(!isAddingCustomer)}
                  className="px-3 py-1.5 text-[11px] font-bold bg-emerald-800 hover:bg-emerald-950 dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-stone-950 text-white rounded-lg transition cursor-pointer"
                >
                  {isAddingCustomer ? "Batal" : "+ Tambah Pelanggan"}
                </button>
                
                {customers.length > 0 && (
                  showClearCustomersConfirm ? (
                    <div className="flex items-center gap-1.5 border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 px-2 py-1 rounded-lg">
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold animate-pulse">Hapus semua pelanggan?</span>
                      <button
                        type="button"
                        onClick={handleClearAllCustomers}
                        className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded hover:bg-rose-700 cursor-pointer transition"
                      >
                        Ya
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClearCustomersConfirm(false)}
                        className="px-2 py-0.5 border border-stone-200 dark:border-stone-800 text-stone-500 bg-white dark:bg-stone-900 text-[10px] font-bold rounded hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowClearCustomersConfirm(true)}
                      className="px-3 py-1.5 text-[11px] font-bold border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                    >
                      Hapus Semua Pelanggan
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Search Bar Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeTab === "ORDERS" ? "Cari berdasarkan nama customer, nama toko, no WhatsApp, atau nomor SO..." : "Cari pelanggan berdasarkan nama, toko, alamat, atau no WhatsApp..."}
              className="w-full rounded-xl border border-stone-200 py-3 pl-10 pr-4 text-sm focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:focus:border-amber-500 transition"
              id="order-search-input"
            />
          </div>

          {activeTab === "ORDERS" ? (
            /* Orders Table & Mobile Cards */
            <div className="overflow-x-auto rounded-xl border border-stone-100 dark:border-stone-800">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-stone-400 dark:text-stone-500 space-y-2">
                  <ShieldAlert className="h-10 w-10 mx-auto stroke-1" />
                  <p className="text-sm font-semibold">Tidak ada data Sales Order yang sesuai filter.</p>
                  <p className="text-xs">Coba kurangi filter atau buat sales order baru.</p>
                </div>
              ) : (
                <>
                  {/* Desktop View Table */}
                  <table className="hidden md:table w-full text-left border-collapse font-sans text-sm" id="sales-orders-table">
                    <thead>
                      <tr className="bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 font-bold border-b border-stone-100 dark:border-stone-800">
                        <th className="py-3 px-4">No. Order</th>
                        <th className="py-3 px-4">Customer / Toko</th>
                        <th className="py-3 px-4">Tanggal / Sales</th>
                        <th className="py-3 px-4 text-right">Grand Total</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr 
                          key={order.id}
                          className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors"
                        >
                          <td className="py-4 px-4 font-mono font-bold text-emerald-900 dark:text-amber-500">
                            <div className="flex items-center space-x-1.5">
                              <span>{order.orderNumber}</span>
                              {order.locked && <span className="text-[9px] uppercase tracking-wider bg-rose-500/10 text-rose-500 px-1 rounded font-sans border border-rose-500/10">🔒 Locked</span>}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-stone-900 dark:text-stone-100">{order.customerInfo.name}</div>
                            <div className="text-xs text-stone-400 dark:text-stone-500">{order.customerInfo.storeName || "Toko Kelontong"}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-stone-800 dark:text-stone-200">{order.orderDate}</div>
                            <div className="text-xs text-stone-400">{order.salesName}</div>
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-stone-900 dark:text-white">
                            Rp {order.paymentSummary.grandTotal.toLocaleString("id-ID")}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusBadge(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => onEditOrder(order)}
                                className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-emerald-700 dark:text-amber-500 transition"
                                title={order.locked ? "Lihat Detail (Terkunci)" : "Edit Sales Order"}
                              >
                                {order.locked ? <Eye className="h-4.5 w-4.5" /> : <Edit2 className="h-4.5 w-4.5" />}
                              </button>
                              <button
                                onClick={() => exportOrderToPdf(order)}
                                className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-emerald-800 dark:text-emerald-400 transition"
                                title="Export PDF Resmi"
                              >
                                <FileText className="h-4.5 w-4.5" />
                              </button>
                              <button
                                onClick={() => exportOrderToExcel(order)}
                                className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-amber-700 transition"
                                title="Ekspor ke Excel"
                              >
                                <FileSpreadsheet className="h-4.5 w-4.5" />
                              </button>
                              {currentUser.role === UserRole.ADMIN && (
                                <button
                                  onClick={() => setDeletingOrderId(order.id)}
                                  className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/25 rounded-lg text-rose-500 transition"
                                  title="Hapus Order"
                                >
                                  <Trash2 className="h-4.5 w-4.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile View Cards */}
                  <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800">
                    {filteredOrders.map((order) => (
                      <div 
                        key={order.id} 
                        className="p-4 space-y-3 hover:bg-stone-50/40 dark:hover:bg-stone-800/20 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-mono font-bold text-emerald-900 dark:text-amber-500 flex items-center gap-1">
                              <span>{order.orderNumber}</span>
                              {order.locked && <span className="text-[8px] bg-rose-500/10 text-rose-500 px-1 rounded border border-rose-500/10">🔒</span>}
                            </div>
                            <h4 className="font-bold text-stone-900 dark:text-stone-100 mt-1">{order.customerInfo.name}</h4>
                            <span className="text-xs text-stone-400">{order.customerInfo.storeName || "Toko Kelontong"}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs text-stone-400">
                          <span>Sales: <strong>{order.salesName}</strong></span>
                          <span>Tgl: <strong>{order.orderDate}</strong></span>
                        </div>

                        <div className="flex justify-between items-center border-t border-stone-100 dark:border-stone-800 pt-2.5">
                          <span className="font-bold text-stone-900 dark:text-white">
                            Rp {order.paymentSummary.grandTotal.toLocaleString("id-ID")}
                          </span>
                          
                          <div className="flex space-x-1">
                            <button
                              onClick={() => onEditOrder(order)}
                              className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-emerald-800 dark:text-amber-500 flex items-center space-x-1 font-semibold text-xs transition"
                            >
                              {order.locked ? <Eye className="h-3.5 w-3.5" /> : <Edit2 className="h-3.5 w-3.5" />}
                              <span>{order.locked ? "Detail" : "Edit"}</span>
                            </button>
                            <button
                              onClick={() => exportOrderToPdf(order)}
                              className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-emerald-800 dark:text-emerald-400 transition"
                              title="Export PDF"
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </button>
                            {currentUser.role === UserRole.ADMIN && (
                              <button
                                onClick={() => setDeletingOrderId(order.id)}
                                className="p-2 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-lg text-rose-600 transition"
                                title="Hapus Order"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Customers Database Management Tab */
            <div className="space-y-4">
              {isAddingCustomer && (
                <form onSubmit={handleAddCustomer} className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl p-4 space-y-4">
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-amber-500 uppercase tracking-wider">Tambah Pelanggan Baru</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Nama Pelanggan *</label>
                      <input
                        type="text"
                        required
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        placeholder="Bapak Ahmad"
                        className="w-full rounded-xl border border-stone-200 py-2.5 px-3 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 focus:border-emerald-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Nama Toko / Perusahaan</label>
                      <input
                        type="text"
                        value={newCustomerStore}
                        onChange={(e) => setNewCustomerStore(e.target.value)}
                        placeholder="Toko Jaya Sembako"
                        className="w-full rounded-xl border border-stone-200 py-2.5 px-3 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 focus:border-emerald-800"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Alamat Lengkap</label>
                      <input
                        type="text"
                        value={newCustomerAddress}
                        onChange={(e) => setNewCustomerAddress(e.target.value)}
                        placeholder="Jl. Raya No. 123, Surabaya"
                        className="w-full rounded-xl border border-stone-200 py-2.5 px-3 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 focus:border-emerald-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">No. WhatsApp</label>
                      <input
                        type="text"
                        value={newCustomerWhatsapp}
                        onChange={(e) => setNewCustomerWhatsapp(e.target.value)}
                        placeholder="+628123456789"
                        className="w-full rounded-xl border border-stone-200 py-2.5 px-3 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 focus:border-emerald-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Titik Koordinat GPS</label>
                      <input
                        type="text"
                        value={newCustomerGps}
                        onChange={(e) => setNewCustomerGps(e.target.value)}
                        placeholder="-7.250445, 112.768845"
                        className="w-full rounded-xl border border-stone-200 py-2.5 px-3 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 focus:border-emerald-800"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold bg-emerald-800 hover:bg-emerald-950 text-white rounded-lg transition cursor-pointer"
                    >
                      Simpan Pelanggan Baru
                    </button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto rounded-xl border border-stone-100 dark:border-stone-800 font-sans text-xs">
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-12 text-stone-400">
                    Tidak ada pelanggan dalam database yang sesuai.
                  </div>
                ) : (
                  <>
                    {/* Desktop customer list */}
                    <table className="hidden md:table w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-50 dark:bg-stone-950 text-stone-500 font-bold border-b border-stone-100 dark:border-stone-800">
                          <th className="py-2.5 px-3">Nama Pelanggan / Toko</th>
                          <th className="py-2.5 px-3">Alamat</th>
                          <th className="py-2.5 px-3">WhatsApp & GPS</th>
                          <th className="py-2.5 px-3 text-center w-28">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                        {filteredCustomers.map(c => (
                          <tr key={c.id} className="align-middle hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                            <td className="py-3 px-3">
                              {editingCustomerId === c.id ? (
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    value={editCustomerName}
                                    onChange={(e) => setEditCustomerName(e.target.value)}
                                    className="w-full py-1 px-1.5 border border-stone-200 rounded font-semibold text-stone-800 dark:bg-stone-950 dark:border-stone-800"
                                    placeholder="Nama"
                                  />
                                  <input
                                    type="text"
                                    value={editCustomerStoreName}
                                    onChange={(e) => setEditCustomerStoreName(e.target.value)}
                                    className="w-full py-1 px-1.5 border border-stone-200 rounded text-stone-600 dark:bg-stone-950 dark:border-stone-800"
                                    placeholder="Nama Toko"
                                  />
                                </div>
                              ) : (
                                <div className="font-semibold text-stone-800 dark:text-stone-200">
                                  {c.name}
                                  {c.storeName && <span className="block text-[10px] text-stone-400 font-normal">{c.storeName}</span>}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-stone-500 max-w-xs truncate">
                              {editingCustomerId === c.id ? (
                                <textarea
                                  rows={2}
                                  value={editCustomerAddress}
                                  onChange={(e) => setEditCustomerAddress(e.target.value)}
                                  className="w-full py-1 px-1.5 border border-stone-200 rounded dark:bg-stone-950 dark:border-stone-800"
                                  placeholder="Alamat"
                                />
                              ) : (
                                c.address || <span className="text-stone-300 dark:text-stone-700">-</span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-stone-600 dark:text-stone-300">
                              {editingCustomerId === c.id ? (
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    value={editCustomerWhatsapp}
                                    onChange={(e) => setEditCustomerWhatsapp(e.target.value)}
                                    className="w-full py-1 px-1.5 border border-stone-200 rounded dark:bg-stone-950 dark:border-stone-800"
                                    placeholder="WhatsApp"
                                  />
                                  <input
                                    type="text"
                                    value={editCustomerGps}
                                    onChange={(e) => setEditCustomerGps(e.target.value)}
                                    className="w-full py-1 px-1.5 border border-stone-200 rounded dark:bg-stone-950 dark:border-stone-800"
                                    placeholder="GPS"
                                  />
                                </div>
                              ) : (
                                <>
                                  <div className="font-bold text-stone-800 dark:text-stone-200">{c.whatsapp || "-"}</div>
                                  {c.gpsLocation && <div className="text-[9px] text-emerald-600 dark:text-amber-500 flex items-center space-x-1"><span>📍 {c.gpsLocation}</span></div>}
                                </>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {editingCustomerId === c.id ? (
                                <div className="flex justify-center space-x-1.5">
                                  <button
                                    onClick={() => handleSaveEditedCustomer(c.id)}
                                    className="px-2 py-1 text-[10px] font-bold bg-emerald-700 text-white rounded hover:bg-emerald-800 cursor-pointer"
                                  >
                                    Simpan
                                  </button>
                                  <button
                                    onClick={() => setEditingCustomerId(null)}
                                    className="px-2 py-1 text-[10px] font-bold border border-stone-200 text-stone-500 rounded hover:bg-stone-100 cursor-pointer"
                                  >
                                    Batal
                                  </button>
                                </div>
                              ) : deletingCustomerId === c.id ? (
                                <div className="flex justify-center space-x-1.5 items-center">
                                  <span className="text-[10px] text-rose-600 font-bold animate-pulse">Hapus?</span>
                                  <button
                                    onClick={() => {
                                      handleDeleteCustomer(c.id);
                                      setDeletingCustomerId(null);
                                    }}
                                    className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded hover:bg-rose-700 cursor-pointer"
                                  >
                                    Ya
                                  </button>
                                  <button
                                    onClick={() => setDeletingCustomerId(null)}
                                    className="px-2 py-0.5 text-[10px] font-bold border border-stone-200 text-stone-500 rounded hover:bg-stone-100 cursor-pointer"
                                  >
                                    Batal
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-center space-x-1.5">
                                  <button
                                    onClick={() => handleEditCustomer(c)}
                                    className="px-2.5 py-1 text-[10px] font-bold border border-stone-200 hover:bg-stone-100 dark:border-stone-800 text-stone-700 dark:text-stone-300 rounded cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => setDeletingCustomerId(c.id)}
                                    className="px-2.5 py-1 text-[10px] font-bold border border-rose-200 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Mobile customer list cards */}
                    <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800">
                      {filteredCustomers.map(c => (
                        <div key={c.id} className="p-3 space-y-2">
                          {editingCustomerId === c.id ? (
                            <div className="space-y-2 text-xs">
                              <div>
                                <label className="block text-[9px] font-bold text-stone-400 uppercase">Nama *</label>
                                <input
                                  type="text"
                                  value={editCustomerName}
                                  onChange={(e) => setEditCustomerName(e.target.value)}
                                  className="w-full py-1.5 px-2 border border-stone-200 rounded dark:bg-stone-950 dark:border-stone-800"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-stone-400 uppercase">Toko</label>
                                <input
                                  type="text"
                                  value={editCustomerStoreName}
                                  onChange={(e) => setEditCustomerStoreName(e.target.value)}
                                  className="w-full py-1.5 px-2 border border-stone-200 rounded dark:bg-stone-950 dark:border-stone-800"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-stone-400 uppercase">Alamat</label>
                                <textarea
                                  rows={2}
                                  value={editCustomerAddress}
                                  onChange={(e) => setEditCustomerAddress(e.target.value)}
                                  className="w-full py-1.5 px-2 border border-stone-200 rounded dark:bg-stone-950 dark:border-stone-800"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-stone-400 uppercase">WhatsApp</label>
                                <input
                                  type="text"
                                  value={editCustomerWhatsapp}
                                  onChange={(e) => setEditCustomerWhatsapp(e.target.value)}
                                  className="w-full py-1.5 px-2 border border-stone-200 rounded dark:bg-stone-950 dark:border-stone-800"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-stone-400 uppercase">GPS</label>
                                <input
                                  type="text"
                                  value={editCustomerGps}
                                  onChange={(e) => setEditCustomerGps(e.target.value)}
                                  className="w-full py-1.5 px-2 border border-stone-200 rounded dark:bg-stone-950 dark:border-stone-800"
                                />
                              </div>
                              <div className="flex space-x-2 pt-1">
                                <button
                                  onClick={() => handleSaveEditedCustomer(c.id)}
                                  className="flex-1 py-1.5 bg-emerald-700 text-white rounded font-bold text-center text-xs"
                                >
                                  Simpan
                                </button>
                                <button
                                  onClick={() => setEditingCustomerId(null)}
                                  className="flex-1 py-1.5 border border-stone-250 text-stone-600 rounded font-bold text-center text-xs"
                                >
                                  Batal
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-bold text-stone-900 dark:text-stone-100">{c.name}</div>
                                  {c.storeName && <div className="text-[10px] text-stone-400">{c.storeName}</div>}
                                </div>
                                <div className="flex space-x-1">
                                  {deletingCustomerId === c.id ? (
                                    <div className="flex items-center space-x-1">
                                      <span className="text-[9px] text-rose-600 font-bold animate-pulse mr-1">Hapus?</span>
                                      <button
                                        onClick={() => {
                                          handleDeleteCustomer(c.id);
                                          setDeletingCustomerId(null);
                                        }}
                                        className="p-1 px-2 bg-rose-600 text-white rounded text-[10px] font-bold"
                                      >
                                        Ya
                                      </button>
                                      <button
                                        onClick={() => setDeletingCustomerId(null)}
                                        className="p-1 px-2 border border-stone-200 text-stone-500 rounded text-[10px] font-bold"
                                      >
                                        Batal
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleEditCustomer(c)}
                                        className="p-1 px-2 border border-stone-200 text-stone-600 rounded text-[10px] font-bold"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => setDeletingCustomerId(c.id)}
                                        className="p-1 px-2 border border-rose-200 text-rose-600 rounded text-[10px] font-bold"
                                      >
                                        Hapus
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="text-[11px] text-stone-500">
                                <strong>Alamat:</strong> {c.address || "-"}
                              </div>
                              <div className="text-[11px] text-stone-500 flex justify-between items-center">
                                <span>WhatsApp: <strong>{c.whatsapp || "-"}</strong></span>
                                {c.gpsLocation && <span className="text-[10px] text-emerald-600 font-mono">📍 {c.gpsLocation}</span>}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Advanced Filter Panel & Graphic mini analytics */}
        <div className="space-y-6">
          
          {/* Advanced Filter Box */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <h4 className="font-display text-sm font-extrabold uppercase tracking-wider text-emerald-950 dark:text-emerald-400 flex items-center gap-2">
              <Filter className="h-4.5 w-4.5 text-amber-600" />
              <span>Filter & Saring Data</span>
            </h4>

            <div className="space-y-3 font-sans text-xs">
              
              {/* Date picker */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Tanggal Pesanan</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 py-2.5 pl-9 pr-3 text-xs outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 focus:border-emerald-800 focus:ring-1"
                  />
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Status Orderan</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 py-2.5 px-3 text-xs outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 focus:border-emerald-800"
                >
                  <option value="ALL">Semua Status (All Statuses)</option>
                  {Object.values(OrderStatus).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Sales Rep Selector */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Petugas Sales</label>
                <select
                  value={salesFilter}
                  onChange={(e) => setSalesFilter(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 py-2.5 px-3 text-xs outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 focus:border-emerald-800"
                >
                  <option value="ALL">Semua Staff Sales (All Sales)</option>
                  {salesNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Min Sales Value Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nilai Transaksi Minimal</label>
                  <span className="text-[10px] font-bold font-mono text-emerald-800 dark:text-amber-500">Rp {minSalesFilter.toLocaleString("id-ID")}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="500000"
                  value={minSalesFilter}
                  onChange={(e) => setMinSalesFilter(Number(e.target.value))}
                  className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-800 dark:accent-amber-500 dark:bg-stone-800"
                />
              </div>

              {/* Reset Filters button */}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                  setSalesFilter("ALL");
                  setDateFilter("");
                  setMinSalesFilter(0);
                }}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-600 dark:text-stone-300 font-bold rounded-xl transition"
              >
                Reset Semua Filter (Clear Filters)
              </button>

            </div>
          </div>

          {/* Premium Handcrafted SVG Analytics Chart */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <h4 className="font-display text-sm font-extrabold uppercase tracking-wider text-emerald-950 dark:text-emerald-400 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-700" />
              <span>Trend Penjualan (Mingguan)</span>
            </h4>
            <span className="text-[10px] text-stone-400 block -mt-2">Satuan: Ribu Rupiah (K)</span>

            {/* Custom SVG Line Chart with Grid lines and hover tooltips */}
            <div className="pt-2">
              <svg viewBox="0 0 300 150" className="w-full h-auto">
                {/* Horizontal Grid lines */}
                <line x1="30" y1="20" x2="290" y2="20" stroke="#f0eee9" strokeWidth="1" strokeDasharray="3,3" className="dark:stroke-stone-800" />
                <line x1="30" y1="60" x2="290" y2="60" stroke="#f0eee9" strokeWidth="1" strokeDasharray="3,3" className="dark:stroke-stone-800" />
                <line x1="30" y1="100" x2="290" y2="100" stroke="#f0eee9" strokeWidth="1" strokeDasharray="3,3" className="dark:stroke-stone-800" />
                <line x1="30" y1="130" x2="290" y2="130" stroke="#e7e5e4" strokeWidth="1" className="dark:stroke-stone-800" />

                {/* Y Axis Labels */}
                <text x="5" y="24" className="fill-stone-400 dark:fill-stone-600" style={{ fontSize: "7px", fontFamily: "monospace" }}>
                  {(maxChartValue).toFixed(0)}K
                </text>
                <text x="5" y="64" className="fill-stone-400 dark:fill-stone-600" style={{ fontSize: "7px", fontFamily: "monospace" }}>
                  {(maxChartValue / 2).toFixed(0)}K
                </text>
                <text x="5" y="104" className="fill-stone-400 dark:fill-stone-600" style={{ fontSize: "7px", fontFamily: "monospace" }}>
                  {(maxChartValue / 4).toFixed(0)}K
                </text>
                <text x="5" y="134" className="fill-stone-400 dark:fill-stone-600" style={{ fontSize: "7px", fontFamily: "monospace" }}>0K</text>

                {/* Draw Bar Columns */}
                {chartData.map((d, index) => {
                  const barWidth = 18;
                  const spacing = 36;
                  const x = 36 + index * spacing;
                  const heightPercentage = d.total / maxChartValue;
                  const y = 130 - (heightPercentage * 110);
                  const barHeight = Math.max(heightPercentage * 110, 2);

                  return (
                    <g key={index}>
                      {/* Bar columns */}
                      <rect
                        x={x - barWidth / 2}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="3"
                        className="fill-emerald-800/20 dark:fill-amber-500/20 stroke-emerald-900/40 dark:stroke-amber-500/40 hover:fill-emerald-800 dark:hover:fill-amber-500 cursor-pointer transition-colors"
                        strokeWidth="1"
                      />
                      
                      {/* Interactive dot */}
                      <circle
                        cx={x}
                        cy={y}
                        r="3"
                        className="fill-amber-500 dark:fill-emerald-400"
                      />

                      {/* X Axis label */}
                      <text
                        x={x}
                        y="145"
                        textAnchor="middle"
                        className="fill-stone-500 dark:fill-stone-400 font-semibold"
                        style={{ fontSize: "8px" }}
                      >
                        {d.date}
                      </text>

                      {/* Floating value text above */}
                      {d.total > 0 && (
                        <text
                          x={x}
                          y={y - 5}
                          textAnchor="middle"
                          className="fill-emerald-950 dark:fill-amber-400 font-bold font-mono"
                          style={{ fontSize: "7px" }}
                        >
                          Rp{d.total.toFixed(0)}K
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
            
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-950 text-xs text-emerald-800 dark:text-emerald-400 flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-700 dark:text-amber-500" />
              <span>Sistem diperbarui secara real-time berdasarkan pesanan terbaru yang dikonfirmasi oleh Sales.</span>
            </div>
          </div>

        </div>

      </div>

      {/* Elegant Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingOrderId(null)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-6 overflow-hidden"
            >
              {/* Accent colored header */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl text-rose-600 dark:text-rose-400 shrink-0">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-base text-stone-900 dark:text-stone-100">
                    Konfirmasi Hapus Sales Order
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Tindakan ini tidak dapat dibatalkan dan data transaksi akan dihapus secara permanen dari sistem.
                  </p>
                </div>
              </div>

              {/* Details card inside modal */}
              {(() => {
                const order = orders.find(o => o.id === deletingOrderId);
                if (!order) return null;
                return (
                  <div className="mt-4 p-4 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-200/60 dark:border-stone-800/60 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-stone-400 font-medium">Nomor Order:</span>
                      <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400 font-medium">Pelanggan:</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200">{order.customerInfo.name}</span>
                    </div>
                    {order.customerInfo.storeName && (
                      <div className="flex justify-between">
                        <span className="text-stone-400 font-medium">Toko:</span>
                        <span className="text-stone-600 dark:text-stone-300">{order.customerInfo.storeName}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-stone-400 font-medium">Sales Rep:</span>
                      <span className="text-stone-600 dark:text-stone-300">{order.salesName}</span>
                    </div>
                    <div className="flex justify-between border-t border-stone-200/50 dark:border-stone-800/50 pt-2 mt-1">
                      <span className="text-stone-400 font-medium">Total Nilai:</span>
                      <span className="font-bold text-emerald-800 dark:text-amber-500">
                        Rp {order.paymentSummary.grandTotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Modal Action buttons */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingOrderId(null)}
                  className="px-4 py-2 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 rounded-xl text-xs font-bold hover:bg-stone-50 dark:hover:bg-stone-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (deletingOrderId) {
                      onDeleteOrder(deletingOrderId);
                      setDeletingOrderId(null);
                    }
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Ya, Hapus Permanen</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
