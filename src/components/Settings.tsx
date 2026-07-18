/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { CompanySettings, User, UserRole, Product } from "../types";
import { 
  getCompanySettingsFromStorage, saveCompanySettingsToStorage, 
  resetAllDataToDefault, getProductsFromStorage, saveProductsToStorage,
  PRESET_USERS, clearAllTransactions
} from "../data";
import { 
  Building, MapPin, Phone, Mail, Percent, Save, RotateCcw, 
  Trash2, ShieldAlert, CheckCircle, ArrowLeft, Package, UserCheck, Eye, EyeOff
} from "lucide-react";

interface SettingsProps {
  currentUser: User;
  onBack: () => void;
  onRefreshData: () => void;
}

export default function Settings({ currentUser, onBack, onRefreshData }: SettingsProps) {
  // Company settings states
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Products manager states
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  // Security and Reset state
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [isResetSuccess, setIsResetSuccess] = useState(false);
  const [transConfirmText, setTransConfirmText] = useState("");
  const [isTransResetSuccess, setIsTransResetSuccess] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [showPassMap, setShowPassMap] = useState<Record<string, boolean>>({});
  
  const [errorMsg, setErrorMsg] = useState("");
  const [showTransConfirmModal, setShowTransConfirmModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // Initialize
  useEffect(() => {
    const current = getCompanySettingsFromStorage();
    setName(current.name);
    setTagline(current.tagline);
    setAddress(current.address);
    setPhone(current.phone);
    setEmail(current.email);

    setProducts(getProductsFromStorage());
  }, []);

  const handleSaveCompanySettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Authorization check
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.MANAGER) {
      setErrorMsg("Error: Hanya Admin atau Manager yang diperbolehkan mengubah Pengaturan Kantor.");
      setTimeout(() => setErrorMsg(""), 5000);
      return;
    }

    const payload: CompanySettings = {
      name,
      tagline,
      address,
      phone,
      email,
      taxRate: 0 // Tax rate is hardcoded to 0 (PPN dihilangkan)
    };

    saveCompanySettingsToStorage(payload);
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 3000);
    onRefreshData();
  };

  const triggerClearTransactions = () => {
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.MANAGER) {
      setErrorMsg("Error: Hanya Admin atau Manager yang memiliki otorisasi untuk menghapus seluruh data transaksi!");
      setTimeout(() => setErrorMsg(""), 5000);
      return;
    }

    if (transConfirmText.toUpperCase() !== "HAPUS") {
      setErrorMsg("Masukkan kata konfirmasi 'HAPUS' dengan benar untuk melakukan tindakan ini.");
      setTimeout(() => setErrorMsg(""), 5000);
      return;
    }

    setShowTransConfirmModal(true);
  };

  const handleClearTransactionsConfirm = () => {
    clearAllTransactions();
    setIsTransResetSuccess(true);
    setTransConfirmText("");
    setShowTransConfirmModal(false);
    onRefreshData();
    setTimeout(() => setIsTransResetSuccess(false), 5000);
  };

  const triggerResetData = () => {
    if (currentUser.role !== UserRole.ADMIN) {
      setErrorMsg("Error: Keamanan ERP - Hanya pemilik dengan role Admin yang memiliki otorisasi penuh untuk mereset seluruh database!");
      setTimeout(() => setErrorMsg(""), 5000);
      return;
    }

    if (resetConfirmText.toUpperCase() !== "RESET") {
      setErrorMsg("Masukkan kata konfirmasi 'RESET' dengan benar untuk melakukan tindakan ini.");
      setTimeout(() => setErrorMsg(""), 5000);
      return;
    }

    setShowResetConfirmModal(true);
  };

  const handleResetDataConfirm = () => {
    resetAllDataToDefault();
    setIsResetSuccess(true);
    setResetConfirmText("");
    setShowResetConfirmModal(false);
    onRefreshData();
    
    // reload lists
    const current = getCompanySettingsFromStorage();
    setName(current.name);
    setTagline(current.tagline);
    setAddress(current.address);
    setPhone(current.phone);
    setEmail(current.email);
    setProducts(getProductsFromStorage());

    setTimeout(() => setIsResetSuccess(false), 5000);
  };

  const handleEditProductPrice = (id: string, currentPrice: number) => {
    setEditingProductId(id);
    setEditPrice(currentPrice);
  };

  const handleSaveProductPrice = (id: string) => {
    const updated = products.map(p => {
      if (p.id === id) {
        return { ...p, price: Number(editPrice) || 0 };
      }
      return p;
    });
    setProducts(updated);
    saveProductsToStorage(updated);
    setEditingProductId(null);
    onRefreshData();
  };

  const togglePasswordVisibility = (uid: string) => {
    setShowPassMap(prev => ({
      ...prev,
      [uid]: !prev[uid]
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-20" id="erp-settings-page">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-stone-200 dark:border-stone-800 pb-4 gap-4 no-print">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition"
            id="settings-back-btn"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-extrabold text-emerald-950 dark:text-emerald-400">
              Pengaturan ERP & Database (Settings)
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Kelola alamat kantor cabang, harga master produk, dan utilitas manajemen data
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-900 rounded-2xl p-4 flex items-center space-x-3 text-rose-900 dark:text-rose-300">
          <ShieldAlert className="h-6 w-6 shrink-0 text-rose-600" />
          <div>
            <h4 className="font-bold text-sm">Terjadi Kesalahan / Penolakan Akses</h4>
            <p className="text-xs">{errorMsg}</p>
          </div>
        </div>
      )}

      {isTransResetSuccess && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-900 rounded-2xl p-4 flex items-center space-x-3 text-amber-900 dark:text-amber-300 animate-pulse">
          <CheckCircle className="h-6 w-6 shrink-0 text-amber-600" />
          <div>
            <h4 className="font-bold text-sm">Data Transaksi Berhasil Dihapus!</h4>
            <p className="text-xs">Seluruh riwayat pesanan penjualan (Sales Orders) telah dibersihkan secara total dan permanen dari sistem.</p>
          </div>
        </div>
      )}

      {isResetSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-900 rounded-2xl p-4 flex items-center space-x-3 text-emerald-900 dark:text-emerald-300 animate-pulse">
          <CheckCircle className="h-6 w-6 shrink-0 text-emerald-600" />
          <div>
            <h4 className="font-bold text-sm">Database Berhasil Direstrukturisasi!</h4>
            <p className="text-xs">Seluruh transaksi (Sales Order) lama telah dihapus, dan data master produk telah dikembalikan ke standar awal pabrik.</p>
          </div>
        </div>
      )}

      {isSavedSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-900 rounded-2xl p-4 flex items-center space-x-3 text-emerald-900 dark:text-emerald-300">
          <CheckCircle className="h-6 w-6 shrink-0 text-emerald-600" />
          <div>
            <h4 className="font-bold text-sm">Pengaturan Kantor Berhasil Disimpan!</h4>
            <p className="text-xs">Informasi perusahaan baru telah diterapkan secara real-time pada pembuatan faktur, dashboard, dan dokumen PDF cetak.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left columns (2/3 width) - Forms & Data Masters */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Company/Office Information Settings */}
          <form onSubmit={handleSaveCompanySettings} className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-sm text-emerald-950 dark:text-emerald-400 uppercase tracking-wider border-b border-stone-100 dark:border-stone-800 pb-3 flex items-center space-x-2">
              <Building className="h-5 w-5 text-emerald-700" />
              <span>Informasi Instansi & Alamat Kantor (Branch Details)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Nama Perusahaan / Kandang</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="LAS FARM"
                    className="w-full rounded-xl border border-stone-200 py-3 px-4 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 focus:border-emerald-800 font-semibold pl-10"
                  />
                  <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Tagline Slogan Perusahaan</label>
                <input
                  type="text"
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Premium Kampung Chicken Eggs"
                  className="w-full rounded-xl border border-stone-200 py-3 px-4 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 focus:border-emerald-800 font-semibold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Alamat Kantor / Surat (Alamat Lengkap) *</label>
                <div className="relative">
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Masukkan alamat kantor yang akan dicetak di header PDF surat pesanan..."
                    className="w-full rounded-xl border border-stone-200 py-3 pl-10 pr-4 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 focus:border-emerald-800 font-semibold resize-none"
                  />
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Telepon Kantor (Sales Support)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 811-300-300"
                    className="w-full rounded-xl border border-stone-200 py-3 px-4 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 focus:border-emerald-800 font-semibold pl-10"
                  />
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Email Resmi</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@lasfarm.com"
                    className="w-full rounded-xl border border-stone-200 py-3 px-4 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 focus:border-emerald-800 font-semibold pl-10"
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-5 py-3 text-xs font-bold bg-emerald-800 hover:bg-emerald-950 text-white rounded-xl transition cursor-pointer"
                id="save-company-settings-btn"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </form>

          {/* Master Product Prices Manager */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-sm text-emerald-950 dark:text-emerald-400 uppercase tracking-wider border-b border-stone-100 dark:border-stone-800 pb-3 flex items-center space-x-2">
              <Package className="h-5 w-5 text-emerald-700" />
              <span>Kelola Harga Master Produk (Product Price Manager)</span>
            </h3>

            <p className="text-xs text-stone-500">
              Ubah harga master telur di bawah ini. Harga ini akan otomatis diisi sebagai nilai standar saat petugas Sales mendaftarkan produk di formulir baru.
            </p>

            <div className="overflow-x-auto rounded-xl border border-stone-100 dark:border-stone-800 font-sans text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 dark:bg-stone-950 text-stone-500 font-bold border-b border-stone-100 dark:border-stone-800">
                    <th className="py-2.5 px-3">Nama Produk</th>
                    <th className="py-2.5 px-3">Satuan</th>
                    <th className="py-2.5 px-3 text-right">Harga Satuan (IDR)</th>
                    <th className="py-2.5 px-3 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {products.map(p => (
                    <tr key={p.id} className="align-middle hover:bg-stone-50/50">
                      <td className="py-3 px-3 font-semibold text-stone-800 dark:text-stone-200">{p.name}</td>
                      <td className="py-3 px-3 text-stone-500">{p.unit}</td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-900 dark:text-amber-500">
                        {editingProductId === p.id ? (
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value) || 0)}
                            className="w-24 text-right py-1 px-1.5 border border-stone-200 rounded font-bold"
                          />
                        ) : (
                          `Rp ${p.price.toLocaleString("id-ID")}`
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {editingProductId === p.id ? (
                          <button
                            onClick={() => handleSaveProductPrice(p.id)}
                            className="px-2.5 py-1 text-[10px] font-bold bg-emerald-700 text-white rounded hover:bg-emerald-800"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEditProductPrice(p.id, p.price)}
                            className="px-2.5 py-1 text-[10px] font-bold border border-stone-200 hover:bg-stone-100 dark:border-stone-800 text-stone-700 dark:text-stone-300 rounded"
                          >
                            Edit Harga
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right column (1/3 width) - Safety Reset & Preset Users Logins Reference */}
        <div className="space-y-6">
          
          {/* Menu Hapus Data Transaksi */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <h4 className="font-display text-xs font-extrabold uppercase tracking-widest text-amber-800 border-b border-stone-100 dark:border-stone-800 pb-2 flex items-center space-x-1.5">
              <Trash2 className="h-4.5 w-4.5 text-amber-600" />
              <span>Hapus Data Transaksi</span>
            </h4>

            <p className="text-xs text-stone-500 leading-relaxed">
              Membersihkan seluruh riwayat pesanan penjualan (Sales Orders) yang telah disimpan. Data master produk dan pengaturan alamat kantor akan tetap aman.
            </p>

            {currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.MANAGER ? (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 p-3 rounded-xl text-[11px] text-rose-800 dark:text-rose-400 font-medium">
                Sistem Terkunci: Hanya pengguna dengan otorisasi level <strong>ADMIN</strong> atau <strong>MANAGER</strong> yang dapat menghapus transaksi.
              </div>
            ) : (
              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                    Ketik konfirmasi kata "HAPUS"
                  </label>
                  <input
                    type="text"
                    value={transConfirmText}
                    onChange={(e) => setTransConfirmText(e.target.value)}
                    placeholder="HAPUS"
                    className="w-full rounded-xl border border-stone-200 py-2.5 px-3 outline-none text-center font-mono font-bold dark:border-stone-800 dark:bg-stone-950 focus:border-amber-600 text-amber-700"
                  />
                </div>

                <button
                  type="button"
                  onClick={triggerClearTransactions}
                  disabled={transConfirmText.toUpperCase() !== "HAPUS"}
                  className={`w-full flex items-center justify-center space-x-1.5 py-3 font-bold rounded-xl transition text-xs ${
                    transConfirmText.toUpperCase() === "HAPUS"
                      ? "bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                      : "bg-stone-100 text-stone-400 dark:bg-stone-800 cursor-not-allowed"
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>HAPUS SELURUH TRANSAKSI</span>
                </button>
              </div>
            )}
          </div>

          {/* Safety Database Reset Section */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <h4 className="font-display text-xs font-extrabold uppercase tracking-widest text-rose-800 border-b border-stone-100 dark:border-stone-800 pb-2 flex items-center space-x-1.5">
              <ShieldAlert className="h-4.5 w-4.5 text-rose-600 animate-bounce" />
              <span>Safety Database Reset</span>
            </h4>

            <p className="text-xs text-stone-500 leading-relaxed">
              Mereset seluruh data akan mengembalikan database internal ERP ini ke pengaturan awal (pabrik). Semua riwayat pesanan (Sales Order) yang telah disimpan akan terhapus secara permanen.
            </p>

            {currentUser.role !== UserRole.ADMIN ? (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 p-3 rounded-xl text-[11px] text-rose-800 dark:text-rose-400 font-medium">
                Sistem Terkunci: Hanya pengguna dengan otorisasi level <strong>ADMIN</strong> yang dapat mereset database. Akun Anda saat ini ({currentUser.role}) tidak berwenang.
              </div>
            ) : (
              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                    Ketik konfirmasi kata "RESET"
                  </label>
                  <input
                    type="text"
                    value={resetConfirmText}
                    onChange={(e) => setResetConfirmText(e.target.value)}
                    placeholder="RESET"
                    className="w-full rounded-xl border border-stone-200 py-2.5 px-3 outline-none text-center font-mono font-bold dark:border-stone-800 dark:bg-stone-950 focus:border-rose-600 text-rose-700"
                  />
                </div>

                <button
                  type="button"
                  onClick={triggerResetData}
                  disabled={resetConfirmText.toUpperCase() !== "RESET"}
                  className={`w-full flex items-center justify-center space-x-1.5 py-3 font-bold rounded-xl transition text-xs ${
                    resetConfirmText.toUpperCase() === "RESET"
                      ? "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                      : "bg-stone-100 text-stone-400 dark:bg-stone-800 cursor-not-allowed"
                  }`}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>RESET DATABASE SEKARANG</span>
                </button>
              </div>
            )}
          </div>

          {/* User Account Login references (ERP Multi-role Helper) */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <h4 className="font-display text-xs font-extrabold uppercase tracking-widest text-emerald-950 dark:text-emerald-400 border-b border-stone-100 dark:border-stone-800 pb-2 flex items-center space-x-1.5">
              <UserCheck className="h-4.5 w-4.5 text-amber-600" />
              <span>Multi-Role Account Reference</span>
            </h4>

            <p className="text-xs text-stone-500">
              Berikut daftar akun demo ERP LAS Farm. Anda dapat keluar lalu masuk kembali dengan peran-peran ini untuk menguji hak akses otorisasi tanda tangan.
            </p>

            <div className="space-y-2 text-xs">
              {PRESET_USERS.map(user => (
                <div key={user.uid} className="p-3 border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/40 rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-stone-800 dark:text-stone-200">{user.name}</span>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600">
                      {user.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 flex flex-col font-mono">
                    <span>Email: {user.email}</span>
                    <span className="flex items-center justify-between mt-1">
                      <span>Password: <strong className="font-bold text-emerald-800 dark:text-amber-500">{showPassMap[user.uid] ? user.passwordKey : "••••••••"}</strong></span>
                      <button
                        onClick={() => togglePasswordVisibility(user.uid)}
                        className="p-1 text-stone-400 hover:text-stone-600 transition"
                      >
                        {showPassMap[user.uid] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Transaction Deletion Custom Confirmation Modal */}
      {showTransConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center space-x-3 text-amber-600 dark:text-amber-500">
              <ShieldAlert className="h-8 w-8 shrink-0" />
              <div>
                <h3 className="font-display font-extrabold text-lg text-amber-950 dark:text-amber-400">Konfirmasi Penghapusan</h3>
                <p className="text-xs text-stone-500">Tindakan ini permanen dan tidak dapat diurungkan!</p>
              </div>
            </div>
            
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border border-stone-100 dark:border-stone-800 font-medium">
              Apakah Anda yakin ingin menghapus <strong>seluruh data transaksi (Sales Orders)</strong>? Semua riwayat pesanan pelanggan dan tanda tangan digital akan dibersihkan secara total.
            </p>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowTransConfirmModal(false)}
                className="flex-1 py-2.5 font-bold text-xs bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-600 dark:text-stone-300 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleClearTransactionsConfirm}
                className="flex-1 py-2.5 font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition flex items-center justify-center space-x-1"
              >
                <Trash2 className="h-4 w-4" />
                <span>Ya, Hapus Semua</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Database Reset Custom Confirmation Modal */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-500">
              <ShieldAlert className="h-8 w-8 shrink-0" />
              <div>
                <h3 className="font-display font-extrabold text-lg text-rose-950 dark:text-rose-400">RESET TOTAL DATABASE</h3>
                <p className="text-xs text-stone-500">Tindakan ini sangat krusial!</p>
              </div>
            </div>
            
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border border-stone-100 dark:border-stone-800 font-medium font-mono">
              PERINGATAN KRITIKAL: Seluruh riwayat penjualan (Sales Orders) akan dikosongkan secara permanen, dan data master produk serta alamat kantor akan dikembalikan ke pengaturan standar pabrik (default).
            </p>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-1 py-2.5 font-bold text-xs bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-600 dark:text-stone-300 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetDataConfirm}
                className="flex-1 py-2.5 font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition flex items-center justify-center space-x-1"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Ya, Reset Total</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
