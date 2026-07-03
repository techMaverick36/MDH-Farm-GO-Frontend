export interface AdminFarm {
  id: string;
  name: string;
  country: string;
  currency: string;
  status: "TRIAL" | "ACTIVE" | "SUSPENDED";
  onboardingCompletedAt: string | null;
  createdAt: string;
}

export interface Analytics {
  farmCount: number;
  farmsByStatus: { status: string; count: number }[];
  subscriptionsByStatus: { status: string; count: number }[];
  moduleAdoption: { moduleId: string; farms: number }[];
}

export interface AdminSubscription {
  farmId: string;
  farm: string;
  plan: string;
  status: string;
  expiresAt: string | null;
}

export interface Plan {
  id: string;
  name: string;
  durationDays: number;
  priceMinor: number;
  currency: string;
  isActive: boolean;
}

export interface Referral {
  id: string;
  referringFarmId: string;
  referredFarmId: string;
  status: string;
  rewardDays: number;
  creditedAt: string | null;
  createdAt: string;
}
