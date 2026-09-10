import { AuthUser, UserRole } from '../types';
import { getCurrentUser, loginAs, logout } from '../utils/auth';

// Simulated network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async login(email: string, password: string):Promise<AuthUser> {
    await delay(200); // simulate network latency
    // Extremely simplified mock login logic based on email
    let role: UserRole = 'TENANT';
    let name = 'Alabi Adebayo';
    let tenantId = 'pay-001';

    if (email.includes('admin')) {
      role = 'ADMIN';
      name = 'Chief Property Admin';
    } else if (email.includes('agent') || email.includes('briggs')) {
      role = 'AGENT';
      name = 'Emeka Nwosu (Agent)';
    } else {
      role = 'TENANT';
      name = 'Michael (Tenant)';
    }

    return loginAs(role, email, tenantId, name);
  },

  async logout(): Promise<void> {
    await delay(200);
    logout();
  },

  async getSession(): Promise<AuthUser | null> {
    await delay(200);
    return getCurrentUser();
  },
};
