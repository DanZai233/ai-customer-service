export const roles = [
  "owner",
  "admin",
  "supervisor",
  "agent",
  "analyst",
] as const;

export type Role = (typeof roles)[number];

export const permissions = [
  "conversation.read",
  "conversation.respond",
  "conversation.manage",
  "knowledge.read",
  "knowledge.write",
  "knowledge.publish",
  "ai.use",
  "analytics.read",
  "channels.manage",
  "team.read",
  "team.manage",
  "settings.read",
  "settings.manage",
] as const;

export type Permission = (typeof permissions)[number];

const permissionMap: Record<Role, readonly Permission[]> = {
  owner: permissions,
  admin: permissions,
  supervisor: [
    "conversation.read",
    "conversation.respond",
    "conversation.manage",
    "knowledge.read",
    "knowledge.write",
    "knowledge.publish",
    "ai.use",
    "analytics.read",
    "team.read",
  ],
  agent: [
    "conversation.read",
    "conversation.respond",
    "conversation.manage",
    "knowledge.read",
    "ai.use",
  ],
  analyst: ["conversation.read", "knowledge.read", "analytics.read"],
};

export const roleLabels: Record<Role, string> = {
  owner: "所有者",
  admin: "管理员",
  supervisor: "客服主管",
  agent: "客服坐席",
  analyst: "数据分析",
};

export function normalizeRole(value: unknown): Role {
  return roles.includes(value as Role) ? (value as Role) : "agent";
}

export function can(role: Role, permission: Permission) {
  return permissionMap[role].includes(permission);
}
