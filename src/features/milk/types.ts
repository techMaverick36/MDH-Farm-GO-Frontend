import type { MilkSession } from "@mdh/shared";

// Wire shape of a milk collection (see apps/api dairy.service / MilkCollection).
export interface MilkCollection {
  id: string;
  cowId: string | null;
  collectedBy: string;
  quantityMl: number;
  session: MilkSession;
  collectedAt: string;
  createdAt: string;
}
