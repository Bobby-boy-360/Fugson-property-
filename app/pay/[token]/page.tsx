'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  FileText,
  Wrench,
  CheckCircle2,
  Clock,
  X,
  Send,
  FileCheck,
  Info,
  LogOut,
  Mail,
} from 'lucide-react';

import { formatNaira, getCurrentUser, logout } from '@/src/auth';
import { HOUSE_RULES } from '@/src/data/mockData';
import { PaymentRecord } from '@/src/types';
import { tenantService } from '@/src/services/tenantService';

interface TenantPortalProps {
  params?: { token?: string };
  onNavigate?: (path: string) => void;
}

type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  agentId?: string;
  [key: string]: unknown;
};

type ReceiptResult = {
  payment?: {
    receipt_number?: string;
    receiptNumber?: string;
  };
  receipt_number?: string;
  receiptNumber?: string;
  message?: string;
  error?: string;
  authorization_url?: string;
};

const API_URL = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export default function TenantPublicPortal({
  params,
  onNavigate,
}: TenantPortalProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tenants, setTenants] = useState<PaymentRecord[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [showHouseRules, setShowHouseRules] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'TRANSFER'>('CARD');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [leaseYears, setLeaseYears] = useState(2);

  const [maintenanceCategory, setMaintenanceCategory] = useState('Plumbing');
  const [maintenanceDesc, setMaintenanceDesc] = useState('');
  const [maintenanceUrgency, setMaintenanceUrgency] = useState('Medium');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  const verificationStarted = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const role = String(currentUser?.role || '').toUpperCase();
  const isStaff = role === 'ADMIN' || role === 'AGENT';

  const currentTenant =
    tenants.find((tenant) => String(tenant.id) === selectedTenantId) ||
    (isStaff
      ? tenants.find((tenant) => String(tenant.id) === params?.token) ||
        tenants[0]
      : undefined);

  const amountOwed = Number(currentTenant?.amountOwed ?? 0);
  const amountPaid = Number(currentTenant?.amountPaid ?? 0);
  const annualRent = Number(currentTenant?.amount ?? 0);

  const adminApprovedMaxYears = Math.max(
    1,
    Math.min(
      4,
      Number(
        (currentTenant as any)?.leaseYears ??
          (currentTenant as any)?.maxAdvanceYears ??
          2
      ) || 2
    )
  );

  const availableAdvanceYears = [2, 3, 4].filter(
    (years) => years <= adminApprovedMaxYears
  );

  const multiYearEligible = Boolean(currentTenant?.multiYearEligible);

  const effectiveLeaseYears = multiYearEligible
    ? availableAdvanceYears.includes(leaseYears)
      ? leaseYears
      : availableAdvanceYears[0] || 2
    : 1;

  const notify = useCallback((message: string) => {
    setToastMessage(message);

    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    toastTimer.current = setTimeout(() => {
      setToastMessage('');
      toastTimer.current = null;
    }, 4500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const loadTenantsForUser = useCallback(
    async (user: User): Promise<PaymentRecord[]> => {
      const userRole = String(user.role || '').toUpperCase();

      if (userRole === 'TENANT') {
        const tenant = await tenantService.getMyTenant();
        return tenant ? [tenant] : [];
      }

      if (userRole === 'ADMIN') {
        const result = await tenantService.getTenants();
        return Array.isArray(result) ? result : [];
      }

      if (userRole === 'AGENT' && user.agentId) {
        const result = await tenantService.getTenantsByAgent(
          String(user.agentId)
        );
        return Array.isArray(result) ? result : [];
      }

      return [];
    },
    []
  );

  // Load the signed-in user and records permitted for their role.
  useEffect(() => {
    let cancelled = false;

    const loadPortal = async () => {
      setIsLoading(true);

      try {
        let user: User | null = null;

        try {
          const savedUser = localStorage.getItem('auth_user');

          if (savedUser) {
            user = JSON.parse(savedUser) as User;
          }
        } catch {
          user = null;
        }

        if (!user) {
          user = (getCurrentUser() as User | null) || null;
        }

        if (cancelled) return;

        setCurrentUser(user);

        if (!user) {
          setTenants([]);
          setSelectedTenantId('');
          return;
        }

        const loadedTenants = await loadTenantsForUser(user);

        if (cancelled) return;

        setTenants(loadedTenants);

        const preferredTenant = loadedTenants.find(
          (tenant) => String(tenant.id) === params?.token
        );

        if (String(user.role || '').toUpperCase() === 'TENANT') {
          setSelectedTenantId(String(loadedTenants[0]?.id || ''));
        } else {
          setSelectedTenantId(
            String(preferredTenant?.id || loadedTenants[0]?.id || '')
          );
        }
      } catch (error) {
        console.error('Unable to load tenant portal:', error);

        if (!cancelled) {
          setTenants([]);
          setSelectedTenantId('');
          notify(
            'Unable to load tenant records. Check your access and reload the page.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadPortal();

    return () => {
      cancelled = true;
    };
  }, [params?.token, loadTenantsForUser, notify]);

  // Update the suggested amount when the tenant or lease period changes.
  useEffect(() => {
    if (!currentTenant) {
      setPaymentAmount(0);
      return;
    }

    if (multiYearEligible) {
      const years = availableAdvanceYears.includes(leaseYears)
        ? leaseYears
        : availableAdvanceYears[0] || 2;

      setPaymentAmount(annualRent * years);
    } else {
      setPaymentAmount(Math.max(0, amountOwed));
    }
  }, [
    currentTenant?.id,
    currentTenant?.amount,
    currentTenant?.amountOwed,
    currentTenant?.multiYearEligible,
    leaseYears,
    multiYearEligible,
    annualRent,
    amountOwed,
    availableAdvanceYears,
  ]);

  // Verify a Paystack callback once the signed-in user has loaded.
  useEffect(() => {
    let cancelled = false;

    const verifyPayment = async () => {
      if (!currentUser || isLoading) return;

      const url = new URL(window.location.href);
      const paymentId = url.searchParams.get('payment_id');
      const reference =
        url.searchParams.get('reference') ||
        url.searchParams.get('trxref');

      if (!paymentId || !reference || verificationStarted.current) {
        return;
      }

      verificationStarted.current = true;

      const authToken = localStorage.getItem('auth_token');

      if (!authToken) {
        notify('Your session has expired. Sign in again to check your payment.');
        return;
      }

      setIsProcessingPayment(true);

      try {
        if (!API_URL) {
          throw new Error('The backend API URL is not configured.');
        }

        const response = await fetch(
          `${API_URL}/api/payments/${encodeURIComponent(paymentId)}/verify-paystack`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ reference }),
          }
        );

        const result: ReceiptResult = await response
          .json()
          .catch(() => ({} as ReceiptResult));

        if (!response.ok) {
          throw new Error(
            result.message ||
              result.error ||
              'Payment verification failed. Contact support before paying again.'
          );
        }

        if (cancelled) return;

        url.searchParams.delete('payment_id');
        url.searchParams.delete('reference');
        url.searchParams.delete('trxref');
        window.history.replaceState({}, '', url.toString());

        const receiptNumber =
          result.payment?.receipt_number ||
          result.payment?.receiptNumber ||
          result.receipt_number ||
          result.receiptNumber;

        setShowPaymentModal(false);

        if (receiptNumber) {
          setShowReceiptModal(String(receiptNumber));
          notify('Payment verified successfully. Your receipt is ready.');
        } else {
          notify(
            'Payment verified, but no receipt number was returned. Contact support if needed.'
          );
        }

        try {
          const refreshed = await loadTenantsForUser(currentUser);

          if (cancelled) return;

          setTenants(refreshed);

          const preferred =
            refreshed.find(
              (tenant) => String(tenant.id) === String(currentTenant?.id)
            ) ||
            refreshed.find(
              (tenant) => String(tenant.id) === params?.token
            ) ||
            refreshed[0];

          setSelectedTenantId(String(preferred?.id || ''));

          if (!refreshed.length) {
            notify('Payment verified, but the tenant records could not refresh.');
          }
        } catch (refreshError) {
          console.error(
            'Payment verified, but tenant refresh failed:',
            refreshError
          );

          if (!cancelled) {
            notify('Payment verified. Reload the portal to refresh your balance.');
          }
        }
      } catch (error) {
        console.error('Paystack verification error:', error);

        if (!cancelled) {
          notify(
            error instanceof Error
              ? error.message
              : 'Unable to verify payment. Contact support before trying again.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsProcessingPayment(false);
        }
      }
    };

    void verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [
    currentUser,
    isLoading,
    currentTenant?.id,
    params?.token,
    loadTenantsForUser,
    notify,
  ]);

  const handleExecutePayment = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!currentTenant) {
      notify('No tenant record is selected.');
      return;
    }

    if (paymentAmount <= 0 || !Number.isFinite(paymentAmount)) {
      notify('Enter a valid payment amount.');
      return;
    }

    const authToken = localStorage.getItem('auth_token');

    if (!authToken) {
      notify('Your session has expired. Please sign in again.');
      return;
    }

    if (paymentMethod === 'TRANSFER') {
      notify(
        'Bank transfer selected. Obtain verified bank details from your property manager before transferring.'
      );
      return;
    }

    setIsProcessingPayment(true);

    try {
      if (!API_URL) {
        throw new Error('The backend API URL is not configured.');
      }

      const response = await fetch(
        `${API_URL}/api/payments/initialize-paystack`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            years: multiYearEligible ? effectiveLeaseYears : 1,
            callback_url: window.location.href.split('?')[0],
          }),
        }
      );

      const result: ReceiptResult = await response
        .json()
        .catch(() => ({} as ReceiptResult));

      if (!response.ok) {
        throw new Error(
          result.message || result.error || 'Unable to initialize payment.'
        );
      }

      if (!result.authorization_url) {
        throw new Error('The payment provider did not return a payment link.');
      }

      // Preserve the existing Paystack redirect.
      window.location.assign(result.authorization_url);
    } catch (error) {
      console.error('Unable to initialize Paystack payment:', error);

      notify(
        error instanceof Error
          ? error.message
          : 'Unable to start payment. Please try again.'
      );

      setIsProcessingPayment(false);
    }
  };

  // Submit a maintenance complaint. The backend resolves the tenant's
  // linked property, so the frontend does not need to supply property_id.
  const handleMaintenanceSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!maintenanceDesc.trim()) {
      notify('Please describe the maintenance issue.');
      return;
    }

    const authToken = localStorage.getItem('auth_token');

    if (!authToken) {
      notify('Your session has expired. Please sign in again.');
      return;
    }

    if (!API_URL) {
      notify('The backend API URL is not configured.');
      return;
    }

    setIsSubmittingTicket(true);

    try {
      const response = await fetch(`${API_URL}/api/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          category: maintenanceCategory,
          description: `[Urgency: ${maintenanceUrgency}] ${maintenanceDesc.trim()}`,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            'Unable to submit the maintenance request.'
        );
      }

      setShowMaintenanceModal(false);
      setMaintenanceDesc('');
      setMaintenanceCategory('Plumbing');
      setMaintenanceUrgency('Medium');

      notify(
        'Maintenance request submitted successfully. Your property manager has been notified.'
      );
    } catch (error) {
      console.error('Maintenance complaint submission failed:', error);

      notify(
        error instanceof Error
          ? error.message
          : 'Unable to submit your maintenance request. Please try again.'
      );
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleExit = () => {
    logout();

    if (onNavigate) {
      onNavigate('/login');
    } else {
      window.location.href = '/login';
    }
  };

  const handleOpenReceipt = () => {
    const savedReceipt =
      (currentTenant as any)?.receiptNumber ||
      (currentTenant as any)?.receipt_number;

    if (savedReceipt) {
      setShowReceiptModal(String(savedReceipt));
    } else {
      notify(
        'No saved receipt was found. Complete a verified payment or check your payment records.'
      );
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <Clock className="animate-spin" size={20} />
          Loading Tenant Portal...
        </div>
      </main>
    );
  }

  if (!currentUser || !currentTenant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Building2 className="mx-auto mb-4 text-emerald-800" size={42} />

          <h1 className="text-xl font-bold text-slate-900">Tenant Portal</h1>

          <p className="mt-3 text-sm text-slate-600">
            {!currentUser
              ? 'Please sign in to access your tenant portal.'
              : 'No tenant record is available for this account, or your account does not have permission to view it.'}
          </p>

          <button
            onClick={handleExit}
            className="mt-6 rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white hover:bg-emerald-900"
          >
            Return to Login
          </button>
        </div>
      </main>
    );
  }

  const tenantName = currentTenant.tenantName || currentUser.name || 'Tenant';
  const tenantProperty =
    currentTenant.property || currentTenant.unit || 'Property';
  const tenantEmail = currentTenant.tenantEmail || currentUser.email || '';

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      {toastMessage && (
        <div
          role="status"
          className="fixed right-4 top-4 z-[100] flex max-w-md items-start gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl"
        >
          <Info className="mt-0.5 shrink-0" size={18} />

          <span>{toastMessage}</span>

          <button
            onClick={() => setToastMessage('')}
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-900 p-2 text-white">
              <Building2 size={24} />
            </div>

            <div>
              <h1 className="font-bold tracking-tight text-slate-900">
                FUGSON PROPERTY
              </h1>
              <p className="text-xs text-slate-500">Resident Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isStaff && onNavigate && (
              <button
                onClick={() =>
                  onNavigate(role === 'ADMIN' ? '/admin' : '/agent')
                }
                className="hidden rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium sm:block"
              >
                Back to Dashboard
              </button>
            )}

            <button
              onClick={handleExit}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-slate-500">Welcome back,</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {tenantName}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{tenantProperty}</p>
          </div>

          <div
            className={`flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              amountOwed > 0
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {amountOwed > 0 ? (
              <Clock size={17} />
            ) : (
              <CheckCircle2 size={17} />
            )}

            {amountOwed > 0 ? 'Payment Outstanding' : 'Account Settled'}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Amount Outstanding</p>
              <CreditCard className="text-emerald-800" size={22} />
            </div>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {formatNaira(amountOwed)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Balance due on your account
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Amount Paid</p>
              <ShieldCheck className="text-emerald-800" size={22} />
            </div>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {formatNaira(amountPaid)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Payments recorded against your account
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Rent and Payments
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Review your outstanding balance and proceed to secure payment.
              </p>

              {multiYearEligible && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {availableAdvanceYears.map((years) => (
                    <button
                      key={years}
                      onClick={() => setLeaseYears(years)}
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                        effectiveLeaseYears === years
                          ? 'border-emerald-800 bg-emerald-800 text-white'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {years} years
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="sm:text-right">
              <p className="text-sm text-slate-500">
                {multiYearEligible
                  ? `Selected period: ${effectiveLeaseYears} year(s)`
                  : 'Current outstanding balance'}
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {formatNaira(
                  multiYearEligible
                    ? annualRent * effectiveLeaseYears
                    : amountOwed
                )}
              </p>

              <button
                onClick={() => {
                  if (amountOwed <= 0 && !multiYearEligible) {
                    notify('There is no outstanding balance to pay.');
                    return;
                  }

                  setShowPaymentModal(true);
                }}
                disabled={isProcessingPayment}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <CreditCard size={18} />
                {isProcessingPayment ? 'Processing...' : 'Pay Rent Now'}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-3">
          <button
            onClick={() => setShowHouseRules(true)}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-emerald-700"
          >
            <FileText className="mb-3 text-emerald-800" size={25} />
            <h3 className="font-bold">House Rules</h3>
            <p className="mt-1 text-sm text-slate-500">
              Review resident guidelines and policies.
            </p>
          </button>

          <button
            onClick={() => setShowMaintenanceModal(true)}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-emerald-700"
          >
            <Wrench className="mb-3 text-emerald-800" size={25} />
            <h3 className="font-bold">Maintenance Request</h3>
            <p className="mt-1 text-sm text-slate-500">
              Describe an issue with your property.
            </p>
          </button>

          <button
            onClick={handleOpenReceipt}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-emerald-700"
          >
            <FileCheck className="mb-3 text-emerald-800" size={25} />
            <h3 className="font-bold">Payment Receipts</h3>
            <p className="mt-1 text-sm text-slate-500">
              Access the receipt generated for a verified payment.
            </p>
          </button>
        </section>

        {showHouseRules && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-bold">House Rules</h3>
                <button
                  onClick={() => setShowHouseRules(false)}
                  aria-label="Close house rules"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="space-y-4">
                {(HOUSE_RULES as any[]).map((rule, index) => (
                  <div
                    key={rule.id || index}
                    className="rounded-lg bg-slate-50 p-4"
                  >
                    <h4 className="font-semibold">
                      {rule.title || rule.name || `Rule ${index + 1}`}
                    </h4>
                    <p className="mt-1 text-sm text-slate-600">
                      {rule.description || rule.content || String(rule)}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowHouseRules(false)}
                className="mt-6 rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showMaintenanceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <form
              onSubmit={handleMaintenanceSubmit}
              className="w-full max-w-lg rounded-2xl bg-white p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-bold">Maintenance Request</h3>
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(false)}
                  aria-label="Close maintenance form"
                >
                  <X size={22} />
                </button>
              </div>

              <label className="mb-2 block text-sm font-medium">
                Issue category
              </label>

              <select
                value={maintenanceCategory}
                onChange={(event) => setMaintenanceCategory(event.target.value)}
                className="mb-4 w-full rounded-lg border border-slate-300 p-3"
              >
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>Structural</option>
                <option>Security</option>
                <option>Other</option>
              </select>

              <label className="mb-2 block text-sm font-medium">
                Urgency
              </label>

              <select
                value={maintenanceUrgency}
                onChange={(event) => setMaintenanceUrgency(event.target.value)}
                className="mb-4 w-full rounded-lg border border-slate-300 p-3"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>

              <label className="mb-2 block text-sm font-medium">
                Describe the issue
              </label>

              <textarea
                value={maintenanceDesc}
                onChange={(event) => setMaintenanceDesc(event.target.value)}
                rows={4}
                required
                className="w-full rounded-lg border border-slate-300 p-3"
                placeholder="Explain the maintenance issue..."
              />

              <button
                type="submit"
                disabled={isSubmittingTicket}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white disabled:opacity-60"
              >
                <Send size={17} />
                {isSubmittingTicket ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        )}

        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <form
              onSubmit={handleExecutePayment}
              className="w-full max-w-lg rounded-2xl bg-white p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-bold">Complete Payment</h3>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  aria-label="Close payment dialog"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Tenant</p>
                <p className="font-semibold">{tenantName}</p>

                <p className="mt-2 text-sm text-slate-500">Property</p>
                <p className="font-semibold">{tenantProperty}</p>

                {tenantEmail && (
                  <p className="mt-2 text-sm text-slate-500">{tenantEmail}</p>
                )}
              </div>

              <label className="mt-5 block text-sm font-medium">
                Amount to pay (₦)
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={paymentAmount}
                onChange={(event) => setPaymentAmount(Number(event.target.value))}
                required
                className="mt-2 w-full rounded-lg border border-slate-300 p-3"
              />

              <p className="mt-2 text-xs text-slate-500">
                The backend must determine and verify the actual amount due.
                Changing this field does not change the amount charged by Paystack.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`rounded-lg border p-3 text-sm font-semibold ${
                    paymentMethod === 'CARD'
                      ? 'border-emerald-800 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200'
                  }`}
                >
                  <CreditCard className="mx-auto mb-2" size={21} />
                  Card / Paystack
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('TRANSFER')}
                  className={`rounded-lg border p-3 text-sm font-semibold ${
                    paymentMethod === 'TRANSFER'
                      ? 'border-emerald-800 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200'
                  }`}
                >
                  <Building2 className="mx-auto mb-2" size={21} />
                  Bank Transfer
                </button>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold">
                  {formatNaira(paymentAmount)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isProcessingPayment || paymentAmount <= 0}
                className="mt-5 w-full rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white disabled:opacity-60"
              >
                {isProcessingPayment
                  ? 'Processing...'
                  : paymentMethod === 'CARD'
                    ? 'Continue to Paystack'
                    : 'Continue with Transfer'}
              </button>
            </form>
          </div>
        )}

        {showReceiptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                  <CheckCircle2 size={30} />
                </div>

                <h3 className="mt-4 text-2xl font-bold">Payment Verified</h3>

                <p className="mt-2 text-sm text-slate-500">
                  Your payment has been confirmed by the payment server.
                </p>
              </div>

              <div className="mt-6 space-y-4 rounded-xl border border-slate-200 p-5">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-500">Receipt reference</span>
                  <span className="break-all text-right font-semibold">
                    {showReceiptModal}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-500">Tenant</span>
                  <span className="text-right font-semibold">{tenantName}</span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-500">Property</span>
                  <span className="text-right font-semibold">
                    {tenantProperty}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-t border-slate-200 pt-4">
                  <span className="font-semibold">Status</span>
                  <span className="font-bold text-emerald-800">Verified</span>
                </div>
              </div>

              <p className="mt-4 flex items-start gap-2 text-xs text-slate-500">
                <Mail className="shrink-0" size={16} />
                Keep this receipt reference for your records. Email delivery
                depends on the backend receipt-email configuration.
              </p>

              <button
                onClick={() => setShowReceiptModal(null)}
                className="mt-6 w-full rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}