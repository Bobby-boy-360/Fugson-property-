import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  ExternalLink,
  Code2,
  RefreshCw,
  AlertTriangle,
  Building2,
  Users,
  CreditCard,
  Lock,
  Sprout,
  CheckCircle2,
} from 'lucide-react';
import LoginPage from '@/app/login/page';
import AdminLayout from '@/app/(dashboards)/admin/layout';
import AdminDashboardPage from '@/app/(dashboards)/admin/page';
import AgentLayout from '@/app/(dashboards)/agent/layout';
import AgentDashboardPage from '@/app/(dashboards)/agent/page';
import TenantPublicPortal from '@/app/pay/[token]/page';
import CodeViewerModal from '@/src/components/CodeViewerModal';
import { getCurrentUser, logout, loginAs, getCookie } from '@/src/utils/auth';
import { UserRole } from '@/src/types';

export default function App() {
  // Navigation State (simulating Next.js App Router paths)
  const [currentPath, setCurrentPath] = useState<string>('/login');
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [middlewareAlert, setMiddlewareAlert] = useState<string | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);

  // Active section state for Admin & Agent layouts
  const [adminSection, setAdminSection] = useState<string>('Dashboard');
  const [agentSection, setAgentSection] = useState<string>('My Properties');

  // Sync auth state on mount
  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, [currentPath]);

  // Navigate function simulating Next.js navigation with Route Protection (middleware.ts)
  const navigateTo = (path: string, bypassProtection = false) => {
    setMiddlewareAlert(null);

    // Route Protection Simulation (matching middleware.ts exactly)
    if (!bypassProtection) {
      const user = getCurrentUser();
      const role = user?.role;

      if (path.startsWith('/admin')) {
        if (!role || role !== 'ADMIN') {
          setMiddlewareAlert(
            `[middleware.ts intercepted] Access to '/admin' blocked: Token role is '${role || 'NONE'}' (Requires 'ADMIN'). Redirected to /login.`
          );
          setCurrentPath('/login');
          return;
        }
      }

      if (path.startsWith('/agent')) {
        if (!role || role !== 'AGENT') {
          setMiddlewareAlert(
            `[middleware.ts intercepted] Access to '/agent' blocked: Token role is '${role || 'NONE'}' (Requires 'AGENT'). Redirected to /login.`
          );
          setCurrentPath('/login');
          return;
        }
      }
    }

    // Handle subpath section setting if navigating to /admin/properties, etc.
    if (path === '/admin/properties') setAdminSection('Properties');
    else if (path === '/admin/tenants') setAdminSection('Tenants');
    else if (path === '/admin/shortlet') setAdminSection('Shortlet');
    else if (path === '/admin/agents') setAdminSection('Agents');
    else if (path === '/admin/reports') setAdminSection('Reports');
    else if (path === '/admin') setAdminSection('Dashboard');

    if (path === '/agent/properties') setAgentSection('My Properties');
    else if (path === '/agent/tenants') setAgentSection('My Tenants');
    else if (path === '/agent/commissions') setAgentSection('Commission Tracker');

    setCurrentPath(path);
  };

  const handleQuickSwitchRole = (role: UserRole | 'NONE', tenantId?: string) => {
    if (role === 'NONE') {
      logout();
      setCurrentUser(null);
      navigateTo('/login', true);
    } else {
      const user = loginAs(role, undefined, tenantId);
      setCurrentUser(user);
      if (role === 'ADMIN') {
        navigateTo('/admin', true);
      } else if (role === 'AGENT') {
        navigateTo('/agent', true);
      } else {
        navigateTo(`/pay/fg-tenant-${(tenantId || 'pay-001').replace('pay-', '')}`, true);
      }
    }
  };

  const handleViewTenantPOV = (tenantId: string) => {
    // Switch into that tenant's verified session and open tenant portal
    const user = loginAs('TENANT', undefined, tenantId);
    setCurrentUser(user);
    navigateTo(`/pay/fg-tenant-${tenantId.replace('pay-', '')}`, true);
  };

  const handleSimulateAgentPOV = (agentId: string) => {
    const user = loginAs('AGENT');
    setCurrentUser(user);
    navigateTo('/agent', true);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col font-sans">
      {/* Top Interactive Environment Toolbar */}
      <header className="bg-[#0B1D2E] text-white text-xs border-b border-slate-800 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#12897F] flex items-center justify-center font-bold text-white text-xs shrink-0">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-white tracking-tight">PropertyPro</span>
            <span className="hidden md:inline text-slate-400 ml-1.5 font-mono text-[11px]">
              Next.js App Router
            </span>
          </div>
        </div>

        {/* Route switcher tabs */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 overflow-x-auto max-w-full">
          <button
            onClick={() => navigateTo('/login', true)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer flex items-center gap-1 shrink-0 ${
              currentPath === '/login' ? 'bg-[#12897F] text-white font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <KeyRound className="w-3 h-3" />
            <span>/login</span>
          </button>

          <button
            onClick={() => navigateTo('/admin')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer flex items-center gap-1 shrink-0 ${
              currentPath.startsWith('/admin') ? 'bg-[#12897F] text-white font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>/admin</span>
          </button>

          <button
            onClick={() => navigateTo('/agent')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer flex items-center gap-1 shrink-0 ${
              currentPath.startsWith('/agent') ? 'bg-[#12897F] text-white font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>/agent</span>
          </button>

          <button
            onClick={() => navigateTo('/pay/fg-tenant-98231', true)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer flex items-center gap-1 shrink-0 ${
              currentPath.startsWith('/pay') ? 'bg-[#12897F] text-white font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sprout className="w-3 h-3 text-teal-300" />
            <span className="font-bold">Tenant POV</span>
          </button>
        </div>

        {/* Current Auth Cookie Status & Actions */}
        <div className="flex items-center gap-2 text-[11px]">
          <div className="hidden lg:flex items-center gap-1.5 bg-[#142A42] px-2.5 py-1 rounded border border-slate-700">
            <span className="text-slate-400">auth_token:</span>
            <span
              className={`font-mono font-bold ${
                currentUser?.role === 'ADMIN'
                  ? 'text-teal-400'
                  : currentUser?.role === 'AGENT'
                  ? 'text-amber-400'
                  : currentUser?.role === 'TENANT'
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {currentUser?.role ? `${currentUser.role}${currentUser.tenantId ? ` (${currentUser.name})` : ''}` : 'NOT SET'}
            </span>
          </div>

          {/* Quick Simulation Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleQuickSwitchRole('ADMIN')}
              title="Set cookie to ADMIN and open /admin"
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded text-[10px] font-semibold border border-slate-700 cursor-pointer"
            >
              Admin
            </button>
            <button
              onClick={() => handleQuickSwitchRole('AGENT')}
              title="Set cookie to AGENT and open /agent"
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-[10px] font-semibold border border-slate-700 cursor-pointer"
            >
              Agent
            </button>
            <button
              onClick={() => handleQuickSwitchRole('TENANT', 'pay-001')}
              title="Set cookie to TENANT (Alabi Adebayo) and open Tenant POV"
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded text-[10px] font-semibold border border-slate-700 cursor-pointer"
            >
              Tenant POV
            </button>
            <button
              onClick={() => handleQuickSwitchRole('NONE')}
              title="Clear auth_token cookie"
              className="px-1.5 py-1 bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 rounded text-[10px] border border-slate-700 cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* View Codebase Modal Trigger */}
          <button
            onClick={() => setShowCodeModal(true)}
            className="px-2.5 py-1 bg-[#12897F] hover:bg-[#0f766e] text-white rounded font-semibold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer ml-1"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Inspect Next.js Files</span>
            <span className="xl:hidden">Code</span>
          </button>
        </div>
      </header>

      {/* Middleware Interception Notification Banner */}
      {middlewareAlert && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-medium flex items-center justify-between border-b border-amber-600 shadow-xs animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" />
            <span>{middlewareAlert}</span>
          </div>
          <button
            onClick={() => setMiddlewareAlert(null)}
            className="text-slate-950 font-bold hover:underline ml-3 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Dynamic View Router according to currentPath */}
      <main className="flex-1">
        {currentPath === '/login' && <LoginPage onNavigate={navigateTo} />}

        {currentPath.startsWith('/admin') && (
          <AdminLayout
            activeSection={adminSection}
            onNavigateSection={(sec) => setAdminSection(sec)}
            onLogout={() => handleQuickSwitchRole('NONE')}
          >
            <AdminDashboardPage
              activeSection={adminSection}
              onNavigateSection={(sec) => setAdminSection(sec)}
              onViewTenantPOV={handleViewTenantPOV}
              onSimulateAgentPOV={handleSimulateAgentPOV}
            />
          </AdminLayout>
        )}

        {currentPath.startsWith('/agent') && (
          <AgentLayout
            activeSection={agentSection}
            onNavigateSection={(sec) => setAgentSection(sec)}
            onLogout={() => handleQuickSwitchRole('NONE')}
          >
            <AgentDashboardPage
              activeSection={agentSection}
              onNavigateSection={(sec) => setAgentSection(sec)}
              onViewTenantPOV={handleViewTenantPOV}
            />
          </AgentLayout>
        )}

        {currentPath.startsWith('/pay') && (
          <TenantPublicPortal
            params={{ token: 'fg-tenant-98231' }}
            onNavigate={navigateTo}
          />
        )}
      </main>

      {/* Next.js Code Files Modal */}
      <CodeViewerModal isOpen={showCodeModal} onClose={() => setShowCodeModal(false)} />
    </div>
  );
}
