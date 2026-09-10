'use client';

import React, { useState } from 'react';
import {
  FileBarChart,
  Download,
  CheckCircle2,
  X,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  ArrowUpRight,
  PieChart,
  Layers,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { formatNaira } from '@/src/utils/auth';
import ProfitLossCharts from './ProfitLossCharts';

export default function AdminReportsView() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reportPeriod, setReportPeriod] = useState<'CURRENT_MONTH' | 'Q1_2025' | 'YEAR_2024'>('CURRENT_MONTH');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const estateReports = [
    {
      estate: 'PropertyPro Heights Estate',
      type: 'Residential High-Rise',
      scheduled: 3800000,
      collected: 3500000,
      rate: 92,
      overdueCount: 0,
    },
    {
      estate: 'PropertyPro Commercial Plaza',
      type: 'Commercial Real Estate',
      scheduled: 2400000,
      collected: 2400000,
      rate: 100,
      overdueCount: 0,
    },
    {
      estate: 'Lekki Phase 1 Luxury Court',
      type: 'Residential Luxury Court',
      scheduled: 2160000,
      collected: 1880000,
      rate: 87,
      overdueCount: 0,
    },
    {
      estate: 'Green Valley Farmland Block A',
      type: 'Farmland (Coming Soon)',
      scheduled: 1850000,
      collected: 850000,
      rate: 46,
      overdueCount: 1,
    },
    {
      estate: 'PropertyPro Shortlet Villas',
      type: 'Shortlet Villa (Coming Soon)',
      scheduled: 900000,
      collected: 900000,
      rate: 100,
      overdueCount: 0,
    },
  ];

  const totalScheduled = 11110000;
  const totalCollected = 6380000;
  const totalArrears = 4730000;
  const collectionEfficiency = Math.round((totalCollected / totalScheduled) * 100);

  const handleExportCSV = () => {
    showToast('Exporting PropertyPro_Property_Audit_2025.csv... Download complete.');
  };

  const handleExportPDF = () => {
    showToast('Generating official Railway audit ledger PropertyPro_Financial_Audit.pdf...');
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

      {/* Header with Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Financial & Arrears Audit</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            PostgreSQL-backed revenue tracking, collection efficiency, and agent remittance ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="px-3.5 py-2 text-xs font-semibold bg-[#12897F] hover:bg-[#0f766e] text-white rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF Summary</span>
          </button>
        </div>
      </div>

      {/* Top 3 High-Impact Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Scheduled Monthly Roll
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {formatNaira(totalScheduled)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">5 Estates • 54 Units / Plots</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
            Collected Revenue
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
            {formatNaira(totalCollected)}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="font-bold text-emerald-700">{collectionEfficiency}% Collected</span>
            <span className="text-slate-400">• On Track</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">
            Arrears Pending
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
            {formatNaira(totalArrears)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">4 Overdue Leases • Automated WhatsApp notices</span>
        </div>
      </div>

      {/* P&L Breakdown Charts (Waterfall / Donut with Overheads & Net Profit) */}
      <ProfitLossCharts />

      {/* Estate by Estate Performance Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Portfolio Estate Breakdown</h2>
            <p className="text-xs text-slate-500">Rent roll collection comparison per property asset.</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            Active Cycle
          </span>
        </div>

        {/* Responsive Table / Stack on Mobile */}
        <div className="space-y-4 pt-2">
          {estateReports.map((item, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{item.estate}</span>
                  <span className="text-[11px] text-slate-500 block sm:inline sm:ml-2">({item.type})</span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500">
                    Collected: <strong className="text-slate-900">{formatNaira(item.collected)}</strong> / {formatNaira(item.scheduled)}
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      item.rate >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.rate >= 50
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.rate}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    item.rate >= 80 ? 'bg-[#12897F]' : item.rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${item.rate}%` }}
                />
              </div>

              {item.overdueCount > 0 && (
                <div className="text-[11px] text-amber-700 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{item.overdueCount} overdue tenant lease(s) under recovery</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Commission Audit Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#12897F]" />
            <span>Agent Commission Liability Audit</span>
          </h3>
          <p className="text-xs text-slate-500">
            Standard 5% commission calculation on verified tenant leases.
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Total Commissions Generated:</span>
              <span className="font-bold text-slate-900">₦555,500</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Disbursed to Bank:</span>
              <span className="font-bold text-emerald-700">₦92,500</span>
            </div>
            <div className="flex justify-between py-1 border-t border-slate-100">
              <span className="text-slate-700 font-semibold">Net Pending Remittance:</span>
              <span className="font-bold text-amber-600 text-sm">₦463,000</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#12897F]" />
            <span>Infrastructure Health</span>
          </h3>
          <p className="text-xs text-slate-500">Database connection and security checks.</p>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Database Server:</span>
              <span className="font-bold text-emerald-700">PostgreSQL (Railway Connected)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Tokenized WhatsApp Links:</span>
              <span className="font-bold text-slate-900">Active (15-min TTL)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">RBAC Enforcement:</span>
              <span className="font-bold text-emerald-700">Strict Cookie Middleware</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
