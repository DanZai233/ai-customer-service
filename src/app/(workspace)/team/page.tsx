import type { Metadata } from "next";

import { TeamSettings } from "@/components/operations/team-settings";

export const metadata: Metadata = {
  title: "团队",
};

export default function TeamPage() {
  return <TeamSettings />;
}
