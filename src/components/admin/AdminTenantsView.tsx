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
  Trash2,
  Mail,
} from 'lucide-react';
import { PaymentRecord } from '@/src/types';
import { formatNaira } from '@/src/utils/auth';

interface AdminTenantsViewProps {
  tenants: PaymentRecord[];
  onSelectTenant: (tenant: PaymentRecord) => void;
  onViewTenantPOV: (tenantId: string) => void;
  onDeleteTenant?: (tenantId: string) => void;
  onAddTenant?: (newTenant: PaymentRecord) => void;
  filterProperty?: string;
  onClearPropertyFilter?: () => void;
}

export default function AdminTenantsView({
  tenants,
  onSelectTenant,
  onViewTenantPOV,
  onDeleteTenant,
  onAddTenant,
  filterProperty,
  onClearPropertyFilter,
}: AdminTenantsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PAID' | 'OVERDUE' | 'MULTIYEAR' | 'STRIKES'>('ALL');
  const [tenantToDelete, setTenantToDelete] = useState<PaymentRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Tenant Form state
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantEmail, setNewTenantEmail] = useState('');
  const [newTenantPhone, setNewTenantPhone] = useState('');
  const [newTenantProperty, setNewTenantProperty] = useState('');
  const [newTenantUnit, setNewTenantUnit] = useState('');
  const [newTenantAmount, setNewTenantAmount] = useState<number>(2000000);
  const [newTenantStatus, setNewTenantStatus] = useState<'Paid' | 'Overdue'>('Paid');
  const [newTenantLeasePeriod, setNewTenantLeasePeriod] = useState('01 Jan 2025 – 31 Dec 2025');
  const [newTenantAgent, setNewTenantAgent] = useState('Emeka Nwosu');

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
      (tenant.phone && tenant.phone.includes(q))
    );
  });

  const paidCount = tenants.filter((t) => t.status === 'Paid').length;
  const overdueCount = tenants.filter((t) => t.status === 'Overdue').length;
  const multiYearCount = tenants.filter((t) => t.multiYearEligible).length;
  const strikesCount = tenants.filter((t) => t.misconductStrikes && t.misconductStrikes.length > 0).length;

  const handleConfirmDelete = () => {
    if (!tenantToDelete) return;
    onDeleteTenant?.(tenantToDelete.id);
    setTenantToDelete(null);
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim() || !newTenantProperty.trim()) return;

    const id = `pay-${Date.now().toString().slice(-6)}`;
    const isPaid = newTenantStatus === 'Paid';
    const numAmount = Number(newTenantAmount);

    const newRecord: PaymentRecord = {
      id,
      tenantName: newTenantName.trim(),
      tenantEmail: newTenantEmail.trim() || `${newTenantName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      property: newTenantProperty.trim(),
      unit: newTenantUnit.trim() || 'Unit 1A',
      amount: numAmount,
      status: newTenantStatus,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      receiptNumber: isPaid ? `REC-FUG-${Math.floor(1000 + Math.random() * 9000)}` : 'REC-PENDING',
      agentId: 'agent-01',
      agentName: newTenantAgent.trim() || 'Emeka Nwosu',
      agentCommissionAmount: Math.round(numAmount * 0.05),
      agentCommissionRemitted: false,
      multiYearEligible: false,
      autoEmailReceipt: true,
      amountOwed: isPaid ? 0 : numAmount,
      amountPaid: isPaid ? numAmount : 0,
      leasePeriod: newTenantLeasePeriod,
      phone: newTenantPhone.trim() || '+234 800 000 0000',
      misconductStrikes: [],
    };

    onAddTenant?.(newRecord);
    setShowAddModal(false);
    setNewTenantName('');
    setNewTenantEmail('');
    setNewTenantPhone('');
    setNewTenantProperty('');
    setNewTenantUnit('');
  };

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

        <div className="flex items-center gap-2">
          {filterProperty && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-xl text-xs font-semibold">
              <span>Filtered: {filterProperty}</span>
              <button onClick={onClearPropertyFilter} className="hover:text-teal-950 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#12897F] hover:bg-[#0e6e66] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tenant</span>
          </button>
        </div>
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
                  ? 'bg-teal-700 text-white font-semibold'
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
              Strikes / Disciplinary ({strikesCount})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tenant, property, phone..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-[#12897F]"
            />
          </div>
        </div>
      </div>

      {/* Tenants Table or Empty State */}
      {filteredTenants.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 sm:p-14 border border-slate-200 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-center mx-auto text-[#12897F]">
            <Users className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {searchQuery || activeFilter !== 'ALL' || filterProperty
                ? 'No matching tenants found'
                : 'No tenants registered yet'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {searchQuery || activeFilter !== 'ALL' || filterProperty
                ? 'Try adjusting your search criteria or filter options.'
                : 'Register your first tenant to manage rent payments, generate virtual accounts, and track lease compliance.'}
            </p>
          </div>
          {(!searchQuery && activeFilter === 'ALL' && !filterProperty) && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#12897F] hover:bg-[#0f766e] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Tenant</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <th className="py-3 px-4 font-bold">Tenant / Property</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Rent Amount</th>
                  <th className="py-3 px-4 font-bold">Lease Period</th>
                  <th className="py-3 px-4 font-bold">Managing Agent</th>
                  <th className="py-3 px-4 font-bold">Tags</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    onClick={() => onSelectTenant(tenant)}
                    className="hover:bg-slate-50/80 transition cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-[#12897F] transition">
                        {tenant.tenantName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium text-slate-700">{tenant.unit}</span>
                        <span>•</span>
                        <span>{tenant.property}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{tenant.phone}</div>
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

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{formatNaira(tenant.amount)}</div>
                      <div className="text-[10px] text-slate-500">
                        {tenant.status === 'Paid' ? 'Paid in Full' : `₦${tenant.amountOwed.toLocaleString()} Arrears`}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {tenant.leasePeriod || '1 Year Lease'}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{tenant.agentName || 'Emeka Nwosu'}</div>
                      <div className="text-[10px] text-slate-400">
                        Commission: {formatNaira(tenant.agentCommissionAmount || 0)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {tenant.multiYearEligible && (
                          <span className="text-[10px] font-bold bg-teal-50 text-[#12897F] px-2 py-0.5 rounded border border-teal-200">
                            Multi-Year
                          </span>
                        )}
                        {tenant.misconductStrikes && tenant.misconductStrikes.length > 0 && (
                          <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                            {tenant.misconductStrikes.length} Strike(s)
                          </span>
                        )}
                        {!tenant.multiYearEligible && (!tenant.misconductStrikes || tenant.misconductStrikes.length === 0) && (
                          <span className="text-[10px] text-slate-400">Standard</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectTenant(tenant)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                        >
                          Details
                        </button>

                        <button
                          type="button"
                          onClick={() => onViewTenantPOV(tenant.id)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-[#12897F] bg-teal-50 hover:bg-teal-100 rounded-lg transition flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Tenant POV</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTenantToDelete(tenant)}
                          title={`Delete tenant ${tenant.tenantName}`}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
            {filteredTenants.map((tenant) => (
              <div
                key={tenant.id}
                onClick={() => onSelectTenant(tenant)}
                className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 cursor-pointer shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{tenant.tenantName}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {tenant.unit} • {tenant.property}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{tenant.phone}</div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {tenant.status === 'Paid' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" />
                        Overdue
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTenantToDelete(tenant);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Rent Amount</span>
                    <span className="font-bold text-slate-900">{formatNaira(tenant.amount)}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] uppercase block">Lease Period</span>
                    <span className="font-medium text-slate-600">{tenant.leasePeriod || '1 Year Lease'}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onSelectTenant(tenant)}
                    className="flex-1 py-1.5 text-center text-xs font-semibold bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200"
                  >
                    Details
                  </button>

                  <button
                    type="button"
                    onClick={() => onViewTenantPOV(tenant.id)}
                    className="flex-1 py-1.5 text-center text-xs font-semibold bg-[#12897F] text-white rounded-lg flex items-center justify-center gap-1 hover:bg-[#0f766e]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Tenant POV</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Tenant Confirmation Modal */}
      {tenantToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={() => setTenantToDelete(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 p-6 space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Tenant Record?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-800">{tenantToDelete.tenantName}</strong>? All associated lease records, invoices, and misconduct strikes will be permanently removed.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTenantToDelete(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition cursor-pointer"
              >
                Delete Tenant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="bg-[#0B1D2E] p-4 sm:p-5 text-white flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">Register New Tenant</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  placeholder="e.g. Babatunde Johnson"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newTenantEmail}
                    onChange={(e) => setNewTenantEmail(e.target.value)}
                    placeholder="tenant@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone (WhatsApp)</label>
                  <input
                    type="tel"
                    value={newTenantPhone}
                    onChange={(e) => setNewTenantPhone(e.target.value)}
                    placeholder="+234 803 000 0000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Property / Estate</label>
                  <input
                    type="text"
                    required
                    value={newTenantProperty}
                    onChange={(e) => setNewTenantProperty(e.target.value)}
                    placeholder="e.g. Fugson Heights Estate"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit / Flat Identifier</label>
                  <input
                    type="text"
                    required
                    value={newTenantUnit}
                    onChange={(e) => setNewTenantUnit(e.target.value)}
                    placeholder="e.g. Flat 4B"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rent Amount (₦)</label>
                  <input
                    type="number"
                    min="1"
                    step="50000"
                    required
                    value={newTenantAmount}
                    onChange={(e) => setNewTenantAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Payment Status</label>
                  <select
                    value={newTenantStatus}
                    onChange={(e) => setNewTenantStatus(e.target.value as 'Paid' | 'Overdue')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                  >
                    <option value="Paid">Paid in Full</option>
                    <option value="Overdue">Overdue / Pending Payment</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lease Period</label>
                  <input
                    type="text"
                    required
                    value={newTenantLeasePeriod}
                    onChange={(e) => setNewTenantLeasePeriod(e.target.value)}
                    placeholder="01 Jan 2025 – 31 Dec 2025"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Managing Agent</label>
                  <input
                    type="text"
                    value={newTenantAgent}
                    onChange={(e) => setNewTenantAgent(e.target.value)}
                    placeholder="Emeka Nwosu"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#12897F] text-white font-semibold rounded-lg hover:bg-[#0e6e66] transition cursor-pointer"
                >
                  Confirm & Register Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
