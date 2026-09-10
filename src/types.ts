export type UserRole = 'ADMIN' | 'AGENT' | 'TENANT';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  assignedPropertiesCount?: number;
  tenantId?: string;
}

export interface AgentItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  assignedPropertiesCount: number;
  managedTenantsCount: number;
  totalLeaseVolume: number;
  unremittedCommission: number;
  remittedCommission: number;
  status: 'Active' | 'On Leave';
}

export interface ShortletItem {
  id: string;
  name: string;
  property: string;
  nightlyRate: number;
  status: 'Available' | 'Occupied' | 'Turnover';
  currentGuest?: string;
  checkIn?: string;
  checkOut?: string;
  rating: number;
  amenities: string[];
}

export interface PaymentRecord {
  id: string;
  tenantName: string;
  tenantEmail: string;
  property: string;
  unit: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  date: string;
  dueDate?: string;
  receiptNumber?: string;
  agentId?: string;
  agentName?: string;
  agentCommissionAmount?: number;
  agentCommissionRemitted?: boolean;
  multiYearEligible?: boolean;
  amountOwed: number;
  amountPaid: number;
  leasePeriod: string;
  phone: string;
  misconductStrikes: MisconductRecord[];
}

export interface MisconductRecord {
  id: string;
  tenantId: string;
  date: string;
  offenseTitle: string;
  description: string;
  penaltyAmount?: number;
  proofImageUrl?: string;
}

export interface PropertyItem {
  id: string;
  name: string;
  type: 'Farmland' | 'Residential' | 'Commercial' | 'Commercial Agro-Hub' | 'Shortlet Villa';
  location: string;
  units: number;
  occupiedUnits: number;
  monthlyRevenue: number;
  assignedAgent: string;
  assignedAgentId: string;
  status: 'Active' | 'Under Maintenance' | 'Coming Soon';
}

export interface MaintenanceComplaint {
  id: string;
  tenantName: string;
  property: string;
  category: 'Plumbing' | 'Electrical' | 'Irrigation / Well' | 'Structural' | 'Gate & Security';
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  submittedAt: string;
  status: 'Submitted' | 'In Review' | 'Technician Assigned' | 'Resolved';
}

export interface ShortletBooking {
  id: string;
  villaId: string;
  villaName: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  source: 'AIRBNB' | 'DIRECT';
  airbnbReservationCode?: string;
  syncMethod: 'Airbnb API v2' | 'iCal Sync' | 'Direct PropertyPro Pay';
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPayout: number;
  hostFee?: number;
  status: 'Confirmed' | 'Checked In' | 'Completed' | 'Upcoming';
}

export interface ProfitLossOverheads {
  maintenance: number;
  power: number;
  internet: number;
  cleaningSecurity: number;
}

export interface ProfitLossBreakdown {
  estateId: string;
  estateName: string;
  type: string;
  grossRevenue: number;
  overheads: ProfitLossOverheads;
  netProfit: number;
  netMargin: number;
}
