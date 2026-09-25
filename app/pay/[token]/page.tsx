'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  Download,
  AlertCircle,
  FileText,
  Wrench,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Clock,
  X,
  Send,
  Lock,
  ArrowDownLeft,
  FileCheck,
  Info,
  LogOut,
  RefreshCw,
  Users,
  AlertOctagon,
  Check,
  BadgeAlert,
  Mail,
} from 'lucide-react';
import { formatNaira, getCurrentUser, logout } from '@/src/utils/auth';
import { HOUSE_RULES, INITIAL_TENANT_PAYMENTS } from '@/src/data/mockData';
import { PaymentRecord } from '@/src/types';
import { tenantService } from '@/src/services/tenantService';

interface TenantPortalProps {
  params?: { token?: string };
  onNavigate?: (path: string) => void;
}

export default function TenantPublicPortal({ params, onNavigate }: TenantPortalProps) {
  // Determine initial tenant based on current user
  const currentUser = typeof window !== 'undefined' ? getCurrentUser() : null;
  const initialTenantId = currentUser?.tenantId || '';

  const [selectedTenantId, setSelectedTenantId] = useState<string>(initialTenantId);
  const [tenants, setTenants] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTenants = async () => {
      setIsLoading(true);
      const data = await tenantService.getTenants();
      setTenants(data);
      if (data.length > 0) {
        if (!selectedTenantId || !data.some((t) => t.id === selectedTenantId)) {
          setSelectedTenantId(data[0].id);
        }
      }
      setIsLoading(false);
    };
    fetchTenants();
  }, []);

  // Active tenant record
  const currentTenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0];

  // Modals & UI states
  const [showHouseRules, setShowHouseRules] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Payment form state inside modal
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'TRANSFER'>('CARD');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [leaseYears, setLeaseYears] = useState<number>(1);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Maintenance form state
  const [maintenanceCategory, setMaintenanceCategory] = useState('Irrigation / Well');
  const [maintenanceDesc, setMaintenanceDesc] = useState('');
  const [maintenanceUrgency, setMaintenanceUrgency] = useState('Medium');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Sync payment amount when selected tenant changes
  useEffect(() => {
    if (currentTenant) {
      if (currentTenant.amountOwed > 0) {
        setPaymentAmount(currentTenant.amountOwed);
      } else {
        setPaymentAmount(currentTenant.amount);
      }
    }
  }, [selectedTenantId, currentTenant?.amountOwed, currentTenant?.amount]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSwitchTenant = (id: string) => {
    setSelectedTenantId(id);
    showToast(`Switched Tenant POV to: ${tenants.find((t) => t.id === id)?.tenantName}`);
  };

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceDesc.trim()) return;

    setIsSubmittingTicket(true);
    setTimeout(() => {
      setIsSubmittingTicket(false);
      setShowMaintenanceModal(false);
      setMaintenanceDesc('');
      showToast('Maintenance complaint #FUG-MNT-912 dispatched to field team.');
    }, 600);
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      setShowPaymentModal(false);

      // Update tenant state to Paid
      const newPaidAmount = currentTenant.amountPaid + paymentAmount;
      const receiptNo = `REC-FUG-${Date.now().toString().slice(-6)}`;
      const updatedTenant: PaymentRecord = {
        ...currentTenant,
        amountOwed: 0,
        amountPaid: newPaidAmount,
        status: 'Paid',
        receiptNumber: receiptNo,
      };

      setTenants((prev) => prev.map((t) => (t.id === currentTenant.id ? updatedTenant : t)));
      tenantService.updateTenant(currentTenant.id, updatedTenant);

      if (currentTenant.autoEmailReceipt) {
        showToast(`Payment confirmed! [Email Sent] Official receipt #${receiptNo} automatically emailed to ${currentTenant.tenantEmail || 'your email'}.`);
      } else {
        showToast(`Payment of ${formatNaira(paymentAmount)} confirmed! Receipt generated.`);
      }
    }, 900);
  };

  const handleExitPortal = () => {
    logout();
    if (onNavigate) {
      onNavigate('/login');
    } else if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center text-slate-500 text-xs">
        Loading Tenant Portal...
      </div>
    );
  }

  if (!currentTenant) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center px-4 font-sans text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#12897F] flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No Tenant Invoices Available</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            There are currently no active tenant records registered in Fugson Property. Please sign in as an Administrator to onboard tenants and issue verified rent tokens.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={() => onNavigate ? onNavigate('/login') : (typeof window !== 'undefined' ? window.location.href = '/login' : null)}
              className="px-4 py-2 bg-[#12897F] text-white text-xs font-semibold rounded-xl hover:bg-[#0f766e] transition cursor-pointer"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-800 flex flex-col justify-start items-center px-4 py-6 sm:py-10 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 z-50 bg-[#0B1D2E] text-white px-4 py-3 rounded-xl shadow-lg border border-teal-500/40 flex items-center gap-3 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top POV Header Banner with Tenant Switcher */}
      <div className="w-full max-w-lg mb-4 bg-white border border-teal-200/80 rounded-2xl p-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#12897F] flex items-center justify-center font-bold text-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider block">
                Active Tenant POV
              </span>
              <span className="text-xs font-bold text-slate-900">
                {currentTenant.tenantName} ({currentTenant.unit})
              </span>
            </div>
          </div>

          {/* Quick Persona Switcher Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {tenants.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSwitchTenant(t.id)}
                title={`Switch to ${t.tenantName}`}
                className={`text-[10px] px-2 py-1 rounded-md font-semibold transition shrink-0 cursor-pointer ${
                  selectedTenantId === t.id
                    ? 'bg-[#12897F] text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {t.tenantName.split(' ')[0]} ({t.status})
              </button>
            ))}

            <button
              onClick={handleExitPortal}
              title="Log out and return to Login"
              className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-md font-medium transition shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Centered Mobile-First Card Container (NO SIDEBAR) */}
      <div className="w-full max-w-lg space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header Branding */}
          <div className="bg-[#0B1D2E] px-6 py-6 text-white text-center relative">
            <div className="w-12 h-12 rounded-2xl bg-[#12897F] flex items-center justify-center mx-auto mb-3 shadow-md">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">Fugson Property</h1>
            <p className="text-xs text-teal-300 font-medium">Tenant Verified Payment Portal</p>

            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] text-teal-300">
              <Mail className="w-3.5 h-3.5 text-[#12897F]" />
              <span>Verified Email Invoicing Link</span>
              <span className="text-[10px] font-bold bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded border border-teal-400/30">
                [Email: Verified]
              </span>
            </div>
          </div>

          {/* Tenant Identity Block */}
          <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Tenant Name
                </span>
                <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  {currentTenant.tenantName}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {currentTenant.unit} • {currentTenant.property}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Lease Period: <span className="text-slate-700 font-medium">{currentTenant.leasePeriod}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-col items-end gap-1.5">
                {currentTenant.status === 'Paid' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Paid
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-3.5 h-3.5" />
                    Overdue
                  </span>
                )}

                {currentTenant.multiYearEligible && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-[#12897F] border border-teal-200">
                    Multi-Year Advance Enabled
                  </span>
                )}
              </div>
            </div>

            {/* Misconduct Notice Banner if strikes exist */}
            {currentTenant.misconductStrikes && currentTenant.misconductStrikes.length > 0 && (
              <div className="mt-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">
                    Covenant Warning ({currentTenant.misconductStrikes.length} Strike Active):
                  </strong>{' '}
                  {currentTenant.misconductStrikes[0].description}
                </div>
              </div>
            )}
          </div>

          {/* Amounts & Payment Action */}
          <div className="p-5 sm:p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3.5">
              {/* Amount Owed */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                  Amount Owed
                </span>
                <span
                  className={`text-xl sm:text-2xl font-extrabold mt-1 block tracking-tight ${
                    currentTenant.amountOwed > 0 ? 'text-amber-600' : 'text-slate-800'
                  }`}
                >
                  {formatNaira(currentTenant.amountOwed)}
                </span>
              </div>

              {/* Amount Paid */}
              <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200/80">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase block">
                  Amount Paid
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-1 block tracking-tight">
                  {formatNaira(currentTenant.amountPaid)}
                </span>
              </div>
            </div>

            {/* "Pay Rent Now" Button */}
            <div className="space-y-2.5">
              <button
                type="button"
                id="btn-pay-rent-now"
                disabled={currentTenant.amountOwed === 0 && !currentTenant.multiYearEligible}
                onClick={() => setShowPaymentModal(true)}
                className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
                  currentTenant.amountOwed === 0 && !currentTenant.multiYearEligible
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    : 'bg-[#12897F] hover:bg-[#0f766e] text-white cursor-pointer active:scale-[0.99]'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {currentTenant.amountOwed > 0
                    ? `Pay Rent Now (${formatNaira(currentTenant.amountOwed)})`
                    : currentTenant.multiYearEligible
                    ? 'Prepay Advance Multi-Year Lease'
                    : 'Pay Rent Now'}
                </span>
              </button>

              {/* Required Prompt Note */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-start gap-2">
                <Info className="w-4 h-4 text-[#12897F] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-slate-700 font-semibold">Note: </strong>
                  {currentTenant.multiYearEligible
                    ? 'Multi-year advance payment has been approved by Admin for your account.'
                    : 'Multi-year payments require Admin approval.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History List with "Download Receipt" */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Payment History & Receipts
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Synced</span>
          </div>

          <div className="divide-y divide-slate-100">
            {currentTenant.status === 'Paid' && (
              <div className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Annual Lease Payment ({currentTenant.leasePeriod})
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {currentTenant.date} • {formatNaira(currentTenant.amountPaid)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const email = currentTenant.tenantEmail || `${currentTenant.tenantName.toLowerCase().replace(/\s+/g, '.')}@example.com`;
                      showToast(`Statement & invoice sent to ${email}`);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition cursor-pointer border border-slate-200"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#12897F]" />
                    <span>Send Statement to my Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowReceiptModal(currentTenant.receiptNumber || 'REC-FUG-2025-084')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#12897F] hover:text-[#0f766e] bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition cursor-pointer border border-teal-100"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            )}

            <div className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Prior Term Agricultural Tenancy (2024)
                </div>
                <div className="text-[11px] text-slate-500">
                  15 Feb 2024 • ₦3,200,000
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const email = currentTenant.tenantEmail || `${currentTenant.tenantName.toLowerCase().replace(/\s+/g, '.')}@example.com`;
                    showToast(`Statement & invoice sent to ${email}`);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition cursor-pointer border border-slate-200"
                >
                  <Mail className="w-3.5 h-3.5 text-[#12897F]" />
                  <span>Send Statement to my Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowReceiptModal('REC-FUG-2024-032')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#12897F] hover:text-[#0f766e] bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition cursor-pointer border border-teal-100"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Links: "House Rules" and "Raise Maintenance Complaint" */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            id="btn-house-rules"
            onClick={() => setShowHouseRules(true)}
            className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left shadow-2xs transition cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#12897F] group-hover:bg-[#12897F] group-hover:text-white flex items-center justify-center mb-2 transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-900">House Rules</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Agricultural & estate covenants</div>
          </button>

          <button
            type="button"
            id="btn-raise-maintenance"
            onClick={() => setShowMaintenanceModal(true)}
            className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left shadow-2xs transition cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center mb-2 transition-colors">
              <Wrench className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-900">Raise Maintenance Complaint</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Borehole, power & facility repairs</div>
          </button>
        </div>
      </div>

      {/* House Rules Modal */}
      {showHouseRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={() => setShowHouseRules(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
            <div className="bg-[#0B1D2E] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">Fugson Property House Rules</h3>
              </div>
              <button onClick={() => setShowHouseRules(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs text-slate-600 max-h-[60vh] overflow-y-auto">
              {HOUSE_RULES.map((rule, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-3 last:border-none last:pb-0">
                  <h4 className="font-bold text-slate-900 mb-1">{rule.title}</h4>
                  <p className="leading-relaxed">{rule.rule}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setShowHouseRules(false)}
                className="px-4 py-2 bg-[#12897F] text-white text-xs font-semibold rounded-lg"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Raise Maintenance Complaint Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={() => setShowMaintenanceModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
            <div className="bg-[#0B1D2E] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">Raise Maintenance Complaint</h3>
              </div>
              <button onClick={() => setShowMaintenanceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMaintenanceSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue Category</label>
                <select
                  value={maintenanceCategory}
                  onChange={(e) => setMaintenanceCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                >
                  <option value="Irrigation / Well">Irrigation / Well Pump & Water Swale</option>
                  <option value="Electrical">Electrical Wiring & Solar Inverter</option>
                  <option value="Plumbing">Plumbing & Sump Drainage</option>
                  <option value="Structural">Perimeter Fence & Gate Lock</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Urgency</label>
                <select
                  value={maintenanceUrgency}
                  onChange={(e) => setMaintenanceUrgency(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                >
                  <option value="Medium">Medium (Inspect within 24 hours)</option>
                  <option value="High">High (Immediate farm operations risk)</option>
                  <option value="Low">Low (Routine maintenance)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description of Issue</label>
                <textarea
                  rows={3}
                  required
                  value={maintenanceDesc}
                  onChange={(e) => setMaintenanceDesc(e.target.value)}
                  placeholder="Detail the location on property, nature of breakdown, etc..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTicket}
                  className="px-4 py-2 bg-[#12897F] hover:bg-[#0f766e] text-white rounded-lg font-semibold flex items-center gap-1.5 transition"
                >
                  {isSubmittingTicket ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Rent Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={() => setShowPaymentModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
            <div className="bg-[#0B1D2E] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">Lease Payment Settlement</h3>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecutePayment} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1">
                <div className="text-[11px] font-bold uppercase text-teal-800">Unit & Tenancy</div>
                <div className="font-bold text-slate-900">{currentTenant.tenantName}</div>
                <div className="text-slate-600">{currentTenant.unit} • {currentTenant.property}</div>
              </div>

              {/* Lease duration selector if multi-year enabled */}
              {currentTenant.multiYearEligible && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Advance Lease Payment Period
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((yrs) => (
                      <button
                        key={yrs}
                        type="button"
                        onClick={() => {
                          setLeaseYears(yrs);
                          setPaymentAmount((currentTenant.amount || 1200000) * yrs);
                        }}
                        className={`py-2 px-2.5 rounded-lg border text-center transition ${
                          leaseYears === yrs
                            ? 'border-[#12897F] bg-teal-50 text-[#12897F] font-bold'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {yrs} {yrs === 1 ? 'Year' : 'Years'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Settlement Amount (₦)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>
              </div>

              {/* Payment Channel */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 ${
                      paymentMethod === 'CARD'
                        ? 'border-[#12897F] bg-teal-50/50 text-[#12897F] font-semibold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card / Paystack</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('TRANSFER')}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 ${
                      paymentMethod === 'TRANSFER'
                        ? 'border-[#12897F] bg-teal-50/50 text-[#12897F] font-semibold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Direct Transfer</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'TRANSFER' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-slate-600">
                  <div className="font-bold text-slate-800">Providus Bank (Dedicated Virtual Swale Account)</div>
                  <div className="font-mono text-sm font-extrabold text-[#12897F]">9920194812</div>
                  <div className="text-[11px] text-slate-500">Account Name: Fugson Property - {currentTenant.tenantName}</div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="px-4 py-2.5 bg-[#12897F] hover:bg-[#0f766e] text-white rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {isProcessingPayment ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Confirming Settlement...</span>
                    </div>
                  ) : (
                    <span>Confirm & Pay {formatNaira(paymentAmount)}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Preview & Download Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={() => setShowReceiptModal(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden z-10">
            <div className="bg-[#0B1D2E] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">Official Tenancy Receipt</h3>
              </div>
              <button onClick={() => setShowReceiptModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 font-mono">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Receipt Ref:</span>
                  <span className="font-bold text-slate-800">{showReceiptModal}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Tenant:</span>
                  <span className="font-bold text-slate-800">{currentTenant.tenantName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Property:</span>
                  <span className="font-bold text-slate-800">{currentTenant.property}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-bold text-emerald-700">{formatNaira(currentTenant.amountPaid || currentTenant.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-600 uppercase">Settled & Cleared</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(null)}
                  className="px-3.5 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium text-xs cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const email = currentTenant.tenantEmail || `${currentTenant.tenantName.toLowerCase().replace(/\s+/g, '.')}@example.com`;
                    showToast(`Official statement & receipt ${showReceiptModal} sent to ${email}`);
                  }}
                  className="px-3.5 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-[#12897F]" />
                  <span>Send Statement to my Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Receipt ${showReceiptModal}.pdf downloaded to device.`);
                    setShowReceiptModal(null);
                  }}
                  className="px-4 py-2 bg-[#12897F] hover:bg-[#0f766e] text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
