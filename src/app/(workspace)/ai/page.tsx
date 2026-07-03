import type { Metadata } from "next";
import { Bot, Database, ShieldCheck, Waypoints } from "lucide-react";

import { AssistantPanel } from "@/components/ai/assistant-panel";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "AI 助手",
};

const safeguards = [
  "资料不足时建议转人工核实",
  "退款、合同与账户安全强制人工确认",
  "不承诺未经业务系统确认的时间和赔付",
];

export default function AiPage() {
  return (
    <div className="h-full overflow-auto bg-muted/15 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5">
          <h1 className="text-xl font-semibold">AI 助手</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            验证知识命中、回复质量和安全规则
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <AssistantPanel />

          <aside className="space-y-4">
            <section className="border bg-background p-4">
              <div className="flex items-center gap-2">
                <Database className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">检索配置</h2>
              </div>
              <dl className="mt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">知识范围</dt>
                  <dd>已发布文章</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">召回数量</dt>
                  <dd className="font-mono">Top 3</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">检索策略</dt>
                  <dd>关键词 + 规则</dd>
                </div>
              </dl>
              <Separator className="my-4" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">知识准备度</span>
                <span className="font-mono">82%</span>
              </div>
              <Progress value={82} className="mt-2 h-1.5" />
            </section>

            <section className="border bg-background p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">安全边界</h2>
              </div>
              <ul className="mt-4 space-y-3">
                {safeguards.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-xs leading-5 text-muted-foreground"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="border bg-background p-4">
              <div className="flex items-center gap-2">
                <Waypoints className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">模型连接</h2>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">OpenAI 兼容接口</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    未配置时自动使用演示模式
                  </p>
                </div>
                <Badge variant="secondary" className="font-normal">
                  可替换
                </Badge>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground">
                <Bot className="size-3.5" />
                支持 DeepSeek、Qwen、OpenAI 等服务
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
