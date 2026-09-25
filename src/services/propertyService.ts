import { PropertyItem } from '../types';
import { MOCK_PROPERTIES } from '../data/mockData';

const STORAGE_KEY = 'fugson_properties_v3';
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function loadStoredProperties(): PropertyItem[] {
  if (typeof window === 'undefined') return MOCK_PROPERTIES;
  try {
    // Purge legacy storage keys that held demo data
    localStorage.removeItem('fugson_properties_v2');
    localStorage.removeItem('propertypro_properties');
    localStorage.removeItem('propertypro_properties_v2');

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse properties from localStorage', err);
  }
  return MOCK_PROPERTIES;
}

function saveStoredProperties(properties: PropertyItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
  } catch (err) {
    console.error('Failed to save properties to localStorage', err);
  }
}

let inMemoryProperties: PropertyItem[] = loadStoredProperties();

export const propertyService = {
  async getProperties(): Promise<PropertyItem[]> {
    await delay(100);
    inMemoryProperties = loadStoredProperties();
    return inMemoryProperties;
  },

  async getPropertyById(id: string): Promise<PropertyItem | undefined> {
    await delay(100);
    inMemoryProperties = loadStoredProperties();
    return inMemoryProperties.find((p) => p.id === id);
  },

  async addProperty(property: PropertyItem): Promise<PropertyItem> {
    await delay(100);
    inMemoryProperties = [property, ...inMemoryProperties];
    saveStoredProperties(inMemoryProperties);
    return property;
  },

  async updateProperty(id: string, updates: Partial<PropertyItem>): Promise<PropertyItem | undefined> {
    await delay(100);
    inMemoryProperties = inMemoryProperties.map((p) => (p.id === id ? { ...p, ...updates } : p));
    saveStoredProperties(inMemoryProperties);
    return inMemoryProperties.find((p) => p.id === id);
  },

  async deleteProperty(id: string): Promise<boolean> {
    await delay(100);
    inMemoryProperties = inMemoryProperties.filter((p) => p.id !== id);
    saveStoredProperties(inMemoryProperties);
    return true;
  },
};
