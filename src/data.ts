/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, SalesOrder, User, UserRole, PaymentMethod, OrderStatus, CompanySettings } from "./types";

// Preset users
export const PRESET_USERS: (User & { passwordKey: string })[] = [
  {
    uid: "usr-admin-1",
    email: "admin@lasfarm.com",
    name: "Budi Santoso (Admin)",
    role: UserRole.ADMIN,
    passwordKey: "admin123"
  },
  {
    uid: "usr-sales-1",
    email: "sales@lasfarm.com",
    name: "Hendra Wijaya (Sales)",
    role: UserRole.SALES,
    passwordKey: "sales123"
  },
  {
    uid: "usr-manager-1",
    email: "manager@lasfarm.com",
    name: "Siti Rahma (Manager)",
    role: UserRole.MANAGER,
    passwordKey: "manager123"
  }
];

// Default products for LAS Farm
export const DEFAULT_PRODUCTS: Product[] = [
  { id: "prod-1", name: "Telur Ayam Kampung Super (Grade A)", unit: "Tray (30 Pcs)", price: 95000 },
  { id: "prod-2", name: "Telur Ayam Kampung Premium (Grade B)", unit: "Tray (30 Pcs)", price: 85000 },
  { id: "prod-3", name: "Telur Omega-3 Gold (Nutrisi Tinggi)", unit: "Pack (10 Pcs)", price: 42000 },
  { id: "prod-4", name: "Telur Ayam Kampung Organik", unit: "Pack (10 Pcs)", price: 38000 },
  { id: "prod-5", name: "Telur Omega-3 Premium Large", unit: "Tray (30 Pcs)", price: 120000 },
  { id: "prod-6", name: "Telur Ayam Kampung Asli LAS", unit: "Pack (10 Pcs)", price: 32000 }
];

// Seed sales orders
export const SEED_ORDERS: SalesOrder[] = [
  {
    id: "so-1",
    orderNumber: "SO-20260718-001",
    orderDate: "2026-07-18",
    salesName: "Hendra Wijaya",
    orderPeriodFrom: "2026-07-18",
    orderPeriodUntil: "2026-07-25",
    customerInfo: {
      name: "Agus Pratama",
      storeName: "Toko Sembako Makmur",
      address: "Jl. Diponegoro No. 45, Surabaya",
      whatsapp: "+6281234567890",
      gpsLocation: "-7.250445, 112.768845"
    },
    paymentMethod: PaymentMethod.TRANSFER,
    status: OrderStatus.PROCESSING,
    items: [
      {
        id: "item-1-1",
        productName: "Telur Ayam Kampung Super (Grade A)",
        quantity: 10,
        unit: "Tray (30 Pcs)",
        price: 95000,
        discount: 5000,
        subtotal: 900000,
        notes: "Kirim pagi hari sebelum jam 10"
      },
      {
        id: "item-1-2",
        productName: "Telur Omega-3 Gold (Nutrisi Tinggi)",
        quantity: 20,
        unit: "Pack (10 Pcs)",
        price: 42000,
        discount: 2000,
        subtotal: 800000,
        notes: "Gunakan box pendingin"
      }
    ],
    deliveryInfo: {
      deliveryDate: "2026-07-19",
      deliveryTime: "09:00",
      deliveryMethod: "LAS Farm Delivery",
      recipientName: "Agus Pratama",
      recipientPhone: "+6281234567890",
      deliveryNotes: "Masuk lewat gerbang samping"
    },
    paymentSummary: {
      subtotal: 1700000,
      discount: 0,
      shippingCost: 25000,
      tax: 187000, // 11% of (1700000 + 25000) or similar
      grandTotal: 1912000
    },
    generalNotes: "Pesanan rutin mingguan untuk katering hotel dekat toko.",
    signatures: {
      customer: { name: "Agus Pratama", pngBase64: "", signedAt: "" },
      admin: { name: "Budi Santoso", pngBase64: "", signedAt: "" },
      manager: { name: "Siti Rahma", pngBase64: "", signedAt: "" }
    },
    locked: false,
    verificationCode: "LAS-VERIFY-8E92B",
    createdAt: "2026-07-18T08:30:00Z",
    updatedAt: "2026-07-18T08:30:00Z"
  },
  {
    id: "so-2",
    orderNumber: "SO-20260718-002",
    orderDate: "2026-07-18",
    salesName: "Hendra Wijaya",
    orderPeriodFrom: "2026-07-18",
    orderPeriodUntil: "2026-07-22",
    customerInfo: {
      name: "Ibu Linda",
      storeName: "Bakery & Cake Seruni",
      address: "Ruko Dharmahusada Mas Block C-12, Surabaya",
      whatsapp: "+6281987654321",
      gpsLocation: "-7.268840, 112.784402"
    },
    paymentMethod: PaymentMethod.QRIS,
    status: OrderStatus.COMPLETED,
    items: [
      {
        id: "item-2-1",
        productName: "Telur Ayam Kampung Premium (Grade B)",
        quantity: 15,
        unit: "Tray (30 Pcs)",
        price: 85000,
        discount: 0,
        subtotal: 1275000,
        notes: "Pilih telur yang bersih dari kotoran"
      }
    ],
    deliveryInfo: {
      deliveryDate: "2026-07-18",
      deliveryTime: "11:00",
      deliveryMethod: "LAS Farm Delivery",
      recipientName: "Staff Linda",
      recipientPhone: "+6281987654321",
      deliveryNotes: "Diterima langsung di dapur roti"
    },
    paymentSummary: {
      subtotal: 1275000,
      discount: 25000,
      shippingCost: 0,
      tax: 137500,
      grandTotal: 1387500
    },
    generalNotes: "Untuk produksi kue lapis surabaya premium.",
    signatures: {
      customer: { name: "Ibu Linda", pngBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", signedAt: "2026-07-18T11:15:00Z" },
      admin: { name: "Budi Santoso", pngBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", signedAt: "2026-07-18T11:20:00Z" },
      manager: { name: "Siti Rahma", pngBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", signedAt: "2026-07-18T11:30:00Z" }
    },
    locked: true,
    verificationCode: "LAS-VERIFY-9C2A4",
    createdAt: "2026-07-18T09:15:00Z",
    updatedAt: "2026-07-18T11:30:00Z"
  },
  {
    id: "so-3",
    orderNumber: "SO-20260715-001",
    orderDate: "2026-07-15",
    salesName: "Hendra Wijaya",
    orderPeriodFrom: "2026-07-15",
    orderPeriodUntil: "2026-07-15",
    customerInfo: {
      name: "Toko Kelontong Jaya",
      storeName: "Toko Kelontong Jaya",
      address: "Pasar Wonokromo Stan No. 12, Surabaya",
      whatsapp: "+6285611223344",
      gpsLocation: ""
    },
    paymentMethod: PaymentMethod.CASH,
    status: OrderStatus.COMPLETED,
    items: [
      {
        id: "item-3-1",
        productName: "Telur Ayam Kampung Asli LAS",
        quantity: 50,
        unit: "Pack (10 Pcs)",
        price: 32000,
        discount: 1000,
        subtotal: 1550000,
        notes: "Dikemas rapi per 10 pack"
      }
    ],
    deliveryInfo: {
      deliveryDate: "2026-07-15",
      deliveryTime: "07:30",
      deliveryMethod: "Pickup",
      recipientName: "Herman (Pemilik)",
      recipientPhone: "+6285611223344",
      deliveryNotes: "Ambil langsung di kandang LAS Farm"
    },
    paymentSummary: {
      subtotal: 1550000,
      discount: 50000,
      shippingCost: 0,
      tax: 165000,
      grandTotal: 1665000
    },
    generalNotes: "Langganan lama, selalu bayar tunai di tempat.",
    signatures: {
      customer: { name: "Herman", pngBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", signedAt: "2026-07-15T07:35:00Z" },
      admin: { name: "Budi Santoso", pngBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", signedAt: "2026-07-15T07:40:00Z" },
      manager: { name: "Siti Rahma", pngBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", signedAt: "2026-07-15T08:00:00Z" }
    },
    locked: true,
    verificationCode: "LAS-VERIFY-1F3D5",
    createdAt: "2026-07-15T07:00:00Z",
    updatedAt: "2026-07-15T08:00:00Z"
  },
  {
    id: "so-4",
    orderNumber: "SO-20260710-001",
    orderDate: "2026-07-10",
    salesName: "Siti Rahma",
    orderPeriodFrom: "2026-07-10",
    orderPeriodUntil: "2026-07-20",
    customerInfo: {
      name: "Restoran Selera Nusantara",
      storeName: "PT. Selera Kuliner Indonesia",
      address: "Mall Galaxy Food Court Lt. 3, Surabaya",
      whatsapp: "+6281133557799",
      gpsLocation: "-7.275521, 112.780121"
    },
    paymentMethod: PaymentMethod.CREDIT,
    status: OrderStatus.PARTIAL,
    items: [
      {
        id: "item-4-1",
        productName: "Telur Omega-3 Premium Large",
        quantity: 30,
        unit: "Tray (30 Pcs)",
        price: 120000,
        discount: 5000,
        subtotal: 3450000,
        notes: "Pengiriman dibagi 2 tahap (tgl 11 dan tgl 18)"
      }
    ],
    deliveryInfo: {
      deliveryDate: "2026-07-11",
      deliveryTime: "08:00",
      deliveryMethod: "LAS Farm Delivery",
      recipientName: "Chef Ahmad",
      recipientPhone: "+6281133557799",
      deliveryNotes: "Kirim ke bagian loading dock mall"
    },
    paymentSummary: {
      subtotal: 3450000,
      discount: 150000,
      shippingCost: 50000,
      tax: 368500,
      grandTotal: 3718500
    },
    generalNotes: "Tempo 14 hari kerja. Tagihan ditujukan ke Finance HO.",
    signatures: {
      customer: { name: "Chef Ahmad", pngBase64: "", signedAt: "" },
      admin: { name: "Budi Santoso", pngBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", signedAt: "2026-07-10T15:00:00Z" },
      manager: { name: "Siti Rahma", pngBase64: "", signedAt: "" }
    },
    locked: false,
    verificationCode: "LAS-VERIFY-4A7C9",
    createdAt: "2026-07-10T14:30:00Z",
    updatedAt: "2026-07-10T15:00:00Z"
  },
  {
    id: "so-5",
    orderNumber: "SO-20260702-001",
    orderDate: "2026-07-02",
    salesName: "Hendra Wijaya",
    orderPeriodFrom: "2026-07-02",
    orderPeriodUntil: "2026-07-05",
    customerInfo: {
      name: "Bapak Hadi",
      storeName: "Kios Telur Hadi Utama",
      address: "Pasar Pucang Anom Kios B-14, Surabaya",
      whatsapp: "+6287766554433",
      gpsLocation: ""
    },
    paymentMethod: PaymentMethod.CASH,
    status: OrderStatus.CANCELLED,
    items: [
      {
        id: "item-5-1",
        productName: "Telur Ayam Kampung Organik",
        quantity: 40,
        unit: "Pack (10 Pcs)",
        price: 38000,
        discount: 0,
        subtotal: 1520000,
        notes: "Batal karena stok gudang pelanggan penuh"
      }
    ],
    deliveryInfo: {
      deliveryDate: "2026-07-03",
      deliveryTime: "06:00",
      deliveryMethod: "Courier",
      recipientName: "Bapak Hadi",
      recipientPhone: "+6287766554433",
      deliveryNotes: ""
    },
    paymentSummary: {
      subtotal: 1520000,
      discount: 0,
      shippingCost: 35000,
      tax: 171050,
      grandTotal: 1726050
    },
    generalNotes: "Dibatalkan atas permintaan pembeli pada H-1 pengiriman.",
    signatures: {
      customer: { name: "", pngBase64: "", signedAt: "" },
      admin: { name: "Budi Santoso", pngBase64: "", signedAt: "" },
      manager: { name: "Siti Rahma", pngBase64: "", signedAt: "" }
    },
    locked: true,
    verificationCode: "LAS-VERIFY-0D2E1",
    createdAt: "2026-07-02T09:00:00Z",
    updatedAt: "2026-07-02T16:45:00Z"
  }
];

// Helper functions for encrypted storage simulation (obfuscated as rot13 or simple base64 string)
const STORAGE_PREFIX = "las_farm_";

function encrypt(data: string): string {
  try {
    return btoa(unescape(encodeURIComponent(data)));
  } catch (e) {
    return data;
  }
}

function decrypt(data: string): string {
  try {
    return decodeURIComponent(escape(atob(data)));
  } catch (e) {
    return data;
  }
}

// Order Operations
export function getOrdersFromStorage(): SalesOrder[] {
  const local = localStorage.getItem(`${STORAGE_PREFIX}orders`);
  if (!local) {
    saveOrdersToStorage(SEED_ORDERS);
    return SEED_ORDERS;
  }
  try {
    const decrypted = decrypt(local);
    return JSON.parse(decrypted);
  } catch (e) {
    // Fail-safe
    return SEED_ORDERS;
  }
}

export function saveOrdersToStorage(orders: SalesOrder[]) {
  const serialized = JSON.stringify(orders);
  localStorage.setItem(`${STORAGE_PREFIX}orders`, encrypt(serialized));
  // Automatic Backup trigger in background (persisting in distinct key)
  localStorage.setItem(`${STORAGE_PREFIX}backup_auto`, encrypt(serialized));
}

// Product Operations
export function getProductsFromStorage(): Product[] {
  const local = localStorage.getItem(`${STORAGE_PREFIX}products`);
  if (!local) {
    localStorage.setItem(`${STORAGE_PREFIX}products`, encrypt(JSON.stringify(DEFAULT_PRODUCTS)));
    return DEFAULT_PRODUCTS;
  }
  try {
    return JSON.parse(decrypt(local));
  } catch (e) {
    return DEFAULT_PRODUCTS;
  }
}

export function saveProductsToStorage(products: Product[]) {
  localStorage.setItem(`${STORAGE_PREFIX}products`, encrypt(JSON.stringify(products)));
}

// User Session Management
export function getCurrentUserFromStorage(): User | null {
  const session = sessionStorage.getItem(`${STORAGE_PREFIX}current_user`);
  if (session) {
    try {
      return JSON.parse(decrypt(session));
    } catch (e) {
      return null;
    }
  }
  // Try localstorage for remember me / auto login
  const local = localStorage.getItem(`${STORAGE_PREFIX}remembered_user`);
  if (local) {
    try {
      return JSON.parse(decrypt(local));
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function setCurrentUserInStorage(user: User | null, rememberMe = false) {
  if (user === null) {
    sessionStorage.removeItem(`${STORAGE_PREFIX}current_user`);
    localStorage.removeItem(`${STORAGE_PREFIX}remembered_user`);
  } else {
    const encrypted = encrypt(JSON.stringify(user));
    sessionStorage.setItem(`${STORAGE_PREFIX}current_user`, encrypted);
    if (rememberMe) {
      localStorage.setItem(`${STORAGE_PREFIX}remembered_user`, encrypted);
    }
  }
}

export function backupDatabase(): string {
  const orders = getOrdersFromStorage();
  const products = getProductsFromStorage();
  const exportPayload = {
    orders,
    products,
    exportedAt: new Date().toISOString(),
    version: "1.0"
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function restoreDatabase(jsonStr: string): boolean {
  try {
    const payload = JSON.parse(jsonStr);
    if (payload && Array.isArray(payload.orders) && Array.isArray(payload.products)) {
      saveOrdersToStorage(payload.orders);
      saveProductsToStorage(payload.products);
      if (payload.companySettings) {
        saveCompanySettingsToStorage(payload.companySettings);
      }
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  name: "LAS FARM",
  tagline: "Premium Kampung Chicken Eggs",
  address: "Dusun Suka Makmur No. 12, Jawa Timur",
  phone: "+62 811-300-300",
  email: "info@lasfarm.com",
  taxRate: 11
};

export function getCompanySettingsFromStorage(): CompanySettings {
  const local = localStorage.getItem(`${STORAGE_PREFIX}company_settings`);
  if (!local) {
    localStorage.setItem(`${STORAGE_PREFIX}company_settings`, encrypt(JSON.stringify(DEFAULT_COMPANY_SETTINGS)));
    return DEFAULT_COMPANY_SETTINGS;
  }
  try {
    return JSON.parse(decrypt(local));
  } catch (e) {
    return DEFAULT_COMPANY_SETTINGS;
  }
}

export function saveCompanySettingsToStorage(settings: CompanySettings) {
  localStorage.setItem(`${STORAGE_PREFIX}company_settings`, encrypt(JSON.stringify(settings)));
}

export function resetAllDataToDefault() {
  localStorage.removeItem(`${STORAGE_PREFIX}orders`);
  localStorage.removeItem(`${STORAGE_PREFIX}products`);
  localStorage.removeItem(`${STORAGE_PREFIX}company_settings`);
  // Seed initial sets
  saveOrdersToStorage(SEED_ORDERS);
  saveProductsToStorage(DEFAULT_PRODUCTS);
  saveCompanySettingsToStorage(DEFAULT_COMPANY_SETTINGS);
}

export function clearAllTransactions() {
  saveOrdersToStorage([]);
}

