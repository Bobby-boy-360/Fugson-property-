'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  Download,
  FileText,
  Wrench,
  CheckCircle2,
  Clock,
  X,
  Send,
  Lock,
  FileCheck,
  Info,
  LogOut,
  Users,
  AlertOctagon,
  Mail,
} from 'lucide-react';

import { formatNaira, getCurrentUser, logout } from '@/src/auth';
import { HOUSE_RULES } from '@/src/data/mockData';
import { PaymentRecord } from '@/src/types';
import { tenantService } from '@/src/services/tenantService';

interface TenantPortalProps {
  params?: {
    token?: string;
  };
  onNavigate?: (path: string) => void;
}

export default function TenantPublicPortal({
  params,
  onNavigate,
}: TenantPortalProps) {
  const currentUser =
    typeof window !== 'undefined' ? getCurrentUser() : null;

  const initialTenantId = currentUser?.tenantId || '';

  const [selectedTenantId, setSelectedTenantId] =
    useState<string>(initialTenantId);

  const [tenants, setTenants] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showHouseRules, setShowHouseRules] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] =
    useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState<'CARD' | 'TRANSFER'>('CARD');

  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [leaseYears, setLeaseYears] = useState<number>(2);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [maintenanceCategory, setMaintenanceCategory] =
    useState('Plumbing');

  const [maintenanceDesc, setMaintenanceDesc] = useState('');
  const [maintenanceUrgency, setMaintenanceUrgency] =
    useState('Medium');

  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  const isUnauthorizedTenantView = Boolean(
  currentUser?.role === 'TENANT' &&
  currentUser.tenantId &&
  selectedTenantId &&
  selectedTenantId !== currentUser.tenantId
);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setIsLoading(true);

        const data = await tenantService.getTenants();

        setTenants(data);

        if (data.length === 0) {
          setSelectedTenantId('');
          return;
        }

        if (currentUser?.role === 'TENANT' && currentUser.tenantId) {
          const ownTenant = data.find(
            (tenant) => tenant.id === currentUser.tenantId
          );

          setSelectedTenantId(
            ownTenant?.id || currentUser.tenantId
          );

          return;
        }

        if (
          params?.token &&
          data.some((tenant) => tenant.id === params.token)
        ) {
          setSelectedTenantId(params.token);
          return;
        }

        if (
          initialTenantId &&
          data.some((tenant) => tenant.id === initialTenantId)
        ) {
          setSelectedTenantId(initialTenantId);
          return;
        }

        if (
          currentUser?.role === 'ADMIN' ||
          currentUser?.role === 'AGENT'
        ) {
          setSelectedTenantId(data[0].id);
        }
      } catch (error) {
        console.error('Failed to load tenant portal:', error);
        setTenants([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenants();
  }, [
    currentUser?.role,
    currentUser?.tenantId,
    initialTenantId,
    params?.token,
  ]);

  const currentTenant =
    tenants.find((tenant) => tenant.id === selectedTenantId) ||
    (currentUser?.role === 'ADMIN' || currentUser?.role === 'AGENT'
      ? tenants[0]
      : undefined);

  const adminApprovedMaxYears = (() => {
    if (!currentTenant) {
      return 2;
    }

    if (
      currentTenant.leaseYears &&
      currentTenant.leaseYears >= 2
    ) {
      return Math.min(4, currentTenant.leaseYears);
    }

    if (currentTenant.leasePeriod) {
      const match = currentTenant.leasePeriod.match(
        /(\d+)\s*(?:year|yr)/i
      );

      if (match) {
        return Math.min(
          4,
          Math.max(2, parseInt(match[1], 10))
        );
      }

      const directNumber =
        currentTenant.leasePeriod.trim().match(/^(\d+)$/);

      if (directNumber) {
        return Math.min(
          4,
          Math.max(2, parseInt(directNumber[1], 10))
        );
      }
    }

    return 2;
  })();

  const availableAdvanceYears = [2, 3, 4].filter(
    (year) => year <= adminApprovedMaxYears
  );

  const effectiveLeaseYears = availableAdvanceYears.includes(
    leaseYears
  )
    ? leaseYears
    : availableAdvanceYears[0] || 2;

  useEffect(() => {
    if (!currentTenant) {
      return;
    }

    if (currentTenant.multiYearEligible) {
      const initialYear = availableAdvanceYears[0] || 2;

      setLeaseYears(initialYear);

      const annualRate =
        currentTenant.amount > 0
          ? currentTenant.amount
          : 2500000;

      setPaymentAmount(annualRate * initialYear);
      return;
    }

    if (currentTenant.amountOwed > 0) {
      setLeaseYears(1);
      setPaymentAmount(currentTenant.amountOwed);
      return;
    }

    setLeaseYears(1);
    setPaymentAmount(currentTenant.amount);
  }, [
    currentTenant?.id,
    currentTenant?.amountOwed,
    currentTenant?.amount,
    currentTenant?.multiYearEligible,
    currentTenant?.leaseYears,
    currentTenant?.leasePeriod,
    adminApprovedMaxYears,
  ]);

  const showToast = (message: string) => {
    setToastMessage(message);

    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleMaintenanceSubmit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!maintenanceDesc.trim()) {
      return;
    }

    setIsSubmittingTicket(true);

    setTimeout(() => {
      setIsSubmittingTicket(false);
      setShowMaintenanceModal(false);
      setMaintenanceDesc('');

      showToast(
        'Maintenance complaint #FUG-MNT-912 dispatched to field team.'
      );
    }, 600);
  };

  const handleExecutePayment = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const tenant = currentTenant;

    if (!tenant) {
      showToast('Tenant information is not available.');
      return;
    }

    if (paymentAmount <= 0) {
      showToast('Please enter a valid payment amount.');
      return;
    }

    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      setShowPaymentModal(false);

      const newPaidAmount =
        tenant.amountPaid + paymentAmount;

      const receiptNo = `REC-FUG-${Date.now()
        .toString()
        .slice(-6)}`;

      const currentYear = new Date().getFullYear();

      const updatedTenant: PaymentRecord = {
        ...tenant,
        id: tenant.id,
        amountOwed: 0,
        amountPaid: newPaidAmount,
        status: 'Paid',
        receiptNumber: receiptNo,
        leasePeriod:
          leaseYears > 1
            ? `${leaseYears} Years Advance Lease (${currentYear} – ${
                currentYear + leaseYears
              })`
            : tenant.leasePeriod,
      };

      setTenants((previousTenants) =>
        previousTenants.map((item) =>
          item.id === tenant.id ? updatedTenant : item
        )
      );

      tenantService
        .updateTenant(tenant.id, updatedTenant)
        .catch((error) => {
          console.error(
            'Failed to update tenant after payment:',
            error
          );
        });

      if (tenant.autoEmailReceipt) {
        showToast(
          `Payment confirmed! Official receipt #${receiptNo} automatically emailed to ${
            tenant.tenantEmail || 'your email'
          }.`
        );
      } else {
        showToast(
          `Payment of ${formatNaira(
            paymentAmount
          )} confirmed! Receipt generated.`
        );
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

  if (isUnauthorizedTenantView) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center px-4 font-sans text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-lg font-bold text-slate-900">
            Access Restricted
          </h2>

          <p className="text-xs text-slate-500 leading-relaxed">
            Tenants are strictly restricted to their own resident
            portal. You do not have permission to view other
            residents&apos; accounts.
          </p>

          <div className="pt-2 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                const target = `/pay/${currentUser?.tenantId}`;

                if (onNavigate) {
                  onNavigate(target);
                } else if (typeof window !== 'undefined') {
                  window.location.href = target;
                }
              }}
              className="px-4 py-2 bg-[#12897F] text-white text-xs font-semibold rounded-xl hover:bg-[#0f766e] transition cursor-pointer"
            >
              Go to My Resident Portal
            </button>
          </div>
        </div>
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

          <h2 className="text-lg font-bold text-slate-900">
            Resident Portal
          </h2>

          <p className="text-xs text-slate-500 leading-relaxed">
            No active billing invoice is registered yet for your
            resident account. Please contact property
            administration to verify your lease registration.
          </p>

          <div className="pt-2 flex justify-center gap-2">
            <button
              type="button"
              onClick={handleExitPortal}
              className="px-4 py-2 bg-[#12897F] text-white text-xs font-semibold rounded-xl hover:bg-[#0f766e] transition cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-800 flex flex-col justify-start items-center px-4 py-6 sm:py-10 font-sans">
      {toastMessage && (
        <div className="fixed bottom-5 z-50 bg-[#0B1D2E] text-white px-4 py-3 rounded-xl shadow-lg border border-teal-500/40 flex items-center gap-3 text-xs sm:text-sm">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />

          <span>{toastMessage}</span>

          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="w-full max-w-lg mb-4 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#12897F] flex items-center justify-center font-bold text-xs">
              <Users className="w-4 h-4" />
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#12897F] tracking-wider block">
                Resident Portal
              </span>

              <span className="text-xs font-bold text-slate-900">
                {currentTenant.tenantName}{' '}
                <span className="text-slate-500 font-normal">
                  ({currentTenant.unit})
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser &&
              (currentUser.role === 'ADMIN' ||
                currentUser.role === 'AGENT') && (
                <button
                  type="button"
                  onClick={() => {
                    const target =
                      currentUser.role === 'ADMIN'
                        ? '/admin'
                        : '/agent';

                    if (onNavigate) {
                      onNavigate(target);
                    } else if (
                      typeof window !== 'undefined'
                    ) {
                      window.location.href = target;
                    }
                  }}
                  className="text-xs px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-[#12897F] border border-teal-200 rounded-lg font-semibold transition shrink-0 cursor-pointer"
                >
                  Back to{' '}
                  {currentUser.role === 'ADMIN'
                    ? 'Admin'
                    : 'Agent'}
                </button>
              )}

            <button
              type="button"
              onClick={handleExitPortal}
              title="Log out and return to Login"
              className="text-xs px-3 py-1.5 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-lg space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-[#0B1D2E] px-6 py-6 text-white text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#12897F] flex items-center justify-center mx-auto mb-3 shadow-md">
              <Building2 className="w-6 h-6 text-white" />
            </div>

            <h1 className="font-bold text-xl tracking-tight">
              Fugson Property
            </h1>

            <p className="text-xs text-teal-300 font-medium">
              Tenant Verified Payment Portal
            </p>

            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] text-teal-300">
              <Mail className="w-3.5 h-3.5 text-[#12897F]" />

              <span>Verified Email Invoicing Link</span>

              <span className="text-[10px] font-bold bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded border border-teal-400/30">
                Email: Verified
              </span>
            </div>
          </div>

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
                  Lease Period:{' '}
                  <span className="text-slate-700 font-medium">
                    {currentTenant.leasePeriod}
                  </span>
                </div>
              </div>

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

            {currentTenant.misconductStrikes &&
              currentTenant.misconductStrikes.length > 0 && (
                <div className="mt-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
                  <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />

                  <div>
                    <strong className="font-bold">
                      Covenant Warning (
                      {currentTenant.misconductStrikes.length}{' '}
                      Strike Active):
                    </strong>{' '}

                    {currentTenant.misconductStrikes[0]
                      .description}
                  </div>
                </div>
              )}
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                  Amount Owed
                </span>

                <span
                  className={`text-xl sm:text-2xl font-extrabold mt-1 block tracking-tight ${
                    currentTenant.amountOwed > 0
                      ? 'text-amber-600'
                      : 'text-slate-800'
                  }`}
                >
                  {formatNaira(currentTenant.amountOwed)}
                </span>
              </div>

              <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200/80">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase block">
                  Amount Paid
                </span>

                <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-1 block tracking-tight">
                  {formatNaira(currentTenant.amountPaid)}
                </span>
              </div>
            </div>

            {currentTenant.multiYearEligible && (
              <div className="p-4 sm:p-5 rounded-xl bg-teal-50/70 border border-teal-200/90 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#12897F]" />
                      Multi-Year Advance Tenancy Plan
                    </div>

                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Admin has enabled advance payment on your
                      account. Choose the number of years you
                      want to prepay.
                    </p>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-100 text-[#12897F] border border-teal-200 shrink-0">
                    Admin Approved
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center justify-between">
                    <span>Select Number of Years:</span>

                    <span className="text-[#12897F] font-bold text-xs">
                      {effectiveLeaseYears} Years Selected
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {availableAdvanceYears.map((years) => {
                      const isSelected =
                        effectiveLeaseYears === years;

                      const annualRate =
                        currentTenant.amount > 0
                          ? currentTenant.amount
                          : 2500000;

                      const totalAdvance = annualRate * years;

                      return (
                        <button
                          key={years}
                          type="button"
                          onClick={() => {
                            setLeaseYears(years);
                            setPaymentAmount(totalAdvance);
                          }}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#12897F] text-white border-[#12897F] shadow-sm ring-2 ring-teal-600/30'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50/40'
                          }`}
                        >
                          <div className="text-xs font-bold">
                            {years} Years
                          </div>

                          <div
                            className={`text-[10px] mt-1 font-medium ${
                              isSelected
                                ? 'text-teal-100'
                                : 'text-slate-500'
                            }`}
                          >
                            {formatNaira(totalAdvance)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px]">
                      Advance Coverage:
                    </span>{' '}

                    <strong className="text-slate-800 font-bold">
                      {effectiveLeaseYears} Years Extended
                      Tenancy
                    </strong>

                    <span className="text-slate-400 text-[11px] ml-1.5">
                      ({new Date().getFullYear()} –{' '}
                      {new Date().getFullYear() +
                        effectiveLeaseYears}
                      )
                    </span>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-slate-500 text-[11px]">
                      Total Prepayment:{' '}
                    </span>

                    <span className="font-extrabold text-[#12897F] text-sm">
                      {formatNaira(
                        (currentTenant.amount > 0
                          ? currentTenant.amount
                          : 2500000) * effectiveLeaseYears
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              <button
                type="button"
                id="btn-pay-rent-now"
                disabled={
                  currentTenant.amountOwed === 0 &&
                  !currentTenant.multiYearEligible
                }
                onClick={() => {
                  if (currentTenant.multiYearEligible) {
                    setPaymentAmount(
                      (currentTenant.amount > 0
                        ? currentTenant.amount
                        : 2500000) * effectiveLeaseYears
                    );
                  }

                  setShowPaymentModal(true);
                }}
                className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
                  currentTenant.amountOwed === 0 &&
                  !currentTenant.multiYearEligible
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    : 'bg-[#12897F] hover:bg-[#0f766e] text-white cursor-pointer active:scale-[0.99]'
                }`}
              >
                <CreditCard className="w-4 h-4" />

                <span>
                  {currentTenant.multiYearEligible
                    ? `Prepay ${effectiveLeaseYears} Years Advance (${formatNaira(
                        (currentTenant.amount > 0
                          ? currentTenant.amount
                          : 2500000) * effectiveLeaseYears
                      )})`
                    : currentTenant.amountOwed > 0
                    ? `Pay Rent Now (${formatNaira(
                        currentTenant.amountOwed
                      )})`
                    : 'Pay Rent Now'}
                </span>
              </button>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-start gap-2">
                <Info className="w-4 h-4 text-[#12897F] shrink-0 mt-0.5" />

                <div className="leading-relaxed">
                  <strong className="text-slate-700 font-semibold">
                    Note:{' '}
                  </strong>

                  {currentTenant.multiYearEligible
                    ? `Multi-year advance payment is enabled for your account (up to ${adminApprovedMaxYears} years approved). You can select the number of years above to prepay.`
                    : 'Multi-year payments require Admin approval.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            id="btn-house-rules"
            onClick={() => setShowHouseRules(true)}
            className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left shadow-sm transition cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#12897F] group-hover:bg-[#12897F] group-hover:text-white flex items-center justify-center mb-2 transition-colors">
              <FileText className="w-4 h-4" />
            </div>

            <div className="text-xs font-bold text-slate-900">
              House Rules
            </div>

            <div className="text-[11px] text-slate-400 mt-0.5">
              Estate covenants & community standards
            </div>
          </button>

          <button
            type="button"
            id="btn-raise-maintenance"
            onClick={() => setShowMaintenanceModal(true)}
            className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left shadow-sm transition cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center mb-2 transition-colors">
              <Wrench className="w-4 h-4" />
            </div>

            <div className="text-xs font-bold text-slate-900">
              Raise Maintenance Complaint
            </div>

            <div className="text-[11px] text-slate-400 mt-0.5">
              Borehole, power & facility repairs
            </div>
          </button>
        </div>
      </div>

      {showHouseRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/50"
            onClick={() => setShowHouseRules(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden z-10">
            <div className="bg-[#0B1D2E] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />

                <h3 className="font-bold text-sm">
                  Fugson Property House Rules
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowHouseRules(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs text-slate-600 max-h-[60vh] overflow-y-auto">
              {HOUSE_RULES.map((rule, index) => (
                <div
                  key={index}
                  className="border-b border-slate-100 pb-3 last:border-none last:pb-0"
                >
                  <h4 className="font-bold text-slate-900 mb-1">
                    {rule.title}
                  </h4>

                  <p className="leading-relaxed">
                    {rule.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                type="button"
                onClick={() => setShowHouseRules(false)}
                className="px-4 py-2 bg-[#12897F] text-white text-xs font-semibold rounded-lg"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/50"
            onClick={() => setShowMaintenanceModal(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden z-10">
            <div className="bg-[#0B1D2E] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-teal-400" />

                <h3 className="font-bold text-sm">
                  Raise Maintenance Complaint
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowMaintenanceModal(false)
                }
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleMaintenanceSubmit}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Issue Category
                </label>

                <select
                  value={maintenanceCategory}
                  onChange={(event) =>
                    setMaintenanceCategory(event.target.value)
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                >
                  <option value="Plumbing">
                    Water Supply, Borehole & Plumbing
                  </option>

                  <option value="Electrical">
                    Electrical Wiring & Solar Inverter
                  </option>

                  <option value="HVAC">
                    Air Conditioning & Ventilation
                  </option>

                  <option value="Structural">
                    Doors, Windows, Perimeter Fence & Gate Lock
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Urgency
                </label>

                <select
                  value={maintenanceUrgency}
                  onChange={(event) =>
                    setMaintenanceUrgency(event.target.value)
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                >
                  <option value="Medium">
                    Medium (Inspect within 24 hours)
                  </option>

                  <option value="High">
                    High (Urgent habitability / facility risk)
                  </option>

                  <option value="Low">
                    Low (Routine maintenance)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description of Issue
                </label>

                <textarea
                  rows={3}
                  required
                  value={maintenanceDesc}
                  onChange={(event) =>
                    setMaintenanceDesc(event.target.value)
                  }
                  placeholder="Detail the location on property, nature of breakdown, etc..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    setShowMaintenanceModal(false)
                  }
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

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/50"
            onClick={() => setShowPaymentModal(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
            <div className="bg-[#0B1D2E] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-400" />

                <h3 className="font-bold text-sm">
                  Lease Payment Settlement
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleExecutePayment}
              className="p-5 space-y-4 text-xs"
            >
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1">
                <div className="text-[11px] font-bold uppercase text-teal-800">
                  Unit & Tenancy
                </div>

                <div className="font-bold text-slate-900">
                  {currentTenant.tenantName}
                </div>

                <div className="text-slate-600">
                  {currentTenant.unit} • {currentTenant.property}
                </div>
              </div>

              {currentTenant.multiYearEligible && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Advance Lease Payment Period
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {availableAdvanceYears.map((years) => (
                      <button
                        key={years}
                        type="button"
                        onClick={() => {
                          setLeaseYears(years);

                          setPaymentAmount(
                            (currentTenant.amount > 0
                              ? currentTenant.amount
                              : 2500000) * years
                          );
                        }}
                        className={`py-2 px-2.5 rounded-lg border text-center transition cursor-pointer ${
                          effectiveLeaseYears === years
                            ? 'border-[#12897F] bg-teal-50 text-[#12897F] font-bold'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {years} Years
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Settlement Amount (₦)
                </label>

                <input
                  type="number"
                  min="0"
                  value={paymentAmount}
                  onChange={(event) =>
                    setPaymentAmount(
                      Number(event.target.value)
                    )
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#12897F]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Payment Method
                </label>

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
                    onClick={() =>
                      setPaymentMethod('TRANSFER')
                    }
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
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-slate-700 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-[#12897F] shrink-0" />
                    <span>
                      Verified Corporate Bank Settlement
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    To prevent incorrect payment routing and
                    ensure direct lease matching, corporate
                    bank account details are generated
                    specifically by Fugson Finance Desk with
                    dedicated billing tokens.
                  </p>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1">
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">
                        Corporate Finance Desk:
                      </span>

                      <a
                        href="mailto:finance@fugsonproperties.com"
                        className="font-semibold text-slate-800 hover:text-[#12897F]"
                      >
                        finance@fugsonproperties.com
                      </a>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">
                        Estate Support Hotline:
                      </span>

                      <span className="font-semibold text-slate-800">
                        +234 800 FUGSON
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-teal-700 font-medium">
                    Tip: Use Card / Paystack above for instant
                    verification and automated digital receipt
                    delivery.
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    setShowPaymentModal(false)
                  }
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="px-4 py-2.5 bg-[#12897F] hover:bg-[#0f766e] text-white rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-70"
                >
                  {isProcessingPayment ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Confirming Settlement...</span>
                    </div>
                  ) : (
                    <span>
                      Confirm & Pay {formatNaira(paymentAmount)}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/50"
            onClick={() => setShowReceiptModal(null)}
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden z-10">
            <div className="bg-[#0B1D2E] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-400" />

                <h3 className="font-bold text-sm">
                  Official Tenancy Receipt
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowReceiptModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 font-mono">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">
                    Receipt Ref:
                  </span>

                  <span className="font-bold text-slate-800">
                    {showReceiptModal}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">
                    Tenant:
                  </span>

                  <span className="font-bold text-slate-800">
                    {currentTenant.tenantName}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">
                    Property:
                  </span>

                  <span className="font-bold text-slate-800">
                    {currentTenant.property}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">
                    Amount Paid:
                  </span>

                  <span className="font-bold text-emerald-700">
                    {formatNaira(
                      currentTenant.amountPaid ||
                        currentTenant.amount
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Status:
                  </span>

                  <span className="font-bold text-emerald-600 uppercase">
                    Settled & Cleared
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowReceiptModal(null)
                  }
                  className="px-3.5 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium text-xs cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const email =
                      currentTenant.tenantEmail ||
                      `${currentTenant.tenantName
                        .toLowerCase()
                        .replace(/\s+/g, '.')}@example.com`;

                    showToast(
                      `Official statement & receipt ${showReceiptModal} sent to ${email}`
                    );
                  }}
                  className="px-3.5 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-[#12897F]" />
                  <span>Send Statement to my Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    showToast(
                      `Receipt ${showReceiptModal}.pdf downloaded to device.`
                    );

                    setShowReceiptModal(null);
                  }}
                  className="px-4 py-2 bg-[#12897F] hover:bg-[#0f766e] text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
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