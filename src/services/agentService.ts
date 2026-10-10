import { AgentItem } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

function getHeaders() {
  const token = localStorage.getItem('auth_token');

  return {
    'Content-Type': 'application/json',
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

async function handleResponse<T>(
  response: Response
): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        'Request failed'
    );
  }

  return data as T;
}

export interface CreateAgentPayload {
  name: string;
  email: string;
  phone: string;
  specialty?: string;
  commission_rate?: number;
  status?: string;
  password: string;
}

export const agentService = {
  async getAgents(): Promise<AgentItem[]> {
    const response = await fetch(
      `${API_URL}/api/agents`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    return handleResponse<AgentItem[]>(response);
  },

  async getAgentById(
    id: string
  ): Promise<AgentItem | undefined> {
    const agents = await this.getAgents();

    return agents.find(
      (agent) => agent.id === id
    );
  },

  async addAgent(
    agent: CreateAgentPayload
  ): Promise<AgentItem> {
    const response = await fetch(
      `${API_URL}/api/agents`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: agent.name,
          email: agent.email,
          phone: agent.phone,
          specialty: agent.specialty || '',
          commission_rate:
            agent.commission_rate ?? 10,
          status: agent.status || 'Active',
          password: agent.password,
        }),
      }
    );

    return handleResponse<AgentItem>(response);
  },

  async updateAgent(
    id: string,
    updates: Partial<AgentItem>
  ): Promise<AgentItem | undefined> {
    throw new Error(
      'Agent update is not currently supported by the backend.'
    );
  },

  async deleteAgent(
    id: string
  ): Promise<boolean> {
    throw new Error(
      'Agent deletion is not currently supported by the backend.'
    );
  },

  async remitCommission(
    commissionId: string
  ): Promise<boolean> {
    const response = await fetch(
      `${API_URL}/api/agents/commissions/${commissionId}/remit`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          is_remitted: true,
        }),
      }
    );

    await handleResponse(response);

    return true;
  },
};