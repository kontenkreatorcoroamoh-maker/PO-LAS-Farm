/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { User, UserRole } from "../types";
import { Sun, Moon, LogOut, Database, Egg, ShieldCheck, Download, Upload, Settings } from "lucide-react";
import { backupDatabase, restoreDatabase, getCompanySettingsFromStorage } from "../data";

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onRefreshData?: () => void;
  onOpenSettings?: () => void;
  view?: string;
}

export default function Header({ currentUser, onLogout, darkMode, setDarkMode, onRefreshData, onOpenSettings, view }: HeaderProps) {
  const [showDbMenu, setShowDbMenu] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const company = getCompanySettingsFromStorage();

  const handleBackup = () => {
    const dataStr = backupDatabase();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `las_farm_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    setShowDbMenu(false);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        const target = event.target;
        if (target && typeof target.result === "string") {
          const success = restoreDatabase(target.result);
          if (success) {
            alert("Database restored successfully!");
            if (onRefreshData) onRefreshData();
          } else {
            alert("Invalid backup file. Restoration failed.");
          }
        }
      };
    }
    setShowDbMenu(false);
  };

  const getRoleColor = (role?: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20";
      case UserRole.MANAGER:
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
      case UserRole.SALES:
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
      default:
        return "bg-zinc-100 text-zinc-600";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/90 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/90 no-print" id="las-farm-header">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Branding */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-amber-400 shadow-md border border-amber-500/30">
            <Egg className="h-6 w-6 stroke-[1.8]" />
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-tight text-emerald-900 dark:text-emerald-400">
              {company.name}
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-500 font-mono">
              {company.tagline}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-stone-700 transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
            aria-label="Toggle theme"
            id="theme-toggle-btn"
          >
            {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-emerald-800" />}
          </button>

          {currentUser && (
            <>
              {/* Settings Icon (Admin or Manager only) */}
              {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER) && (
                <button
                  onClick={onOpenSettings}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                    view === "SETTINGS"
                      ? "bg-emerald-800 text-white border-emerald-800 dark:bg-emerald-600 dark:border-emerald-600"
                      : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
                  }`}
                  title="Pengaturan ERP (Settings)"
                  id="settings-nav-btn"
                >
                  <Settings className="h-5 w-5" />
                </button>
              )}
              {/* Backup Database Dropdown Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowDbMenu(!showDbMenu)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-stone-700 transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
                  title="Database Backup & System Settings"
                  id="db-backup-btn"
                >
                  <Database className="h-5 w-5" />
                </button>

                {showDbMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-stone-200 bg-white p-2 shadow-xl dark:border-stone-800 dark:bg-stone-900 z-50">
                    <div className="px-3 py-2 text-xs font-semibold text-stone-500 dark:text-stone-400 border-b border-stone-100 dark:border-stone-800 mb-1">
                      System Database Tools
                    </div>
                    <button
                      onClick={handleBackup}
                      className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800 transition"
                      id="backup-db-action"
                    >
                      <Download className="h-4 w-4 text-emerald-600" />
                      <span>Download Backup</span>
                    </button>
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                      className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800 transition"
                      id="restore-db-action"
                    >
                      <Upload className="h-4 w-4 text-amber-600" />
                      <span>Restore Backup</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleRestore}
                      accept=".json"
                      className="hidden"
                    />
                    <div className="mt-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg text-[10px] text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950 flex items-center space-x-1">
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                      <span>Database Auto-encrypted</span>
                    </div>
                  </div>
                )}
              </div>

              {/* User Identity Info */}
              <div className="hidden md:flex flex-col items-end">
                <span className="font-display text-sm font-semibold text-stone-800 dark:text-stone-100">
                  {currentUser.name}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getRoleColor(currentUser.role)}`}>
                  {currentUser.role}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex h-10 w-10 md:w-auto md:px-4 items-center justify-center space-x-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition dark:bg-rose-950/20 dark:hover:bg-rose-950/40 dark:text-rose-400 border border-rose-100 dark:border-rose-950/50"
                title="Log Out"
                id="logout-btn"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden md:inline text-sm font-semibold">Log Out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
