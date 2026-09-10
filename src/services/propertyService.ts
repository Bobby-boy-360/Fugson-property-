import { PropertyItem } from '../types';
import { MOCK_PROPERTIES } from '../data/mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const propertyService = {
  async getProperties(): Promise<PropertyItem[]> {
    await delay(200);
    return MOCK_PROPERTIES;
  },

  async getPropertyById(id: string): Promise<PropertyItem | undefined> {
    await delay(200);
    return MOCK_PROPERTIES.find((p) => p.id === id);
  },
};
