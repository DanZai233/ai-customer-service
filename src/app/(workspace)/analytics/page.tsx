import type { Metadata } from "next";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Clock3,
  MessagesSquare,
  Smile,
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
import { cn } from "@/lib/utils";
import { requirePageAuth } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "数据分析",
};

const metrics = [
  {
    label: "今日会话",
    value: "286",
    change: "+12.4%",
    trend: "up",
    icon: MessagesSquare,
  },
  {
    label: "AI 独立解决",
    value: "71.8%",
    change: "+4.1%",
    trend: "up",
    icon: Bot,
  },
  {
    label: "首次响应",
    value: "18 秒",
    change: "-6 秒",
    trend: "down",
    icon: Clock3,
  },
  {
    label: "客户满意度",
    value: "94.6%",
    change: "+1.2%",
    trend: "up",
    icon: Smile,
  },
] as const;

const volume = [48, 62, 54, 73, 68, 82, 76, 91, 88, 70, 64, 52];
const queues = [
  {
    name: "订单与物流",
    volume: 108,
    aiRate: 82,
    response: "14 秒",
    csat: "96.2%",
  },
  {
    name: "售后退款",
    volume: 74,
    aiRate: 48,
    response: "31 秒",
    csat: "91.8%",
  },
  { name: "产品咨询", volume: 63, aiRate: 89, response: "9 秒", csat: "97.1%" },
  {
    name: "企业客户",
    volume: 41,
    aiRate: 37,
    response: "42 秒",
    csat: "93.4%",
  },
];

export default async function AnalyticsPage() {
  await requirePageAuth("analytics.read");
  return (
    <div className="h-full overflow-auto bg-muted/15 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">数据分析</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              今天 00:00 至当前，较上周同期
            </p>
          </div>
          <Badge variant="outline" className="font-normal">
            实时更新
          </Badge>
        </header>

        <section className="grid gap-px overflow-hidden border bg-border sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, change, trend, icon: Icon }) => (
            <div key={label} className="bg-background p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{label}</p>
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 font-mono text-2xl font-semibold">{value}</p>
              <p
                className={cn(
                  "mt-2 flex items-center gap-1 text-xs",
                  trend === "up" ? "text-emerald-600" : "text-blue-600",
                )}
              >
                {trend === "up" ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <ArrowDownRight className="size-3.5" />
                )}
                {change}
              </p>
            </div>
          ))}
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
              {volume.map((value, index) => (
                <div
                  key={`${index}-${value}`}
                  className="group flex h-full min-w-0 flex-1 items-end"
                >
                  <div
                    className="relative w-full bg-primary/75 transition-colors group-hover:bg-primary"
                    style={{ height: `${value}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 font-mono text-[10px] group-hover:block">
                      {value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>22:00</span>
            </div>
          </section>

          <section className="border bg-background p-4 sm:p-5">
            <h2 className="text-sm font-semibold">AI 处理漏斗</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              从接待到独立解决
            </p>
            <div className="mt-6 space-y-5">
              {[
                ["AI 接待", 248, 100],
                ["知识命中", 221, 89],
                ["生成有效回复", 196, 79],
                ["AI 独立解决", 178, 72],
              ].map(([label, count, percent]) => (
                <div key={String(label)}>
                  <div className="flex items-center justify-between text-xs">
                    <span>{label}</span>
                    <span className="font-mono text-muted-foreground">
                      {count}
                    </span>
                  </div>
                  <Progress value={Number(percent)} className="mt-2 h-1.5" />
                </div>
              ))}
            </div>
            <div className="mt-6 border-t pt-4">
              <p className="text-xs text-muted-foreground">主要转人工原因</p>
              <p className="mt-2 text-sm">退款审批、物流异常、企业报价</p>
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
                  <TableHead className="text-right">AI 解决率</TableHead>
                  <TableHead className="text-right">首次响应</TableHead>
                  <TableHead className="text-right">满意度</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queues.map((queue) => (
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
                      {queue.csat}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </div>
  );
}
