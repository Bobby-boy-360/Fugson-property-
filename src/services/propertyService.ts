import { PropertyItem } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

function getHeaders() {
  const token = localStorage.getItem('auth_token');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data as T;
}

export const propertyService = {
  async getProperties(): Promise<PropertyItem[]> {
    const response = await fetch(`${API_URL}/api/properties`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return handleResponse<PropertyItem[]>(response);
  },

  async getPropertyById(id: string): Promise<PropertyItem | undefined> {
    const response = await fetch(`${API_URL}/api/properties/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (response.status === 404) {
      return undefined;
    }

    return handleResponse<PropertyItem>(response);
  },

  async addProperty(property: PropertyItem): Promise<PropertyItem> {
    const locationParts = property.location
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);

    const address = locationParts[0] || property.location || property.name;
    const city = locationParts[1] || '';

    const response = await fetch(`${API_URL}/api/properties`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name: property.name,
        address,
        city,
        country: 'Nigeria',
        currency: 'NGN',
        type: property.type,
        units: property.units,
        agent_id: property.assignedAgentId || null,
      }),
    });

    return handleResponse<PropertyItem>(response);
  },

  async updateProperty(
    id: string,
    updates: Partial<PropertyItem>
  ): Promise<PropertyItem> {
    const locationParts = updates.location
      ?.split(',')
      .map((part) => part.trim())
      .filter(Boolean);

    const body: Record<string, unknown> = {};

    if (updates.name !== undefined) body.name = updates.name;
    if (updates.type !== undefined) body.type = updates.type;
    if (updates.units !== undefined) body.units = updates.units;
    if (updates.occupiedUnits !== undefined) {
      body.occupied_units = updates.occupiedUnits;
    }
    if (updates.status !== undefined) body.status = updates.status;
    if (updates.assignedAgentId !== undefined) {
      body.agent_id = updates.assignedAgentId || null;
    }

    if (updates.location !== undefined) {
      body.address = locationParts?.[0] || updates.location;
      body.city = locationParts?.[1] || '';
    }

    const response = await fetch(`${API_URL}/api/properties/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    return handleResponse<PropertyItem>(response);
  },

  async deleteProperty(id: string): Promise<boolean> {
    const response = await fetch(`${API_URL}/api/properties/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    await handleResponse(response);

    return true;
  },
};