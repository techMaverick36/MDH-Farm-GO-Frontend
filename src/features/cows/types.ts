import type { CowStatus } from "@mdh/shared";

// Wire shape of a cow (see apps/api dairy.service / prisma Cow model).
export interface Cow {
  id: string;
  tag: string;
  name: string | null;
  breed: string | null;
  dateOfBirth: string | null;
  status: CowStatus;
  createdAt: string;
}
