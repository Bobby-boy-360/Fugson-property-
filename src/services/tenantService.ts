import { PaymentRecord, MisconductRecord } from '../types';
import { propertyService } from './propertyService';

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

export const tenantService = {
  async getTenants(): Promise<PaymentRecord[]> {
    const response = await fetch(`${API_URL}/api/tenants`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return handleResponse<PaymentRecord[]>(response);
  },

  async getMyTenant(): Promise<PaymentRecord> {
    const response = await fetch(`${API_URL}/api/tenants/me`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return handleResponse<PaymentRecord>(response);
  },

  async getTenantsByAgent(agentId: string): Promise<PaymentRecord[]> {
    const response = await fetch(
      `${API_URL}/api/tenants/by-agent/${agentId}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    return handleResponse<PaymentRecord[]>(response);
  },

  async getTenantById(
    id: string
  ): Promise<PaymentRecord | undefined> {
    const response = await fetch(`${API_URL}/api/tenants/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (response.status === 404) {
      return undefined;
    }

    return handleResponse<PaymentRecord>(response);
  },

  async addTenant(
    newTenant: PaymentRecord,
    password: string
  ): Promise<PaymentRecord> {
    if (!password || password.length < 6) {
      throw new Error('Tenant password must be at least 6 characters.');
    }

    const properties = await propertyService.getProperties();

    const enteredProperty = String(newTenant.property || '').trim();

    if (!enteredProperty) {
      throw new Error('Please select or enter a property.');
    }

    const normalizedProperty = enteredProperty.toLowerCase();

    const property = properties.find((item) => {
      const propertyId = String(item.id || '').trim().toLowerCase();
      const propertyName = String(item.name || '').trim().toLowerCase();

      return (
        propertyId === normalizedProperty ||
        propertyName === normalizedProperty
      );
    });

    if (!property) {
      const availableProperties = properties
        .map((item) => item.name)
        .filter(Boolean)
        .join(', ');

      throw new Error(
        availableProperties
          ? `Property "${enteredProperty}" was not found. Available properties: ${availableProperties}`
          : 'No properties are currently available. Please create a property first.'
      );
    }

    const response = await fetch(`${API_URL}/api/tenants`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        property_id: property.id,
        name: newTenant.tenantName.trim(),
        email: newTenant.tenantEmail.trim().toLowerCase(),
        phone: newTenant.phone,
        rent_amount: newTenant.amount,
        rent_cycle: 'monthly',
        multi_year_eligible: newTenant.multiYearEligible ?? false,
        password,
      }),
    });

    const created = await handleResponse<{ id: string }>(response);
    const createdTenant = await this.getTenantById(created.id);

    if (!createdTenant) {
      throw new Error(
        'Tenant was created but could not be retrieved.'
      );
    }

    return createdTenant;
  },

  async updateTenant(
    tenantId: string,
    updates: Partial<PaymentRecord>
  ): Promise<PaymentRecord> {
    console.trace(
      '[PropertyPro] updateTenant called',
      { tenantId, updates }
    );

    const response = await fetch(
      `${API_URL}/api/tenants/${tenantId}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          name: updates.tenantName,
          email: updates.tenantEmail,
          phone: updates.phone,
          rent_amount: updates.amount,
          rent_cycle: 'monthly',
        }),
      }
    );

    return handleResponse<PaymentRecord>(response);
  },

  async deleteTenant(tenantId: string): Promise<boolean> {
    const response = await fetch(
      `${API_URL}/api/tenants/${tenantId}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      }
    );

    await handleResponse(response);
    return true;
  },

  async addMisconduct(
    tenantId: string,
    misconduct: MisconductRecord
  ): Promise<MisconductRecord> {
    const response = await fetch(
      `${API_URL}/api/tenants/${tenantId}/misconduct`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          offenseTitle: misconduct.offenseTitle,
          description: misconduct.description,
          penaltyAmount: misconduct.penaltyAmount,
          proofImageUrl: misconduct.proofImageUrl,
          date: misconduct.date,
        }),
      }
    );

    const created = await handleResponse<any>(response);

    return {
      id: created.id,
      tenantId: created.tenant_id ?? tenantId,
      date: created.occurred_at ?? misconduct.date,
      offenseTitle: created.offense_title ?? misconduct.offenseTitle,
      description: created.description ?? misconduct.description,
      penaltyAmount:
        created.penalty_amount ?? misconduct.penaltyAmount,
      proofImageUrl:
        created.proof_image_url ?? misconduct.proofImageUrl,
    };
  },

  async remitCommission(tenantId: string): Promise<boolean> {
    const response = await fetch(
      `${API_URL}/api/tenants/${tenantId}/remit-commission`,
      {
        method: 'PUT',
        headers: getHeaders(),
      }
    );

    await handleResponse(response);
    return true;
  },

  async toggleMultiYear(
    tenantId: string,
    isEligible: boolean
  ): Promise<boolean> {
    const response = await fetch(
      `${API_URL}/api/tenants/${tenantId}/multi-year`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ isEligible }),
      }
    );

    await handleResponse(response);
    return true;
  },

  async toggleAutoEmailReceipt(
    _tenantId: string,
    _enabled: boolean
  ): Promise<boolean> {
    throw new Error(
      'Auto email receipt settings are not currently supported by the backend.'
    );
  },
};
