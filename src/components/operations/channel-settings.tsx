"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Code2,
  Globe2,
  Mail,
  MessageCircleMore,
  MessagesSquare,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type ChannelConfig = {
  id: string;
  name: string;
  description: string;
  icon: typeof Globe2;
  connected: boolean;
  enabled: boolean;
  detail: string;
};

const initialChannels: ChannelConfig[] = [
  {
    id: "web",
    name: "网站聊天组件",
    description: "嵌入官网或产品后台，支持访客识别与实时消息。",
    icon: Globe2,
    connected: true,
    enabled: true,
    detail: "luma-web-production",
  },
  {
    id: "wechat",
    name: "微信公众号",
    description: "通过公众号消息接口接收咨询并同步人工回复。",
    icon: MessageCircleMore,
    connected: false,
    enabled: false,
    detail: "尚未配置 AppID",
  },
  {
    id: "email",
    name: "客服邮箱",
    description: "将客户邮件转换为会话，并保留完整邮件线程。",
    icon: Mail,
    connected: true,
    enabled: true,
    detail: "support@example.com",
  },
  {
    id: "chatwoot",
    name: "Chatwoot",
    description: "同步现有 Chatwoot 收件箱、联系人和坐席状态。",
    icon: MessagesSquare,
    connected: false,
    enabled: false,
    detail: "使用 Webhook + REST API",
  },
];

export function ChannelSettings() {
  const [channels, setChannels] = useState(initialChannels);

  function toggleEnabled(id: string, enabled: boolean) {
    setChannels((current) =>
      current.map((channel) =>
        channel.id === id ? { ...channel, enabled } : channel,
      ),
    );
  }

  function toggleConnection(id: string) {
    setChannels((current) =>
      current.map((channel) =>
        channel.id === id
          ? {
              ...channel,
              connected: !channel.connected,
              enabled: !channel.connected,
              detail: channel.connected ? "等待重新连接" : "演示连接已建立",
            }
          : channel,
      ),
    );
  }

  return (
    <div className="h-full overflow-auto bg-muted/15 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5">
          <h1 className="text-xl font-semibold">渠道</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            把客户消息汇总到统一收件箱
          </p>
        </header>

        <div className="grid gap-3 md:grid-cols-2">
          {channels.map((channel) => {
            const Icon = channel.icon;
            return (
              <section key={channel.id} className="border bg-background p-5">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold">{channel.name}</h2>
                      <Badge
                        variant={channel.connected ? "outline" : "secondary"}
                        className="font-normal"
                      >
                        {channel.connected ? "已连接" : "未连接"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {channel.description}
                    </p>
                  </div>
                  <Switch
                    checked={channel.enabled}
                    onCheckedChange={(enabled) =>
                      toggleEnabled(channel.id, enabled)
                    }
                    disabled={!channel.connected}
                    aria-label={`${channel.enabled ? "停用" : "启用"}${channel.name}`}
                  />
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4">
                  <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                    {channel.connected ? (
                      <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                    ) : (
                      <Code2 className="size-3.5 shrink-0" />
                    )}
                    <span className="truncate">{channel.detail}</span>
                  </div>
                  <Button
                    variant={channel.connected ? "outline" : "default"}
                    size="sm"
                    onClick={() => toggleConnection(channel.id)}
                  >
                    {channel.connected ? "断开" : "配置"}
                  </Button>
                </div>
              </section>
            );
          })}
        </div>

        <section className="mt-4 border bg-background p-5">
          <h2 className="text-sm font-semibold">网站组件安装</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            将脚本放在网站结束 body 标签前。
          </p>
          <div className="mt-4 overflow-x-auto border bg-muted/40 p-3 font-mono text-xs">
            {`<script src="https://cdn.example.com/luma-widget.js" data-workspace="ws_demo"></script>`}
          </div>
        </section>
      </div>
    </div>
  );
}
