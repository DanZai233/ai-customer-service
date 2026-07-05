import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { getAiModel } from "@/lib/ai/provider";
import { authorizeRequest } from "@/lib/auth/context";
import { buildKnowledgeContext } from "@/lib/knowledge/repository";

export const maxDuration = 30;

function latestUserText(messages: UIMessage[]) {
  const message = [...messages].reverse().find((item) => item.role === "user");
  if (!message) return "";

  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

export async function POST(request: Request) {
  const authorization = await authorizeRequest(request, "ai.use");
  if (!authorization.authorized) return authorization.response;

  const { messages }: { messages: UIMessage[] } = await request.json();
  const query = latestUserText(messages);
  const context = await buildKnowledgeContext(
    authorization.context.user.organizationId,
    query,
  );
  const model = await getAiModel(authorization.context.user.organizationId);

  if (!model) {
    return Response.json(
      { error: "AI 模型尚未配置或已停用" },
      { status: 503, headers: { "X-Luma-AI-Mode": "unconfigured" } },
    );
  }

  const result = streamText({
    model,
    system: `你是企业客服团队的回复助手。你的任务是给人工客服提供可直接发送的中文回复建议。

规则：
1. 语气专业、自然、简洁，不夸大承诺。
2. 只能根据提供的知识资料回答；资料不足时明确建议转人工核实。
3. 涉及退款、合同、账户安全和具体赔付时必须提示人工确认。
4. 先给出“建议回复”，再用一行说明依据或风险提示。

当前知识资料：
${context || "未检索到相关资料。"}`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    headers: { "X-Luma-AI-Mode": "provider" },
  });
}
