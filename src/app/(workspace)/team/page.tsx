import type { Metadata } from "next";

import { TeamSettings } from "@/components/operations/team-settings";
import { requirePageAuth } from "@/lib/auth/context";
import { can } from "@/lib/auth/permissions";
import { getTeamDashboard } from "@/lib/team/repository";

export const metadata: Metadata = {
  title: "团队",
};

export default async function TeamPage() {
  const { user } = await requirePageAuth("team.read");
  const dashboard = await getTeamDashboard(user.organizationId);
  return (
    <TeamSettings
      initialDashboard={dashboard}
      canManage={can(user.role, "team.manage")}
    />
  );
}
