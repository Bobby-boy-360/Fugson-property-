import { ShortletItem, ShortletBooking } from '../types';
import { MOCK_SHORTLETS, MOCK_SHORTLET_BOOKINGS } from '../data/mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const shortletService = {
  async getShortlets(): Promise<ShortletItem[]> {
    await delay(200);
    return MOCK_SHORTLETS;
  },
  
  async getBookings(): Promise<ShortletBooking[]> {
    await delay(200);
    return MOCK_SHORTLET_BOOKINGS;
  }
};
