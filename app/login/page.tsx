'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  UserPlus,
  Phone,
  Home,
  Calendar,
  DollarSign,
  CheckCircle2,
  ShieldCheck,
  BookOpen,
  Clock,
  X,
  FileText,
} from 'lucide-react';
import { authService } from '@/src/services/authService';
import { propertyService } from '@/src/services/propertyService';
import { HOUSE_RULES } from '@/src/data/mockData';
import { PropertyItem } from '@/src/types';

interface LoginPageProps {
  onNavigate?: (path: string) => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

  // Sign in state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Tenant self-registration state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupProperty, setSignupProperty] = useState('');
  const [signupCustomProperty, setSignupCustomProperty] = useState('');
  const [signupUnit, setSignupUnit] = useState('');
  const [signupRent, setSignupRent] = useState<number>(2000000);
  const [signupLeasePeriod, setSignupLeasePeriod] = useState('01 Jan 2025 – 31 Dec 2025');
  const [signupEmergency, setSignupEmergency] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showHouseRulesModal, setShowHouseRulesModal] = useState(false);

  // Available properties from portfolio
  const [availableProperties, setAvailableProperties] = useState<PropertyItem[]>([]);

  useEffect(() => {
    propertyService.getProperties().then((props) => {
      setAvailableProperties(props);
      if (props.length > 0) {
        setSignupProperty(props[0].name);
      } else {
        setSignupProperty('Fugson Heights Estate');
      }
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const user = await authService.login(email, password);
      // Route based on role
      const destination =
        user.role === 'ADMIN'
          ? '/admin'
          : user.role === 'AGENT'
          ? '/agent'
          : `/pay/${user.tenantId || 'fg-tenant-001'}`;

      if (onNavigate) {
        onNavigate(destination);
      } else if (typeof window !== 'undefined') {
        window.location.href = destination;
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTenantSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setError('Please fill in all required tenant registration fields.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match. Please verify your password entry.');
      return;
    }

    if (!agreeTerms) {
      setError('Please review and check "i agree to fugson properties official house rules" to complete registration.');
      return;
    }

    const selectedProp =
      signupProperty === '__custom__' || !signupProperty
        ? signupCustomProperty.trim() || 'Fugson Heights Estate'
        : signupProperty;

    setIsLoading(true);

    try {
      /**
       * PLUG & PLAY BACKEND INTEGRATION:
       * Dispatches signup payload to authService (which is wired ready for REST/Postgres endpoint)
       */
      const { user, tenant } = await authService.signupTenant({
        fullName: signupName.trim(),
        email: signupEmail.trim(),
        phone: signupPhone.trim(),
        password: signupPassword,
        property: selectedProp,
        unit: signupUnit.trim() || 'Apartment 1A',
        rentAmount: Number(signupRent) || 2000000,
        leasePeriod: signupLeasePeriod,
        emergencyContact: signupEmergency.trim(),
      });

      setSuccessMessage(`Account created successfully for ${tenant.tenantName}! Redirecting to your verified Tenant Portal...`);

      setTimeout(() => {
        const dest = `/pay/${tenant.id}`;
        if (onNavigate) {
          onNavigate(dest);
        } else if (typeof window !== 'undefined') {
          window.location.href = dest;
        }
      }, 900);
    } catch (err: any) {
      setError(err?.message || 'Failed to complete tenant registration.');
      setIsLoading(false);
    }
  };

  const devLogin = (devEmail: string) => {
    setEmail(devEmail);
    setPassword('password123');
    setActiveTab('LOGIN');
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col justify-center items-center px-4 py-8 sm:py-12 text-slate-800 font-sans">
      {/* Brand Header */}
      <div className="mb-6 text-center max-w-md">
        <div className="inline-flex items-center justify-center gap-2.5 px-4 py-2 rounded-2xl bg-[#0B1D2E] text-white shadow-md mb-3.5">
          <div className="w-8 h-8 rounded-lg bg-[#12897F] flex items-center justify-center text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="font-bold text-lg tracking-tight block leading-tight">Fugson Property</span>
            <span className="text-[10px] text-teal-200 tracking-wider uppercase font-semibold block">
              Property & Asset Management
            </span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {activeTab === 'LOGIN' ? 'Sign in to your account' : 'Tenant Self-Registration'}
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          {activeTab === 'LOGIN'
            ? 'Unified portal for Administrators, Managing Agents, and Tenants'
            : 'Register your residential or commercial tenancy to access verified rent payment tokens'}
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5">
        {/* Tab Toggle: Sign In vs Tenant Sign Up */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('LOGIN');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'LOGIN'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('SIGNUP');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'SIGNUP'
                ? 'bg-[#12897F] text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tenant Sign Up</span>
          </button>
        </div>

        {/* Feedback Alert Messages */}
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 animate-in fade-in">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: SIGN IN */}
        {activeTab === 'LOGIN' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#12897F] transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <span className="text-[11px] text-teal-600 font-semibold cursor-pointer hover:underline">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#12897F] transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#12897F] hover:bg-[#0e6e66] text-white text-sm font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 mt-2 shadow-2xs"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">New tenant moving in? </span>
              <button
                type="button"
                onClick={() => setActiveTab('SIGNUP')}
                className="text-xs font-bold text-[#12897F] hover:underline cursor-pointer"
              >
                Create your account here →
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: TENANT SELF-REGISTRATION (BACKEND-READY) */}
        {activeTab === 'SIGNUP' && (
          <form onSubmit={handleTenantSignup} className="space-y-3.5 text-xs">
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-[11px] leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#12897F] shrink-0 mt-0.5" />
              <span>
                <strong>Self-Service Onboarding:</strong> Register your tenancy details to receive an official Fugson verified rent portal link with digital receipt issuance.
              </span>
            </div>

            {/* Full Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full Name (First & Surname) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="e.g. Chidinma Okafor"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
              />
            </div>

            {/* Email Address & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="chidinma@gmail.com"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone (WhatsApp) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="+234 803 000 0000"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 outline-none focus:ring-2 focus:ring-[#12897F]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 outline-none focus:ring-2 focus:ring-[#12897F]"
                />
              </div>
            </div>

            {/* Property / Estate Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Select Estate / Residence <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Home className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <select
                  value={signupProperty}
                  onChange={(e) => setSignupProperty(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#12897F]"
                >
                  {availableProperties.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.location})
                    </option>
                  ))}
                  <option value="__custom__">+ Enter Another Estate / Custom Property</option>
                </select>
              </div>

              {signupProperty === '__custom__' && (
                <input
                  type="text"
                  required
                  value={signupCustomProperty}
                  onChange={(e) => setSignupCustomProperty(e.target.value)}
                  placeholder="Enter estate or residence name..."
                  className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl p-2 outline-none focus:ring-2 focus:ring-[#12897F]"
                />
              )}
            </div>

            {/* Unit / Flat Number & Annual Rent Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Unit / Flat / Office # <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={signupUnit}
                  onChange={(e) => setSignupUnit(e.target.value)}
                  placeholder="e.g. Flat 3B or Suite 12"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 outline-none focus:ring-2 focus:ring-[#12897F]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Annual Rent (₦) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    min="100000"
                    step="50000"
                    required
                    value={signupRent}
                    onChange={(e) => setSignupRent(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>
              </div>
            </div>

            {/* Lease Period & Emergency Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lease Period</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={signupLeasePeriod}
                    onChange={(e) => setSignupLeasePeriod(e.target.value)}
                    placeholder="01 Jan 2025 – 31 Dec 2025"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emergency Contact (Next of Kin)</label>
                <input
                  type="text"
                  value={signupEmergency}
                  onChange={(e) => setSignupEmergency(e.target.value)}
                  placeholder="Name & Contact phone"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 outline-none focus:ring-2 focus:ring-[#12897F]"
                />
              </div>
            </div>

            {/* Rules & Policy Preview Link / Trigger */}
            <div className="bg-teal-50/80 border border-teal-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start gap-2.5">
                <BookOpen className="w-4 h-4 text-[#12897F] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                    <span>House Rules, Policies & Guidelines</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-md">
                      <Clock className="w-2.5 h-2.5" /> Quiet Hours: 10PM – 7AM
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Review official resident obligations, community guidelines, sanitation, and safety policies.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHouseRulesModal(true)}
                className="px-3 py-1.5 bg-[#12897F] hover:bg-[#0e6e66] text-white text-[11px] font-bold rounded-lg shadow-2xs transition cursor-pointer flex items-center justify-center gap-1 shrink-0 self-start sm:self-auto"
              >
                <span>Click to see rules, policy, etc.</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Terms checkbox */}
            <div className="pt-0.5">
              <label className="flex items-start gap-2.5 cursor-pointer text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded text-[#12897F] focus:ring-[#12897F] mt-0.5 cursor-pointer w-4 h-4"
                />
                <span className="text-xs leading-tight font-medium text-slate-800">
                  i agree to fugson properties official house rules
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#12897F] hover:bg-[#0e6e66] text-white text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 mt-2 shadow-2xs"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete Tenant Registration'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="text-center pt-2">
              <span className="text-slate-500">Already have an account? </span>
              <button
                type="button"
                onClick={() => setActiveTab('LOGIN')}
                className="font-bold text-[#12897F] hover:underline cursor-pointer"
              >
                Sign in here →
              </button>
            </div>
          </form>
        )}

        {/* Quick Testing Login shortcuts */}
        <div className="border-t border-slate-100 pt-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
            Quick Dev Login (Role Previews)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => devLogin('admin@fugsonproperty.com')}
              className="py-1.5 px-2 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition cursor-pointer text-center"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => devLogin('agent@fugsonproperty.com')}
              className="py-1.5 px-2 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition cursor-pointer text-center"
            >
              Agent
            </button>
            <button
              type="button"
              onClick={() => devLogin('tenant@fugsonproperty.com')}
              className="py-1.5 px-2 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition cursor-pointer text-center"
            >
              Tenant
            </button>
          </div>
        </div>
      </div>

      {/* House Rules & Policies Modal */}
      {showHouseRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowHouseRulesModal(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[88vh]">
            {/* Modal Header */}
            <div className="bg-[#0B1D2E] p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">
                    Fugson Properties Official House Rules
                  </h3>
                  <p className="text-[11px] text-teal-300">
                    Tenancy Agreement & Community Policy Guidelines
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHouseRulesModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quiet Hours Banner */}
            <div className="bg-amber-50 border-b border-amber-200/80 p-3.5 flex items-start gap-3 shrink-0">
              <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900">
                  Key Policy Notice: Mandatory Quiet Hours (10:00 PM – 7:00 AM)
                </p>
                <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                  To ensure comfort and rest for all residents across all Fugson properties, high decibel sound equipment, parties, and disruptive noise are prohibited during these hours.
                </p>
              </div>
            </div>

            {/* Rules Content */}
            <div className="p-5 space-y-4 text-xs text-slate-600 overflow-y-auto divide-y divide-slate-100">
              {HOUSE_RULES.map((rule, idx) => (
                <div key={idx} className="pt-3 first:pt-0">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#12897F]" />
                    {rule.title}
                  </h4>
                  <p className="text-slate-600 leading-relaxed pl-3.5 text-xs">
                    {rule.rule}
                  </p>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowHouseRulesModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setAgreeTerms(true);
                  setShowHouseRulesModal(false);
                }}
                className="px-4 py-2 bg-[#12897F] hover:bg-[#0e6e66] text-white text-xs font-bold rounded-lg shadow-2xs transition cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Agree & Accept House Rules</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
