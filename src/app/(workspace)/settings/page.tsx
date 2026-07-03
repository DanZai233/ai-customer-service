import type { Metadata } from "next";

import { SystemSettings } from "@/components/operations/system-settings";

export const metadata: Metadata = {
  title: "设置",
};

export default function SettingsPage() {
  return <SystemSettings />;
}
