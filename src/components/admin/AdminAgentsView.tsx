'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Phone,
  Mail,
  Building,
  Users,
  Wallet,
  CheckCircle2,
  X,
  ExternalLink,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  Trash2,
  AlertTriangle,
  Home,
  Check,
} from 'lucide-react';
import { AgentItem, PropertyItem, PaymentRecord } from '@/src/types';
import { agentService } from '@/src/services/agentService';
import { propertyService } from '@/src/services/propertyService';
import { tenantService } from '@/src/services/tenantService';
import { formatNaira } from '@/src/utils/auth';

interface AdminAgentsViewProps {
  onSimulateAgentPOV?: (agentId: string) => void;
}

export default function AdminAgentsView({ onSimulateAgentPOV }: AdminAgentsViewProps) {
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [allProperties, setAllProperties] = useState<PropertyItem[]>([]);
  const [allTenants, setAllTenants] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<AgentItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Agent Form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('Leasing & Facility Management');
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [agentList, propList, tenantList] = await Promise.all([
        agentService.getAgents(),
        propertyService.getProperties(),
        tenantService.getTenants(),
      ]);
      setAgents(agentList);
      setAllProperties(propList);
      setAllTenants(tenantList);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRemitAll = (agentId: string) => {
    const targetAgent = agents.find((a) => a.id === agentId);
    if (!targetAgent || targetAgent.unremittedCommission === 0) {
      showToast('No outstanding commissions pending for this agent.');
      return;
    }

    const remittedAmount = targetAgent.unremittedCommission;
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId
          ? {
              ...a,
              remittedCommission: a.remittedCommission + remittedAmount,
              unremittedCommission: 0,
            }
          : a
      )
    );

    showToast(`Remitted ${formatNaira(remittedAmount)} in commission to ${targetAgent.name}.`);
  };

  const togglePropertySelection = (propId: string) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(propId) ? prev.filter((id) => id !== propId) : [...prev, propId]
    );
  };

  const toggleTenantSelection = (tenantId: string) => {
    setSelectedTenantIds((prev) =>
      prev.includes(tenantId) ? prev.filter((id) => id !== tenantId) : [...prev, tenantId]
    );
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const agentId = `agent-${Date.now().toString().slice(-6)}`;
    const cleanName = newName.trim();

    // Collect assigned property details
    const assignedProps = allProperties.filter((p) => selectedPropertyIds.includes(p.id));
    const assignedPropNames = assignedProps.map((p) => p.name);

    // Collect assigned tenant details
    const assignedTenants = allTenants.filter((t) => selectedTenantIds.includes(t.id));
    const assignedTenantNames = assignedTenants.map((t) => `${t.tenantName} (${t.unit})`);

    // Calculate total lease volume and initial commission
    const totalVolume = assignedTenants.reduce((sum, t) => sum + (t.amount || 0), 0);
    const unremitted = Math.round(totalVolume * 0.05);

    const newAgent: AgentItem = {
      id: agentId,
      name: cleanName,
      email: newEmail.trim(),
      phone: newPhone.trim() || '+234 800 000 0000',
      specialty: newSpecialty,
      assignedPropertiesCount: selectedPropertyIds.length,
      managedTenantsCount: selectedTenantIds.length,
      assignedPropertyIds: selectedPropertyIds,
      assignedPropertyNames: assignedPropNames,
      assignedTenantIds: selectedTenantIds,
      assignedTenantNames: assignedTenantNames,
      totalLeaseVolume: totalVolume,
      unremittedCommission: unremitted,
      remittedCommission: 0,
      status: 'Active',
    };

    // Update each selected property in DB / service
    for (const propId of selectedPropertyIds) {
      await propertyService.updateProperty(propId, {
        assignedAgent: cleanName,
        assignedAgentId: agentId,
      });
    }

    // Update each selected tenant in DB / service
    for (const tenantId of selectedTenantIds) {
      const target = allTenants.find((t) => t.id === tenantId);
      const commission = target ? Math.round(target.amount * 0.05) : 0;
      await tenantService.updateTenant(tenantId, {
        agentName: cleanName,
        agentId: agentId,
        agentCommissionAmount: commission,
        agentCommissionRemitted: false,
      });
    }

    // Persist agent
    await agentService.addAgent(newAgent);
    setAgents([newAgent, ...agents]);

    // Reset modal state
    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setSelectedPropertyIds([]);
    setSelectedTenantIds([]);

    showToast(`Agent "${newAgent.name}" registered with ${selectedPropertyIds.length} properties and ${selectedTenantIds.length} tenants assigned.`);
  };

  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;
    const name = agentToDelete.name;
    await agentService.deleteAgent(agentToDelete.id);
    setAgents((prev) => prev.filter((a) => a.id !== agentToDelete.id));
    setAgentToDelete(null);
    showToast(`Agent "${name}" removed from platform.`);
  };

  const totalUnremitted = agents.reduce((acc, a) => acc + a.unremittedCommission, 0);
  const totalRemitted = agents.reduce((acc, a) => acc + a.remittedCommission, 0);
  const totalVolume = agents.reduce((acc, a) => acc + a.totalLeaseVolume, 0);

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Managing Agents & Commissions</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Track field representative assignments, portfolio rent rolls, and 5% commission remittances.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedPropertyIds([]);
            setSelectedTenantIds([]);
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-[#12897F] hover:bg-[#0e6e66] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Agent</span>
        </button>
      </div>

      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Active Agents</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{agents.length}</div>
          <span className="text-[11px] text-teal-600 font-semibold mt-0.5 block">Managing field operations</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Rent Roll Managed</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{formatNaira(totalVolume)}</div>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Portfolio lease volume</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Unremitted Commissions (5%)</span>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">{formatNaira(totalUnremitted)}</div>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
            {formatNaira(totalRemitted)} already remitted
          </span>
        </div>
      </div>

      {/* Agents List or Empty State */}
      {agents.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 sm:p-14 border border-slate-200 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-center mx-auto text-[#12897F]">
            <UserCheck className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">No agents registered yet</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Onboard your field representatives and estate managers, assign them properties and tenants, and track 5% commission earnings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#12897F] hover:bg-[#0f766e] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard First Agent</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 text-[#12897F] flex items-center justify-center font-bold text-sm">
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{agent.name}</h3>
                      <div className="text-[11px] text-slate-400 mt-0.5">{agent.email}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAgentToDelete(agent)}
                    title={`Delete agent ${agent.name}`}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{agent.phone}</span>
                </div>

                {/* Assigned Properties Badges */}
                {agent.assignedPropertyNames && agent.assignedPropertyNames.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Assigned Estates ({agent.assignedPropertyNames.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {agent.assignedPropertyNames.map((pName, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-medium"
                        >
                          {pName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assigned Tenants Badges */}
                {agent.assignedTenantNames && agent.assignedTenantNames.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Managed Tenants ({agent.assignedTenantNames.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {agent.assignedTenantNames.map((tName, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-medium"
                        >
                          {tName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats Breakdown */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Estates</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{agent.assignedPropertiesCount} Estates</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tenants Managed</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{agent.managedTenantsCount} Tenants</span>
                  </div>
                </div>

                <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-800 font-medium">Pending Commission:</span>
                    <span className="font-bold text-amber-900">{formatNaira(agent.unremittedCommission)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Remitted to Date:</span>
                    <span>{formatNaira(agent.remittedCommission)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRemitAll(agent.id)}
                  disabled={agent.unremittedCommission === 0}
                  className="flex-1 py-2 text-center text-xs font-semibold bg-[#12897F] hover:bg-[#0f766e] text-white rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Remit Commission
                </button>

                {onSimulateAgentPOV && (
                  <button
                    type="button"
                    onClick={() => onSimulateAgentPOV(agent.id)}
                    className="py-2 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer flex items-center gap-1"
                  >
                    <span>Agent POV</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Agent Confirmation Modal */}
      {agentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={() => setAgentToDelete(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 p-6 space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Agent?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-800">{agentToDelete.name}</strong> from the agent roster? Any linked estate assignments will need to be reassigned.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAgentToDelete(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAgent}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition cursor-pointer"
              >
                Delete Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Agent Modal with Assigned Tenants & Properties */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="bg-[#0B1D2E] p-4 sm:p-5 text-white flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">Onboard Managing Agent</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAgent} className="p-4 sm:p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Agent Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Emeka Nwosu"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="emeka@fugsonproperty.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number (WhatsApp)</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+234 803 123 4567"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agent Specialty / Role</label>
                <input
                  type="text"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="e.g. Residential Leasing & Arrears Collection"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                />
              </div>

              {/* ASSIGNED PROPERTIES SECTION */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-[#12897F]" />
                    <span>Assign Properties / Estates</span>
                  </label>
                  <span className="text-[11px] font-semibold text-[#12897F] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    {selectedPropertyIds.length} Selected
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Select the estate portfolios this agent will oversee and manage collections for:
                </p>

                {allProperties.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-center">
                    No properties currently registered in portfolio. Add properties in the Estates tab.
                  </div>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                    {allProperties.map((prop) => {
                      const isSelected = selectedPropertyIds.includes(prop.id);
                      return (
                        <div
                          key={prop.id}
                          onClick={() => togglePropertySelection(prop.id)}
                          className={`p-2 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-teal-50 border-teal-300 text-teal-950 font-semibold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <span className="block">{prop.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {prop.type} • {prop.location}
                            </span>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-[#12897F] border-[#12897F] text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ASSIGNED TENANTS SECTION */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Assign Tenants</span>
                  </label>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {selectedTenantIds.length} Selected
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Select which tenants this agent will directly manage and collect 5% commission on:
                </p>

                {allTenants.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-center">
                    No tenants currently registered. Add tenants in the Tenants tab or via Tenant Sign Up.
                  </div>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                    {allTenants.map((tenant) => {
                      const isSelected = selectedTenantIds.includes(tenant.id);
                      return (
                        <div
                          key={tenant.id}
                          onClick={() => toggleTenantSelection(tenant.id)}
                          className={`p-2 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50 border-blue-300 text-blue-950 font-semibold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <span className="block">{tenant.tenantName}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {tenant.unit} • {tenant.property} ({formatNaira(tenant.amount)})
                            </span>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#12897F] text-white font-semibold rounded-lg hover:bg-[#0e6e66] transition cursor-pointer shadow-2xs"
                >
                  Confirm & Onboard Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
