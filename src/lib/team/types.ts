import type { Role } from "@/lib/auth/permissions";

export type TeamMember = {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: Role;
  online: boolean;
  activeConversations: number;
  capacity: number;
  joinedAt: string;
};

export type TeamDashboard = {
  members: TeamMember[];
  summary: {
    totalMembers: number;
    onlineMembers: number;
    activeConversations: number;
    capacity: number;
    loadPercent: number;
  };
};
