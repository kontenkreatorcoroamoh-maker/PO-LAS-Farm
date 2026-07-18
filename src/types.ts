/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = "Admin",
  SALES = "Sales",
  MANAGER = "Manager"
}

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Product {
  id: string;
  name: string;
  unit: string;
  price: number;
}

export interface OrderItem {
  id: string; // unique item id
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  discount: number; // percentage or fixed? Let's use fixed Rp discount or percentage. Let's make it fixed discount amount per unit.
  subtotal: number;
  notes: string;
}

export enum PaymentMethod {
  CASH = "Cash",
  TRANSFER = "Bank Transfer",
  QRIS = "QRIS",
  CREDIT = "Credit (Tempo)"
}

export enum OrderStatus {
  NEW = "New",
  PROCESSING = "Processing",
  PARTIAL = "Partially Delivered",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled"
}

export interface CustomerInfo {
  name: string;
  storeName: string;
  address: string;
  whatsapp: string;
  gpsLocation?: string;
}

export interface Customer {
  id: string;
  name: string;
  storeName: string;
  address: string;
  whatsapp: string;
  gpsLocation?: string;
}

export interface DeliveryInfo {
  deliveryDate: string;
  deliveryTime: string;
  deliveryMethod: "Pickup" | "LAS Farm Delivery" | "Courier";
  recipientName: string;
  recipientPhone: string;
  deliveryNotes: string;
}

export interface PaymentSummary {
  subtotal: number;
  discount: number; // overall discount
  shippingCost: number;
  tax: number; // 11% or similar
  grandTotal: number;
}

export interface SignatureData {
  name: string;
  pngBase64?: string; // canvas drawing as dataURL
  signedAt?: string;
}

export interface SalesOrder {
  id: string; // document id
  orderNumber: string;
  orderDate: string;
  salesName: string;
  orderPeriodFrom: string;
  orderPeriodUntil: string;
  customerInfo: CustomerInfo;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  items: OrderItem[];
  deliveryInfo: DeliveryInfo;
  paymentSummary: PaymentSummary;
  generalNotes: string;
  signatures: {
    customer: SignatureData;
    admin: SignatureData;
    manager: SignatureData;
  };
  locked: boolean;
  verificationCode: string; // random UUID/string for QR verification
  createdAt: string;
  updatedAt: string;
}

export interface CompanySettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  taxRate: number;
}

