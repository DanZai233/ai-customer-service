"use client";

import { useState } from "react";
import { MoreHorizontal, Plus, UserRoundCheck, Users } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Agent = {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: string;
  status: "online" | "busy" | "offline" | "invited";
  active: number;
  capacity: number;
  csat: string;
};

const initialAgents: Agent[] = [
  {
    id: "a1",
    name: "周宁",
    initials: "周",
    email: "ning.zhou@example.com",
    role: "管理员",
    status: "online",
    active: 5,
    capacity: 8,
    csat: "96.8%",
  },
  {
    id: "a2",
    name: "顾言",
    initials: "顾",
    email: "yan.gu@example.com",
    role: "客服",
    status: "busy",
    active: 8,
    capacity: 8,
    csat: "94.2%",
  },
  {
    id: "a3",
    name: "唐悦",
    initials: "唐",
    email: "yue.tang@example.com",
    role: "客服",
    status: "online",
    active: 3,
    capacity: 8,
    csat: "97.1%",
  },
  {
    id: "a4",
    name: "苏禾",
    initials: "苏",
    email: "he.su@example.com",
    role: "质检",
    status: "offline",
    active: 0,
    capacity: 6,
    csat: "95.6%",
  },
];

const statusLabel = {
  online: "在线",
  busy: "忙碌",
  offline: "离线",
  invited: "已邀请",
};

export function TeamSettings() {
  const [agents, setAgents] = useState(initialAgents);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [autoAssign, setAutoAssign] = useState(true);

  function inviteAgent() {
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    setAgents((current) => [
      ...current,
      {
        id: `invite-${Date.now()}`,
        name: inviteName.trim(),
        initials: inviteName.trim().slice(0, 1),
        email: inviteEmail.trim(),
        role: "客服",
        status: "invited",
        active: 0,
        capacity: 8,
        csat: "--",
      },
    ]);
    setInviteName("");
    setInviteEmail("");
    setInviteOpen(false);
  }

  return (
    <div className="h-full overflow-auto bg-muted/15 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">团队</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              管理坐席、容量和会话分配规则
            </p>
          </div>
          <Sheet open={inviteOpen} onOpenChange={setInviteOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" />
                邀请成员
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col sm:max-w-md">
              <SheetHeader>
                <SheetTitle>邀请团队成员</SheetTitle>
                <SheetDescription>邀请链接将在 7 天后失效。</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-5 px-4">
                <label className="block space-y-2 text-sm font-medium">
                  姓名
                  <Input
                    value={inviteName}
                    onChange={(event) => setInviteName(event.target.value)}
                    placeholder="成员姓名"
                  />
                </label>
                <label className="block space-y-2 text-sm font-medium">
                  邮箱
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="name@example.com"
                  />
                </label>
                <label className="block space-y-2 text-sm font-medium">
                  角色
                  <Select defaultValue="agent">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent">客服</SelectItem>
                      <SelectItem value="qa">质检</SelectItem>
                      <SelectItem value="admin">管理员</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>
                  取消
                </Button>
                <Button
                  onClick={inviteAgent}
                  disabled={!inviteName.trim() || !inviteEmail.trim()}
                >
                  发送邀请
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </header>

        <section className="mb-4 grid gap-px overflow-hidden border bg-border sm:grid-cols-3">
          <div className="bg-background p-4">
            <p className="text-xs text-muted-foreground">团队成员</p>
            <p className="mt-2 font-mono text-2xl font-semibold">
              {agents.length}
            </p>
          </div>
          <div className="bg-background p-4">
            <p className="text-xs text-muted-foreground">当前在线</p>
            <p className="mt-2 font-mono text-2xl font-semibold">
              {
                agents.filter(
                  (agent) =>
                    agent.status === "online" || agent.status === "busy",
                ).length
              }
            </p>
          </div>
          <div className="bg-background p-4">
            <p className="text-xs text-muted-foreground">平均负载</p>
            <p className="mt-2 font-mono text-2xl font-semibold">67%</p>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="border bg-background">
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">成员与负载</h2>
              </div>
              <Badge variant="outline" className="font-normal">
                容量保护已启用
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>成员</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>活跃会话</TableHead>
                    <TableHead className="text-right">满意度</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="text-xs">
                              {agent.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{agent.name}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {agent.email} · {agent.role}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="gap-1.5 font-normal"
                        >
                          <span
                            className={`size-1.5 rounded-full ${agent.status === "online" ? "bg-emerald-500" : agent.status === "busy" ? "bg-amber-500" : "bg-muted-foreground/40"}`}
                          />
                          {statusLabel[agent.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-32 items-center gap-3">
                          <Progress
                            value={(agent.active / agent.capacity) * 100}
                            className="h-1.5"
                          />
                          <span className="shrink-0 font-mono text-xs">
                            {agent.active}/{agent.capacity}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {agent.csat}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`管理 ${agent.name}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="border bg-background p-4">
              <div className="flex items-center gap-2">
                <UserRoundCheck className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">自动分配</h2>
                <Switch
                  className="ml-auto"
                  checked={autoAssign}
                  onCheckedChange={setAutoAssign}
                  aria-label="自动分配"
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                根据队列技能、在线状态和当前容量分配新会话。
              </p>
              <div className="mt-4 space-y-4 border-t pt-4">
                <label className="block space-y-2 text-xs text-muted-foreground">
                  分配策略
                  <Select defaultValue="balanced">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">负载均衡</SelectItem>
                      <SelectItem value="round">轮流分配</SelectItem>
                      <SelectItem value="skill">技能优先</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
                <label className="block space-y-2 text-xs text-muted-foreground">
                  单人容量
                  <Input type="number" defaultValue="8" min="1" max="30" />
                </label>
              </div>
            </section>
            <section className="border bg-background p-4">
              <h2 className="text-sm font-semibold">超时升级</h2>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                高优先级会话 5 分钟未响应时，自动通知值班管理员。
              </p>
              <Button variant="outline" size="sm" className="mt-4 w-full">
                编辑升级规则
              </Button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
