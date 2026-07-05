"use client";

import { useState } from "react";
import { Settings2, Users } from "lucide-react";

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
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { roleLabels, roles, type Role } from "@/lib/auth/permissions";
import type { TeamDashboard, TeamMember } from "@/lib/team/types";

type Notice = { tone: "success" | "error"; text: string } | null;

export function TeamSettings({
  initialDashboard,
  canManage,
}: {
  initialDashboard: TeamDashboard;
  canManage: boolean;
}) {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [role, setRole] = useState<Role>("agent");
  const [capacity, setCapacity] = useState("8");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  function openEditor(member: TeamMember) {
    setEditing(member);
    setRole(member.role);
    setCapacity(String(member.capacity));
    setNotice(null);
  }

  async function saveMember() {
    if (!editing) return;
    const parsedCapacity = Number(capacity);
    if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1) {
      setNotice({ tone: "error", text: "接待容量必须是大于 0 的整数" });
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/team/${editing.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role, capacity: parsedCapacity }),
      });
      const payload = (await response.json()) as {
        data?: TeamDashboard;
        error?: string;
      };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "保存成员配置失败");
      }
      setDashboard(payload.data);
      setNotice({ tone: "success", text: "成员配置已保存" });
      setEditing(null);
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "保存成员配置失败",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="h-full overflow-auto bg-muted/15 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5">
          <h1 className="text-xl font-semibold">团队</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理真实账号角色与坐席接待容量
          </p>
        </header>

        {notice ? (
          <div
            className={`mb-4 border px-3 py-2 text-sm ${notice.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-destructive/30 bg-destructive/5 text-destructive"}`}
            role="status"
          >
            {notice.text}
          </div>
        ) : null}

        <section className="mb-4 grid gap-px overflow-hidden border bg-border sm:grid-cols-4">
          <Metric label="团队成员" value={dashboard.summary.totalMembers} />
          <Metric label="当前在线" value={dashboard.summary.onlineMembers} />
          <Metric
            label="已分配会话"
            value={dashboard.summary.activeConversations}
          />
          <Metric
            label="团队负载"
            value={`${dashboard.summary.loadPercent}%`}
          />
        </section>

        <section className="border bg-background">
          <div className="flex items-center gap-2 border-b p-4">
            <Users className="size-4 text-primary" />
            <h2 className="text-sm font-semibold">成员与负载</h2>
            <Badge variant="outline" className="ml-auto font-normal">
              总容量 {dashboard.summary.capacity}
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>成员</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>活跃会话 / 容量</TableHead>
                  <TableHead>加入时间</TableHead>
                  {canManage ? <TableHead className="w-12" /> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {member.email}
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
                          className={`size-1.5 rounded-full ${member.online ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
                        />
                        {member.online ? "在线" : "离线"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {roleLabels[member.role]}
                    </TableCell>
                    <TableCell>
                      <div className="flex min-w-36 items-center gap-3">
                        <Progress
                          value={Math.min(
                            100,
                            (member.activeConversations / member.capacity) *
                              100,
                          )}
                          className="h-1.5"
                        />
                        <span className="shrink-0 font-mono text-xs">
                          {member.activeConversations}/{member.capacity}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("zh-CN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      }).format(new Date(member.joinedAt))}
                    </TableCell>
                    {canManage ? (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`管理 ${member.name}`}
                          title="成员设置"
                          onClick={() => openEditor(member)}
                        >
                          <Settings2 className="size-4" />
                        </Button>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>

      <Sheet
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <SheetContent className="flex flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>成员设置</SheetTitle>
            <SheetDescription>
              {editing ? `${editing.name} · ${editing.email}` : ""}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-5 px-4">
            <label className="block space-y-2 text-sm font-medium">
              角色
              <Select
                value={role}
                onValueChange={(value) => setRole(value as Role)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((item) => (
                    <SelectItem key={item} value={item}>
                      {roleLabels[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="block space-y-2 text-sm font-medium">
              接待容量
              <Input
                type="number"
                min={1}
                max={100}
                step={1}
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
              />
            </label>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              取消
            </Button>
            <Button onClick={saveMember} disabled={saving}>
              {saving ? "保存中" : "保存"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-background p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold">{value}</p>
    </div>
  );
}
