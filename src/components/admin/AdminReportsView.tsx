'use client';

import React, { useState, useEffect } from 'react';
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
  Building,
  Filter,
  Printer,
  Database,
  RefreshCw,
} from 'lucide-react';
import { formatNaira } from '@/src/utils/auth';
import { propertyService } from '@/src/services/propertyService';
import { reportService, FinancialAuditSummary } from '@/src/services/reportService';
import { PropertyItem } from '@/src/types';
import ProfitLossCharts from './ProfitLossCharts';

export default function AdminReportsView() {
  const [summary, setSummary] = useState<FinancialAuditSummary | null>(null);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState<'CURRENT_MONTH' | 'LAST_MONTH' | 'Q1_2025' | 'YEAR_2025' | 'ALL_TIME'>('CURRENT_MONTH');
  const [selectedProperty, setSelectedProperty] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PAID' | 'OVERDUE'>('ALL');

  // Print Modal
  const [showPrintModal, setShowPrintModal] = useState(false);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const [reportData, propList] = await Promise.all([
        reportService.getFinancialAuditSummary({
          period: selectedPeriod,
          propertyFilter: selectedProperty,
          statusFilter: selectedStatus,
        }),
        propertyService.getProperties(),
      ]);
      setSummary(reportData);
      setProperties(propList);
    } catch (err) {
      console.error('Failed to load report data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedPeriod, selectedProperty, selectedStatus]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportCSV = () => {
    if (!summary) return;
    const dateStr = new Date().toISOString().split('T')[0];
    reportService.downloadCSV(summary, `Fugson_Property_Audit_${dateStr}.csv`);
    showToast('Official CSV audit file generated and downloaded successfully.');
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
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

      {/* Header with Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Database className="w-3 h-3 text-[#12897F]" />
            <span>Database Connected • REST Ready</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Financial & Portfolio Audit Reports
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Rent collection velocity, tenant payment reconciliations, and P&L ledger audits.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchReport}
            title="Refresh database records"
            className="p-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#12897F]" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="px-3.5 py-2 bg-[#12897F] hover:bg-[#0f766e] text-white text-xs font-semibold rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Audit Statement</span>
          </button>
        </div>
      </div>

      {/* Interactive Filters Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Period Selector */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Period:
          </span>
          <button
            onClick={() => setSelectedPeriod('CURRENT_MONTH')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
              selectedPeriod === 'CURRENT_MONTH'
                ? 'bg-[#0B1D2E] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Current Month
          </button>
          <button
            onClick={() => setSelectedPeriod('Q1_2025')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
              selectedPeriod === 'Q1_2025'
                ? 'bg-[#0B1D2E] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Q1 2025
          </button>
          <button
            onClick={() => setSelectedPeriod('YEAR_2025')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
              selectedPeriod === 'YEAR_2025'
                ? 'bg-[#0B1D2E] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            YTD 2025
          </button>
          <button
            onClick={() => setSelectedPeriod('ALL_TIME')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
              selectedPeriod === 'ALL_TIME'
                ? 'bg-[#0B1D2E] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All-Time
          </button>
        </div>

        {/* Property & Status Dropdown Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-[#12897F]"
          >
            <option value="ALL">All Estates Portfolio</option>
            {properties.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-[#12897F]"
          >
            <option value="ALL">All Invoices & Collections</option>
            <option value="PAID">Fully Settled (Paid)</option>
            <option value="OVERDUE">Arrears & Overdue</option>
          </select>
        </div>
      </div>

      {/* Top Audit KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Scheduled Rent Roll
          </span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {formatNaira(summary?.scheduledRentRoll || 0)}
          </div>
          <span className="text-[11px] text-teal-600 font-semibold mt-0.5 block">
            {summary?.activePropertiesCount || 0} Estates Tracked
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Realized Collections
          </span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">
            {formatNaira(summary?.realizedCollections || 0)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Bank confirmed remittances</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Outstanding Arrears
          </span>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 mt-1">
            {formatNaira(summary?.outstandingArrears || 0)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
            {summary?.overdueTenantsCount || 0} delinquent units
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Collection Efficiency
          </span>
          <div className="text-xl sm:text-2xl font-bold text-[#12897F] mt-1">
            {summary?.collectionEfficiency || 0}%
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Velocity index</span>
        </div>
      </div>

      {/* Estate Performance Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Portfolio Estate Performance Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live collection velocity and tenant arrears grouped by asset ({summary?.periodLabel}).
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            {summary?.rows.length || 0} Estates in Filter
          </span>
        </div>

        {!summary || summary.rows.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Building className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="font-bold text-slate-800 text-sm">No estate records found for selected filter</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Once properties and leased tenants are registered or match your active filter, collection velocities and arrears will calculate here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Estate & Asset Type</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Scheduled Volume</th>
                  <th className="py-3 px-4">Realized Collections</th>
                  <th className="py-3 px-4">Collection Rate</th>
                  <th className="py-3 px-4">Delinquency</th>
                  <th className="py-3 px-4 text-right">Managing Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {summary.rows.map((row) => (
                  <tr key={row.estateId} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {row.estateName}
                      <span className="block text-[10px] text-slate-400 font-normal uppercase">{row.type}</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">{row.location}</td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatNaira(row.scheduledRent)}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-emerald-700">
                      {formatNaira(row.collectedRent)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.efficiencyRate >= 80 ? 'bg-[#12897F]' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, row.efficiencyRate)}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800">{row.efficiencyRate}%</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {row.outstandingArrears > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          {formatNaira(row.outstandingArrears)} ({row.overdueTenantsCount} Overdue)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Zero Arrears
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                      {row.assignedAgent || 'Unassigned'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive Profit & Loss and Operating Expenses Section */}
      <div className="pt-2">
        <ProfitLossCharts />
      </div>

      {/* Printable Statement Modal */}
      {showPrintModal && summary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowPrintModal(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 z-10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Official Audit Document</span>
                <h2 className="text-xl font-bold text-slate-900">Fugson Property Financial Statement</h2>
                <p className="text-xs text-slate-500 mt-0.5">Period: {summary.periodLabel} • Date: {summary.generatedAt}</p>
              </div>
              <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Scheduled Roll</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{formatNaira(summary.scheduledRentRoll)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Collections</span>
                <span className="font-bold text-emerald-700 text-sm mt-0.5 block">{formatNaira(summary.realizedCollections)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Arrears</span>
                <span className="font-bold text-rose-600 text-sm mt-0.5 block">{formatNaira(summary.outstandingArrears)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Efficiency</span>
                <span className="font-bold text-[#12897F] text-sm mt-0.5 block">{summary.collectionEfficiency}%</span>
              </div>
            </div>

            {/* Rows summary */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Estate Breakdowns</span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {summary.rows.map((row) => (
                  <div key={row.estateId} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-900 block">{row.estateName}</span>
                      <span className="text-[10px] text-slate-500">{row.location} • Agent: {row.assignedAgent}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">{formatNaira(row.collectedRent)} / {formatNaira(row.scheduledRent)}</span>
                      <span className="text-[10px] text-teal-700 font-semibold">{row.efficiencyRate}% Efficiency</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Close Preview
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 bg-[#12897F] hover:bg-[#0f766e] text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
