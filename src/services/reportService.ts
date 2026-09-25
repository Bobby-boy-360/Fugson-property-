import { propertyService } from './propertyService';
import { tenantService } from './tenantService';
import { PropertyItem, PaymentRecord } from '../types';

export interface ReportFilterOptions {
  period?: 'CURRENT_MONTH' | 'LAST_MONTH' | 'Q1_2025' | 'YEAR_2025' | 'ALL_TIME';
  propertyFilter?: string;
  statusFilter?: 'ALL' | 'Paid' | 'Overdue' | 'PAID' | 'OVERDUE';
}

export interface EstatePerformanceRow {
  estateId: string;
  estateName: string;
  type: string;
  location: string;
  totalUnits: number;
  occupiedUnits: number;
  scheduledRent: number;
  collectedRent: number;
  outstandingArrears: number;
  efficiencyRate: number;
  overdueTenantsCount: number;
  assignedAgent: string;
}

export interface FinancialAuditSummary {
  periodLabel: string;
  generatedAt: string;
  scheduledRentRoll: number;
  realizedCollections: number;
  outstandingArrears: number;
  collectionEfficiency: number;
  activePropertiesCount: number;
  totalUnitsCount: number;
  totalTenantsCount: number;
  overdueTenantsCount: number;
  rows: EstatePerformanceRow[];
}

// Simulated network delay for database query simulation
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const reportService = {
  /**
   * PLUG & PLAY BACKEND DATABASE ENDPOINT:
   * GET /api/reports/financial?period=${options.period}&property=${options.propertyFilter}
   * Directly maps to SQL aggregate queries:
   * SELECT estate, SUM(amount), SUM(amount_paid), COUNT(*) FROM tenants GROUP BY estate;
   */
  async getFinancialAuditSummary(options: ReportFilterOptions = {}): Promise<FinancialAuditSummary> {
    await delay(150); // simulate database query latency

    const [properties, tenants] = await Promise.all([
      propertyService.getProperties(),
      tenantService.getTenants(),
    ]);

    // Apply Property Filter
    const filteredProps = options.propertyFilter && options.propertyFilter !== 'ALL'
      ? properties.filter(p => p.name.toLowerCase() === options.propertyFilter?.toLowerCase() || p.id === options.propertyFilter)
      : properties;

    // Apply Status Filter to tenants
    const filteredTenants = options.statusFilter && options.statusFilter !== 'ALL'
      ? tenants.filter(t => t.status.toLowerCase() === options.statusFilter?.toLowerCase())
      : tenants;

    // Calculate Estate rows
    const rows: EstatePerformanceRow[] = filteredProps.map((prop) => {
      const propTenants = filteredTenants.filter(
        (t) => t.property.toLowerCase() === prop.name.toLowerCase() || t.property.includes(prop.name)
      );

      const scheduled = propTenants.reduce((sum, t) => sum + (t.amount || 0), 0) || prop.monthlyRevenue;
      const collected = propTenants
        .filter((t) => t.status === 'Paid')
        .reduce((sum, t) => sum + (t.amountPaid || 0), 0);
      const arrears = Math.max(0, scheduled - collected);
      const overdueCount = propTenants.filter((t) => t.status === 'Overdue').length;
      const efficiency = scheduled > 0 ? Math.round((collected / scheduled) * 100) : 0;

      return {
        estateId: prop.id,
        estateName: prop.name,
        type: prop.type,
        location: prop.location,
        totalUnits: prop.units,
        occupiedUnits: prop.occupiedUnits,
        scheduledRent: scheduled,
        collectedRent: collected,
        outstandingArrears: arrears,
        efficiencyRate: efficiency,
        overdueTenantsCount: overdueCount,
        assignedAgent: prop.assignedAgent,
      };
    });

    const totalScheduled = rows.reduce((sum, r) => sum + r.scheduledRent, 0);
    const totalCollected = rows.reduce((sum, r) => sum + r.collectedRent, 0);
    const totalArrears = Math.max(0, totalScheduled - totalCollected);
    const overallEfficiency = totalScheduled > 0 ? Math.round((totalCollected / totalScheduled) * 100) : 0;
    const totalOverdueTenants = rows.reduce((sum, r) => sum + r.overdueTenantsCount, 0);
    const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);

    const periodLabel =
      options.period === 'LAST_MONTH'
        ? 'Previous Month'
        : options.period === 'Q1_2025'
        ? 'Q1 2025 (Jan – Mar)'
        : options.period === 'YEAR_2025'
        ? 'Full Year 2025 (YTD)'
        : options.period === 'ALL_TIME'
        ? 'All-Time Records'
        : 'Current Cycle (March 2025)';

    return {
      periodLabel,
      generatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      scheduledRentRoll: totalScheduled,
      realizedCollections: totalCollected,
      outstandingArrears: totalArrears,
      collectionEfficiency: overallEfficiency,
      activePropertiesCount: filteredProps.length,
      totalUnitsCount: totalUnits,
      totalTenantsCount: filteredTenants.length,
      overdueTenantsCount: totalOverdueTenants,
      rows,
    };
  },

  /**
   * Generates and automatically triggers browser download of an authentic CSV ledger
   */
  downloadCSV(summary: FinancialAuditSummary, filename = 'Fugson_Financial_Audit.csv'): void {
    const headers = [
      'Estate Name',
      'Asset Type',
      'Location',
      'Total Units',
      'Scheduled Rent (NGN)',
      'Collected (NGN)',
      'Arrears (NGN)',
      'Collection Efficiency (%)',
      'Overdue Tenants',
      'Managing Agent',
    ];

    const csvRows = [
      ['"FUGSON PROPERTY - FINANCIAL & PORTFOLIO AUDIT REPORT"'],
      [`"Period: ${summary.periodLabel}"`, `"Generated: ${summary.generatedAt}"`],
      [`"Total Scheduled: NGN ${summary.scheduledRentRoll.toLocaleString()}"`, `"Total Collected: NGN ${summary.realizedCollections.toLocaleString()}"`, `"Total Arrears: NGN ${summary.outstandingArrears.toLocaleString()}"`],
      [],
      headers,
    ];

    summary.rows.forEach((row) => {
      csvRows.push([
        `"${row.estateName}"`,
        `"${row.type}"`,
        `"${row.location}"`,
        row.totalUnits.toString(),
        row.scheduledRent.toString(),
        row.collectedRent.toString(),
        row.outstandingArrears.toString(),
        `${row.efficiencyRate}%`,
        row.overdueTenantsCount.toString(),
        `"${row.assignedAgent}"`,
      ]);
    });

    const csvString = csvRows.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
