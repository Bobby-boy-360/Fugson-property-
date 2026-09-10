import { PaymentRecord, MisconductRecord } from '../types';
import { INITIAL_TENANT_PAYMENTS } from '../data/mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const tenantService = {
  async getTenants(): Promise<PaymentRecord[]> {
    await delay(200);
    return INITIAL_TENANT_PAYMENTS;
  },

  async getTenantsByAgent(agentId: string): Promise<PaymentRecord[]> {
    await delay(200);
    return INITIAL_TENANT_PAYMENTS.filter((t) => t.agentId === agentId);
  },

  async getTenantById(id: string): Promise<PaymentRecord | undefined> {
    await delay(200);
    return INITIAL_TENANT_PAYMENTS.find((t) => t.id === id);
  },

  async addMisconduct(tenantId: string, misconduct: MisconductRecord): Promise<boolean> {
    await delay(200);
    // In a real app, this would be an API call to a backend
    console.log(`Adding misconduct to tenant ${tenantId}`, misconduct);
    return true;
  },

  async remitCommission(tenantId: string, reference?: string): Promise<boolean> {
    await delay(200);
    console.log(`Remitting commission for tenant ${tenantId}, ref: ${reference}`);
    return true;
  },

  async toggleMultiYear(tenantId: string, isEligible: boolean): Promise<boolean> {
    await delay(200);
    console.log(`Toggling multi-year for tenant ${tenantId} to ${isEligible}`);
    return true;
  }
};
