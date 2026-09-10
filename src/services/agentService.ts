import { AgentItem } from '../types';
import { MOCK_AGENTS } from '../data/mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const agentService = {
  async getAgents(): Promise<AgentItem[]> {
    await delay(200);
    return MOCK_AGENTS;
  }
};
