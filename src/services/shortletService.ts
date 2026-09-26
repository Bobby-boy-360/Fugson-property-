import { ShortletItem, ShortletBooking } from '../types';

const API_URL = 'https://propertypro-backend-production-ba1d.up.railway.app/api';

export const shortletService = {
  async getShortlets(): Promise<ShortletItem[]> {
    const res = await fetch(`${API_URL}/shortlet`);
    if (!res.ok) throw new Error('Failed to fetch shortlets');
    return res.json();
  },

  async getBookings(): Promise<ShortletBooking[]> {
    const res = await fetch(`${API_URL}/shortlet/bookings`);
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
  }
};