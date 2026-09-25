import { PaymentRecord, MisconductRecord } from '../types';
import { INITIAL_TENANT_PAYMENTS } from '../data/mockData';

const STORAGE_KEY = 'fugson_tenants_v3';
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function loadStoredTenants(): PaymentRecord[] {
  if (typeof window === 'undefined') return INITIAL_TENANT_PAYMENTS;
  try {
    // Purge legacy storage keys that held demo data
    localStorage.removeItem('fugson_tenants_v2');
    localStorage.removeItem('propertypro_tenants');
    localStorage.removeItem('propertypro_tenants_v2');

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse tenants from localStorage', err);
  }
  return INITIAL_TENANT_PAYMENTS;
}

function saveStoredTenants(tenants: PaymentRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tenants));
  } catch (err) {
    console.error('Failed to save tenants to localStorage', err);
  }
}

let inMemoryTenants: PaymentRecord[] = loadStoredTenants();

export const tenantService = {
  async getTenants(): Promise<PaymentRecord[]> {
    await delay(100);
    inMemoryTenants = loadStoredTenants();
    return inMemoryTenants;
  },

  async getTenantsByAgent(agentId: string): Promise<PaymentRecord[]> {
    await delay(100);
    inMemoryTenants = loadStoredTenants();
    return inMemoryTenants.filter((t) => t.agentId === agentId);
  },

  async getTenantById(id: string): Promise<PaymentRecord | undefined> {
    await delay(100);
    inMemoryTenants = loadStoredTenants();
    return inMemoryTenants.find((t) => t.id === id);
  },

  async addTenant(newTenant: PaymentRecord): Promise<PaymentRecord> {
    await delay(100);
    inMemoryTenants = [newTenant, ...inMemoryTenants];
    saveStoredTenants(inMemoryTenants);
    return newTenant;
  },

  async updateTenant(tenantId: string, updates: Partial<PaymentRecord>): Promise<PaymentRecord | undefined> {
    await delay(100);
    inMemoryTenants = inMemoryTenants.map((t) => (t.id === tenantId ? { ...t, ...updates } : t));
    saveStoredTenants(inMemoryTenants);
    return inMemoryTenants.find((t) => t.id === tenantId);
  },

  async deleteTenant(tenantId: string): Promise<boolean> {
    await delay(100);
    inMemoryTenants = inMemoryTenants.filter((t) => t.id !== tenantId);
    saveStoredTenants(inMemoryTenants);
    return true;
  },

  async addMisconduct(tenantId: string, misconduct: MisconductRecord): Promise<boolean> {
    await delay(100);
    inMemoryTenants = inMemoryTenants.map((t) => {
      if (t.id === tenantId) {
        return {
          ...t,
          misconductStrikes: [misconduct, ...(t.misconductStrikes || [])],
        };
      }
      return t;
    });
    saveStoredTenants(inMemoryTenants);
    return true;
  },

  async remitCommission(tenantId: string): Promise<boolean> {
    await delay(100);
    inMemoryTenants = inMemoryTenants.map((t) =>
      t.id === tenantId ? { ...t, agentCommissionRemitted: true } : t
    );
    saveStoredTenants(inMemoryTenants);
    return true;
  },

  async toggleMultiYear(tenantId: string, isEligible: boolean): Promise<boolean> {
    await delay(100);
    inMemoryTenants = inMemoryTenants.map((t) =>
      t.id === tenantId ? { ...t, multiYearEligible: isEligible } : t
    );
    saveStoredTenants(inMemoryTenants);
    return true;
  },

  async toggleAutoEmailReceipt(tenantId: string, enabled: boolean): Promise<boolean> {
    await delay(100);
    inMemoryTenants = inMemoryTenants.map((t) =>
      t.id === tenantId ? { ...t, autoEmailReceipt: enabled } : t
    );
    saveStoredTenants(inMemoryTenants);
    return true;
  },
};
