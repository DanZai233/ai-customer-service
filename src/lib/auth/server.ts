import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";

import { getDatabase } from "@/db/client";
import * as authSchema from "@/db/auth-schema";
import { getRequiredRuntimeSecret } from "@/lib/runtime-secrets";

function createAuth() {
  return betterAuth({
    appName: "Luma 客服中台",
    baseURL: process.env.BETTER_AUTH_URL,
    secret: getRequiredRuntimeSecret(
      process.env.BETTER_AUTH_SECRET,
      process.env.BETTER_AUTH_SECRET_FILE,
      "Better Auth secret",
    ),
    database: drizzleAdapter(getDatabase(), {
      provider: "pg",
      schema: authSchema,
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: process.env.AUTH_ALLOW_SIGN_UP !== "true",
      minPasswordLength: 10,
      revokeSessionsOnPasswordReset: true,
    },
    user: {
      additionalFields: {
        role: {
          type: ["owner", "admin", "supervisor", "agent", "analyst"],
          required: false,
          defaultValue: "agent",
          input: false,
        },
        organizationId: {
          type: "string",
          required: false,
          defaultValue: "org-luma",
          input: false,
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: true, maxAge: 60 * 5 },
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 30,
    },
    advanced: {
      cookiePrefix: "luma",
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;

let authInstance: Auth | null = null;

export function getAuth() {
  if (!authInstance) authInstance = createAuth();
  return authInstance;
}
