import { AuthUser } from '../types';
import { getCurrentUser, setCookie, logout } from '../auth';

const API_URL = 'https://propertypro-backend-production-ba1d.up.railway.app/api';
const AUTH_COOKIE_NAME = 'auth_token';

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      throw new Error('Invalid credentials.');
    }

    const data = await res.json();

    const user: AuthUser = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role.toUpperCase() as AuthUser['role'],
      avatarUrl: data.avatarUrl,
      tenantId: data.tenantId,
    };

    // Store the real, backend-verified session
    setCookie(AUTH_COOKIE_NAME, JSON.stringify(user));
    return user;
  },

  async logout(): Promise<void> {
    logout();
  },

  async getSession(): Promise<AuthUser | null> {
    return getCurrentUser();
  },
};