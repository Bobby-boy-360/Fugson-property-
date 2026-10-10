import {
  AuthUser,
  UserRole,
  PaymentRecord,
} from '../types';

import { getCurrentUser, logout } from '../auth';
import { tenantService } from './tenantService';
import { propertyService } from './propertyService';

interface TenantSignupPayload {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  rentAmount?: number | string;
  property: string;
  unit: string;
  leasePeriod?: string;
  nextOfKinName?: string;
  nextOfKinRelationship?: string;
  nextOfKinPhone?: string;
  emergencyContact?: string;
}

export const authService = {
  async login(
    email: string,
    password: string
  ): Promise<AuthUser> {
    const apiUrl = import.meta.env.VITE_API_URL;

    if (!apiUrl) {
      throw new Error('VITE_API_URL is not configured.');
    }

    const response = await fetch(
      `${apiUrl.replace(/\/$/, '')}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          'Invalid email or password'
      );
    }

    if (!data?.token) {
      throw new Error(
        'Login succeeded but no authentication token was returned.'
      );
    }

    const role = String(data.role).toUpperCase() as UserRole;

    const user: AuthUser = {
      id: data.id,
      name: data.name,
      email: data.email,
      role,
      tenantId: data.tenantId,
    };

    localStorage.setItem(
      'auth_user',
      JSON.stringify(user)
    );

    localStorage.setItem(
      'auth_token',
      data.token
    );

    return user;
  },

  async signupTenant(
    payload: TenantSignupPayload
  ): Promise<{ user: AuthUser; tenant: PaymentRecord }> {
    const cleanEmail = payload.email.trim().toLowerCase();

    if (!cleanEmail) {
      throw new Error('Email address is required.');
    }

    if (!payload.password || payload.password.length < 6) {
      throw new Error(
        'Password must be at least 6 characters.'
      );
    }

    if (!payload.fullName.trim()) {
      throw new Error('Full name is required.');
    }

    const numAmount =
      Number(payload.rentAmount) || 2000000;

    const properties =
      await propertyService.getProperties();

    const matchedProp = properties.find(
      (property) =>
        property.name.trim().toLowerCase() ===
        payload.property.trim().toLowerCase()
    );

    if (!matchedProp) {
      throw new Error(
        `Property "${payload.property}" was not found.`
      );
    }

    const assignedAgentId =
      matchedProp.assignedAgentId || 'agent-01';

    const assignedAgentName =
      matchedProp.assignedAgent || 'Emeka Nwosu';

    const newTenant: PaymentRecord = {
      id: '',
      tenantName: payload.fullName.trim(),
      tenantEmail: cleanEmail,
      phone:
        payload.phone.trim() ||
        '+234 800 000 0000',
      property: payload.property.trim(),
      unit: payload.unit.trim() || 'Unit 1A',
      amount: numAmount,
      amountPaid: 0,
      amountOwed: numAmount,
      status: 'Overdue',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(
        Date.now() + 14 * 86400000
      )
        .toISOString()
        .split('T')[0],
      receiptNumber: 'REC-PENDING',
      agentId: assignedAgentId,
      agentName: assignedAgentName,
      agentCommissionAmount: Math.round(
        numAmount * 0.05
      ),
      agentCommissionRemitted: false,
      leasePeriod:
        payload.leasePeriod ||
        '01 Jan 2025 – 31 Dec 2025',
      multiYearEligible: false,
      autoEmailReceipt: true,
      misconductStrikes: [],
    };

    const createdTenant =
      await tenantService.addTenant(
        newTenant,
        payload.password
      );

    /*
     * The backend creates the actual user account.
     * Log in through the real authentication endpoint
     * so the tenant receives a real JWT.
     */
    const user = await this.login(
      cleanEmail,
      payload.password
    );

    return {
      user,
      tenant: createdTenant,
    };
  },

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    logout();
  },

  async getSession(): Promise<AuthUser | null> {
    const storedUser =
      localStorage.getItem('auth_user');

    if (storedUser) {
      try {
        return JSON.parse(storedUser) as AuthUser;
      } catch {
        localStorage.removeItem('auth_user');
      }
    }

    return getCurrentUser();
  },
};