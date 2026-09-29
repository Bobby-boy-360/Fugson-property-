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
  CheckCircle2,
  ShieldCheck,
  BookOpen,
  Clock,
  X,
  FileText,
  ShieldAlert,
  HelpCircle,
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
  const [signupNextOfKinName, setSignupNextOfKinName] = useState('');
  const [signupNextOfKinRelationship, setSignupNextOfKinRelationship] = useState('Spouse');
  const [signupNextOfKinPhone, setSignupNextOfKinPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showHouseRulesModal, setShowHouseRulesModal] = useState(false);
  const [rulesModalTab, setRulesModalTab] = useState<'RULES' | 'TERMS' | 'PRIVACY'>('RULES');

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
      setError('Please review and check "I agree to the Terms and Conditions and Privacy Policy of Fugson Properties" to complete registration.');
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
       * Dispatches structured signup payload to authService (ready for REST/Postgres endpoint)
       */
      const formattedEmergency = signupNextOfKinName
        ? `${signupNextOfKinName.trim()} (${signupNextOfKinRelationship.trim()}) - ${signupNextOfKinPhone.trim()}`
        : '';

      const { user, tenant } = await authService.signupTenant({
        fullName: signupName.trim(),
        email: signupEmail.trim(),
        phone: signupPhone.trim(),
        password: signupPassword,
        property: selectedProp,
        unit: signupUnit.trim() || 'Suite 1A',
        rentAmount: 2500000,
        leasePeriod: '1 Year Lease (Admin Set)',
        nextOfKinName: signupNextOfKinName.trim(),
        nextOfKinRelationship: signupNextOfKinRelationship.trim(),
        nextOfKinPhone: signupNextOfKinPhone.trim(),
        emergencyContact: formattedEmergency,
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

            {/* Unit / Flat Number */}
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#12897F] text-xs"
              />
            </div>

            {/* Next of Kin & Emergency Contact (Separated & Well-Organized) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#12897F]" />
                    <span>Next of Kin & Emergency Contact</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Separated for clarity. Made accessible to estate agents and management in case of emergencies.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Next of Kin Full Name
                  </label>
                  <input
                    type="text"
                    value={signupNextOfKinName}
                    onChange={(e) => setSignupNextOfKinName(e.target.value)}
                    placeholder="e.g. Amina Bello"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Relationship
                    </label>
                    <select
                      value={signupNextOfKinRelationship}
                      onChange={(e) => setSignupNextOfKinRelationship(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-[#12897F]"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Parent">Parent</option>
                      <option value="Child">Child / Dependent</option>
                      <option value="Next of Kin / Relative">Next of Kin / Relative</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                      <option value="Business Associate">Business Associate</option>
                      <option value="Close Friend">Close Friend</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Emergency Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="tel"
                        value={signupNextOfKinPhone}
                        onChange={(e) => setSignupNextOfKinPhone(e.target.value)}
                        placeholder="+234 801 234 5678"
                        className="w-full pl-7 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#12897F]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tenancy Policies Trigger Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-[#12897F] flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                      <span>Tenancy Terms, House Rules & Privacy Policy</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Review community quiet hours (10:00 PM – 7:00 AM), payment terms in Naira (₦), and emergency protocols.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowHouseRulesModal(true)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#12897F] border border-teal-200 text-[11px] font-bold rounded-lg shadow-2xs transition cursor-pointer flex items-center gap-1 shrink-0 self-start sm:self-auto"
                >
                  <span>Review Policies</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
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
                  I agree to the Terms and Conditions and Privacy Policy of Fugson Properties.
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

      {/* House Rules, Terms & Policies Modal */}
      {showHouseRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowHouseRulesModal(false)}
          />
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[88vh]">
            {/* Modal Header */}
            <div className="bg-[#0B1D2E] p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">
                    Fugson Properties Tenancy Legal Documents
                  </h3>
                  <p className="text-[11px] text-teal-300">
                    Terms & Conditions, Official House Rules & Privacy Policy
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

            {/* Document Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setRulesModalTab('RULES')}
                className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 cursor-pointer ${
                  rulesModalTab === 'RULES'
                    ? 'border-[#12897F] text-[#12897F] bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                House Rules (8)
              </button>
              <button
                type="button"
                onClick={() => setRulesModalTab('TERMS')}
                className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 cursor-pointer ${
                  rulesModalTab === 'TERMS'
                    ? 'border-[#12897F] text-[#12897F] bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Terms & Conditions
              </button>
              <button
                type="button"
                onClick={() => setRulesModalTab('PRIVACY')}
                className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 cursor-pointer ${
                  rulesModalTab === 'PRIVACY'
                    ? 'border-[#12897F] text-[#12897F] bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Privacy & Next of Kin Consent
              </button>
            </div>

            {/* TAB 1: HOUSE RULES */}
            {rulesModalTab === 'RULES' && (
              <div className="overflow-y-auto flex-1">
                {/* Quiet Hours Banner */}
                <div className="bg-amber-50 border-b border-amber-200/80 p-3.5 flex items-start gap-3 shrink-0">
                  <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-900">
                      Mandatory Quiet Hours: 10:00 PM – 7:00 AM Daily
                    </p>
                    <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                      All residents across Fugson properties must observe peaceful tranquility. High decibel sound equipment and loud disturbances are strictly prohibited during these hours.
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-4 text-xs text-slate-600 divide-y divide-slate-100">
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
              </div>
            )}

            {/* TAB 2: TERMS AND CONDITIONS */}
            {rulesModalTab === 'TERMS' && (
              <div className="overflow-y-auto flex-1 p-5 space-y-4 text-xs text-slate-600">
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1">
                  <h4 className="font-bold text-[#12897F] text-xs">Official Tenancy Agreement Framework</h4>
                  <p className="text-[11px] text-teal-800 leading-relaxed">
                    By registering as a tenant under Fugson Properties, you agree to comply with the terms and statutory property regulations governed under Nigerian Tenancy Law.
                  </p>
                </div>

                <div className="space-y-3 divide-y divide-slate-100">
                  <div className="pt-2 first:pt-0">
                    <h5 className="font-bold text-slate-900 mb-1">1. Rent Denomination & Nigerian Naira (₦) Currency Protocol</h5>
                    <p className="leading-relaxed">
                      All rents, annual renewals, caution deposits, and recurring facility service charges are denominated and payable strictly in Nigerian Naira (₦). Electronic bank settlements are verified through unique Fugson virtual account tokens.
                    </p>
                  </div>

                  <div className="pt-3">
                    <h5 className="font-bold text-slate-900 mb-1">2. Payment Timelines & 5-Day Grace Period</h5>
                    <p className="leading-relaxed">
                      Rent must be paid on or before the anniversary of the lease start date. A grace period of 5 calendar days is observed before automated overdue notices are generated and communicated to the tenant and assigned field agents.
                    </p>
                  </div>

                  <div className="pt-3">
                    <h5 className="font-bold text-slate-900 mb-1">3. Maintenance Obligations & Property Inspection</h5>
                    <p className="leading-relaxed">
                      Tenants must immediately report water leakage, electrical hazards, or structural damage via the tenant maintenance portal. Authorized Fugson agents may inspect premises with 24 hours prior written or electronic notice, except in emergency crises where immediate access is warranted.
                    </p>
                  </div>

                  <div className="pt-3">
                    <h5 className="font-bold text-slate-900 mb-1">4. Prohibited Uses & Unauthorized Subletting</h5>
                    <p className="leading-relaxed">
                      Tenants shall not sublet or part with possession of the premises or any part thereof without express written consent from Fugson Properties management. Residential units may not be converted to commercial warehouse storage or high-traffic unauthorized activities.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PRIVACY POLICY & EMERGENCY PROTOCOL */}
            {rulesModalTab === 'PRIVACY' && (
              <div className="overflow-y-auto flex-1 p-5 space-y-4 text-xs text-slate-600">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                  <h4 className="font-bold text-blue-900 text-xs">Data Protection & Next of Kin Emergency Protocol</h4>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Compliant with the Nigeria Data Protection Act (NDPA). Learn how your data and emergency contact information are securely handled.
                  </p>
                </div>

                <div className="space-y-3 divide-y divide-slate-100">
                  <div className="pt-2 first:pt-0">
                    <h5 className="font-bold text-slate-900 mb-1">1. Purpose of Next of Kin Information</h5>
                    <p className="leading-relaxed">
                      Your Next of Kin and Emergency Contact details (Name, Relationship, Phone Number) are collected solely to safeguard resident life and property. In the event of a fire outbreak, plumbing flooding, medical emergency, security lockdown, or prolonged unresponsive tenant access, designated estate field agents and management are empowered to reach your emergency contact.
                    </p>
                  </div>

                  <div className="pt-3">
                    <h5 className="font-bold text-slate-900 mb-1">2. Access Control for Field Agents</h5>
                    <p className="leading-relaxed">
                      Only authorized field agents assigned to your specific estate corridor have view access to emergency contact details. Personal information is never sold, leased, or disclosed to unauthorized third parties or marketing affiliates.
                    </p>
                  </div>

                  <div className="pt-3">
                    <h5 className="font-bold text-slate-900 mb-1">3. Electronic Records & Data Retention</h5>
                    <p className="leading-relaxed">
                      Tenancy agreements, rent receipts, payment tokens, and incident logs are stored securely using encrypted cloud database protocols. Tenants may request updates to their next of kin records at any time by contacting estate administration.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                <span>I Agree to Terms & Conditions and Privacy Policy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
