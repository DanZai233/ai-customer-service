import Link from "next/link";
import {
  Braces,
  Clock3,
  Globe2,
  KeyRound,
  Mail,
  MessageCircleMore,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ChannelDashboard, ChannelId } from "@/lib/channels/types";

const channelPresentation: Record<
  ChannelId,
  { icon: typeof Globe2; detail: string }
> = {
  web: {
    icon: Globe2,
    detail: "标准会话 API 已上线，可通过有效写入密钥接入网站或业务系统。",
  },
  wechat: {
    icon: MessageCircleMore,
    detail: "原生消息回调、签名验证与出站回复连接器尚未实现。",
  },
  email: {
    icon: Mail,
    detail: "原生收信、邮件线程解析与发信连接器尚未实现。",
  },
};

function formatDate(value: string | null) {
  if (!value) return "从未调用";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function ChannelSettings({
  dashboard,
  baseUrl,
}: {
  dashboard: ChannelDashboard;
  baseUrl: string;
}) {
  return (
    <div className="h-full overflow-auto bg-muted/15 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5">
          <h1 className="text-xl font-semibold">渠道</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            查看实际接入能力与渠道会话数据
          </p>
        </header>

        <section className="mb-4 grid gap-px overflow-hidden border bg-border sm:grid-cols-3">
          <Metric
            icon={KeyRound}
            label="有效写入密钥"
            value={dashboard.api.activeWriteKeys}
          />
          <Metric
            icon={Clock3}
            label="API 最近调用"
            value={formatDate(dashboard.api.lastUsedAt)}
            compact
          />
          <Metric
            icon={Braces}
            label="会话写入端点"
            value="/api/v1/conversations"
            compact
          />
        </section>

        <div className="grid gap-3 md:grid-cols-3">
          {dashboard.channels.map((channel) => {
            const presentation = channelPresentation[channel.id];
            const Icon = presentation.icon;
            return (
              <section key={channel.id} className="border bg-background p-5">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold">{channel.name}</h2>
                      <Badge
                        variant={
                          channel.nativeConnectorAvailable
                            ? "outline"
                            : "secondary"
                        }
                        className="font-normal"
                      >
                        {channel.nativeConnectorAvailable
                          ? "可接入"
                          : "原生连接器未上线"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <p className="mt-4 min-h-10 text-xs leading-5 text-muted-foreground">
                  {presentation.detail}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-px border bg-border">
                  <div className="bg-background p-3">
                    <dt className="text-xs text-muted-foreground">全部会话</dt>
                    <dd className="mt-1 font-mono text-lg font-semibold">
                      {channel.conversationCount}
                    </dd>
                  </div>
                  <div className="bg-background p-3">
                    <dt className="text-xs text-muted-foreground">未结会话</dt>
                    <dd className="mt-1 font-mono text-lg font-semibold">
                      {channel.unresolvedCount}
                    </dd>
                  </div>
                </dl>
              </section>
            );
          })}
        </div>

        <section className="mt-4 flex flex-col gap-4 border bg-background p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">开放 API</h2>
            <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
              {baseUrl}/api/v1/conversations
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/developer">管理密钥与接入示例</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  compact = false,
}: {
  icon: typeof Globe2;
  label: string;
  value: string | number;
  compact?: boolean;
}) {
  return (
    <div className="bg-background p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p
        className={`mt-2 font-mono font-semibold ${compact ? "text-sm" : "text-2xl"}`}
      >
        {value}
      </p>
    </div>
  );
}
