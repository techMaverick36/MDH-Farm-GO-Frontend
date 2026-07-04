export declare const RoleType: {
    readonly PLATFORM_ADMIN: "PLATFORM_ADMIN";
    readonly FARM_MANAGER: "FARM_MANAGER";
    readonly FARM_STAFF: "FARM_STAFF";
    readonly CUSTOMER: "CUSTOMER";
};
export type RoleType = (typeof RoleType)[keyof typeof RoleType];
export declare const FarmStatus: {
    readonly TRIAL: "TRIAL";
    readonly ACTIVE: "ACTIVE";
    readonly SUSPENDED: "SUSPENDED";
};
export type FarmStatus = (typeof FarmStatus)[keyof typeof FarmStatus];
export declare const SubscriptionStatus: {
    readonly TRIAL: "TRIAL";
    readonly ACTIVE: "ACTIVE";
    readonly GRACE: "GRACE";
    readonly EXPIRED: "EXPIRED";
};
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];
export declare const StaffType: {
    readonly MILK_COLLECTOR: "MILK_COLLECTOR";
    readonly EGG_COLLECTOR: "EGG_COLLECTOR";
    readonly DELIVERY: "DELIVERY";
    readonly INVENTORY: "INVENTORY";
    readonly GENERAL: "GENERAL";
};
export type StaffType = (typeof StaffType)[keyof typeof StaffType];
export declare const CowStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly DRY: "DRY";
    readonly SOLD: "SOLD";
    readonly DECEASED: "DECEASED";
};
export type CowStatus = (typeof CowStatus)[keyof typeof CowStatus];
export declare const MilkSession: {
    readonly MORNING: "MORNING";
    readonly EVENING: "EVENING";
};
export type MilkSession = (typeof MilkSession)[keyof typeof MilkSession];
export declare const FlockStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly CLOSED: "CLOSED";
};
export type FlockStatus = (typeof FlockStatus)[keyof typeof FlockStatus];
export declare const StockDirection: {
    readonly IN: "IN";
    readonly OUT: "OUT";
};
export type StockDirection = (typeof StockDirection)[keyof typeof StockDirection];
export declare const StockReason: {
    readonly COLLECTION: "COLLECTION";
    readonly SALE: "SALE";
    readonly DELIVERY: "DELIVERY";
    readonly CONSUMPTION: "CONSUMPTION";
    readonly MORTALITY: "MORTALITY";
    readonly ADJUSTMENT: "ADJUSTMENT";
};
export type StockReason = (typeof StockReason)[keyof typeof StockReason];
export declare const DeliveryStatus: {
    readonly PENDING: "PENDING";
    readonly CONFIRMED: "CONFIRMED";
    readonly DISPUTED: "DISPUTED";
    readonly CANCELLED: "CANCELLED";
    readonly EXPIRED: "EXPIRED";
};
export type DeliveryStatus = (typeof DeliveryStatus)[keyof typeof DeliveryStatus];
export declare const InvoiceStatus: {
    readonly DRAFT: "DRAFT";
    readonly APPROVED: "APPROVED";
    readonly SENT: "SENT";
    readonly OVERDUE: "OVERDUE";
    readonly PAID: "PAID";
    readonly VOID: "VOID";
};
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];
export declare const PaymentMethod: {
    readonly MOBILE_MONEY: "MOBILE_MONEY";
    readonly CASH: "CASH";
    readonly BANK: "BANK";
    readonly OTHER: "OTHER";
};
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
