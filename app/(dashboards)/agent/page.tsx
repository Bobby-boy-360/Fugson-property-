'use client';

import React, { useState } from 'react';
import {
  Building,
  Users,
  BadgePercent,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ExternalLink,
  Receipt,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Phone,
  Mail,
  Eye,
  Send,
  X,
  Wallet,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { propertyService } from '@/src/services/propertyService';
import { tenantService } from '@/src/services/tenantService';
import { formatNaira } from '@/src/utils/auth';
import { PaymentRecord, PropertyItem } from '@/src/types';

interface AgentDashboardPageProps {
  activeSection?: string;
  onNavigateSection?: (section: string) => void;
  onViewTenantPOV?: (tenantId: string) => void;
}

export default function AgentDashboardPage({
  activeSection = 'My Properties',
  onNavigateSection,
  onViewTenantPOV,
}: AgentDashboardPageProps) {
  const currentAgentId = 'agent-01'; // Emeka Nwosu

  const [assignedProperties, setAssignedProperties] = useState<PropertyItem[]>([]);
  const [agentPayments, setAgentPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [propsData, tenantsData] = await Promise.all([
        propertyService.getProperties(),
        tenantService.getTenantsByAgent(currentAgentId)
      ]);
      setAssignedProperties(propsData.filter((p) => p.assignedAgentId === currentAgentId));
      setAgentPayments(tenantsData);
      setIsLoading(false);
    };
    fetchData();
  }, [currentAgentId]);

  const [commissionFilter, setCommissionFilter] = useState<'ALL' | 'UNREMITTED' | 'REMITTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Agent metrics
  const unremittedCommissions = agentPayments
    .filter((p) => !p.agentCommissionRemitted)
    .reduce((sum, p) => sum + (p.agentCommissionAmount || 0), 0);

  const remittedCommissions = agentPayments
    .filter((p) => p.agentCommissionRemitted)
    .reduce((sum, p) => sum + (p.agentCommissionAmount || 0), 0);

  const totalCommissionsEarned = unremittedCommissions + remittedCommissions;
  const totalAssignedUnits = assignedProperties.reduce((sum, p) => sum + p.units, 0);
  const totalOccupiedUnits = assignedProperties.reduce((sum, p) => sum + p.occupiedUnits, 0);
  const overallOccupancy = totalAssignedUnits > 0 ? Math.round((totalOccupiedUnits / totalAssignedUnits) * 100) : 0;

  const filteredCommissions = agentPayments.filter((p) => {
    if (commissionFilter === 'UNREMITTED') return !p.agentCommissionRemitted;
    if (commissionFilter === 'REMITTED') return p.agentCommissionRemitted;
    return true;
  });

  const filteredTenants = agentPayments.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.tenantName.toLowerCase().includes(q) ||
      t.property.toLowerCase().includes(q) ||
      t.unit.toLowerCase().includes(q) ||
      t.phone.includes(q)
    );
  });

  const handleSendEmailInvoice = (tenant: PaymentRecord) => {
    const email = tenant.tenantEmail || `${tenant.tenantName.toLowerCase().replace(/\s+/g, '.')}@example.com`;
    showToast(`Official email invoice with payment token dispatched to ${tenant.tenantName} (${email})`);
  };

  const handleRequestPayout = () => {
    showToast(`Remittance payout request of ${formatNaira(unremittedCommissions)} submitted to Chief Admin.`);
  };

  return (
    <div className="space-y-6">
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

      {/* Header with Agent Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {activeSection === 'My Properties' && 'My Assigned Properties'}
            {activeSection === 'My Tenants' && 'My Managed Tenants'}
            {activeSection === 'Commission Tracker' && 'My Commission Ledger'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Agent: <strong>Emeka Nwosu</strong> • Senior Field Specialist (Lagos & Ogun Corridors)
          </p>
        </div>

        {/* Section Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => onNavigateSection?.('My Properties')}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'My Properties'
                ? 'bg-[#12897F] text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Properties ({assignedProperties.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateSection?.('My Tenants')}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'My Tenants'
                ? 'bg-[#12897F] text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Tenants ({agentPayments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateSection?.('Commission Tracker')}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'Commission Tracker'
                ? 'bg-[#12897F] text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BadgePercent className="w-3.5 h-3.5" />
            <span>Commissions</span>
          </button>
        </div>
      </div>

      {/* Top 3 Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Unremitted Commission (5%)
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
            {formatNaira(unremittedCommissions)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Pending admin clearance</span>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
            Remitted to Bank
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
            {formatNaira(remittedCommissions)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Settled to your verified account</span>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Portfolio Occupancy
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {overallOccupancy}%
          </div>
          <span className="text-xs text-teal-700 font-semibold mt-1 block">
            {totalOccupiedUnits} of {totalAssignedUnits} Units Occupied
          </span>
        </div>
      </div>

      {/* SECTION 1: MY PROPERTIES */}
      {activeSection === 'My Properties' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Assigned Estates & Managed Portfolios</h2>
            <span className="text-xs text-slate-500">{assignedProperties.length} Estates Under Care</span>
          </div>

          {assignedProperties.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-2">
              <Building className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-800 text-sm">No properties assigned to your agent profile yet</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once the administrator allocates residential estates or commercial plazas to your account, your rent roll and occupancy will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {assignedProperties.map((property) => {
                const occupancy = property.units > 0 ? Math.round((property.occupiedUnits / property.units) * 100) : 0;
                const isComingSoon = property.status === 'Coming Soon';

                return (
                  <div
                    key={property.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition"
                  >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-[#12897F] border border-teal-200">
                        {property.type}
                      </span>
                      {isComingSoon ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          Coming Soon
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">{property.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{property.location}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Occupancy</span>
                        <span className="font-bold text-slate-800">
                          {property.occupiedUnits} / {property.units} Units ({occupancy}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#12897F] h-full rounded-full transition-all duration-300"
                          style={{ width: `${occupancy}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-xs flex justify-between items-center">
                      <span className="text-slate-400 uppercase text-[10px]">Monthly Lease Volume</span>
                      <span className="font-bold text-slate-900">{formatNaira(property.monthlyRevenue)}</span>
                    </div>
                  </div>

                  {isComingSoon ? (
                    <div className="w-full py-2 text-center text-xs font-semibold bg-slate-100 text-slate-500 rounded-lg">
                      Module In Staging (Coming Soon)
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNavigateSection?.('My Tenants')}
                      className="w-full py-2 text-center text-xs font-semibold bg-slate-50 hover:bg-teal-50 text-[#12897F] border border-slate-200 hover:border-teal-200 rounded-lg transition"
                    >
                      View Tenants in this Estate →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    )}

      {/* SECTION 2: MY TENANTS */}
      {activeSection === 'My Tenants' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Directly Managed Tenants</h2>
              <p className="text-xs text-slate-500">Contact tenants, dispatch email invoices, or inspect their portal view.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tenant name or unit..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#12897F]"
              />
            </div>
          </div>

          {/* Desktop Table (>= 768px) */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Tenant / Unit</th>
                    <th className="py-3 px-4">Estate</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Owed / Paid</th>
                    <th className="py-3 px-4">Phone / Email</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredTenants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No tenants currently assigned to this agent portfolio.
                      </td>
                    </tr>
                  ) : (
                    filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {tenant.tenantName}
                        <div className="text-[11px] font-normal text-slate-500">{tenant.unit}</div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800">{tenant.property}</td>

                      <td className="py-3.5 px-4">
                        {tenant.status === 'Paid' ? (
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
                        <div className="font-bold text-slate-900">{formatNaira(tenant.amount)}</div>
                        <div className="text-[10px] text-slate-500">
                          {tenant.amountOwed > 0 ? (
                            <span className="text-amber-600 font-semibold">{formatNaira(tenant.amountOwed)} Owed</span>
                          ) : (
                            <span className="text-emerald-700 font-semibold">Cleared</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        <div>{tenant.phone}</div>
                        <div className="text-[10px] text-blue-600 font-sans font-semibold">[Email: Verified]</div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSendEmailInvoice(tenant)}
                            className="px-2.5 py-1.5 text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-[#12897F] rounded-lg transition flex items-center gap-1 cursor-pointer border border-teal-100"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email Invoice</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onViewTenantPOV?.(tenant.id)}
                            className="px-2.5 py-1.5 text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-[#12897F] rounded-lg transition flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Tenant POV</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List (< 768px) */}
          <div className="md:hidden space-y-3">
            {filteredTenants.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                No tenants currently assigned to this agent portfolio.
              </div>
            ) : (
              filteredTenants.map((tenant) => (
                <div key={tenant.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{tenant.tenantName}</h3>
                      <span className="text-xs text-slate-500">{tenant.unit} • {tenant.property}</span>
                    </div>

                    {tenant.status === 'Paid' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Overdue
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-lg text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Lease</span>
                      <span className="font-bold text-slate-900">{formatNaira(tenant.amount)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Amount Owed</span>
                      <span className={`font-bold ${tenant.amountOwed > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                        {formatNaira(tenant.amountOwed)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendEmailInvoice(tenant)}
                      className="flex-1 py-2 text-center text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-[#12897F] rounded-lg transition flex items-center justify-center gap-1 border border-teal-100 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Invoice</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onViewTenantPOV?.(tenant.id)}
                      className="flex-1 py-2 text-center text-xs font-semibold bg-[#12897F] text-white rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Tenant POV</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: COMMISSION TRACKER */}
      {activeSection === 'Commission Tracker' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">5% Commission Ledger Breakdown</h2>
              <p className="text-xs text-slate-500">Every verified payment entitles agent to 5% statutory field commission.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setCommissionFilter('ALL')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                    commissionFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  All ({agentPayments.length})
                </button>
                <button
                  onClick={() => setCommissionFilter('UNREMITTED')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                    commissionFilter === 'UNREMITTED' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Unremitted
                </button>
                <button
                  onClick={() => setCommissionFilter('REMITTED')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                    commissionFilter === 'REMITTED' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Remitted
                </button>
              </div>

              <button
                type="button"
                onClick={handleRequestPayout}
                className="px-3 py-1.5 bg-[#12897F] hover:bg-[#0f766e] text-white text-xs font-semibold rounded-lg shadow-2xs transition cursor-pointer"
              >
                Request Payout
              </button>
            </div>
          </div>

          {/* Ledger Table (Desktop) */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Tenant / Property</th>
                    <th className="py-3 px-4">Lease Total</th>
                    <th className="py-3 px-4">5% Commission</th>
                    <th className="py-3 px-4">Payment Date</th>
                    <th className="py-3 px-4">Remittance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredCommissions.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {record.tenantName}
                        <div className="text-[11px] font-normal text-slate-500">{record.property} ({record.unit})</div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {formatNaira(record.amount)}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-[#12897F] text-sm">
                        {formatNaira(record.agentCommissionAmount || 0)}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {record.date}
                      </td>

                      <td className="py-3.5 px-4">
                        {record.agentCommissionRemitted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Remitted to Bank
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Pending Clearance
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Ledger Cards (< 768px) */}
          <div className="md:hidden space-y-3">
            {filteredCommissions.map((record) => (
              <div key={record.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{record.tenantName}</h3>
                    <span className="text-[11px] text-slate-500">{record.property}</span>
                  </div>

                  {record.agentCommissionRemitted ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Remitted
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Pending
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block font-semibold">Lease Value</span>
                    <span className="font-bold text-slate-800">{formatNaira(record.amount)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] uppercase block font-semibold">5% Commission</span>
                    <span className="font-extrabold text-[#12897F] text-sm">{formatNaira(record.agentCommissionAmount || 0)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
