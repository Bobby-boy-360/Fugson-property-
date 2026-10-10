import { UserRole, AuthUser } from './types';

const AUTH_USER_KEY = 'auth_user';

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedUser =
      localStorage.getItem(AUTH_USER_KEY);

    if (!storedUser) {
      return null;
    }

    const user = JSON.parse(
      storedUser
    ) as AuthUser;

    if (
      !user?.id ||
      !user?.email ||
      !user?.role
    ) {
      localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

/*
 * Kept for compatibility with older parts of the
 * frontend. Real authentication should use authService.login().
 */
export function loginAs(
  role: UserRole,
  email?: string,
  tenantId?: string,
  customName?: string
): AuthUser {
  const user: AuthUser = {
    id:
      role === 'ADMIN'
        ? 'usr-admin-01'
        : role === 'AGENT'
        ? 'agent-01'
        : tenantId || 'pay-001',

    name:
      customName ||
      (role === 'ADMIN'
        ? 'Admin'
        : role === 'AGENT'
        ? 'Emeka Nwosu'
        : 'Tenant'),

    email:
      email ||
      (role === 'ADMIN'
        ? 'admin@fugsonproperty.com'
        : role === 'AGENT'
        ? 'emeka@fugsonproperty.com'
        : 'tenant@propertypro.com'),

    role,

    avatarUrl:
      role === 'ADMIN'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : undefined,

    assignedPropertiesCount:
      role === 'AGENT' ? 3 : 5,

    tenantId:
      role === 'TENANT'
        ? tenantId
        : undefined,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(
      AUTH_USER_KEY,
      JSON.stringify(user)
    );
  }

  return user;
}

export function logout() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem('auth_token');
}

export function formatNaira(val: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  })
    .format(val)
    .replace('NGN', '₦');
}