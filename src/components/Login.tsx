/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, UserRole } from "../types";
import { PRESET_USERS } from "../data";
import { Egg, Key, Mail, Shield, User as UserIcon, Lock, ChevronRight, CheckCircle } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.SALES);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePresetLogin = (presetEmail: string, presetPass: string) => {
    const user = PRESET_USERS.find(
      (u) => u.email.toLowerCase() === presetEmail.toLowerCase() && u.passwordKey === presetPass
    );
    if (user) {
      onLoginSuccess({
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role
      });
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    const matchedUser = PRESET_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.passwordKey === password
    );

    if (matchedUser) {
      onLoginSuccess({
        uid: matchedUser.uid,
        email: matchedUser.email,
        name: matchedUser.name,
        role: matchedUser.role
      });
    } else {
      // Allow custom simulated login in local storage if registered
      const customUsersLocal = localStorage.getItem("las_farm_registered_users");
      if (customUsersLocal) {
        try {
          const customUsers = JSON.parse(customUsersLocal);
          const customUser = customUsers.find(
            (u: any) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
          );
          if (customUser) {
            onLoginSuccess({
              uid: customUser.uid,
              email: customUser.email,
              name: customUser.name,
              role: customUser.role
            });
            return;
          }
        } catch (e) {}
      }
      setError("Email atau Password salah. Silakan coba akun preset atau daftarkan akun baru.");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password) {
      setError("Semua kolom registrasi wajib diisi.");
      return;
    }

    // Read existing custom users
    const customUsersLocal = localStorage.getItem("las_farm_registered_users");
    let customUsers: any[] = [];
    if (customUsersLocal) {
      try { customUsers = JSON.parse(customUsersLocal); } catch (e) {}
    }

    // Check conflict
    const emailConflict = PRESET_USERS.some(u => u.email.toLowerCase() === email.trim().toLowerCase()) ||
                          customUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
    
    if (emailConflict) {
      setError("Email sudah digunakan. Gunakan email lain.");
      return;
    }

    const newCustomUser = {
      uid: `usr-custom-${Date.now()}`,
      email: email.trim(),
      name: name.trim(),
      role: selectedRole,
      password: password
    };

    customUsers.push(newCustomUser);
    localStorage.setItem("las_farm_registered_users", JSON.stringify(customUsers));

    setSuccess(`Registrasi Berhasil! Akun ${selectedRole} baru terdaftar.`);
    setEmail(newCustomUser.email);
    setPassword(password);
    setTimeout(() => {
      setActiveTab("login");
      setSuccess("");
    }, 1500);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-stone-50 dark:bg-stone-950 transition-colors duration-300" id="login-container">
      <div className="w-full max-w-lg space-y-8">
        
        {/* Brand Banner */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-amber-400 shadow-xl border border-amber-500/30 animate-bounce">
            <Egg className="h-10 w-10 stroke-[1.5]" />
          </div>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-400">
            LAS FARM
          </h2>
          <p className="mt-1 text-sm font-medium text-amber-700 dark:text-amber-500 font-mono uppercase tracking-wider">
            Premium Kampung Chicken Eggs
          </p>
          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
            Sistem Informasi Penjualan & Sales Order
          </p>
        </div>

        {/* Credentials Tab Box */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xl dark:border-stone-800 dark:bg-stone-900 transition-all duration-300">
          
          {/* Tabs header */}
          <div className="flex border-b border-stone-100 dark:border-stone-800 pb-4 mb-6">
            <button
              onClick={() => { setActiveTab("login"); setError(""); }}
              className={`flex-1 text-center pb-2 text-sm font-semibold transition ${
                activeTab === "login"
                  ? "border-b-2 border-emerald-800 text-emerald-900 dark:border-amber-500 dark:text-amber-500"
                  : "text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
              }`}
              id="login-tab-btn"
            >
              Masuk (Sign In)
            </button>
            <button
              onClick={() => { setActiveTab("register"); setError(""); }}
              className={`flex-1 text-center pb-2 text-sm font-semibold transition ${
                activeTab === "register"
                  ? "border-b-2 border-emerald-800 text-emerald-900 dark:border-amber-500 dark:text-amber-500"
                  : "text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
              }`}
              id="register-tab-btn"
            >
              Registrasi Akun
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950 px-4 py-3 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-start space-x-2">
              <Shield className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950 px-4 py-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {activeTab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4" id="login-form">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                  Email Kantor
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sales@lasfarm.com"
                    className="w-full rounded-xl border border-stone-200 py-3.5 pl-10 pr-4 text-sm focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-stone-200 py-3.5 pl-10 pr-4 text-sm focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-900 py-3.5 text-sm font-bold text-white shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition active:scale-98"
                id="submit-login-btn"
              >
                <span>Masuk Ke Sistem</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4" id="register-form">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                    <UserIcon className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Hendra Wijaya"
                    className="w-full rounded-xl border border-stone-200 py-3.5 pl-10 pr-4 text-sm focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                  Email Akun
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@lasfarm.com"
                    className="w-full rounded-xl border border-stone-200 py-3.5 pl-10 pr-4 text-sm focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                  Pilih Role Otoritas
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(UserRole).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                        selectedRole === role
                          ? "bg-emerald-800 text-white border-emerald-800 dark:bg-amber-500 dark:text-stone-950 dark:border-amber-500"
                          : "border-stone-200 text-stone-600 bg-stone-50 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                  Password Baru
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-stone-200 py-3.5 pl-10 pr-4 text-sm focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-900 py-3.5 text-sm font-bold text-white shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition active:scale-98"
                id="submit-register-btn"
              >
                <span>Daftarkan Pengguna Baru</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>

        {/* Quick Demo Accounts Banner */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 dark:bg-amber-500/5 border-dashed" id="demo-presets-box">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest text-center mb-3 flex items-center justify-center space-x-1.5">
            <Shield className="h-4 w-4 text-amber-500" />
            <span>Akses Demo Cepat (Quick Preset Select)</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {PRESET_USERS.map((u) => (
              <button
                key={u.uid}
                onClick={() => handlePresetLogin(u.email, u.passwordKey)}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-stone-200 hover:border-amber-500 dark:bg-stone-900 dark:border-stone-800 dark:hover:border-amber-500 text-center transition hover:shadow-md"
                id={`preset-login-${u.role.toLowerCase()}`}
              >
                <span className="text-[10px] font-bold text-amber-600 font-mono uppercase tracking-widest mb-1">
                  {u.role}
                </span>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-100 truncate w-full">
                  {u.name.split(" ")[0]}
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  pass: {u.passwordKey}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
