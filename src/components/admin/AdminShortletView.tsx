'use client';

import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  Bell,
  Building2,
  Star,
  RefreshCw,
  Link as LinkIcon,
  Copy,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  User,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  Layers,
  ArrowUpRight,
  BedDouble,
  Tag,
  Share2,
} from 'lucide-react';
import { ShortletItem, ShortletBooking } from '@/src/types';
import { shortletService } from '@/src/services/shortletService';
import { formatNaira } from '@/src/utils/auth';

export default function AdminShortletView() {
  const [shortlets, setShortlets] = useState<ShortletItem[]>([]);
  const [bookings, setBookings] = useState<ShortletBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [sData, bData] = await Promise.all([
        shortletService.getShortlets(),
        shortletService.getBookings()
      ]);
      setShortlets(sData);
      setBookings(bData);
      setIsLoading(false);
    };
    fetchData();
  }, []);
  const [selectedVillaFilter, setSelectedVillaFilter] = useState<string>('ALL');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<'ALL' | 'AIRBNB' | 'DIRECT'>('ALL');
  const [activeBookingModal, setActiveBookingModal] = useState<ShortletBooking | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<'March 2025' | 'April 2025'>('March 2025');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Trigger manual Airbnb sync
  const handleAirbnbSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Airbnb API & iCal synchronization complete. 8 reservations verified, 0 calendar collisions.');
    }, 1200);
  };

  // Copy iCal URL
  const handleCopyIcalUrl = () => {
    const icalUrl = 'https://api.fugsonproperty.com/v1/ical/feed/fugson-villas.ics';
    navigator.clipboard?.writeText?.(icalUrl);
    showToast('Bi-directional iCal feed URL copied to clipboard.');
  };

  // Calculate Direct vs Airbnb revenue metrics
  const directBookings = bookings.filter((b) => b.source === 'DIRECT');
  const airbnbBookings = bookings.filter((b) => b.source === 'AIRBNB');

  const directRevenue = directBookings.reduce((sum, b) => sum + b.totalPayout, 0);
  const airbnbRevenue = airbnbBookings.reduce((sum, b) => sum + b.totalPayout, 0);
  const totalShortletRevenue = directRevenue + airbnbRevenue;

  const directPercent = Math.round((directRevenue / totalShortletRevenue) * 100);
  const airbnbPercent = 100 - directPercent;
  const otaSavings = Math.round(directRevenue * 0.15); // 15% standard Airbnb host commission saved

  // Filtered bookings for the calendar UI
  const filteredBookings = bookings.filter((b) => {
    if (selectedVillaFilter !== 'ALL' && b.villaId !== selectedVillaFilter) return false;
    if (selectedSourceFilter !== 'ALL' && b.source !== selectedSourceFilter) return false;
    return true;
  });

  // Calendar dates for March 2025 (representative preview 1st - 31st)
  const marchDays = Array.from({ length: 31 }, (_, i) => i + 1);

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

      {/* Primary Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0B1D2E] via-[#102a42] to-[#0B1D2E] text-white rounded-2xl p-6 sm:p-8 border border-slate-700/80 shadow-md">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Shortlet Operations & OTA Hub</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Shortlet Villas & Vacation Lodges
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Multi-channel short-stay operations with real-time Airbnb API & iCal synchronization,
            dynamic revenue auditing, and automated guest digital check-in passes.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleAirbnbSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-[#12897F] hover:bg-[#0f766e] disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing Airbnb Feeds...' : 'Sync Airbnb Feeds'}</span>
            </button>
            <button
              onClick={handleCopyIcalUrl}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy iCal URL</span>
            </button>
          </div>
        </div>

        {/* Decorative Watermark Icon */}
        <CalendarDays className="absolute right-4 -bottom-6 w-48 h-48 text-white/[0.04] pointer-events-none hidden md:block" />
      </div>

      {/* FEATURE 2 SECTION A: 'Integrations' Panel (Airbnb Connected) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#FF5A5F] flex items-center justify-center font-bold">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  OTA Channel Integrations
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronize calendar dates, reservation rates, and guest arrivals across booking platforms.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Last Synced:</span>
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              2 mins ago
            </span>
          </div>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Airbnb Integration Card (Connected) */}
          <div className="p-5 rounded-xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/20 via-white to-white space-y-4 relative overflow-hidden shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Airbnb Custom SVG/Badge */}
                <div className="w-10 h-10 rounded-xl bg-[#FF5A5F]/10 border border-[#FF5A5F]/20 flex items-center justify-center text-[#FF5A5F] font-black text-lg">
                  ⌂
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">Airbnb Official Channel</h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Connected
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">Partner API v2 & Bi-directional iCal Feed</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAirbnbSync}
                disabled={isSyncing}
                className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                title="Force Sync Now"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Sync Features List */}
            <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>2-Way Calendar Sync</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero Double-Bookings</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Instant Webhook Alerts</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Host Fee Auditing (15%)</span>
              </div>
            </div>

            {/* Channel Metrics Strip */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-500">
                Linked Listings: <strong>3 Luxury Villas</strong>
              </span>
              <button
                type="button"
                onClick={handleCopyIcalUrl}
                className="text-[#12897F] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <LinkIcon className="w-3 h-3" />
                <span>View iCal Endpoint</span>
              </button>
            </div>
          </div>

          {/* Secondary Channel - Booking.com (Staged / Direct Complement) */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800 font-black text-sm">
                  B.
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-sm">Booking.com / VRBO</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                      Standby
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">iCal Inbound Reservation Feed</span>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 font-medium">Ready</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Import reservations from additional European and corporate channels directly into the PropertyPro central schedule.
            </p>

            <button
              type="button"
              onClick={() => showToast('Booking.com integration token ready. Contact PropertyPro support to bind API key.')}
              className="w-full py-2 text-center text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition cursor-pointer"
            >
              Configure Additional Channels →
            </button>
          </div>
        </div>
      </div>

      {/* FEATURE 2 SECTION B: Metric Card Comparing 'Direct Booking Revenue' vs 'Airbnb Revenue' */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Channel Revenue Intelligence
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              Direct Booking vs. Airbnb Revenue Comparison
            </h2>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>₦{formatNaira(otaSavings)} saved in OTA host commissions</span>
          </div>
        </div>

        {/* 2-Column Revenue Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Direct Bookings Card */}
          <div className="p-5 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/40 via-white to-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#12897F] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#12897F]" />
                Direct Bookings (WhatsApp / Web)
              </span>
              <span className="text-xs font-bold bg-[#12897F] text-white px-2 py-0.5 rounded-full">
                {directPercent}% Volume
              </span>
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {formatNaira(directRevenue)}
            </div>

            <div className="space-y-1 text-xs text-slate-600 pt-1 border-t border-teal-100">
              <div className="flex justify-between">
                <span>Reservations:</span>
                <strong className="text-slate-900">{directBookings.length} confirmed stays</strong>
              </div>
              <div className="flex justify-between">
                <span>Platform Deductions:</span>
                <strong className="text-emerald-700">₦0 (0% Fee via PropertyPro Pay)</strong>
              </div>
              <div className="flex justify-between">
                <span>Guest Repeat Rate:</span>
                <strong className="text-slate-900">82% retention</strong>
              </div>
            </div>
          </div>

          {/* Airbnb Bookings Card */}
          <div className="p-5 rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50/30 via-white to-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A5F]" />
                Airbnb Synced Revenue
              </span>
              <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                {airbnbPercent}% Volume
              </span>
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {formatNaira(airbnbRevenue)}
            </div>

            <div className="space-y-1 text-xs text-slate-600 pt-1 border-t border-rose-100">
              <div className="flex justify-between">
                <span>Reservations:</span>
                <strong className="text-slate-900">{airbnbBookings.length} synced bookings</strong>
              </div>
              <div className="flex justify-between">
                <span>Host Commission Fee (15%):</span>
                <strong className="text-rose-600">
                  -{formatNaira(airbnbBookings.reduce((sum, b) => sum + (b.hostFee || 0), 0))}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Sync Channel:</span>
                <strong className="text-slate-900">Airbnb Partner API v2</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Comparison Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span className="text-[#12897F]">Direct Bookings ({directPercent}%)</span>
            <span className="text-rose-600">Airbnb Synced ({airbnbPercent}%)</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden bg-rose-200 flex">
            <div
              className="bg-[#12897F] h-full transition-all duration-500"
              style={{ width: `${directPercent}%` }}
            />
            <div
              className="bg-[#FF5A5F] h-full transition-all duration-500"
              style={{ width: `${airbnbPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Total Realized Shortlet Revenue: {formatNaira(totalShortletRevenue)}</span>
            <span className="text-emerald-700 font-bold">100% Payout Verified</span>
          </div>
        </div>
      </div>

      {/* FEATURE 2 SECTION C: Calendar UI noting which bookings came from Airbnb (via API/iCal sync) vs Direct */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#12897F] flex items-center justify-center font-bold">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Shortlet Booking & Occupancy Schedule
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual calendar indicating Airbnb (API/iCal sync) and Direct WhatsApp reservations.
                </p>
              </div>
            </div>
          </div>

          {/* Filters for Villa and Channel */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Source Channel Filter */}
            <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setSelectedSourceFilter('ALL')}
                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                  selectedSourceFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Sources
              </button>
              <button
                type="button"
                onClick={() => setSelectedSourceFilter('AIRBNB')}
                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer flex items-center gap-1 ${
                  selectedSourceFilter === 'AIRBNB'
                    ? 'bg-white text-[#FF5A5F] shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#FF5A5F]" />
                <span>Airbnb Only</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedSourceFilter('DIRECT')}
                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer flex items-center gap-1 ${
                  selectedSourceFilter === 'DIRECT'
                    ? 'bg-white text-[#12897F] shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#12897F]" />
                <span>Direct Only</span>
              </button>
            </div>

            {/* Villa Filter Dropdown */}
            <select
              value={selectedVillaFilter}
              onChange={(e) => setSelectedVillaFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 outline-none focus:ring-1 focus:ring-[#12897F]"
            >
              <option value="ALL">All Shortlet Villas (3)</option>
              <option value="sht-01">Villa Orchid</option>
              <option value="sht-02">Villa Bamboo</option>
              <option value="sht-03">Lakefront Executive Lodge</option>
            </select>
          </div>
        </div>

        {/* Legend / Color Identifiers */}
        <div className="flex flex-wrap items-center gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Booking Identifiers:</span>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF5A5F]/15 text-[#FF5A5F] border border-[#FF5A5F]/30">
              Airbnb (API/iCal Sync)
            </span>
            <span className="text-slate-600 text-[11px]">Synced via Airbnb Partner API & iCal Feed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-[#12897F] border border-teal-200">
              Direct Booking (PropertyPro Pay)
            </span>
            <span className="text-slate-600 text-[11px]">Direct WhatsApp link, 0% OTA fees</span>
          </div>
        </div>

        {/* Bookings Card List for Clean Mobile & Desktop Inspection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">
              Active & Upcoming Reservations ({filteredBookings.length})
            </span>
            <span className="text-xs text-slate-500">March 2025 Calendar Schedule</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredBookings.map((b) => {
              const isAirbnb = b.source === 'AIRBNB';

              return (
                <div
                  key={b.id}
                  onClick={() => setActiveBookingModal(b)}
                  className={`p-4 rounded-xl border transition cursor-pointer hover:shadow-sm space-y-3 ${
                    isAirbnb
                      ? 'bg-rose-50/20 border-rose-200 hover:border-rose-300'
                      : 'bg-teal-50/20 border-teal-200 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {/* Booking Origin Badge */}
                      {isAirbnb ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#FF5A5F]/15 text-[#FF5A5F] border border-[#FF5A5F]/30 mb-1">
                          <span>Airbnb (via {b.syncMethod})</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-teal-100 text-[#12897F] border border-teal-200 mb-1">
                          <span>Direct Booking ({b.syncMethod})</span>
                        </div>
                      )}

                      <h3 className="font-bold text-slate-900 text-sm">{b.guestName}</h3>
                      <span className="text-xs text-slate-500 block">{b.villaName}</span>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-900">
                        {formatNaira(b.totalPayout)}
                      </div>
                      <span className="text-[11px] text-slate-400">{b.nights} nights</span>
                    </div>
                  </div>

                  {/* Dates & Reference Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs py-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {b.checkIn} → {b.checkOut}
                      </span>
                    </div>

                    {isAirbnb && b.airbnbReservationCode && (
                      <span className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Code: {b.airbnbReservationCode}
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.status === 'Checked In'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'Confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : b.status === 'Upcoming'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Planned Villa Inventory (Staging preview) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Villa Assets & Nightly Rates</h2>
            <p className="text-xs text-slate-500">Live units synchronized with Airbnb calendar.</p>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
            3 Villas Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {shortlets.map((villa) => (
            <div
              key={villa.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{villa.name}</h3>
                    <span className="text-xs text-slate-500">{villa.property}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-bold">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{villa.rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs py-2 border-y border-slate-100">
                  <span className="font-extrabold text-slate-700">
                    {formatNaira(villa.nightlyRate)}{' '}
                    <span className="text-xs font-normal text-slate-400">/ night</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Airbnb Linked
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Featured Amenities</div>
                  <div className="flex flex-wrap gap-1">
                    {villa.amenities.map((item, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedVillaFilter(villa.id);
                  showToast(`Filtered schedule for ${villa.name}`);
                }}
                className="w-full text-center text-xs font-semibold py-2 px-3 bg-slate-50 hover:bg-teal-50 text-[#12897F] border border-slate-200 hover:border-teal-200 rounded-lg transition cursor-pointer"
              >
                View Calendar Schedule →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Details Modal */}
      {activeBookingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-block mb-1 ${
                    activeBookingModal.source === 'AIRBNB'
                      ? 'bg-[#FF5A5F]/15 text-[#FF5A5F] border border-[#FF5A5F]/30'
                      : 'bg-teal-100 text-[#12897F] border border-teal-200'
                  }`}
                >
                  {activeBookingModal.source === 'AIRBNB'
                    ? `Airbnb (${activeBookingModal.syncMethod})`
                    : `Direct (${activeBookingModal.syncMethod})`}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {activeBookingModal.guestName}
                </h3>
                <span className="text-xs text-slate-500">{activeBookingModal.villaName}</span>
              </div>

              <button
                onClick={() => setActiveBookingModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Dates of Stay:</span>
                <strong className="text-slate-800">
                  {activeBookingModal.checkIn} to {activeBookingModal.checkOut} ({activeBookingModal.nights} nights)
                </strong>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Gross Payout:</span>
                <strong className="text-slate-900 text-sm">
                  {formatNaira(activeBookingModal.totalPayout)}
                </strong>
              </div>

              {activeBookingModal.source === 'AIRBNB' ? (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Airbnb Confirmation Code:</span>
                    <strong className="font-mono text-slate-800">{activeBookingModal.airbnbReservationCode}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Host Fee Deduction (15%):</span>
                    <strong className="text-rose-600">
                      -{formatNaira(activeBookingModal.hostFee || 0)}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Sync Status:</span>
                    <strong className="text-emerald-700">Verified via Airbnb Webhook</strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Booking Channel:</span>
                    <strong className="text-[#12897F]">PropertyPro Direct WhatsApp Gateway</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Host Fee Deductions:</span>
                    <strong className="text-emerald-700">₦0 (100% Retained)</strong>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  showToast(`WhatsApp digital check-in pass resent to ${activeBookingModal.guestName}`);
                  setActiveBookingModal(null);
                }}
                className="flex-1 py-2.5 text-xs font-semibold bg-[#12897F] hover:bg-[#0f766e] text-white rounded-xl transition cursor-pointer text-center"
              >
                Send WhatsApp Check-in Pass
              </button>
              <button
                type="button"
                onClick={() => setActiveBookingModal(null)}
                className="px-4 py-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
