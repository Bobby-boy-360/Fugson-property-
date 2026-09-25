import { PaymentRecord, PropertyItem, MaintenanceComplaint, AgentItem, ShortletItem, ShortletBooking } from '../types';

/**
 * Fugson Property - Foundational Data Store
 * All demo records have been cleared. Real records are added and managed by administrators.
 */

export const INITIAL_TENANT_PAYMENTS: PaymentRecord[] = [];

export const MOCK_PROPERTIES: PropertyItem[] = [];

export const MOCK_COMPLAINTS: MaintenanceComplaint[] = [];

export const MOCK_AGENTS: AgentItem[] = [];

export const MOCK_SHORTLETS: ShortletItem[] = [];

export const MOCK_SHORTLET_BOOKINGS: ShortletBooking[] = [];

export const MOCK_PROFIT_LOSS: Record<string, any> = {};

export const HOUSE_RULES = [
  {
    title: '1. Community Quiet Hours (10:00 PM – 7:00 AM)',
    rule: 'Quiet hours are strictly observed from 10:00 PM to 7:00 AM daily across all Fugson properties and residences. High-volume sound systems, parties, non-emergency construction, and disruptive activities are strictly prohibited during these hours to ensure peace and tranquility for all residents.',
  },
  {
    title: '2. Payment Deadlines & Grace Period',
    rule: 'Rent payments and recurring service charges are due strictly on or before the 1st day of every month or agreed lease cycle. A standard grace period of 5 calendar days is permitted before automated late notices are initiated.',
  },
  {
    title: '3. Multi-Year Lease Settlement Option',
    rule: 'Tenants with multi-year eligible leases may opt to prepay advance terms directly via the verified tenant portal at locked-in annual rates with 0% inflation escalation surcharge during the term.',
  },
  {
    title: '4. Structural Modifications & Property Care',
    rule: 'No unauthorized physical alterations, perimeter excavations, drilling into load-bearing masonry, or alterations to plumbing/electrical lines may be executed without prior written consent from estate management.',
  },
  {
    title: '5. Environmental Sanitation & Waste Management',
    rule: 'Household waste must be securely bagged and placed into designated central disposal dumpsters according to sanitation schedules. Littering common stairwells, corridors, or parking lots incurs disciplinary action.',
  },
  {
    title: '6. Vehicle Parking & Traffic Protocol',
    rule: 'All vehicles must park strictly within assigned parking bays.',
  },
  {
    title: '7. Subletting & Commercial Unauthorized Usage',
    rule: 'Subletting residential flats or utilizing premises for unauthorized high-traffic commercial activities without landlord express written permit is strictly prohibited and grounds for immediate lease termination.',
  },
  {
    title: '8. Safety, Visitor Protocols & Security Procedures',
    rule: 'All visitors and service technicians must clear entry check-in at the security gate. Fireworks, hazardous chemicals, and tampering with fire safety equipment or communal electrical panels are strictly forbidden.',
  },
];
