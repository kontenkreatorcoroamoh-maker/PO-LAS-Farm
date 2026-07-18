/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { SalesOrder, User, UserRole } from "./types";
import { 
  getCurrentUserFromStorage, setCurrentUserInStorage, 
  getOrdersFromStorage, saveOrdersToStorage 
} from "./data";
import Header from "./components/Header";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import OrderForm from "./components/OrderForm";
import Settings from "./components/Settings";

export default function App() {
  // Session States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  
  // Navigation View State
  const [view, setView] = useState<"DASHBOARD" | "ORDER_FORM" | "SETTINGS">("DASHBOARD");
  const [orderToEdit, setOrderToEdit] = useState<SalesOrder | null>(null);
  
  // Theme Toggle State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("las_farm_theme");
    return saved === "dark";
  });

  // Apply dark mode theme class to document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("las_farm_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("las_farm_theme", "light");
    }
  }, [darkMode]);

  // Load session & orders on mount
  useEffect(() => {
    const user = getCurrentUserFromStorage();
    if (user) {
      setCurrentUser(user);
    }
    const storedOrders = getOrdersFromStorage();
    setOrders(storedOrders);
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentUserInStorage(user, true); // remember session
    // Refresh orders
    setOrders(getOrdersFromStorage());
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserInStorage(null);
    setView("DASHBOARD");
  };

  const handleNewOrder = () => {
    setOrderToEdit(null);
    setView("ORDER_FORM");
  };

  const handleEditOrder = (order: SalesOrder) => {
    setOrderToEdit(order);
    setView("ORDER_FORM");
  };

  const handleDeleteOrder = (orderId: string) => {
    const updated = orders.filter((o) => o.id !== orderId);
    setOrders(updated);
    saveOrdersToStorage(updated);
  };

  const handleSaveOrder = (savedOrder: SalesOrder) => {
    let updatedOrders = [...orders];
    const existsIdx = orders.findIndex((o) => o.id === savedOrder.id);
    
    if (existsIdx > -1) {
      updatedOrders[existsIdx] = savedOrder;
    } else {
      // Add as first element so it shows on top of recent list
      updatedOrders = [savedOrder, ...updatedOrders];
    }
    
    setOrders(updatedOrders);
    saveOrdersToStorage(updatedOrders);
    setView("DASHBOARD");
    
    // Smooth scroll back to top of dashboard
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefreshData = () => {
    setOrders(getOrdersFromStorage());
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 dark:bg-stone-950 dark:text-stone-100 transition-colors duration-300 font-sans antialiased">
      
      {/* Header Container */}
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        onRefreshData={handleRefreshData}
        onOpenSettings={() => setView("SETTINGS")}
        view={view}
      />

      {/* Primary Routing Body */}
      <main className="pb-12">
        {!currentUser ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : view === "DASHBOARD" ? (
          <Dashboard 
            orders={orders}
            currentUser={currentUser}
            onNewOrder={handleNewOrder}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteOrder}
            onRefresh={handleRefreshData}
          />
        ) : view === "SETTINGS" ? (
          <Settings 
            currentUser={currentUser}
            onBack={() => setView("DASHBOARD")}
            onRefreshData={handleRefreshData}
            orders={orders}
          />
        ) : (
          <OrderForm 
            orderToEdit={orderToEdit}
            currentUser={currentUser}
            onBack={() => setView("DASHBOARD")}
            onSave={handleSaveOrder}
          />
        )}
      </main>

    </div>
  );
}
