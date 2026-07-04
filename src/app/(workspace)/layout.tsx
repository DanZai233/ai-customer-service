import { AppShell } from "@/components/app-shell";
import { requirePageAuth } from "@/lib/auth/context";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requirePageAuth();
  return <AppShell user={user}>{children}</AppShell>;
}
