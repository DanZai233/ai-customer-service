import { and, eq, ne, sql } from "drizzle-orm";

import { session, user } from "@/db/auth-schema";
import { getDatabase } from "@/db/client";
import { conversations, teamMemberSettings } from "@/db/schema";
import { normalizeRole, type Role } from "@/lib/auth/permissions";
import type { TeamDashboard } from "@/lib/team/types";

export class TeamMemberNotFoundError extends Error {}
export class LastOwnerError extends Error {}

export async function getTeamDashboard(
  organizationId: string,
): Promise<TeamDashboard> {
  const db = getDatabase();

  const [members, loads] = await Promise.all([
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        capacity: teamMemberSettings.capacity,
        online: sql<boolean>`exists (
          select 1 from ${session}
          where ${session.userId} = ${user.id}
            and ${session.expiresAt} > now()
        )`,
      })
      .from(user)
      .leftJoin(teamMemberSettings, eq(teamMemberSettings.userId, user.id))
      .where(eq(user.organizationId, organizationId))
      .orderBy(user.createdAt),
    db
      .select({
        assignee: conversations.assignee,
        count: sql<number>`count(*)::int`,
      })
      .from(conversations)
      .where(
        and(
          eq(conversations.organizationId, organizationId),
          ne(conversations.status, "resolved"),
        ),
      )
      .groupBy(conversations.assignee),
  ]);

  const loadByName = new Map(loads.map((row) => [row.assignee, row.count]));
  const normalizedMembers = members.map((member) => ({
    id: member.id,
    name: member.name,
    initials: member.name.trim().slice(0, 2).toUpperCase() || "?",
    email: member.email,
    role: normalizeRole(member.role),
    online: member.online,
    activeConversations: loadByName.get(member.name) ?? 0,
    capacity: member.capacity ?? 8,
    joinedAt: member.createdAt.toISOString(),
  }));
  const activeConversations = normalizedMembers.reduce(
    (sum, member) => sum + member.activeConversations,
    0,
  );
  const capacity = normalizedMembers.reduce(
    (sum, member) => sum + member.capacity,
    0,
  );

  return {
    members: normalizedMembers,
    summary: {
      totalMembers: normalizedMembers.length,
      onlineMembers: normalizedMembers.filter((member) => member.online).length,
      activeConversations,
      capacity,
      loadPercent:
        capacity === 0 ? 0 : Math.round((activeConversations / capacity) * 100),
    },
  };
}

export async function updateTeamMember(
  organizationId: string,
  actorId: string,
  memberId: string,
  input: { role: Role; capacity: number },
) {
  const db = getDatabase();
  const target = await db.query.user.findFirst({
    where: and(eq(user.id, memberId), eq(user.organizationId, organizationId)),
  });
  if (!target) throw new TeamMemberNotFoundError("成员不存在");

  if (normalizeRole(target.role) === "owner" && input.role !== "owner") {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(user)
      .where(
        and(eq(user.organizationId, organizationId), eq(user.role, "owner")),
      );
    if (count <= 1) throw new LastOwnerError("工作空间必须保留至少一位所有者");
  }

  const now = new Date();
  await db.transaction(async (transaction) => {
    await transaction
      .update(user)
      .set({ role: input.role, updatedAt: now })
      .where(
        and(eq(user.id, memberId), eq(user.organizationId, organizationId)),
      );
    await transaction
      .insert(teamMemberSettings)
      .values({
        userId: memberId,
        organizationId,
        capacity: input.capacity,
        updatedBy: actorId,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: teamMemberSettings.userId,
        set: { capacity: input.capacity, updatedBy: actorId, updatedAt: now },
      });
  });

  return getTeamDashboard(organizationId);
}
