import { PropertyItem } from '../types';

const API_URL = 'https://propertypro-backend-production-ba1d.up.railway.app/api';

export const propertyService = {
  async getProperties(): Promise<PropertyItem[]> {
    const res = await fetch(`${API_URL}/properties`);
    if (!res.ok) throw new Error('Failed to fetch properties');
    return res.json();
  },

  async getPropertyById(id: string): Promise<PropertyItem | undefined> {
    const res = await fetch(`${API_URL}/properties/${id}`);
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error('Failed to fetch property');
    return res.json();
  },
};