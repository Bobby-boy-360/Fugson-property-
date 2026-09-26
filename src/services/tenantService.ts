import { PaymentRecord, MisconductRecord } from '../types';

const API_URL = 'https://propertypro-backend-production-ba1d.up.railway.app/api';

export const tenantService = {
  async getTenants(): Promise<PaymentRecord[]> {
    const res = await fetch(`${API_URL}/tenants`);
    if (!res.ok) throw new Error('Failed to fetch tenants');
    return res.json();
  },

  async getTenantsByAgent(agentId: string): Promise<PaymentRecord[]> {
    const res = await fetch(`${API_URL}/tenants/by-agent/${agentId}`);
    if (!res.ok) throw new Error('Failed to fetch tenants for agent');
    return res.json();
  },

  async getTenantById(id: string): Promise<PaymentRecord | undefined> {
    const res = await fetch(`${API_URL}/tenants/${id}`);
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error('Failed to fetch tenant');
    return res.json();
  },

  async addTenant(data: {
    property_id: string;
    name: string;
    email: string;
    phone: string;
    rent_amount: number;
    rent_cycle?: string;
    multi_year_eligible?: boolean;
  }): Promise<void> {
    const res = await fetch(`${API_URL}/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create tenant');
  },

  async addMisconduct(tenantId: string, misconduct: MisconductRecord): Promise<boolean> {
    const res = await fetch(`${API_URL}/tenants/${tenantId}/misconduct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(misconduct),
    });
    return res.ok;
  },

  async remitCommission(tenantId: string, reference?: string): Promise<boolean> {
    const res = await fetch(`${API_URL}/tenants/${tenantId}/remit-commission`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
    });
    return res.ok;
  },

  async toggleMultiYear(tenantId: string, isEligible: boolean): Promise<boolean> {
    const res = await fetch(`${API_URL}/tenants/${tenantId}/multi-year`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isEligible }),
    });
    return res.ok;
  },
};