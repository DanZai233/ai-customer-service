import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  can,
  normalizeRole,
  type Permission,
  type Role,
} from "@/lib/auth/permissions";
import { getAuth } from "@/lib/auth/server";

export type AuthContext = {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    organizationId: string;
  };
  sessionId: string;
};

type SessionResult = Awaited<
  ReturnType<ReturnType<typeof getAuth>["api"]["getSession"]>
>;

function toAuthContext(session: NonNullable<SessionResult>): AuthContext {
  const user = session.user as typeof session.user & {
    role?: unknown;
    organizationId?: unknown;
  };

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: normalizeRole(user.role),
      organizationId:
        typeof user.organizationId === "string"
          ? user.organizationId
          : "org-luma",
    },
    sessionId: session.session.id,
  };
}

export async function getAuthContext(requestHeaders?: Headers) {
  const session = await getAuth().api.getSession({
    headers: requestHeaders ?? (await headers()),
  });
  return session ? toAuthContext(session) : null;
}

export async function requirePageAuth(permission?: Permission) {
  const context = await getAuthContext();
  if (!context) redirect("/sign-in");
  if (permission && !can(context.user.role, permission)) {
    redirect("/inbox?access=denied");
  }
  return context;
}

export async function authorizeRequest(
  request: Request,
  permission: Permission,
): Promise<
  | { authorized: true; context: AuthContext }
  | { authorized: false; response: Response }
> {
  const context = await getAuthContext(request.headers);
  if (!context) {
    return {
      authorized: false,
      response: Response.json({ error: "请先登录" }, { status: 401 }),
    };
  }
  if (!can(context.user.role, permission)) {
    return {
      authorized: false,
      response: Response.json(
        { error: "没有执行此操作的权限" },
        { status: 403 },
      ),
    };
  }
  return { authorized: true, context };
}
