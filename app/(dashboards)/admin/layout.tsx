'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building,
  Users,
  CalendarDays,
  UserCheck,
  FileBarChart,
  LogOut,
  Bell,
  Menu,
  X,
  Building2,
  ChevronRight,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { logout } from '@/src/utils/auth';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection?: string;
  onNavigateSection?: (section: string) => void;
  onLogout?: () => void;
}

export default function AdminLayout({
  children,
  activeSection = 'Dashboard',
  onNavigateSection,
  onLogout,
}: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState(activeSection);

  React.useEffect(() => {
    if (activeSection) {
      setActiveNav(activeSection);
    }
  }, [activeSection]);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'Properties', icon: Building, href: '/admin/properties' },
    { label: 'Tenants', icon: Users, href: '/admin/tenants' },
    { label: 'Shortlet', icon: CalendarDays, href: '/admin/shortlet' },
    { label: 'Agents', icon: UserCheck, href: '/admin/agents' },
    { label: 'Reports', icon: FileBarChart, href: '/admin/reports' },
  ];

  const handleNavClick = (label: string, href: string) => {
    setActiveNav(label);
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(label);
    }
  };

  const handleSignOut = () => {
    logout();
    if (onLogout) {
      onLogout();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col md:flex-row text-slate-800 font-sans">
      {/* Mobile Top App Bar */}
      <div className="md:hidden bg-[#0B1D2E] text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#12897F] flex items-center justify-center text-white font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm text-white">PropertyPro</span>
            <span className="text-[10px] text-teal-300 block leading-tight">Admin Console</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Persistent Desktop Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B1D2E] text-slate-300 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto md:min-h-screen flex flex-col ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="px-6 py-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#12897F] flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight leading-tight">PropertyPro</h1>
              <p className="text-[11px] text-teal-400 font-medium tracking-wide uppercase">Real Estate Management</p>
            </div>
          </div>
          {mobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Role Indicator Badge */}
        <div className="px-6 py-4">
          <div className="bg-[#142A42] border border-slate-700/60 rounded-lg p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#12897F]/20 text-[#12897F] flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">Administrator</div>
              <div className="text-[11px] text-teal-300 truncate">Superuser Privileges</div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Management Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.label;
            return (
              <button
                key={item.label}
                id={`admin-nav-${item.label.toLowerCase()}`}
                onClick={() => handleNavClick(item.label, item.href)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#12897F] text-white shadow-sm'
                    : 'text-slate-300 hover:bg-[#142A42] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive ? (
                  <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                ) : item.label === 'Shortlet' ? (
                  <span className="text-[9px] bg-rose-900/60 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                    Airbnb Sync
                  </span>
                ) : item.label === 'Tenants' ? (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                    4 Due
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / System Notice */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="bg-slate-900/60 rounded-lg p-3 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <span>Audit log enabled. All tenant status toggles are tracked.</span>
          </div>

          <button
            id="admin-logout-btn"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-950/30 rounded-lg border border-rose-900/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out (Clear Cookie)</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-slate-100 rounded-lg px-3 py-1.5 w-64 text-slate-500 border border-slate-200 text-xs">
              <Search className="w-3.5 h-3.5 mr-2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tenants, units, or plots..."
                className="bg-transparent border-none outline-none w-full text-slate-700 placeholder:text-slate-400 text-xs"
              />
            </div>
            <span className="hidden md:inline-flex text-xs font-medium text-slate-400 px-2 py-0.5 bg-slate-100 rounded">
              Node.js + PostgreSQL on Railway
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick alert icon */}
            <div className="relative">
              <button
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
              </button>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
            </div>

            {/* Admin Profile */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-800 leading-tight">Admin</div>
                <div className="text-[11px] text-slate-500">Super Administrator</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#12897F] text-white flex items-center justify-center font-bold text-sm shadow-xs ring-2 ring-teal-50">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Children Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
