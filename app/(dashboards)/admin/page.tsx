'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  Clock,
  Wallet,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Building,
  Users,
  CalendarDays,
  UserCheck,
  FileBarChart,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Plus,
  Filter,
  Check,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { PaymentRecord, MisconductRecord } from '@/src/types';
import { tenantService } from '@/src/services/tenantService';
import { formatNaira } from '@/src/utils/auth';

// Subcomponents
import AdminPropertiesView from '@/src/components/admin/AdminPropertiesView';
import AdminTenantsView from '@/src/components/admin/AdminTenantsView';
import AdminAgentsView from '@/src/components/admin/AdminAgentsView';
import AdminReportsView from '@/src/components/admin/AdminReportsView';
import AdminShortletView from '@/src/components/admin/AdminShortletView';

interface AdminDashboardPageProps {
  activeSection?: string;
  onNavigateSection?: (section: string) => void;
  onViewTenantPOV?: (tenantId: string) => void;
  onSimulateAgentPOV?: (agentId: string) => void;
}

export default function AdminDashboardPage({
  activeSection = 'Dashboard',
  onNavigateSection,
  onViewTenantPOV,
  onSimulateAgentPOV,
}: AdminDashboardPageProps) {
  // Global Data State
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<PaymentRecord | null>(null);
  const [tenantFilterProperty, setTenantFilterProperty] = useState<string | undefined>(undefined);

  // Search & Filter for Dashboard Recent Payments table
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'Paid' | 'Overdue'>('ALL');

  // Feedback Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await tenantService.getTenants();
      setPayments(data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Misconduct Form inside Drawer
  const [misconductTitle, setMisconductTitle] = useState('');
  const [misconductDesc, setMisconductDesc] = useState('');
  const [misconductPenalty, setMisconductPenalty] = useState('');
  const [misconductImage, setMisconductImage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Top 3 Metrics Calculations
  const totalCollectedMonth = payments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, item) => sum + item.amountPaid, 0);

  const overdueTenantsCount = payments.filter((p) => p.status === 'Overdue').length;

  const commissionOwed = payments
    .filter((p) => !p.agentCommissionRemitted && p.agentCommissionAmount)
    .reduce((sum, item) => sum + (item.agentCommissionAmount || 0), 0);

  // Filtered Payments for Dashboard View
  const filteredDashboardPayments = payments.filter((p) => {
    const matchesSearch =
      p.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.unit.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Drawer Action: Toggle Multi-Year Advance Payment
  const handleToggleMultiYear = (tenantId: string) => {
    setPayments((prev) =>
      prev.map((item) => {
        if (item.id === tenantId) {
          const nextVal = !item.multiYearEligible;
          showToast(
            nextVal
              ? `Multi-year advance payment enabled for ${item.tenantName}.`
              : `Multi-year advance payment disabled for ${item.tenantName}.`
          );
          const updated = { ...item, multiYearEligible: nextVal };
          if (selectedTenant?.id === tenantId) setSelectedTenant(updated);
          return updated;
        }
        return item;
      })
    );
  };

  // Drawer Action: Log Misconduct Record
  const handleLogMisconduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || !misconductTitle.trim() || !misconductDesc.trim()) return;

    const newStrike: MisconductRecord = {
      id: `msc-${Date.now().toString().slice(-4)}`,
      tenantId: selectedTenant.id,
      date: new Date().toISOString().split('T')[0],
      offenseTitle: misconductTitle.trim(),
      description: misconductDesc.trim(),
      penaltyAmount: misconductPenalty ? parseFloat(misconductPenalty) : undefined,
      proofImageUrl: misconductImage.trim() || undefined,
    };

    setPayments((prev) =>
      prev.map((item) => {
        if (item.id === selectedTenant.id) {
          const updated = {
            ...item,
            misconductStrikes: [newStrike, ...item.misconductStrikes],
          };
          setSelectedTenant(updated);
          return updated;
        }
        return item;
      })
    );

    setMisconductDesc('');
    showToast(`Misconduct strike logged for ${selectedTenant.tenantName}.`);
  };

  // Drawer Action: Toggle Commission Remittance
  const handleToggleCommissionRemitted = (tenantId: string) => {
    setPayments((prev) =>
      prev.map((item) => {
        if (item.id === tenantId) {
          const nextVal = !item.agentCommissionRemitted;
          showToast(
            nextVal
              ? `Commission marked as remitted to ${item.agentName}.`
              : `Commission marked as pending for ${item.agentName}.`
          );
          const updated = { ...item, agentCommissionRemitted: nextVal };
          if (selectedTenant?.id === tenantId) setSelectedTenant(updated);
          return updated;
        }
        return item;
      })
    );
  };

  const handleFilterPropertyFromView = (propertyName: string) => {
    setTenantFilterProperty(propertyName);
    onNavigateSection?.('Tenants');
  };

  const handleViewPOV = (tenantId: string) => {
    if (onViewTenantPOV) {
      onViewTenantPOV(tenantId);
    }
  };

  return (
    <div className="relative space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0B1D2E] text-white px-4 py-3 rounded-xl shadow-lg border border-teal-500/40 flex items-center gap-3 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Render Sub-View according to activeSection */}
      {activeSection === 'Properties' && (
        <AdminPropertiesView
          onFilterTenantsByProperty={handleFilterPropertyFromView}
        />
      )}

      {activeSection === 'Tenants' && (
        <AdminTenantsView
          tenants={payments}
          onSelectTenant={(tenant) => setSelectedTenant(tenant)}
          onViewTenantPOV={handleViewPOV}
          filterProperty={tenantFilterProperty}
          onClearPropertyFilter={() => setTenantFilterProperty(undefined)}
        />
      )}

      {activeSection === 'Shortlet' && <AdminShortletView />}

      {activeSection === 'Agents' && (
        <AdminAgentsView onSimulateAgentPOV={onSimulateAgentPOV} />
      )}

      {activeSection === 'Reports' && <AdminReportsView />}

      {/* Default View: Main Dashboard */}
      {activeSection === 'Dashboard' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Executive Property Overview
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Real-time collection velocity, arrears management, and commission audit.
              </p>
            </div>

            {/* Quick Section Jump Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => onNavigateSection?.('Properties')}
                className="text-xs px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg shadow-2xs transition shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Building className="w-3.5 h-3.5 text-[#12897F]" />
                <span>Properties</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateSection?.('Tenants')}
                className="text-xs px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg shadow-2xs transition shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Tenants (7)</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateSection?.('Shortlet')}
                className="text-xs px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg shadow-2xs transition shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <CalendarDays className="w-3.5 h-3.5 text-[#FF5A5F]" />
                <span>Shortlet & Airbnb</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateSection?.('Agents')}
                className="text-xs px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg shadow-2xs transition shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Agents (3)</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateSection?.('Reports')}
                className="text-xs px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg shadow-2xs transition shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <FileBarChart className="w-3.5 h-3.5 text-purple-600" />
                <span>Reports</span>
              </button>
            </div>
          </div>

          {/* Top 3 Required Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Metric 1: Collected This Month */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Collected This Month
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 block tracking-tight">
                  {formatNaira(totalCollectedMonth)}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 mt-1 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  +18.4% vs previous cycle
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#12897F] flex items-center justify-center shrink-0 border border-teal-100">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            {/* Metric 2: Overdue Tenants */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Overdue Tenants
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1 block tracking-tight">
                  {overdueTenantsCount} Tenants
                </span>
                <button
                  onClick={() => onNavigateSection?.('Tenants')}
                  className="text-[11px] font-semibold text-slate-500 hover:text-amber-700 mt-1 inline-flex items-center gap-1 cursor-pointer"
                >
                  Inspect delinquent units →
                </button>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* Metric 3: Commission Owed */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between sm:col-span-2 lg:col-span-1">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Commission Owed
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 block tracking-tight">
                  {formatNaira(commissionOwed)}
                </span>
                <button
                  onClick={() => onNavigateSection?.('Agents')}
                  className="text-[11px] font-semibold text-slate-500 hover:text-[#12897F] mt-1 inline-flex items-center gap-1 cursor-pointer"
                >
                  Review 3 managing agents →
                </button>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#12897F] flex items-center justify-center shrink-0 border border-teal-100">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Recent Payments Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            {/* Table Filter / Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Recent Payment Ledger</h2>
                <p className="text-xs text-slate-500">
                  Select any record to manage multi-year approvals, misconduct, and agent remittance.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                {/* Status Toggle Pills */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setFilterStatus('ALL')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                      filterStatus === 'ALL'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({payments.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('Paid')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                      filterStatus === 'Paid'
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Paid
                  </button>
                  <button
                    onClick={() => setFilterStatus('Overdue')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                      filterStatus === 'Overdue'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Overdue
                  </button>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tenant or unit..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>
              </div>
            </div>

            {/* Desktop Table (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Tenant / Property</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Lease Date</th>
                    <th className="py-3 px-4">Badges & Flags</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredDashboardPayments.map((record) => (
                    <tr
                      key={record.id}
                      onClick={() => setSelectedTenant(record)}
                      className={`hover:bg-slate-50/80 transition cursor-pointer ${
                        selectedTenant?.id === record.id ? 'bg-teal-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{record.tenantName}</div>
                        <div className="text-[11px] text-slate-500">
                          {record.unit} • {record.property}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {record.status === 'Paid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Overdue
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{formatNaira(record.amount)}</div>
                        <div className="text-[10px] text-slate-500">
                          {record.status === 'Paid' ? 'Paid in Full' : `₦${record.amountOwed.toLocaleString()} Due`}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-600">{record.date}</td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {record.multiYearEligible && (
                            <span className="text-[10px] font-bold bg-teal-50 text-[#12897F] px-2 py-0.5 rounded border border-teal-200">
                              Multi-Year Enabled
                            </span>
                          )}
                          {record.misconductStrikes.length > 0 && (
                            <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                              {record.misconductStrikes.length} Strike
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedTenant(record)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                          >
                            Details
                          </button>

                          <button
                            type="button"
                            onClick={() => handleViewPOV(record.id)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-[#12897F] bg-teal-50 hover:bg-teal-100 rounded-lg transition flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Tenant POV</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card-Based Responsive View (< 768px) */}
            <div className="md:hidden divide-y divide-slate-100 p-3 space-y-3">
              {filteredDashboardPayments.map((record) => (
                <div
                  key={record.id}
                  onClick={() => setSelectedTenant(record)}
                  className={`p-3 rounded-xl border border-slate-200 space-y-2.5 cursor-pointer ${
                    selectedTenant?.id === record.id ? 'bg-teal-50/40 border-teal-300' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{record.tenantName}</div>
                      <div className="text-[11px] text-slate-500">
                        {record.unit} • {record.property}
                      </div>
                    </div>

                    {record.status === 'Paid' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                        <Clock className="w-3 h-3" />
                        Overdue
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Amount</span>
                      <span className="font-bold text-slate-900">{formatNaira(record.amount)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] uppercase block">Lease Date</span>
                      <span className="font-medium text-slate-600">{record.date}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSelectedTenant(record)}
                      className="flex-1 py-1.5 text-center text-xs font-semibold bg-slate-100 text-slate-800 rounded-lg"
                    >
                      Details
                    </button>

                    <button
                      type="button"
                      onClick={() => handleViewPOV(record.id)}
                      className="flex-1 py-1.5 text-center text-xs font-semibold bg-[#12897F] text-white rounded-lg flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Tenant POV</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tenant Control Drawer (Financial, Multi-Year Toggle, Misconduct Logger, Commission Remittance) */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedTenant(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200">
              {/* Drawer Header */}
              <div className="bg-[#0B1D2E] p-6 text-white flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-bold text-teal-300 uppercase tracking-wider">
                    Tenant Control Panel
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedTenant.tenantName}</h3>
                  <div className="text-xs text-slate-300">
                    {selectedTenant.unit} • {selectedTenant.property}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTenant(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
                {/* 1. Financial Status */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Financial Summary
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Amount Paid</span>
                      <span className="text-base font-bold text-emerald-700">
                        {formatNaira(selectedTenant.amountPaid)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Amount Owed</span>
                      <span
                        className={`text-base font-bold ${
                          selectedTenant.amountOwed > 0 ? 'text-amber-600' : 'text-slate-800'
                        }`}
                      >
                        {formatNaira(selectedTenant.amountOwed)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between">
                    <span>Lease Period:</span>
                    <span className="font-semibold text-slate-800">{selectedTenant.leasePeriod}</span>
                  </div>
                </div>

                {/* Direct "View Tenant POV" Button */}
                <button
                  type="button"
                  onClick={() => handleViewPOV(selectedTenant.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#12897F] border border-teal-200 font-bold flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Inspect Tenant POV for {selectedTenant.tenantName} →</span>
                </button>

                {/* 2. Multi-Year Advance Payment Toggle */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Multi-Year Advance Payment</span>
                      <span className="text-[11px] text-slate-500">
                        Permits tenant to settle multi-year lease periods via portal.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleMultiYear(selectedTenant.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        selectedTenant.multiYearEligible ? 'bg-[#12897F]' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          selectedTenant.multiYearEligible ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 3. Misconduct Strikes & Violations */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Misconduct Strikes ({selectedTenant.misconductStrikes.length})</span>
                    </span>
                  </div>

                  {/* Existing Strikes List */}
                  {selectedTenant.misconductStrikes.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTenant.misconductStrikes.map((strike) => (
                        <div key={strike.id} className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-rose-800">{strike.offenseTitle}</span>
                            {strike.penaltyAmount && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-200 text-rose-900 rounded">
                                {formatNaira(strike.penaltyAmount)} Penalty
                              </span>
                            )}
                          </div>
                          <p className="text-rose-700 text-[11px] leading-relaxed">{strike.description}</p>
                          {strike.proofImageUrl && (
                            <img src={strike.proofImageUrl} alt="Proof" className="w-full h-16 object-cover rounded-md border border-rose-200 mt-1" />
                          )}
                          <div className="text-[10px] text-rose-500 pt-1 font-medium">
                            Logged: {strike.date}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-center">
                      Zero conduct violations recorded. Clean tenancy record.
                    </div>
                  )}

                  {/* Log Misconduct Form */}
                  <form onSubmit={handleLogMisconduct} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <span className="font-bold text-slate-800 block text-xs">Record New Violation</span>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Offense Title / Category</label>
                      <input
                        type="text"
                        required
                        value={misconductTitle}
                        onChange={(e) => setMisconductTitle(e.target.value)}
                        placeholder="e.g. Broken borehole valve"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-[#12897F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Detailed Description</label>
                      <textarea
                        rows={2}
                        required
                        value={misconductDesc}
                        onChange={(e) => setMisconductDesc(e.target.value)}
                        placeholder="Notes and context..."
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-[#12897F]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">Penalty / Repair Deduction (₦)</label>
                        <input
                          type="number"
                          value={misconductPenalty}
                          onChange={(e) => setMisconductPenalty(e.target.value)}
                          placeholder="Optional"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-[#12897F]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">Proof Image URL</label>
                        <input
                          type="url"
                          value={misconductImage}
                          onChange={(e) => setMisconductImage(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-[#12897F]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs transition cursor-pointer"
                    >
                      Log Official Strike
                    </button>
                  </form>
                </div>

                {/* 4. Agent Commission Remittance */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Agent Commission Remittance
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">{selectedTenant.agentName || 'Emeka Nwosu'}</div>
                      <div className="text-slate-500 text-[11px]">
                        5% Commission: <strong>{formatNaira(selectedTenant.agentCommissionAmount || 150000)}</strong>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!selectedTenant.agentCommissionRemitted}
                        onChange={() => handleToggleCommissionRemitted(selectedTenant.id)}
                        className="w-4 h-4 text-[#12897F] rounded focus:ring-[#12897F] cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        {selectedTenant.agentCommissionRemitted ? 'Remitted' : 'Pending'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTenant(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs"
                >
                  Close Drawer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
