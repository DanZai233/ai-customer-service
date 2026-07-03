"use client";

import { useState } from "react";
import {
  Archive,
  BookOpenText,
  CheckCircle2,
  CircleAlert,
  FileText,
  Globe2,
  LoaderCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Shapes,
  Send,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Textarea } from "@/components/ui/textarea";
import type {
  KnowledgeDocument,
  KnowledgeDocumentStatus,
  KnowledgeMatch,
  KnowledgeStats,
} from "@/lib/knowledge/types";

const sourceIcons = {
  manual: BookOpenText,
  document: FileText,
  website: Globe2,
  template: Shapes,
};

const statusLabels: Record<KnowledgeDocumentStatus, string> = {
  draft: "草稿",
  published: "已发布",
  archived: "已归档",
};

const categories = [
  "订单与物流",
  "售后政策",
  "发票与财务",
  "销售与续费",
  "服务说明",
];

type Notice = { tone: "success" | "error"; text: string } | null;

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const payload = (await response.json()) as { data?: T; error?: string };
  if (!response.ok || payload.data === undefined) {
    throw new Error(payload.error || "请求失败，请稍后重试");
  }
  return payload.data;
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function KnowledgeWorkspace({
  initialDocuments,
  initialStats,
  canWrite,
  canPublish,
}: {
  initialDocuments: KnowledgeDocument[];
  initialStats: KnowledgeStats;
  canWrite: boolean;
  canPublish: boolean;
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [stats, setStats] = useState(initialStats);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [testQuery, setTestQuery] = useState("物流三天没有更新怎么办？");
  const [matches, setMatches] = useState<KnowledgeMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredDocuments = documents.filter((document) => {
    const matchesText =
      `${document.title}${document.category}${document.content}`
        .toLowerCase()
        .includes(normalizedSearch);
    const matchesStatus =
      statusFilter === "all" || document.status === statusFilter;
    return matchesText && matchesStatus;
  });

  function resetEditor() {
    setEditingId(null);
    setTitle("");
    setCategory(categories[0]);
    setContent("");
  }

  function openCreate() {
    resetEditor();
    setNotice(null);
    setSheetOpen(true);
  }

  function openEdit(document: KnowledgeDocument) {
    setEditingId(document.id);
    setTitle(document.title);
    setCategory(document.category);
    setContent(document.content);
    setNotice(null);
    setSheetOpen(true);
  }

  function replaceDocument(next: KnowledgeDocument) {
    setDocuments((current) =>
      current.map((document) => (document.id === next.id ? next : document)),
    );
    setMatches((current) =>
      current.map((match) =>
        match.document.id === next.id ? { ...match, document: next } : match,
      ),
    );
  }

  async function saveDocument() {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    setNotice(null);
    try {
      const body = JSON.stringify({ title, category, content });
      const document = editingId
        ? await requestJson<KnowledgeDocument>(`/api/knowledge/${editingId}`, {
            method: "PATCH",
            body,
          })
        : await requestJson<KnowledgeDocument>("/api/knowledge", {
            method: "POST",
            body,
          });
      if (editingId) {
        replaceDocument(document);
      } else {
        setDocuments((current) => [document, ...current]);
        setStats((current) => ({ ...current, total: current.total + 1 }));
      }
      setSheetOpen(false);
      resetEditor();
      setNotice({
        tone: "success",
        text: editingId ? "知识内容已更新" : "草稿已创建",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "保存失败",
      });
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(
    document: KnowledgeDocument,
    action: "publish" | "archive",
  ) {
    setBusyId(document.id);
    setNotice(null);
    try {
      const next = await requestJson<KnowledgeDocument>(
        `/api/knowledge/${document.id}/${action}`,
        { method: "POST", body: "{}" },
      );
      replaceDocument(next);
      if (action === "archive") {
        setMatches((current) =>
          current.filter((match) => match.document.id !== document.id),
        );
      }
      setStats((current) => ({
        ...current,
        published:
          action === "publish"
            ? current.published + (document.status === "published" ? 0 : 1)
            : Math.max(
                0,
                current.published - (document.status === "published" ? 1 : 0),
              ),
      }));
      setNotice({
        tone: "success",
        text: action === "publish" ? "知识已发布" : "知识已归档",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "操作失败",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function runSearch() {
    if (testQuery.trim().length < 2) return;
    setSearching(true);
    setNotice(null);
    try {
      const data = await requestJson<{
        matches: KnowledgeMatch[];
        stats: KnowledgeStats;
      }>("/api/knowledge/search", {
        method: "POST",
        body: JSON.stringify({ query: testQuery, limit: 3 }),
      });
      setMatches(data.matches);
      setStats(data.stats);
      const hitCounts = new Map(
        data.matches.map((match) => [
          match.document.id,
          match.document.hitCount,
        ]),
      );
      setDocuments((current) =>
        current.map((document) =>
          hitCounts.has(document.id)
            ? { ...document, hitCount: hitCounts.get(document.id) ?? 0 }
            : document,
        ),
      );
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "检索失败",
      });
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="h-full overflow-auto bg-muted/15 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">知识库</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              维护 AI 可引用的业务事实与处理规则
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!canWrite && <Badge variant="secondary">只读</Badge>}
            {canWrite && (
              <Button size="sm" onClick={openCreate}>
                <Plus />
                新建知识
              </Button>
            )}
          </div>
        </header>

        {notice && (
          <div
            role="status"
            className={`mb-4 flex items-center gap-2 border px-3 py-2 text-xs ${
              notice.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-destructive/30 bg-destructive/5 text-destructive"
            }`}
          >
            {notice.tone === "success" ? (
              <CheckCircle2 className="size-3.5" />
            ) : (
              <CircleAlert className="size-3.5" />
            )}
            {notice.text}
          </div>
        )}

        <section className="mb-4 grid gap-px overflow-hidden border bg-border sm:grid-cols-3">
          <div className="bg-background p-4">
            <p className="text-xs text-muted-foreground">知识总数</p>
            <p className="mt-2 font-mono text-2xl font-semibold">
              {stats.total}
            </p>
          </div>
          <div className="bg-background p-4">
            <p className="text-xs text-muted-foreground">已发布</p>
            <p className="mt-2 font-mono text-2xl font-semibold">
              {stats.published}
            </p>
          </div>
          <div className="bg-background p-4">
            <p className="text-xs text-muted-foreground">本月检索命中</p>
            <p className="mt-2 font-mono text-2xl font-semibold">
              {stats.retrievalsThisMonth.toLocaleString("zh-CN")}
            </p>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="min-w-0 border bg-background">
            <div className="flex flex-wrap items-center gap-3 border-b p-3">
              <div className="relative min-w-52 flex-1 sm:max-w-sm">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="搜索标题、分类或正文"
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="archived">已归档</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>知识条目</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">命中</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((document) => {
                    const SourceIcon = sourceIcons[document.source];
                    const canManage = canWrite || canPublish;
                    return (
                      <TableRow key={document.id}>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                              <SourceIcon className="size-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {document.title}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {document.category} ·{" "}
                                {formatUpdatedAt(document.updatedAt)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              document.status === "published"
                                ? "outline"
                                : "secondary"
                            }
                            className="font-normal"
                          >
                            {statusLabels[document.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {document.hitCount}
                        </TableCell>
                        <TableCell>
                          {canManage && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label={`管理 ${document.title}`}
                                  disabled={busyId === document.id}
                                >
                                  {busyId === document.id ? (
                                    <LoaderCircle className="animate-spin" />
                                  ) : (
                                    <MoreHorizontal />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {canWrite && (
                                  <DropdownMenuItem
                                    onSelect={() => openEdit(document)}
                                  >
                                    <Pencil />
                                    编辑
                                  </DropdownMenuItem>
                                )}
                                {canPublish &&
                                  document.status !== "published" && (
                                    <DropdownMenuItem
                                      onSelect={() =>
                                        changeStatus(document, "publish")
                                      }
                                    >
                                      <Send />
                                      发布
                                    </DropdownMenuItem>
                                  )}
                                {canPublish &&
                                  document.status !== "archived" && (
                                    <DropdownMenuItem
                                      variant="destructive"
                                      onSelect={() =>
                                        changeStatus(document, "archive")
                                      }
                                    >
                                      <Archive />
                                      归档
                                    </DropdownMenuItem>
                                  )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredDocuments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center">
                        <p className="text-sm font-medium">没有匹配的知识</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          调整搜索词或状态筛选
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </section>

          <section className="flex min-h-[520px] flex-col border bg-background">
            <header className="border-b p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">检索测试</h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                使用与 AI 回复相同的已发布知识
              </p>
            </header>
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground">
                客户问题
              </label>
              <Textarea
                value={testQuery}
                onChange={(event) => setTestQuery(event.target.value)}
                className="mt-2 min-h-24 resize-none"
              />
              <Button
                className="mt-3 w-full"
                size="sm"
                onClick={runSearch}
                disabled={searching || testQuery.trim().length < 2}
              >
                {searching ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Search />
                )}
                运行检索
              </Button>
            </div>
            <ScrollArea className="min-h-0 flex-1 border-t">
              <div className="space-y-3 p-4">
                {matches.length > 0 ? (
                  matches.map(({ document, score }, index) => (
                    <article key={document.id} className="border p-3">
                      <div className="flex items-start gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-[10px] text-primary">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium leading-5">
                            {document.title}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <Progress value={score * 100} className="h-1.5" />
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {Math.round(score * 100)}%
                            </span>
                          </div>
                          <p className="mt-2 line-clamp-3 text-[11px] leading-5 text-muted-foreground">
                            {document.content}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <Search className="mx-auto size-5 text-muted-foreground" />
                    <p className="mt-3 text-sm font-medium">等待检索</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      输入客户问题并运行检索
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </section>
        </div>
      </div>

      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) resetEditor();
        }}
      >
        <SheetContent className="flex w-full flex-col sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editingId ? "编辑知识" : "新建知识"}</SheetTitle>
            <SheetDescription>
              {editingId
                ? "保存后更新当前内容。"
                : "新条目先保存为草稿，发布后进入 AI 检索。"}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-5 overflow-y-auto px-4">
            <label className="block space-y-2 text-sm font-medium">
              标题
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="例如：换货申请处理规则"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              分类
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="block space-y-2 text-sm font-medium">
              正文
              <Textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="写清适用条件、处理步骤、时效和人工确认边界。"
                className="min-h-64 resize-none"
              />
            </label>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              取消
            </Button>
            <Button
              onClick={saveDocument}
              disabled={
                saving || title.trim().length < 3 || content.trim().length < 20
              }
            >
              {saving && <LoaderCircle className="animate-spin" />}
              {editingId ? "保存修改" : "保存草稿"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
