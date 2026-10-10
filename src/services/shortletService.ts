import { ShortletItem, ShortletBooking } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

function getHeaders() {
  const token = localStorage.getItem('auth_token');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const shortletService = {
  async getShortlets(): Promise<ShortletItem[]> {
    const res = await fetch(`${API_URL}/api/shortlet`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(
        data?.error ||
          data?.message ||
          'Failed to fetch shortlets'
      );
    }

    return res.json();
  },

  async getBookings(): Promise<ShortletBooking[]> {
    const res = await fetch(`${API_URL}/api/shortlet/bookings`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(
        data?.error ||
          data?.message ||
          'Failed to fetch bookings'
      );
    }

    return res.json();
  },
};