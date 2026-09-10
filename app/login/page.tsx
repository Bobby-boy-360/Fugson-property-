'use client';

import React, { useState } from 'react';
import { Building2, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { authService } from '@/src/services/authService';

interface LoginPageProps {
  onNavigate?: (path: string) => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const destination = user.role === 'ADMIN' ? '/admin' : user.role === 'AGENT' ? '/agent' : '/pay/fg-tenant-001';
      if (onNavigate) {
        onNavigate(destination);
      } else if (typeof window !== 'undefined') {
        window.location.href = destination;
      }
    } catch (err) {
      setError('Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const devLogin = (devEmail: string) => {
    setEmail(devEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col justify-center items-center px-4 py-8 sm:py-12 text-slate-800 font-sans">
      <div className="mb-6 text-center max-w-md">
        <div className="inline-flex items-center justify-center gap-2.5 px-4 py-2 rounded-2xl bg-[#0B1D2E] text-white shadow-md mb-3.5">
          <div className="w-8 h-8 rounded-lg bg-[#12897F] flex items-center justify-center text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="font-bold text-lg tracking-tight block leading-tight">PropertyPro</span>
            <span className="text-[10px] text-teal-200 tracking-wider uppercase font-semibold block">
              Property & Farm Management
            </span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to your account</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Unified portal for Administrators, Agents, and Tenants
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200">
              {error}
            </div>
          )}

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
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Password
            </label>
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
            className="w-full py-2.5 bg-[#12897F] hover:bg-[#0e6e66] text-white text-sm font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-100 pt-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
            Quick Dev Login (Testing)
          </div>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => devLogin('peter@propertypro.com')}
              className="py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition cursor-pointer"
            >
              Login as Admin (peter@propertypro.com)
            </button>
            <button
              type="button"
              onClick={() => devLogin('briggs@propertypro.com')}
              className="py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition cursor-pointer"
            >
              Login as Agent (briggs@propertypro.com)
            </button>
            <button
              type="button"
              onClick={() => devLogin('michael@propertypro.com')}
              className="py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition cursor-pointer"
            >
              Login as Tenant (michael@propertypro.com)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
