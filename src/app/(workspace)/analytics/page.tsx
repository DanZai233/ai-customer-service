import type { Metadata } from "next";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Clock3,
  ListTodo,
  MessagesSquare,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requirePageAuth } from "@/lib/auth/context";
import { getAnalyticsDashboard } from "@/lib/analytics/repository";

export const metadata: Metadata = {
  title: "数据分析",
};

const metricIcons = {
  conversations: MessagesSquare,
  aiRate: Bot,
  firstResponse: Clock3,
  backlog: ListTodo,
};

export default async function AnalyticsPage() {
  const { user } = await requirePageAuth("analytics.read");
  const dashboard = await getAnalyticsDashboard(user.organizationId);
  const maxVolume = Math.max(1, ...dashboard.volume.map((item) => item.value));
  const generatedAt = new Intl.DateTimeFormat("zh-CN", {
    timeZone: dashboard.timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(dashboard.generatedAt));
  return (
    <div className="h-full overflow-auto bg-muted/15 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">数据分析</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              今天 00:00 至当前，比较昨日同期
            </p>
          </div>
          <Badge variant="outline" className="font-normal">
            PostgreSQL · {generatedAt}
          </Badge>
        </header>

        <section className="grid gap-px overflow-hidden border bg-border sm:grid-cols-2 xl:grid-cols-4">
          {dashboard.metrics.map((metric) => {
            const Icon = metricIcons[metric.id];
            const TrendIcon =
              metric.trend === "positive"
                ? ArrowUpRight
                : metric.trend === "negative"
                  ? ArrowDownRight
                  : ArrowRight;
            return (
              <div key={metric.id} className="bg-background p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {metric.label}
                  </p>
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <p className="mt-3 font-mono text-2xl font-semibold">
                  {metric.value}
                </p>
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendIcon className="size-3.5" />
                  {metric.detail}
                </p>
              </div>
            );
          })}
        </section>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="border bg-background p-4 sm:p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold">会话量趋势</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  按两小时统计的新会话
                </p>
              </div>
              <Badge variant="secondary" className="font-normal">
                今日
              </Badge>
            </div>
            <div className="mt-8 flex h-56 items-end gap-2 border-b px-2 sm:gap-3">
              {dashboard.volume.map((item) => (
                <div
                  key={item.label}
                  className="group flex h-full min-w-0 flex-1 items-end"
                >
                  <div
                    className="relative w-full bg-primary/75 transition-colors group-hover:bg-primary"
                    style={{
                      height:
                        item.value === 0
                          ? "0%"
                          : `${Math.max(6, (item.value / maxVolume) * 100)}%`,
                    }}
                  >
                    <span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 font-mono text-[10px] group-hover:block">
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
              {dashboard.volume
                .filter((_, index) => index % 3 === 0 || index === 11)
                .map((item) => (
                  <span key={item.label}>{item.label}</span>
                ))}
            </div>
          </section>

          <section className="border bg-background p-4 sm:p-5">
            <h2 className="text-sm font-semibold">AI 运行信号</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              今日真实事件计数
            </p>
            <div className="mt-6 space-y-5">
              {dashboard.aiSignals.map((signal) => (
                <div key={signal.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span>{signal.label}</span>
                    <span className="font-mono text-muted-foreground">
                      {signal.count}
                    </span>
                  </div>
                  <Progress value={signal.percent} className="mt-2 h-1.5" />
                </div>
              ))}
            </div>
            <div className="mt-6 border-t pt-4">
              <p className="text-xs text-muted-foreground">数据口径</p>
              <p className="mt-2 text-xs leading-5">
                托管标记、知识检索记录、assistant 消息和已解决状态
              </p>
            </div>
          </section>
        </div>

        <section className="mt-4 border bg-background">
          <div className="border-b p-4">
            <h2 className="text-sm font-semibold">队列表现</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>队列</TableHead>
                  <TableHead className="text-right">会话量</TableHead>
                  <TableHead className="text-right">AI 托管率</TableHead>
                  <TableHead className="text-right">首次响应</TableHead>
                  <TableHead className="text-right">解决率</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.queues.map((queue) => (
                  <TableRow key={queue.name}>
                    <TableCell className="font-medium">{queue.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {queue.volume}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {queue.aiRate}%
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {queue.response}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {queue.resolutionRate}%
                    </TableCell>
                  </TableRow>
                ))}
                {dashboard.queues.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      今日还没有会话数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </div>
  );
}
