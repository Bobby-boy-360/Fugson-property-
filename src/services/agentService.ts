import { AgentItem } from '../types';

const API_URL = 'https://propertypro-backend-production-ba1d.up.railway.app/api';

export const agentService = {
  async getAgents(): Promise<AgentItem[]> {
    const res = await fetch(`${API_URL}/agents`);
    if (!res.ok) throw new Error('Failed to fetch agents');
    return res.json();
  },

  async addAgent(data: {
    name: string;
    email: string;
    phone: string;
    specialty?: string;
    commission_rate?: number;
    status?: string;
  }): Promise<void> {
    const res = await fetch(`${API_URL}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create agent');
  },
};