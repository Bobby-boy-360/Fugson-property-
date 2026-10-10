import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

import LoginPage from '@/app/login/page';
import AdminLayout from '@/app/(dashboards)/admin/layout';
import AdminDashboardPage from '@/app/(dashboards)/admin/page';
import AgentLayout from '@/app/(dashboards)/agent/layout';
import AgentDashboardPage from '@/app/(dashboards)/agent/page';
import TenantPublicPortal from '@/app/pay/[token]/page';

import { getCurrentUser, logout, loginAs } from '@/src/auth';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>('/login');
  const [, setCurrentUser] = useState(getCurrentUser());
  const [middlewareAlert, setMiddlewareAlert] = useState<string | null>(null);

  const [adminSection, setAdminSection] = useState<string>('Dashboard');
  const [agentSection, setAgentSection] = useState<string>('My Properties');
  const [tenantPOVId, setTenantPOVId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, [currentPath]);

  const navigateTo = (
    path: string,
    bypassProtection: boolean = false
  ) => {
    setMiddlewareAlert(null);

    if (!bypassProtection) {
      const user = getCurrentUser();
      const role = user?.role;

      if (path.startsWith('/admin') && role !== 'ADMIN') {
        setMiddlewareAlert(
          'You need to be signed in as an admin to view this page.'
        );
        setCurrentPath('/login');
        return;
      }

      if (path.startsWith('/agent') && role !== 'AGENT') {
        setMiddlewareAlert(
          'You need to be signed in as an agent to view this page.'
        );
        setCurrentPath('/login');
        return;
      }
    }

    if (path === '/admin/properties') {
      setAdminSection('Properties');
    } else if (path === '/admin/tenants') {
      setAdminSection('Tenants');
    } else if (path === '/admin/shortlet') {
      setAdminSection('Shortlet');
    } else if (path === '/admin/agents') {
      setAdminSection('Agents');
    } else if (path === '/admin/reports') {
      setAdminSection('Reports');
    } else if (path === '/admin') {
      setAdminSection('Dashboard');
    }

    if (path === '/agent/properties') {
      setAgentSection('My Properties');
    } else if (path === '/agent/tenants') {
      setAgentSection('My Tenants');
    } else if (path === '/agent/commissions') {
      setAgentSection('Commission Tracker');
    }

    setCurrentPath(path);
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setTenantPOVId(null);
    navigateTo('/login', true);
  };

  
const handleViewTenantPOV = (tenantId: string) => {
  setTenantPOVId(tenantId);
  navigateTo('/pay/' + tenantId, true);
};


  const handleSimulateAgentPOV = (_agentId: string) => {
    const user = loginAs('AGENT');
    setCurrentUser(user);
    navigateTo('/agent', true);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col font-sans">
      {middlewareAlert && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-medium flex items-center justify-between border-b border-amber-600 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{middlewareAlert}</span>
          </div>

          <button
            onClick={() => setMiddlewareAlert(null)}
            className="ml-3 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <main className="flex-1">
        {currentPath === '/login' && (
          <LoginPage onNavigate={navigateTo} />
        )}

        {currentPath.startsWith('/admin') && (
          <AdminLayout
            activeSection={adminSection}
            onNavigateSection={setAdminSection}
            onLogout={handleLogout}
          >
            <AdminDashboardPage
              activeSection={adminSection}
              onNavigateSection={setAdminSection}
              onViewTenantPOV={handleViewTenantPOV}
              onSimulateAgentPOV={handleSimulateAgentPOV}
            />
          </AdminLayout>
        )}

        {currentPath.startsWith('/agent') && (
          <AgentLayout
            activeSection={agentSection}
            onNavigateSection={setAgentSection}
            onLogout={handleLogout}
          >
            <AgentDashboardPage
              activeSection={agentSection}
              onNavigateSection={setAgentSection}
              onViewTenantPOV={handleViewTenantPOV}
            />
          </AgentLayout>
        )}

        {currentPath.startsWith('/pay') && (
          <TenantPublicPortal
            params={{
              token:
                tenantPOVId ||
                currentPath.replace('/pay/', ''),
            }}
            onNavigate={navigateTo}
          />
        )}
      </main>
    </div>
  );
}
