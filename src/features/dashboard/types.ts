// Wire shapes returned by the reports endpoints (see apps/api reports.service).

export interface ProductionReport {
  module: string;
  unit: string;
  granularity: string;
  from: string;
  to: string;
  // quantity is in the report's base unit (ml for dairy); entries is the count.
  series: { period: string; quantity: number; entries: number }[];
}

export interface SalesReport {
  currency: string;
  granularity: string;
  from: string;
  to: string;
  series: { period: string; totalMinor: number; deliveries: number }[];
}

export interface OutstandingPaymentsReport {
  currency: string;
  totalOutstandingMinor: number;
  customers: { customerId: string; name: string; balanceMinor: number }[];
}

export interface InventorySnapshot {
  items: {
    id: string;
    name: string;
    category: string;
    unit: string;
    quantity: number;
  }[];
}
