'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { AgentItem } from '@/src/types';
import { agentService } from '@/src/services/agentService';
import { formatNaira } from '@/src/utils/auth';

interface AdminAgentsViewProps {
  onSimulateAgentPOV?: (agentId: string) => void;
}

export default function AdminAgentsView({ onSimulateAgentPOV }: AdminAgentsViewProps) {
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await agentService.getAgents();
      setAgents(data);
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
      </div>

      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Active Agents</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{agents.length}</div>
          <span className="text-[11px] text-teal-700 font-semibold mt-0.5 block">100% Territory Coverage</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Commission Liability (Owed)</span>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">{formatNaira(totalUnremitted)}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Pending admin bank clearance</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Remitted to Date</span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">{formatNaira(totalRemitted)}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Cleared wire disbursements</span>
        </div>
      </div>

      {/* Responsive Agents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Agent Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#0B1D2E] text-white flex items-center justify-center font-bold text-sm">
                    {agent.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">{agent.name}</h3>
                    <span className="text-[11px] text-teal-700 font-semibold block mt-0.5">{agent.specialty}</span>
                  </div>
                </div>

                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {agent.status}
                </span>
              </div>

              {/* Contact details */}
              <div className="space-y-1 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{agent.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{agent.email}</span>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-slate-400 text-[10px] block uppercase font-medium">Assigned Estates</span>
                  <span className="font-bold text-slate-800 text-sm">{agent.assignedPropertiesCount} Estates</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-slate-400 text-[10px] block uppercase font-medium">Managed Tenants</span>
                  <span className="font-bold text-slate-800 text-sm">{agent.managedTenantsCount} Tenants</span>
                </div>
              </div>

              {/* Financial Commissions */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total Leases Managed:</span>
                  <span className="font-bold text-slate-900">{formatNaira(agent.totalLeaseVolume)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Unremitted (5% Owed):</span>
                  <span className={`font-bold ${agent.unremittedCommission > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                    {formatNaira(agent.unremittedCommission)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Remitted to Bank:</span>
                  <span className="font-bold text-emerald-700">{formatNaira(agent.remittedCommission)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => handleRemitAll(agent.id)}
                disabled={agent.unremittedCommission === 0}
                className={`w-full py-2 px-3 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  agent.unremittedCommission > 0
                    ? 'bg-[#12897F] hover:bg-[#0f766e] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Remit Commissions</span>
              </button>

              <button
                type="button"
                onClick={() => onSimulateAgentPOV?.(agent.id)}
                className="w-full sm:w-auto py-2 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition shrink-0 flex items-center justify-center gap-1 cursor-pointer"
                title="View Agent POV Dashboard"
              >
                <span>Agent View</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
