"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  ArrowUp,
  Bot,
  Copy,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

const transport = new DefaultChatTransport({ api: "/api/ai/suggest" });

const examples = [
  "客户说物流三天没有更新，帮我写回复",
  "客户询问退款多久能到账",
  "企业客户要续费报价单，该怎么回复",
];

export function AssistantPanel() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error, regenerate } = useChat({
    transport,
  });
  const busy = status === "submitted" || status === "streaming";

  function submit(value = input) {
    const text = value.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <section className="flex min-h-[560px] flex-1 flex-col border bg-background">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Bot className="size-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold">客服回复助手</h2>
          <p className="text-xs text-muted-foreground">
            基于已发布知识生成可审核回复
          </p>
        </div>
        <Badge variant="outline" className="ml-auto gap-1 font-normal">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          演示模式可用
        </Badge>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-5 sm:p-8">
          {messages.length === 0 && (
            <div className="py-8">
              <Sparkles className="size-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">
                先把客户的问题交给我
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                我会检索已发布知识，生成回复并标注风险。最终发送仍由人工客服确认。
              </p>
              <div className="mt-6 grid gap-2 sm:grid-cols-3">
                {examples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => submit(example)}
                    className="border bg-muted/20 p-3 text-left text-xs leading-5 transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, messageIndex) => (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                {message.parts.map((part, partIndex) =>
                  part.type === "text" ? (
                    <MessageResponse key={`${message.id}-${partIndex}`}>
                      {part.text}
                    </MessageResponse>
                  ) : null,
                )}
              </MessageContent>
              {message.role === "assistant" &&
                messageIndex === messages.length - 1 && (
                  <MessageActions>
                    <MessageAction
                      tooltip="复制回复"
                      onClick={() => {
                        const text = message.parts
                          .filter((part) => part.type === "text")
                          .map((part) => part.text)
                          .join("\n");
                        navigator.clipboard.writeText(text);
                      }}
                    >
                      <Copy className="size-3.5" />
                    </MessageAction>
                    <MessageAction
                      tooltip="重新生成"
                      onClick={() => regenerate()}
                    >
                      <RotateCcw className="size-3.5" />
                    </MessageAction>
                  </MessageActions>
                )}
            </Message>
          ))}

          {busy && messages.at(-1)?.role !== "assistant" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              正在检索知识并生成回复…
            </div>
          )}

          {error && (
            <div className="border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              生成失败，请稍后重试。系统不会向页面暴露模型服务的内部错误。
            </div>
          )}
        </div>
      </ScrollArea>

      <footer className="shrink-0 border-t p-3 sm:p-4">
        <div className="mx-auto max-w-3xl border bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring/30">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="描述客户问题，或粘贴完整对话…"
            className="min-h-24 resize-none border-0 shadow-none focus-visible:ring-0"
            disabled={busy}
          />
          <div className="flex items-center gap-2 px-3 pb-3">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              高风险操作必须人工确认
            </span>
            <Button
              size="icon-sm"
              className="ml-auto"
              onClick={() => submit()}
              disabled={!input.trim() || busy}
              aria-label="生成回复"
            >
              <ArrowUp className="size-4" />
            </Button>
          </div>
        </div>
      </footer>
    </section>
  );
}
