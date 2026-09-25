import { AuthUser, UserRole, TenantSignupPayload, PaymentRecord } from '../types';
import { getCurrentUser, loginAs, logout } from '../utils/auth';
import { tenantService } from './tenantService';

// Simulated network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const USERS_STORAGE_KEY = 'fugson_registered_users_v3';

interface StoredAccount {
  email: string;
  password?: string;
  role: UserRole;
  name: string;
  tenantId?: string;
}

function getRegisteredAccounts(): StoredAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return [];
}

function saveRegisteredAccount(account: StoredAccount) {
  if (typeof window === 'undefined') return;
  try {
    const list = getRegisteredAccounts().filter(a => a.email.toLowerCase() !== account.email.toLowerCase());
    list.push(account);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    // ignore
  }
}

export const authService = {
  /**
   * PLUG & PLAY BACKEND ENDPOINT: POST /api/auth/login
   */
  async login(email: string, password: string): Promise<AuthUser> {
    await delay(200); // simulate network latency

    const cleanEmail = email.trim().toLowerCase();
    const registered = getRegisteredAccounts().find(a => a.email.toLowerCase() === cleanEmail);

    let role: UserRole = registered ? registered.role : 'TENANT';
    let name = registered ? registered.name : 'Registered Tenant';
    let tenantId = registered?.tenantId || `fg-tenant-001`;

    if (!registered) {
      if (cleanEmail.includes('admin')) {
        role = 'ADMIN';
        name = 'Property Administrator';
      } else if (cleanEmail.includes('agent') || cleanEmail.includes('briggs') || cleanEmail.includes('nwosu')) {
        role = 'AGENT';
        name = 'Field Agent';
      } else {
        role = 'TENANT';
        name = 'Registered Tenant';
      }
    }

    return loginAs(role, email, tenantId, name);
  },

  /**
   * PLUG & PLAY BACKEND ENDPOINT: POST /api/auth/register-tenant
   * Ready to connect directly to Express / PostgreSQL / REST API
   */
  async signupTenant(payload: TenantSignupPayload): Promise<{ user: AuthUser; tenant: PaymentRecord }> {
    await delay(300); // simulate backend registration latency

    const cleanEmail = payload.email.trim().toLowerCase();
    const existing = getRegisteredAccounts().find(a => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    const tenantId = `fg-tenant-${Date.now().toString().slice(-6)}`;
    const numAmount = Number(payload.rentAmount) || 2000000;

    const newTenant: PaymentRecord = {
      id: tenantId,
      tenantName: payload.fullName.trim(),
      tenantEmail: cleanEmail,
      phone: payload.phone.trim() || '+234 800 000 0000',
      property: payload.property.trim(),
      unit: payload.unit.trim(),
      amount: numAmount,
      amountPaid: 0,
      amountOwed: numAmount,
      status: 'Overdue',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      receiptNumber: 'REC-PENDING',
      leasePeriod: payload.leasePeriod || '01 Jan 2025 – 31 Dec 2025',
      nextOfKinName: payload.nextOfKinName?.trim() || '',
      nextOfKinRelationship: payload.nextOfKinRelationship?.trim() || 'Next of Kin',
      nextOfKinPhone: payload.nextOfKinPhone?.trim() || '',
      emergencyContact: payload.emergencyContact?.trim() || (payload.nextOfKinName ? `${payload.nextOfKinName.trim()} (${payload.nextOfKinRelationship?.trim() || 'Next of Kin'}) - ${payload.nextOfKinPhone?.trim() || ''}` : ''),
      multiYearEligible: false,
      autoEmailReceipt: true,
      misconductStrikes: [],
    };

    // Save tenant record to database/service
    await tenantService.addTenant(newTenant);

    // Save auth credential profile for future sign-ins
    saveRegisteredAccount({
      email: cleanEmail,
      password: payload.password,
      role: 'TENANT',
      name: payload.fullName.trim(),
      tenantId: newTenant.id,
    });

    // Automatically set current session
    const user = loginAs('TENANT', cleanEmail, newTenant.id, payload.fullName.trim());

    return { user, tenant: newTenant };
  },

  async logout(): Promise<void> {
    await delay(150);
    logout();
  },

  async getSession(): Promise<AuthUser | null> {
    await delay(100);
    return getCurrentUser();
  },
};
