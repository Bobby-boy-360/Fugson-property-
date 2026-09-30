import { PaymentRecord, PropertyItem } from '../types';
import { propertyService } from './propertyService';
import { tenantService } from './tenantService';

export type ReportPeriod =
  | 'CURRENT_MONTH'
  | 'LAST_MONTH'
  | 'Q1_2025'
  | 'YEAR_2025'
  | 'ALL_TIME';

export type ReportStatus = 'ALL' | 'PAID' | 'OVERDUE';

export interface FinancialAuditRow {
  estateId: string;
  estateName: string;
  type: PropertyItem['type'];
  location: string;
  scheduledRent: number;
  collectedRent: number;
  efficiencyRate: number;
  outstandingArrears: number;
  overdueTenantsCount: number;
  assignedAgent: string;
}

export interface FinancialAuditSummary {
  scheduledRentRoll: number;
  activePropertiesCount: number;
  realizedCollections: number;
  outstandingArrears: number;
  overdueTenantsCount: number;
  collectionEfficiency: number;
  periodLabel: string;
  generatedAt: string;
  rows: FinancialAuditRow[];
}

interface ReportFilters {
  period: ReportPeriod;
  propertyFilter: string;
  statusFilter: ReportStatus;
}

function getDateRange(period: ReportPeriod): {
  start: Date | null;
  end: Date | null;
  label: string;
} {
  const now = new Date();

  if (period === 'ALL_TIME') {
    return {
      start: null,
      end: null,
      label: 'All Time',
    };
  }

  if (period === 'CURRENT_MONTH') {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
      label: now.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    };
  }

  if (period === 'LAST_MONTH') {
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
      label: 'Last Month',
    };
  }

  if (period === 'Q1_2025') {
    return {
      start: new Date(2025, 0, 1),
      end: new Date(2025, 2, 31, 23, 59, 59),
      label: 'Q1 2025',
    };
  }

  return {
    start: new Date(2025, 0, 1),
    end: new Date(2025, 11, 31, 23, 59, 59),
    label: 'YTD 2025',
  };
}

function isWithinPeriod(dateValue: string, period: ReportPeriod): boolean {
  const { start, end } = getDateRange(period);

  if (!start || !end) return true;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return false;

  return date >= start && date <= end;
}

function normalizePropertyName(value: string): string {
  return value.trim().toLowerCase();
}

export const reportService = {
  async getFinancialAuditSummary(
    filters: ReportFilters
  ): Promise<FinancialAuditSummary> {
    const [properties, tenants] = await Promise.all([
      propertyService.getProperties(),
      tenantService.getTenants(),
    ]);

    const { label } = getDateRange(filters.period);

    const filteredTenants = tenants.filter((tenant: PaymentRecord) => {
      if (!isWithinPeriod(tenant.date, filters.period)) {
        return false;
      }

      if (
        filters.statusFilter === 'PAID' &&
        tenant.status !== 'Paid'
      ) {
        return false;
      }

      if (
        filters.statusFilter === 'OVERDUE' &&
        tenant.status !== 'Overdue'
      ) {
        return false;
      }

      if (filters.propertyFilter !== 'ALL') {
        return (
          normalizePropertyName(tenant.property) ===
          normalizePropertyName(filters.propertyFilter)
        );
      }

      return true;
    });

    const filteredProperties =
      filters.propertyFilter === 'ALL'
        ? properties
        : properties.filter(
            (property) =>
              normalizePropertyName(property.name) ===
              normalizePropertyName(filters.propertyFilter)
          );

    const rows: FinancialAuditRow[] = filteredProperties.map((property) => {
      const propertyTenants = filteredTenants.filter(
        (tenant) =>
          normalizePropertyName(tenant.property) ===
          normalizePropertyName(property.name)
      );

      const scheduledRent = propertyTenants.reduce(
        (total, tenant) => total + (tenant.amount || 0),
        0
      );

      const collectedRent = propertyTenants.reduce(
        (total, tenant) => total + (tenant.amountPaid || 0),
        0
      );

      const outstandingArrears = propertyTenants.reduce(
        (total, tenant) => total + (tenant.amountOwed || 0),
        0
      );

      const overdueTenantsCount = propertyTenants.filter(
        (tenant) => tenant.status === 'Overdue'
      ).length;

      const efficiencyRate =
        scheduledRent > 0
          ? (collectedRent / scheduledRent) * 100
          : 0;

      return {
        estateId: property.id,
        estateName: property.name,
        type: property.type,
        location: property.location,
        scheduledRent,
        collectedRent,
        efficiencyRate,
        outstandingArrears,
        overdueTenantsCount,
        assignedAgent: property.assignedAgent,
      };
    });

    const scheduledRentRoll = rows.reduce(
      (total, row) => total + row.scheduledRent,
      0
    );

    const realizedCollections = rows.reduce(
      (total, row) => total + row.collectedRent,
      0
    );

    const outstandingArrears = rows.reduce(
      (total, row) => total + row.outstandingArrears,
      0
    );

    const overdueTenantsCount = rows.reduce(
      (total, row) => total + row.overdueTenantsCount,
      0
    );

    const collectionEfficiency =
      scheduledRentRoll > 0
        ? (realizedCollections / scheduledRentRoll) * 100
        : 0;

    return {
      scheduledRentRoll,
      activePropertiesCount: rows.filter(
        (row) =>
          properties.find((property) => property.id === row.estateId)
            ?.status === 'Active'
      ).length,
      realizedCollections,
      outstandingArrears,
      overdueTenantsCount,
      collectionEfficiency,
      periodLabel: label,
      generatedAt: new Date().toISOString(),
      rows,
    };
  },

  downloadCSV(summary: FinancialAuditSummary, filename: string): void {
    const headers = [
      'Estate ID',
      'Estate Name',
      'Type',
      'Location',
      'Scheduled Rent',
      'Collected Rent',
      'Efficiency Rate',
      'Outstanding Arrears',
      'Overdue Tenants',
      'Assigned Agent',
    ];

    const escapeCSV = (value: unknown): string => {
      const text = String(value ?? '');

      if (
        text.includes(',') ||
        text.includes('"') ||
        text.includes('\n')
      ) {
        return `"${text.replace(/"/g, '""')}"`;
      }

      return text;
    };

    const csvRows = summary.rows.map((row) => [
      row.estateId,
      row.estateName,
      row.type,
      row.location,
      row.scheduledRent,
      row.collectedRent,
      `${row.efficiencyRate.toFixed(2)}%`,
      row.outstandingArrears,
      row.overdueTenantsCount,
      row.assignedAgent,
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...csvRows.map((row) => row.map(escapeCSV).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  },
};