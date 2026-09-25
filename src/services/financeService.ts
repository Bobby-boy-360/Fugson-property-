import { MOCK_PROFIT_LOSS } from '../data/mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const financeService = {
  async getProfitLossData(): Promise<typeof MOCK_PROFIT_LOSS> {
    await delay(100);
    return MOCK_PROFIT_LOSS;
  }
};
