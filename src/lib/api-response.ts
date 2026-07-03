import { ZodError } from "zod";

import { ConversationNotFoundError } from "@/lib/conversations/repository";

export function apiErrorResponse(error: unknown) {
  if (error instanceof SyntaxError) {
    return Response.json({ error: "请求体不是有效的 JSON" }, { status: 400 });
  }

  if (error instanceof ZodError) {
    return Response.json(
      {
        error: "请求数据不合法",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  if (error instanceof ConversationNotFoundError) {
    return Response.json({ error: "会话不存在" }, { status: 404 });
  }

  console.error(error);
  return Response.json({ error: "服务暂时不可用" }, { status: 500 });
}
