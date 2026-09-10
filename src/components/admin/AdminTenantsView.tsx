'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  Phone,
  Building,
  ShieldAlert,
  ArrowUpRight,
  Eye,
  Check,
  X,
  Plus,
} from 'lucide-react';
import { PaymentRecord } from '@/src/types';
import { formatNaira } from '@/src/utils/auth';

interface AdminTenantsViewProps {
  tenants: PaymentRecord[];
  onSelectTenant: (tenant: PaymentRecord) => void;
  onViewTenantPOV: (tenantId: string) => void;
  filterProperty?: string;
  onClearPropertyFilter?: () => void;
}

export default function AdminTenantsView({
  tenants,
  onSelectTenant,
  onViewTenantPOV,
  filterProperty,
  onClearPropertyFilter,
}: AdminTenantsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PAID' | 'OVERDUE' | 'MULTIYEAR' | 'STRIKES'>('ALL');

  const filteredTenants = tenants.filter((tenant) => {
    // Property specific filter
    if (filterProperty && tenant.property !== filterProperty) {
      return false;
    }

    // Status filter
    if (activeFilter === 'PAID' && tenant.status !== 'Paid') return false;
    if (activeFilter === 'OVERDUE' && tenant.status !== 'Overdue') return false;
    if (activeFilter === 'MULTIYEAR' && !tenant.multiYearEligible) return false;
    if (activeFilter === 'STRIKES' && (!tenant.misconductStrikes || tenant.misconductStrikes.length === 0)) return false;

    // Search query
    const q = searchQuery.toLowerCase();
    return (
      tenant.tenantName.toLowerCase().includes(q) ||
      tenant.property.toLowerCase().includes(q) ||
      tenant.unit.toLowerCase().includes(q) ||
      tenant.phone.includes(q)
    );
  });

  const paidCount = tenants.filter((t) => t.status === 'Paid').length;
  const overdueCount = tenants.filter((t) => t.status === 'Overdue').length;
  const multiYearCount = tenants.filter((t) => t.multiYearEligible).length;
  const strikesCount = tenants.filter((t) => t.misconductStrikes && t.misconductStrikes.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Tenant Management Directory</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Oversee residential and commercial leases, tenant compliance, and payment records.
          </p>
        </div>

        {filterProperty && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-xl text-xs font-semibold">
            <span>Filtered by: {filterProperty}</span>
            <button onClick={onClearPropertyFilter} className="hover:text-teal-950">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition shrink-0 cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-[#12897F] text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Tenants ({tenants.length})
            </button>

            <button
              onClick={() => setActiveFilter('PAID')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition shrink-0 cursor-pointer ${
                activeFilter === 'PAID'
                  ? 'bg-emerald-700 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Paid ({paidCount})
            </button>

            <button
              onClick={() => setActiveFilter('OVERDUE')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition shrink-0 cursor-pointer ${
                activeFilter === 'OVERDUE'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Overdue ({overdueCount})
            </button>

            <button
              onClick={() => setActiveFilter('MULTIYEAR')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition shrink-0 cursor-pointer ${
                activeFilter === 'MULTIYEAR'
                  ? 'bg-[#0B1D2E] text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Multi-Year Advance ({multiYearCount})
            </button>

            <button
              onClick={() => setActiveFilter('STRIKES')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition shrink-0 cursor-pointer ${
                activeFilter === 'STRIKES'
                  ? 'bg-rose-700 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Conduct Strikes ({strikesCount})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, unit, or phone..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#12897F]"
            />
          </div>
        </div>
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Tenant / Unit</th>
                <th className="py-3 px-4">Property Estate</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Amount Owed</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Badges & Flags</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No tenants match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => {
                  const hasStrikes = tenant.misconductStrikes && tenant.misconductStrikes.length > 0;

                  return (
                    <tr
                      key={tenant.id}
                      className="hover:bg-slate-50/70 transition cursor-pointer"
                      onClick={() => onSelectTenant(tenant)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{tenant.tenantName}</div>
                        <div className="text-[11px] text-slate-500">{tenant.unit} • {tenant.phone}</div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {tenant.property}
                        <div className="text-[11px] text-slate-400">Lease: {tenant.leasePeriod}</div>
                      </td>

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

                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {tenant.amountOwed > 0 ? (
                          <span className="text-amber-600 font-bold">{formatNaira(tenant.amountOwed)}</span>
                        ) : (
                          <span className="text-slate-400">₦0</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-emerald-700">
                        {formatNaira(tenant.amountPaid)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {tenant.multiYearEligible && (
                            <span className="text-[10px] font-bold bg-teal-50 text-[#12897F] px-2 py-0.5 rounded border border-teal-200">
                              Multi-Year Enabled
                            </span>
                          )}

                          {hasStrikes && (
                            <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                              {tenant.misconductStrikes.length} Strike
                            </span>
                          )}

                          {!tenant.multiYearEligible && !hasStrikes && (
                            <span className="text-[10px] text-slate-400">Standard</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectTenant(tenant)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                          >
                            Manage
                          </button>

                          <button
                            type="button"
                            onClick={() => onViewTenantPOV(tenant.id)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-[#12897F] bg-teal-50 hover:bg-teal-100 rounded-lg transition flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Tenant POV</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card-Based Responsive View (< 768px) */}
      <div className="md:hidden space-y-3.5">
        {filteredTenants.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center text-slate-400 border border-slate-200 text-xs">
            No tenants match your search criteria.
          </div>
        ) : (
          filteredTenants.map((tenant) => {
            const hasStrikes = tenant.misconductStrikes && tenant.misconductStrikes.length > 0;

            return (
              <div
                key={tenant.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3"
              >
                {/* Header: Name, Unit, and Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{tenant.tenantName}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {tenant.unit} • {tenant.property}
                    </div>
                  </div>

                  {tenant.status === 'Paid' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                      <Clock className="w-3 h-3" />
                      Overdue
                    </span>
                  )}
                </div>

                {/* Amounts Grid */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Amount Owed</span>
                    <span className={`font-bold ${tenant.amountOwed > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                      {formatNaira(tenant.amountOwed)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Amount Paid</span>
                    <span className="font-bold text-emerald-700">{formatNaira(tenant.amountPaid)}</span>
                  </div>
                </div>

                {/* Flags / Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {tenant.multiYearEligible && (
                    <span className="text-[10px] font-bold bg-teal-50 text-[#12897F] px-2 py-0.5 rounded border border-teal-200">
                      Multi-Year Advance Enabled
                    </span>
                  )}

                  {hasStrikes && (
                    <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                      {tenant.misconductStrikes.length} Conduct Strike
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectTenant(tenant)}
                    className="flex-1 py-2 text-center text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition"
                  >
                    Manage Tenant
                  </button>

                  <button
                    type="button"
                    onClick={() => onViewTenantPOV(tenant.id)}
                    className="flex-1 py-2 text-center text-xs font-semibold bg-[#12897F] hover:bg-[#0f766e] text-white rounded-lg transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Tenant POV</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
