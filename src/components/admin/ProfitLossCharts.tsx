'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Wrench,
  Wifi,
  ShieldCheck,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  Building,
  Sprout,
  Info,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react';
import { financeService } from '@/src/services/financeService';
import { formatNaira } from '@/src/utils/auth';
import { ProfitLossBreakdown, ProfitLossOverheads } from '@/src/types';

export interface ExpenseLog {
  id: string;
  propertyKey: string;
  category: keyof ProfitLossOverheads | 'admin';
  categoryLabel: string;
  amount: number;
  date: string;
  description: string;
}

type PLData = Record<string, any>;

export default function ProfitLossCharts() {
  const [dataMap, setDataMap] = useState<PLData | null>(null);
  const [selectedKey, setSelectedKey] = useState<string>('consolidated');
  const [chartType, setChartType] = useState<'DONUT' | 'WATERFALL'>('DONUT');
  const [expenses, setExpenses] = useState<ExpenseLog[]>([]);

  // Form state
  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseDate, setNewExpenseDate] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<keyof ProfitLossOverheads | 'admin'>('maintenance');

  React.useEffect(() => {
    financeService.getProfitLossData().then((data) => {
      setDataMap(data || {});
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('fugson_expenses_v2');
        localStorage.removeItem('propertypro_expenses');
        const storedExp = localStorage.getItem('fugson_expenses_v3');
        if (storedExp) {
          setExpenses(JSON.parse(storedExp));
        }
      } catch (err) {
        console.error('Failed to load expenses', err);
      }
    }
  }, []);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseDesc || !newExpenseAmount || !newExpenseDate) return;
    
    const newLog: ExpenseLog = {
      id: `exp-${Date.now()}`,
      propertyKey: selectedKey,
      category: newExpenseCategory,
      categoryLabel: newExpenseCategory === 'maintenance' ? 'Maintenance & Facility' : 
                     newExpenseCategory === 'power' ? 'Power & Diesel' : 
                     newExpenseCategory === 'internet' ? 'Internet & Tech' :
                     newExpenseCategory === 'cleaningSecurity' ? 'Cleaning & Security' : 'Administrative',
      amount: parseFloat(newExpenseAmount),
      date: newExpenseDate,
      description: newExpenseDesc,
    };

    const updated = [newLog, ...expenses];
    setExpenses(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('fugson_expenses_v3', JSON.stringify(updated));
      } catch (err) {
        // ignore
      }
    }
    setNewExpenseDesc('');
    setNewExpenseAmount('');
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('fugson_expenses_v3', JSON.stringify(updated));
      } catch (err) {
        // ignore
      }
    }
  };

  // Dynamic calculations based on original + logged expenses
  const fallbackPL = {
    id: 'consolidated',
    name: 'Consolidated Portfolio',
    type: 'Entire Portfolio',
    grossRevenue: 0,
    overheads: {
      maintenance: 0,
      power: 0,
      internet: 0,
      cleaningSecurity: 0,
    },
    totalOverheads: 0,
    netProfit: 0,
    netMargin: 0,
    notes: 'Operating expense and net yield tracker.',
  };
  const basePL = (dataMap && dataMap[selectedKey]) ? dataMap[selectedKey] : fallbackPL;
  const activeExpenses = expenses.filter(e => e.propertyKey === selectedKey || selectedKey === 'consolidated');
  
  let dynamicOverheads = { ...(basePL.overheads || {}) };
  let additionalAdmin = 0;
  
  activeExpenses.forEach(exp => {
    if (exp.category !== 'admin') {
      dynamicOverheads[exp.category] = (dynamicOverheads[exp.category] || 0) + exp.amount;
    } else {
      additionalAdmin += exp.amount;
    }
  });

  const dynamicTotalOverheads = (Object.values(dynamicOverheads) as number[]).reduce((a: number, b: number) => a + b, 0) + additionalAdmin;
  const grossRevenue = basePL.grossRevenue || 0;
  const netProfit = grossRevenue - dynamicTotalOverheads;
  const netMargin = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : '0.0';

  // Donut chart data
  const donutData = [
    {
      name: 'Net Operating Profit',
      value: Math.max(0, netProfit),
      color: '#12897F', // Brand Teal / Emerald
      percentage: grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : '0.0',
    },
    {
      name: 'Power & Diesel',
      value: dynamicOverheads.power || 0,
      color: '#F59E0B', // Amber
      percentage: grossRevenue > 0 ? (((dynamicOverheads.power || 0) / grossRevenue) * 100).toFixed(1) : '0.0',
    },
    {
      name: 'Facility & Maintenance',
      value: dynamicOverheads.maintenance || 0,
      color: '#F43F5E', // Rose
      percentage: grossRevenue > 0 ? (((dynamicOverheads.maintenance || 0) / grossRevenue) * 100).toFixed(1) : '0.0',
    },
    {
      name: 'Cleaning & Security',
      value: dynamicOverheads.cleaningSecurity || 0,
      color: '#6366F1', // Indigo
      percentage: grossRevenue > 0 ? (((dynamicOverheads.cleaningSecurity || 0) / grossRevenue) * 100).toFixed(1) : '0.0',
    },
    {
      name: 'Internet & Tech',
      value: dynamicOverheads.internet || 0,
      color: '#06B6D4', // Cyan
      percentage: grossRevenue > 0 ? (((dynamicOverheads.internet || 0) / grossRevenue) * 100).toFixed(1) : '0.0',
    },
  ];
  if (additionalAdmin > 0) {
    donutData.push({
      name: 'Administrative',
      value: additionalAdmin,
      color: '#8B5CF6', // Purple
      percentage: grossRevenue > 0 ? ((additionalAdmin / grossRevenue) * 100).toFixed(1) : '0.0',
    });
  }

  // Waterfall Chart Data 
  const waterfallData = [
    { step: 'Gross Rent Roll', amount: grossRevenue, fill: '#0B1D2E' }, // Brand Navy
    { step: 'Power & Utility', amount: dynamicOverheads.power || 0, fill: '#F43F5E' },
    { step: 'Maintenance', amount: dynamicOverheads.maintenance || 0, fill: '#F43F5E' },
    { step: 'Cleaning/Security', amount: dynamicOverheads.cleaningSecurity || 0, fill: '#F43F5E' },
    { step: 'Net Cashflow', amount: Math.max(0, netProfit), fill: '#12897F' }, // Brand Teal
  ];

  const CustomDonutTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            {data.name}
          </div>
          <div className="text-white font-bold">{formatNaira(data.value)}</div>
          <div className="text-teal-400 text-xs font-semibold">{data.percentage}% of Gross Revenue</div>
        </div>
      );
    }
    return null;
  };

  const CustomWaterfallTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            {label}
          </div>
          <div className="text-white font-bold">{formatNaira(data.amount)}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Operating Expense Logger */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-rose-500" />
            Interactive Operating Expense Logger
          </h2>
          <p className="text-xs text-slate-500 mt-1">Log property expenditures to instantly recalculate Net Operating Income (NOI) and margins.</p>
        </div>

        <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Expense Description</label>
            <input 
              type="text" 
              required
              value={newExpenseDesc}
              onChange={(e) => setNewExpenseDesc(e.target.value)}
              placeholder="e.g. Diesel for Generator, Plumbing repair"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-[#12897F]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Category</label>
            <select 
              value={newExpenseCategory}
              onChange={(e) => setNewExpenseCategory(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-[#12897F]"
            >
              <option value="maintenance">Maintenance</option>
              <option value="power">Power / Diesel</option>
              <option value="cleaningSecurity">Security / Cleaning</option>
              <option value="internet">Internet & Tech</option>
              <option value="admin">Administrative</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Amount (₦)</label>
            <input 
              type="number" 
              required
              min="0"
              value={newExpenseAmount}
              onChange={(e) => setNewExpenseAmount(e.target.value)}
              placeholder="50000"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-[#12897F]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Date</label>
            <input 
              type="date" 
              required
              value={newExpenseDate}
              onChange={(e) => setNewExpenseDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-[#12897F]"
            />
          </div>
          <button type="submit" className="md:col-span-5 py-2 mt-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2">
            <Plus className="w-3.5 h-3.5" />
            Add Expense
          </button>
        </form>

        {activeExpenses.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recently Logged Expenses</h3>
            <div className="space-y-2">
              {activeExpenses.map(exp => (
                <div key={exp.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{exp.description}</span>
                    <span className="text-[10px] text-slate-500">{exp.date} • {exp.categoryLabel}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-rose-600">-{formatNaira(exp.amount)}</span>
                    <button onClick={() => handleDeleteExpense(exp.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-[#12897F]" />
              <span>Real-Time P&L Architecture</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Gross rent collection minus operational overheads equals true net yield. Select a portfolio node below to instantly re-calculate operating margins.
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg self-start">
            <button
              onClick={() => setChartType('DONUT')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                chartType === 'DONUT'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Distribution</span>
            </button>
            <button
              onClick={() => setChartType('WATERFALL')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                chartType === 'WATERFALL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Waterfall</span>
            </button>
          </div>
        </div>

        {/* Portfolio Selectors */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setSelectedKey('consolidated')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-2 ${
              selectedKey === 'consolidated'
                ? 'bg-[#0B1D2E] text-white border-[#0B1D2E] shadow-md'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Consolidated (All)
          </button>
          <button
            onClick={() => setSelectedKey('residential')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-2 ${
              selectedKey === 'residential'
                ? 'bg-[#12897F] text-white border-[#12897F] shadow-md'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            Residential Portfolio
          </button>
        </div>

        {/* Visual Chart Canvas */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-4 sm:p-6 lg:p-8">
          {chartType === 'DONUT' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Pie Chart */}
              <div className="lg:col-span-7 h-64 sm:h-80 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius="65%"
                      outerRadius="90%"
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomDonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center KPI */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">
                    Net Profit
                  </span>
                  <span className="text-xl sm:text-3xl font-extrabold text-[#0B1D2E] tracking-tight mt-0.5">
                    {formatNaira(netProfit)}
                  </span>
                  <span className="text-xs font-semibold text-[#12897F]">{netMargin}% Margin</span>
                </div>
              </div>

              {/* Breakdown Legend Column */}
              <div className="lg:col-span-5 space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-200">
                  Revenue & Cost Distribution
                </span>
                {donutData.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/70 text-xs shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold text-slate-800">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{formatNaira(item.value)}</div>
                      <div className="text-[10px] text-slate-400">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Waterfall / Stepped Breakdown Chart Visual */
            <div className="space-y-4">
              <div className="h-72 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={waterfallData}
                    margin={{ top: 20, right: 20, left: 10, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="step"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      interval={0}
                      angle={-12}
                      textAnchor="end"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      tickFormatter={(val) => `₦${(val / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip content={<CustomWaterfallTooltip />} />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                      {waterfallData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Waterfall Footnote */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs pt-1 border-t border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#0B1D2E]" />
                  <span className="text-slate-600">Gross Rent Roll</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-rose-500" />
                  <span className="text-slate-600">Operating Overheads (Deductions)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#12897F]" />
                  <span className="text-slate-600 font-semibold">Net Operating Cashflow</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4 Dedicated Overheads Item Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
        {/* Maintenance */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
              {((dynamicOverheads.maintenance / grossRevenue) * 100).toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800">Maintenance & Facility</span>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">
              {formatNaira(dynamicOverheads.maintenance)}
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Elevator maintenance, plumbing lines, gate motors, and electrical checks.
          </p>
        </div>

        {/* Power */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              {((dynamicOverheads.power / grossRevenue) * 100).toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800">Power & Diesel</span>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">
              {formatNaira(dynamicOverheads.power)}
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Standby diesel generator fuel, oil filters, and PHCN grid billing.
          </p>
        </div>

        {/* Internet */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Wifi className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded">
              {((dynamicOverheads.internet / grossRevenue) * 100).toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800">Internet & Tech</span>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">
              {formatNaira(dynamicOverheads.internet)}
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Redundant commercial fiber optic line for smart access controls and CCTV.
          </p>
        </div>

        {/* Cleaning & Security Staff */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {((dynamicOverheads.cleaningSecurity / grossRevenue) * 100).toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800">Cleaning & Security</span>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">
              {formatNaira(dynamicOverheads.cleaningSecurity)}
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            24/7 uniformed access gate officers, lobby reception, and groundskeeping.
          </p>
        </div>
      </div>
    </div>
  );
}
