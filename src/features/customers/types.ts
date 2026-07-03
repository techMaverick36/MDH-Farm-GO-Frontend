// Wire shapes for the Sales/Customers context (see apps/api customer.service).

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  zone: string | null;
  openingBalMinor: number;
  userId: string | null; // their mobile login, if provisioned
  createdAt: string;
}

export interface CustomerStatement {
  customerId: string;
  openingBalMinor: number;
  invoicedMinor: number;
  paidMinor: number;
  balanceMinor: number;
  invoiceCount: number;
  paymentCount: number;
}
