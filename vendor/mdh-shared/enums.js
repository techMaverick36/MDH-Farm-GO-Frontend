// Mirrors the Prisma enums. Keep these in sync with apps/api/prisma/schema.prisma.
// Only the enums needed for Phase 0 are defined here; module enums are added
// as their modules land.
export const RoleType = {
    PLATFORM_ADMIN: "PLATFORM_ADMIN",
    FARM_MANAGER: "FARM_MANAGER",
    FARM_STAFF: "FARM_STAFF",
    CUSTOMER: "CUSTOMER",
};
export const FarmStatus = {
    TRIAL: "TRIAL",
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
};
export const SubscriptionStatus = {
    TRIAL: "TRIAL",
    ACTIVE: "ACTIVE",
    GRACE: "GRACE",
    EXPIRED: "EXPIRED",
};
export const StaffType = {
    MILK_COLLECTOR: "MILK_COLLECTOR",
    EGG_COLLECTOR: "EGG_COLLECTOR",
    DELIVERY: "DELIVERY",
    INVENTORY: "INVENTORY",
    GENERAL: "GENERAL",
};
export const CowStatus = {
    ACTIVE: "ACTIVE",
    DRY: "DRY",
    SOLD: "SOLD",
    DECEASED: "DECEASED",
};
export const MilkSession = {
    MORNING: "MORNING",
    EVENING: "EVENING",
};
export const FlockStatus = {
    ACTIVE: "ACTIVE",
    CLOSED: "CLOSED",
};
export const StockDirection = {
    IN: "IN",
    OUT: "OUT",
};
export const StockReason = {
    COLLECTION: "COLLECTION",
    SALE: "SALE",
    DELIVERY: "DELIVERY",
    CONSUMPTION: "CONSUMPTION",
    MORTALITY: "MORTALITY",
    ADJUSTMENT: "ADJUSTMENT",
};
export const DeliveryStatus = {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    DISPUTED: "DISPUTED",
    CANCELLED: "CANCELLED",
    EXPIRED: "EXPIRED",
};
export const InvoiceStatus = {
    DRAFT: "DRAFT",
    APPROVED: "APPROVED",
    SENT: "SENT",
    OVERDUE: "OVERDUE",
    PAID: "PAID",
    VOID: "VOID",
};
export const PaymentMethod = {
    MOBILE_MONEY: "MOBILE_MONEY",
    CASH: "CASH",
    BANK: "BANK",
    OTHER: "OTHER",
};
//# sourceMappingURL=enums.js.map