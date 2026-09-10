'use client';

import React, { useState } from 'react';
import {
  Building,
  MapPin,
  Users,
  Search,
  CheckCircle2,
  X,
  Plus,
  ArrowUpRight,
  Filter,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';
import { PropertyItem } from '@/src/types';
import { propertyService } from '@/src/services/propertyService';
import { formatNaira } from '@/src/utils/auth';

interface AdminPropertiesViewProps {
  onFilterTenantsByProperty?: (propertyName: string) => void;
}

export default function AdminPropertiesView({ onFilterTenantsByProperty }: AdminPropertiesViewProps) {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await propertyService.getProperties();
      setProperties(data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // New property form state
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<PropertyItem['type']>('Residential');
  const [newLocation, setNewLocation] = useState('');
  const [newUnits, setNewUnits] = useState(10);
  const [newRevenue, setNewRevenue] = useState(2500000);
  const [newAgent, setNewAgent] = useState('Emeka Nwosu');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const propertyTypes = [
    { label: 'All Estates', value: 'ALL' },
    { label: 'Residential', value: 'Residential' },
    { label: 'Commercial', value: 'Commercial' },
    { label: 'Farmlands (Coming Soon)', value: 'Farmland' },
    { label: 'Shortlet Villas (Coming Soon)', value: 'Shortlet Villa' },
  ];

  const filteredProperties = properties.filter((p) => {
    const matchesType = selectedType === 'ALL' || p.type === selectedType;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.assignedAgent.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalUnits = properties.reduce((acc, p) => acc + p.units, 0);
  const occupiedUnits = properties.reduce((acc, p) => acc + p.occupiedUnits, 0);
  const overallOccupancy = Math.round((occupiedUnits / totalUnits) * 100);
  const totalRevenue = properties.reduce((acc, p) => acc + p.monthlyRevenue, 0);

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newLocation.trim()) return;

    const isComingSoonType = newType === 'Farmland' || newType === 'Shortlet Villa';

    const newProp: PropertyItem = {
      id: `prop-${Date.now().toString().slice(-4)}`,
      name: newName.trim(),
      type: newType,
      location: newLocation.trim(),
      units: Number(newUnits),
      occupiedUnits: 0,
      monthlyRevenue: Number(newRevenue),
      assignedAgent: newAgent,
      assignedAgentId: newAgent.includes('Emeka') ? 'agent-01' : 'agent-02',
      status: isComingSoonType ? 'Coming Soon' : 'Active',
    };

    setProperties([newProp, ...properties]);
    setShowAddModal(false);
    setNewName('');
    setNewLocation('');
    showToast(`Property "${newProp.name}" added to PropertyPro Portfolio.`);
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

      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Properties & Estates</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage residential complexes and commercial real estate. Farmland and Shortlet modules are marked as Coming Soon.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#12897F] hover:bg-[#0f766e] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </button>
      </div>

      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Estates</span>
          <div className="text-lg sm:text-2xl font-bold text-slate-900 mt-1">{properties.length}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block truncate">Lagos & Ogun Corridors</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Units / Plots</span>
          <div className="text-lg sm:text-2xl font-bold text-slate-900 mt-1">{totalUnits}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">{occupiedUnits} Leased</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Overall Occupancy</span>
          <div className="text-lg sm:text-2xl font-bold text-[#12897F] mt-1">{overallOccupancy}%</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#12897F] h-full rounded-full" style={{ width: `${overallOccupancy}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Projected Monthly</span>
          <div className="text-base sm:text-xl font-bold text-slate-900 mt-1 truncate">{formatNaira(totalRevenue)}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block truncate">Across active leases</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Type tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none w-full md:w-auto">
          {propertyTypes.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedType(tab.value)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition shrink-0 cursor-pointer whitespace-nowrap ${
                selectedType === tab.value
                  ? 'bg-[#12897F] text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search properties or agents..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#12897F]"
          />
        </div>
      </div>

      {/* Notice Banner when Filtering by Coming Soon types */}
      {(selectedType === 'Farmland' || selectedType === 'Shortlet Villa') && (
        <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-[#12897F] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm text-[#0B1D2E]">
              {selectedType === 'Farmland' ? 'Farmlands Module' : 'Shortlet Villas Module'} — Staging & Coming Soon
            </span>
            <p className="text-slate-600 mt-0.5">
              These properties are staged for upcoming feature rollouts. Direct lease modifications and online payments are on hold until official activation.
            </p>
          </div>
        </div>
      )}

      {/* Responsive Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredProperties.map((property) => {
          const occupancyRate = Math.round((property.occupiedUnits / property.units) * 100);
          const isComingSoon = property.status === 'Coming Soon' || property.type === 'Farmland' || property.type === 'Shortlet Villa';

          return (
            <div
              key={property.id}
              className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5 flex flex-col justify-between space-y-4 ${
                isComingSoon ? 'border-dashed border-slate-300 bg-slate-50/50' : ''
              }`}
            >
              <div className="space-y-3">
                {/* Header with Type & Status */}
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      property.type === 'Farmland'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : property.type === 'Commercial' || property.type === 'Commercial Agro-Hub'
                        ? 'bg-teal-50 text-teal-700 border-teal-200'
                        : property.type === 'Shortlet Villa'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {property.type}
                  </span>

                  {isComingSoon ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
                      Coming Soon
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {property.status}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{property.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{property.location}</span>
                  </div>
                </div>

                {/* Occupancy Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Occupancy</span>
                    <span className="font-bold text-slate-800">
                      {property.occupiedUnits} / {property.units} Units ({occupancyRate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isComingSoon
                          ? 'bg-slate-400'
                          : occupancyRate >= 80
                          ? 'bg-[#12897F]'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                </div>

                {/* Revenue & Assigned Agent */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Est. Monthly</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {formatNaira(property.monthlyRevenue)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Managing Agent</span>
                    <span className="font-semibold text-[#12897F] truncate block">
                      {property.assignedAgent}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                {isComingSoon ? (
                  <button
                    type="button"
                    onClick={() => showToast(`"${property.name}" module is labeled Coming Soon. Leases will be manageable in the next update.`)}
                    className="w-full text-center text-xs font-semibold py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition border border-slate-200 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Module In Staging (Coming Soon)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onFilterTenantsByProperty?.(property.name)}
                    className="w-full text-center text-xs font-semibold py-2 px-3 bg-slate-50 hover:bg-teal-50 text-[#12897F] rounded-lg transition border border-slate-200 hover:border-teal-200 cursor-pointer"
                  >
                    View Leased Tenants →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="bg-[#0B1D2E] p-4 sm:p-5 text-white flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">Add New Property to Portfolio</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProperty} className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Property / Estate Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Victoria Island Plaza"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estate Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as PropertyItem['type'])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial Real Estate</option>
                    <option value="Farmland">Farmland (Coming Soon)</option>
                    <option value="Shortlet Villa">Shortlet Villa (Coming Soon)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Units / Plots</label>
                  <input
                    type="number"
                    min="1"
                    value={newUnits}
                    onChange={(e) => setNewUnits(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location / Axis</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Victoria Island, Lagos"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Flow (₦)</label>
                  <input
                    type="number"
                    value={newRevenue}
                    onChange={(e) => setNewRevenue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Agent</label>
                  <select
                    value={newAgent}
                    onChange={(e) => setNewAgent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                  >
                    <option value="Emeka Nwosu">Emeka Nwosu (Senior Agent)</option>
                    <option value="Zainab Bello">Zainab Bello</option>
                    <option value="Tunde Bakare">Tunde Bakare</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#12897F] hover:bg-[#0f766e] text-white rounded-lg font-semibold shadow-sm transition"
                >
                  Create Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
