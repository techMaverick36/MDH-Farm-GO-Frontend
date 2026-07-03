import { Permission } from "@mdh/shared";
import type { ReactNode } from "react";

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  /** Permission required to see this item (omit = always visible to a manager). */
  permission?: string;
  /** Module that must be enabled on the farm. */
  module?: string;
  /** Show in the mobile bottom bar (space is limited there). */
  primary?: boolean;
}

// Simple inline glyphs keep the bundle lean and render crisply at any size.
function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: "/",
    label: "Home",
    primary: true,
    icon: <Icon d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />,
  },
  {
    to: "/cows",
    label: "Cows",
    permission: Permission.COW_VIEW,
    module: "dairy",
    primary: true,
    icon: <Icon d="M4 8c0 4 3 8 8 8s8-4 8-8M7 8V5l2 2M17 8V5l-2 2M9 12h.01M15 12h.01" />,
  },
  {
    to: "/milk",
    label: "Milk",
    permission: Permission.MILK_VIEW,
    module: "dairy",
    primary: true,
    icon: <Icon d="M8 3h8l-1 4v3l2 4v6a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-6l2-4V7L8 3Z" />,
  },
  {
    to: "/customers",
    label: "Customers",
    permission: Permission.CUSTOMER_VIEW,
    primary: true,
    icon: <Icon d="M16 18v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
  },
  {
    to: "/deliveries",
    label: "Deliveries",
    permission: Permission.DELIVERY_VIEW,
    primary: true,
    icon: <Icon d="M3 7h11v8H3zM14 10h4l3 3v2h-7M7 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />,
  },
  {
    to: "/invoices",
    label: "Invoices",
    permission: Permission.INVOICE_VIEW,
    icon: <Icon d="M7 3h10v18l-2.5-1.5L12 21l-2.5-1.5L7 21V3ZM9.5 8h5M9.5 12h5" />,
  },
  {
    to: "/staff",
    label: "Staff",
    permission: Permission.USER_VIEW,
    icon: <Icon d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1M17 11a3 3 0 0 0 0-6M19.5 20v-1a4 4 0 0 0-3-3.87" />,
  },
  {
    to: "/subscription",
    label: "Subscription",
    permission: Permission.SUBSCRIPTION_VIEW_OWN,
    icon: <Icon d="M3 7h18v10H3zM3 10h18M7 14h4" />,
  },
  {
    to: "/recycle-bin",
    label: "Bin",
    permission: Permission.RECYCLEBIN_VIEW,
    icon: <Icon d="M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13M10 11v6M14 11v6" />,
  },
];
