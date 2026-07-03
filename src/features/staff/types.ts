export interface Staff {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  staffType: string | null;
  zone: string | null;
}

export const STAFF_TYPE_LABELS: Record<string, string> = {
  MILK_COLLECTOR: "Milk collector",
  EGG_COLLECTOR: "Egg collector",
  DELIVERY: "Delivery (supplier)",
  INVENTORY: "Inventory",
  GENERAL: "General",
};
