'use client';

import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Link2,
  CheckCircle2,
  X,
  Share2,
  CalendarCheck,
  Building,
  Sparkles,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Edit2,
  Save,
} from 'lucide-react';

const AIRBNB_STORAGE_KEY = 'fugson_airbnb_profile_url';

export default function AdminShortletView() {
  const [airbnbUrl, setAirbnbUrl] = useState<string>('');
  const [tempUrl, setTempUrl] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(AIRBNB_STORAGE_KEY);
      if (saved) {
        setAirbnbUrl(saved);
        setTempUrl(saved);
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = tempUrl.trim();
    if (!cleanUrl) {
      showToast('Please enter a valid Airbnb profile link.');
      return;
    }

    let formattedUrl = cleanUrl;
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      formattedUrl = `https://${cleanUrl}`;
    }

    setAirbnbUrl(formattedUrl);
    setTempUrl(formattedUrl);
    if (typeof window !== 'undefined') {
      localStorage.setItem(AIRBNB_STORAGE_KEY, formattedUrl);
    }
    setIsEditing(false);
    showToast('Airbnb profile link updated and saved successfully.');
  };

  const handleOpenAirbnb = () => {
    if (!airbnbUrl) {
      setIsEditing(true);
      showToast('Please specify your Airbnb profile URL first.');
      return;
    }
    if (typeof window !== 'undefined') {
      window.open(airbnbUrl, '_blank', 'noopener,noreferrer');
    }
  };

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
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold uppercase tracking-wider mb-2">
            <span>Airbnb & Vacation Rentals</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Shortlet & Airbnb Portal
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage your shortlet portfolio, guest reservations, and connect directly to your verified Airbnb profile.
          </p>
        </div>

        {airbnbUrl && (
          <button
            type="button"
            onClick={handleOpenAirbnb}
            className="px-4 py-2 bg-[#FF5A5F] hover:bg-[#e0484d] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <span>Visit Airbnb Profile</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Airbnb Profile Link Connection Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#FF5A5F] shrink-0 shadow-2xs">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Official Airbnb Host Profile Link
              </h2>
              <p className="text-slate-500 text-xs mt-1 max-w-xl leading-relaxed">
                Connect your official Airbnb Host account. Once saved, guests, team members, and admins can quickly navigate directly to your live Airbnb property listings and reviews.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {airbnbUrl && !isEditing ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Profile Linked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Action Required
              </span>
            )}
          </div>
        </div>

        {/* Link Display / Form */}
        {isEditing || !airbnbUrl ? (
          <form onSubmit={handleSaveUrl} className="space-y-4 max-w-2xl bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Airbnb Host Profile URL
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://www.airbnb.com/users/show/YOUR_PROFILE_ID"
                  className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#FF5A5F] transition"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Paste your public Airbnb host URL (e.g. <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">airbnb.com/h/fugsonproperty</code>).
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-[#12897F] hover:bg-[#0f766e] text-white text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Link</span>
              </button>
              {airbnbUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setTempUrl(airbnbUrl);
                    setIsEditing(false);
                  }}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="space-y-1 overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Current Connected Profile
              </span>
              <a
                href={airbnbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-mono font-semibold text-[#12897F] hover:underline flex items-center gap-1.5 truncate"
              >
                <span className="truncate">{airbnbUrl}</span>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Link</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAirbnb}
                className="px-4 py-1.5 bg-[#FF5A5F] hover:bg-[#e0484d] text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Informational Guidance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-[#12897F] flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-xs">Calendar Synchronization</h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              When reservations are made on your Airbnb listings, bi-directional iCal calendar feeds will prevent overlapping dates.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-xs">Direct Payment Links</h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              For return guests booking outside Airbnb, dispatch direct Fugson Property payment links with 0% third-party service fees.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-xs">Shortlet Portfolio</h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              New villas, serviced apartments, and vacation flats added to Fugson Property will integrate directly into this portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
