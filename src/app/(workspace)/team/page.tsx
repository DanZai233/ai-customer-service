import type { Metadata } from "next";

import { TeamSettings } from "@/components/operations/team-settings";
import { requirePageAuth } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "团队",
};

export default async function TeamPage() {
  await requirePageAuth("team.read");
  return <TeamSettings />;
}
