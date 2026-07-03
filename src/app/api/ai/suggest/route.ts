import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";

import { getAiModel } from "@/lib/ai/provider";
import { buildKnowledgeContext } from "@/lib/knowledge-data";

export const maxDuration = 30;

function latestUserText(messages: UIMessage[]) {
  const message = [...messages].reverse().find((item) => item.role === "user");
  if (!message) return "";

  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

function demoSuggestion(query: string, context: string) {
  if (
    query.includes("物流") ||
    query.includes("快递") ||
    query.includes("更新")
  ) {
    return `建议回复：\n\n你好，抱歉让你久等了。我已经核对到这笔订单的物流信息超过 **48 小时**没有更新，现已为你创建承运商核查单并标记为优先处理。我们会在 **24 小时内**同步最新结果。\n\n> 回复依据：物流停滞与异常件处理规则\n\n在承运商反馈前，建议不要承诺具体送达时间。`;
  }

  if (query.includes("退款")) {
    return `建议回复：\n\n你好，可以帮你处理退款。若订单尚未发货，可直接提交申请；若已经发货，需要在拒收或退货入库后办理。退款原路返回，通常需要 **1 至 5 个工作日**到账。\n\n> 涉及大额退款时，请转人工确认。`;
  }

  const sourceNote = context
    ? "已结合当前知识库内容生成。"
    : "当前没有检索到直接相关资料。";
  return `建议回复：\n\n你好，我已经收到你的问题。为了避免提供不准确的信息，我会先核对相关记录，再尽快给你明确答复。\n\n${sourceNote} 如涉及退款、合同或账户安全，请转交人工客服。`;
}

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();
  const query = latestUserText(messages);
  const context = buildKnowledgeContext(query);
  const model = getAiModel();

  if (!model) {
    const text = demoSuggestion(query, context);
    const stream = createUIMessageStream({
      execute({ writer }) {
        const id = crypto.randomUUID();
        writer.write({ type: "text-start", id });

        const chunks = Array.from({ length: Math.ceil(text.length / 16) }, (_, index) =>
          text.slice(index * 16, (index + 1) * 16),
        );
        for (const chunk of chunks) {
          writer.write({ type: "text-delta", id, delta: chunk });
        }

        writer.write({ type: "text-end", id });
      },
    });

    return createUIMessageStreamResponse({
      stream,
      headers: { "X-Luma-AI-Mode": "demo" },
    });
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
