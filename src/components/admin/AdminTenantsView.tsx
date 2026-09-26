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
  UserPlus,
} from 'lucide-react';
import { PaymentRecord, PropertyItem } from '@/src/types';
import { formatNaira } from '@/src/auth';
import { tenantService } from '@/src/services/tenantService';
import { propertyService } from '@/src/services/propertyService';

interface AdminTenantsViewProps {
  tenants: PaymentRecord[];
  onSelectTenant: (tenant: PaymentRecord) => void;
  onViewTenantPOV: (tenantId: string) => void;
  filterProperty?: string;
  onClearPropertyFilter?: () => void;
  onTenantAdded?: () => void; // parent should refetch its tenant list when this fires
}

export default function AdminTenantsView({
  tenants,
  onSelectTenant,
  onViewTenantPOV,
  filterProperty,
  onClearPropertyFilter,
  onTenantAdded,
}: AdminTenantsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PAID' | 'OVERDUE' | 'MULTIYEAR' | 'STRIKES'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [properties, setProperties] = useState<PropertyItem[]>([]);

  React.useEffect(() => {
    propertyService.getProperties().then(setProperties).catch(() => {});
  }, []);

  // New tenant form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPropertyId, setNewPropertyId] = useState('');
  const [newRentAmount, setNewRentAmount] = useState(120000);
  const [newRentCycle, setNewRentCycle] = useState('monthly');
  const [newMultiYear, setNewMultiYear] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPropertyId) {
      showToast('Please fill in the tenant name and select a property.');
      return;
    }

    setIsSaving(true);
    try {
      await tenantService.addTenant({
        property_id: newPropertyId,
        name: newName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim(),
        rent_amount: newRentAmount,
        rent_cycle: newRentCycle,
        multi_year_eligible: newMultiYear,
      });
      onTenantAdded?.(); // tell the parent to refetch the real tenant list
      setShowAddModal(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewPropertyId('');
      setNewRentAmount(120000);
      setNewMultiYear(false);
      showToast(`Tenant "${newName.trim()}" added.`);
    } catch (err) {
      showToast('Failed to add tenant. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTenants = tenants.filter((tenant) => {
    if (filterProperty && tenant.property !== filterProperty) {
      return false;
    }
    if (activeFilter === 'PAID' && tenant.status !== 'Paid') return false;
    if (activeFilter === 'OVERDUE' && tenant.status !== 'Overdue') return false;
    if (activeFilter === 'MULTIYEAR' && !tenant.multiYearEligible) return false;
    if (activeFilter === 'STRIKES' && (!tenant.misconductStrikes || tenant.misconductStrikes.length === 0)) return false;

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
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0B1D2E] text-white px-4 py-3 rounded-xl shadow-lg border border-teal-500/40 flex items-center gap-3 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
              <span>Filtered by: {filterProperty}</span>
              <button onClick={onClearPropertyFilter} className="hover:text-teal-950">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#12897F] hover:bg-[#0f766e] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tenant</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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

      {/* Desktop Table View */}
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
                            {tenant.status}
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3.5">
        {filteredTenants.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center text-slate-400 border border-slate-200 text-xs">
            No tenants match your search criteria.
          </div>
        ) : (
          filteredTenants.map((tenant) => {
            const hasStrikes = tenant.misconductStrikes && tenant.misconductStrikes.length > 0;

            return (
              <div key={tenant.id} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
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
                      {tenant.status}
                    </span>
                  )}
                </div>

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

      {/* Add Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="bg-[#0B1D2E] p-4 sm:p-5 text-white flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">Add New Tenant</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTenant} className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tenant Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Tunde Bello"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Property</label>
                <select
                  required
                  value={newPropertyId}
                  onChange={(e) => setNewPropertyId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                >
                  <option value="">Select a property...</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {p.location}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="tenant@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="080..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rent Amount (₦)</label>
                  <input
                    type="number"
                    min="0"
                    value={newRentAmount}
                    onChange={(e) => setNewRentAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rent Cycle</label>
                  <select
                    value={newRentCycle}
                    onChange={(e) => setNewRentCycle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newMultiYear}
                  onChange={(e) => setNewMultiYear(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span className="font-semibold text-slate-700">Eligible to pay for more than a year in advance</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#12897F] hover:bg-[#0f766e] text-white rounded-lg font-semibold shadow-sm transition disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Create Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}