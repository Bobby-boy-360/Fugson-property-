import { ProfitLossBreakdown } from '../types';

const API_URL = 'https://propertypro-backend-production-ba1d.up.railway.app/api';

export const financeService = {
  async getProfitLossData(): Promise<ProfitLossBreakdown[]> {
    const res = await fetch(`${API_URL}/finance/profit-loss`);
    if (!res.ok) throw new Error('Failed to fetch profit & loss data');
    return res.json();
  }
};
