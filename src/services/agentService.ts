import { AgentItem } from '../types';
import { MOCK_AGENTS } from '../data/mockData';

const STORAGE_KEY = 'fugson_agents_v3';
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function loadStoredAgents(): AgentItem[] {
  if (typeof window === 'undefined') return MOCK_AGENTS;
  try {
    // Purge legacy storage keys that held demo data
    localStorage.removeItem('fugson_agents_v2');
    localStorage.removeItem('propertypro_agents');
    localStorage.removeItem('propertypro_agents_v2');

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse agents from localStorage', err);
  }
  return MOCK_AGENTS;
}

function saveStoredAgents(agents: AgentItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
  } catch (err) {
    console.error('Failed to save agents to localStorage', err);
  }
}

let inMemoryAgents: AgentItem[] = loadStoredAgents();

export const agentService = {
  async getAgents(): Promise<AgentItem[]> {
    await delay(100);
    inMemoryAgents = loadStoredAgents();
    return inMemoryAgents;
  },

  async getAgentById(id: string): Promise<AgentItem | undefined> {
    await delay(100);
    inMemoryAgents = loadStoredAgents();
    return inMemoryAgents.find((a) => a.id === id);
  },

  async addAgent(agent: AgentItem): Promise<AgentItem> {
    await delay(100);
    inMemoryAgents = [agent, ...inMemoryAgents];
    saveStoredAgents(inMemoryAgents);
    return agent;
  },

  async updateAgent(id: string, updates: Partial<AgentItem>): Promise<AgentItem | undefined> {
    await delay(100);
    inMemoryAgents = inMemoryAgents.map((a) => (a.id === id ? { ...a, ...updates } : a));
    saveStoredAgents(inMemoryAgents);
    return inMemoryAgents.find((a) => a.id === id);
  },

  async deleteAgent(id: string): Promise<boolean> {
    await delay(100);
    inMemoryAgents = inMemoryAgents.filter((a) => a.id !== id);
    saveStoredAgents(inMemoryAgents);
    return true;
  },
};
