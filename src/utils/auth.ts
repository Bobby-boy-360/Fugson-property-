import { UserRole, AuthUser } from '../types';

const AUTH_COOKIE_NAME = 'auth_token';

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);
  
  // Local storage fallback for iframe environments where third-party cookies might be blocked
  try {
    return localStorage.getItem(name);
  } catch {
    return null;
  }
}

export function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  try {
    localStorage.setItem(name, value);
  } catch {
    // Ignore storage quota error
  }
}

export function removeCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  try {
    localStorage.removeItem(name);
  } catch {
    // Ignore
  }
}

export function getCurrentUser(): AuthUser | null {
  const cookieVal = getCookie(AUTH_COOKIE_NAME);
  if (!cookieVal) return null;

  try {
    if (cookieVal.startsWith('{')) {
      const data = JSON.parse(cookieVal);
      return {
        id: data.id || 'usr-default',
        name: data.name || (data.role === 'ADMIN' ? 'Property Administrator' : data.role === 'AGENT' ? 'Field Agent' : 'Registered Tenant'),
        email: data.email || (data.role === 'ADMIN' ? 'admin@fugsonproperty.com' : data.role === 'AGENT' ? 'agent@fugsonproperty.com' : 'tenant@fugsonproperty.com'),
        role: data.role as UserRole,
        avatarUrl: data.avatarUrl,
        assignedPropertiesCount: data.assignedPropertiesCount || 0,
        tenantId: data.tenantId,
      };
    } else {
      const role = cookieVal.toUpperCase() as UserRole;
      return {
        id: role === 'ADMIN' ? 'usr-admin' : role === 'AGENT' ? 'usr-agent' : 'tenant-01',
        name: role === 'ADMIN' ? 'Property Administrator' : role === 'AGENT' ? 'Field Agent' : 'Registered Tenant',
        email: role === 'ADMIN' ? 'admin@fugsonproperty.com' : role === 'AGENT' ? 'agent@fugsonproperty.com' : 'tenant@fugsonproperty.com',
        role: role,
        assignedPropertiesCount: 0,
        tenantId: role === 'TENANT' ? 'pay-001' : undefined,
      };
    }
  } catch {
    return null;
  }
}

export function loginAs(role: UserRole, email?: string, tenantId?: string, customName?: string): AuthUser {
  const user: AuthUser = {
    id: role === 'ADMIN' ? 'usr-admin-01' : role === 'AGENT' ? 'agent-01' : (tenantId || 'pay-001'),
    name:
      customName ||
      (role === 'ADMIN'
        ? 'Property Administrator'
        : role === 'AGENT'
        ? 'Field Agent'
        : 'Registered Tenant'),
    email: email || (role === 'ADMIN' ? 'admin@fugsonproperty.com' : role === 'AGENT' ? 'agent@fugsonproperty.com' : 'tenant@fugsonproperty.com'),
    role,
    avatarUrl: role === 'ADMIN' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' : undefined,
    assignedPropertiesCount: 0,
    tenantId: role === 'TENANT' ? (tenantId || 'pay-001') : undefined,
  };

  setCookie(AUTH_COOKIE_NAME, JSON.stringify(user));
  return user;
}

export function logout() {
  removeCookie(AUTH_COOKIE_NAME);
}

export function formatNaira(val: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(val).replace('NGN', '₦');
}
