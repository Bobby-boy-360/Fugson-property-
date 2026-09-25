'use client';

import React, { useState, useEffect } from 'react';
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
  Trash2,
  AlertTriangle,
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
  const [propertyToDelete, setPropertyToDelete] = useState<PropertyItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
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
  const overallOccupancy = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const totalRevenue = properties.reduce((acc, p) => acc + p.monthlyRevenue, 0);

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newLocation.trim()) return;

    const isComingSoonType = newType === 'Farmland' || newType === 'Shortlet Villa';

    const newProp: PropertyItem = {
      id: `prop-${Date.now().toString().slice(-6)}`,
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

    await propertyService.addProperty(newProp);
    setProperties([newProp, ...properties]);
    setShowAddModal(false);
    setNewName('');
    setNewLocation('');
    showToast(`Property "${newProp.name}" added to Fugson Property Portfolio.`);
  };

  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;
    const propName = propertyToDelete.name;
    await propertyService.deleteProperty(propertyToDelete.id);
    setProperties((prev) => prev.filter((p) => p.id !== propertyToDelete.id));
    setPropertyToDelete(null);
    showToast(`Property "${propName}" deleted successfully.`);
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Estates & Real Estate Portfolio</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Oversee residential apartments, commercial plazas, and staged developments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#12897F] hover:bg-[#0e6e66] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </button>
      </div>

      {/* Portfolio Quick Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Properties</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{properties.length}</div>
          <span className="text-[11px] text-teal-600 font-semibold mt-0.5 block">Managed in portfolio</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Capacity</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{totalUnits} Units</div>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">{occupiedUnits} currently occupied</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Portfolio Occupancy</span>
          <div className="text-xl sm:text-2xl font-bold text-[#12897F] mt-1">{overallOccupancy}%</div>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Across all units</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Target Monthly Rent</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{formatNaira(totalRevenue)}</div>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Gross potential volume</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by estate name, location, or assigned agent..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#12897F] transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {propertyTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap cursor-pointer ${
                selectedType === type.value
                  ? 'bg-[#0B1D2E] text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Properties Grid or Empty State */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 sm:p-14 border border-slate-200 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-center mx-auto text-[#12897F]">
            <Building className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {searchQuery || selectedType !== 'ALL' ? 'No matching properties found' : 'No properties in portfolio yet'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {searchQuery || selectedType !== 'ALL'
                ? 'Try adjusting your search criteria or category filter.'
                : 'Get started by adding your first residential apartment complex, commercial office plaza, or estate to Fugson Property.'}
            </p>
          </div>
          {(!searchQuery && selectedType === 'ALL') && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#12897F] hover:bg-[#0f766e] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Property</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map((property) => {
            const occupancyRate = property.units > 0 ? Math.round((property.occupiedUnits / property.units) * 100) : 0;
            const isComingSoon = property.status === 'Coming Soon';

            return (
              <div
                key={property.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between p-5 space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Badges & Delete Button */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        property.type === 'Residential'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : property.type === 'Commercial'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : property.type === 'Farmland'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {property.type}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isComingSoon && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300">
                          Coming Soon
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => setPropertyToDelete(property)}
                        title={`Delete ${property.name}`}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
                        {property.occupiedUnits} / {property.units} Units ({occupancyRate}%){' '}
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
                      onClick={() => showToast(`"${property.name}" module is labeled Coming Soon.`)}
                      className="w-full text-center text-xs font-semibold py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition border border-slate-200 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Module In Staging</span>
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
      )}

      {/* Delete Property Confirmation Modal */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={() => setPropertyToDelete(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 p-6 space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Property?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-800">{propertyToDelete.name}</strong>? This will remove this apartment / property from the active portfolio.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProperty}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition cursor-pointer"
              >
                Delete Property
              </button>
            </div>
          </div>
        </div>
      )}

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

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Classification Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as PropertyItem['type'])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                >
                  <option value="Residential">Residential High-Rise / Villa</option>
                  <option value="Commercial">Commercial Office Complex</option>
                  <option value="Farmland">Farmland (Coming Soon)</option>
                  <option value="Shortlet Villa">Shortlet Villa (Coming Soon)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location / Address</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Admiralty Way, Lekki Phase 1, Lagos"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Units / Plots</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newUnits}
                    onChange={(e) => setNewUnits(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Monthly Rent (₦)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    required
                    value={newRevenue}
                    onChange={(e) => setNewRevenue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Managing Agent</label>
                <input
                  type="text"
                  required
                  value={newAgent}
                  onChange={(e) => setNewAgent(e.target.value)}
                  placeholder="e.g. Emeka Nwosu"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#12897F]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#12897F] text-white font-semibold rounded-lg hover:bg-[#0e6e66] transition cursor-pointer"
                >
                  Confirm & Add Estate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
