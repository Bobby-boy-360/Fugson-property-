import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import LoginPage from '@/app/login/page';
import AdminLayout from '@/app/(dashboards)/admin/layout';
import AdminDashboardPage from '@/app/(dashboards)/admin/page';
import AgentLayout from '@/app/(dashboards)/agent/layout';
import AgentDashboardPage from '@/app/(dashboards)/agent/page';
import TenantPublicPortal from '@/app/pay/[token]/page';
import { getCurrentUser, logout, loginAs } from '@/src/utils/auth';
import { UserRole } from '@/src/types';

export default function App() {
  // Navigation State (simulating Next.js App Router paths with browser URL sync)
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.pathname && window.location.pathname !== '/') {
      return window.location.pathname;
    }
    return '/login';
  });
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [middlewareAlert, setMiddlewareAlert] = useState<string | null>(null);

  // Active section state for Admin & Agent layouts
  const [adminSection, setAdminSection] = useState<string>('Dashboard');
  const [agentSection, setAgentSection] = useState<string>('My Properties');

  // Sync auth state on mount & handle browser back/forward buttons
  useEffect(() => {
    setCurrentUser(getCurrentUser());

    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname || '/login';
        const targetPath = path === '/' ? '/login' : path;
        setCurrentPath(targetPath);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.history.pushState({}, '', '/login');
          }
          setCurrentPath('/login');
          return;
        }
      }

      if (path.startsWith('/agent')) {
        if (!role || role !== 'AGENT') {
          setMiddlewareAlert(
            `[middleware.ts intercepted] Access to '/agent' blocked: Token role is '${role || 'NONE'}' (Requires 'AGENT'). Redirected to /login.`
          );
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.history.pushState({}, '', '/login');
          }
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

    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
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

        {(currentPath.startsWith('/pay') || currentPath.startsWith('/tenant')) && (
          <TenantPublicPortal
            params={{ token: 'fg-tenant-98231' }}
            onNavigate={navigateTo}
          />
        )}
      </main>
    </div>
  );
}
