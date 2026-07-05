import { z } from "zod";

import { roles } from "@/lib/auth/permissions";

export const updateTeamMemberSchema = z.object({
  role: z.enum(roles),
  capacity: z.number().int().min(1).max(100),
});
