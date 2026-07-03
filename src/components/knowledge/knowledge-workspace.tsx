"use client";

import { useMemo, useState } from "react";
import {
  BookOpenText,
  CheckCircle2,
  FileText,
  Globe2,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  SheetTrigger,
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
import {
  knowledgeArticles as initialArticles,
  searchKnowledge,
  type KnowledgeArticle,
} from "@/lib/knowledge-data";

const sourceIcons = {
  manual: BookOpenText,
  document: FileText,
  website: Globe2,
};

export function KnowledgeWorkspace() {
  const [articles, setArticles] = useState(initialArticles);
  const [search, setSearch] = useState("");
  const [testQuery, setTestQuery] = useState("物流三天没有更新怎么办？");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("订单与物流");
  const [content, setContent] = useState("");

  const filteredArticles = articles.filter((article) =>
    `${article.title}${article.category}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const matches = useMemo(
    () => searchKnowledge(testQuery, articles).slice(0, 3),
    [testQuery, articles],
  );
  const publishedCount = articles.filter(
    (article) => article.status === "published",
  ).length;

  function addArticle() {
    if (!title.trim() || !content.trim()) return;

    const article: KnowledgeArticle = {
      id: `kb-local-${Date.now()}`,
      title: title.trim(),
      category,
      content: content.trim(),
      status: "draft",
      source: "manual",
      updatedAt: "刚刚",
      hits: 0,
    };

    setArticles((current) => [article, ...current]);
    setTitle("");
    setContent("");
    setSheetOpen(false);
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
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" />
                新建知识
              </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>新建知识</SheetTitle>
                <SheetDescription>
                  草稿不会进入 AI 检索，发布前可以继续审核。
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-5 px-4">
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
                      <SelectItem value="订单与物流">订单与物流</SelectItem>
                      <SelectItem value="售后政策">售后政策</SelectItem>
                      <SelectItem value="发票与财务">发票与财务</SelectItem>
                      <SelectItem value="服务说明">服务说明</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
                <label className="block space-y-2 text-sm font-medium">
                  正文
                  <Textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="写清适用条件、处理步骤、时效和需要人工确认的边界。"
                    className="min-h-48 resize-none"
                  />
                </label>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => setSheetOpen(false)}>
                  取消
                </Button>
                <Button
                  onClick={addArticle}
                  disabled={!title.trim() || !content.trim()}
                >
                  保存草稿
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </header>

        <section className="mb-4 grid gap-px overflow-hidden border bg-border sm:grid-cols-3">
          <div className="bg-background p-4">
            <p className="text-xs text-muted-foreground">知识总数</p>
            <p className="mt-2 font-mono text-2xl font-semibold">
              {articles.length}
            </p>
          </div>
          <div className="bg-background p-4">
            <p className="text-xs text-muted-foreground">已发布</p>
            <p className="mt-2 font-mono text-2xl font-semibold">
              {publishedCount}
            </p>
          </div>
          <div className="bg-background p-4">
            <p className="text-xs text-muted-foreground">本月检索命中</p>
            <p className="mt-2 font-mono text-2xl font-semibold">1,041</p>
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
                  placeholder="搜索知识标题或分类"
                  className="pl-9"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
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
                  {filteredArticles.map((article) => {
                    const SourceIcon = sourceIcons[article.source];
                    return (
                      <TableRow key={article.id}>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                              <SourceIcon className="size-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {article.title}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {article.category} · {article.updatedAt}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              article.status === "published"
                                ? "outline"
                                : "secondary"
                            }
                            className="font-normal"
                          >
                            {article.status === "published" ? "已发布" : "草稿"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {article.hits}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`管理 ${article.title}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
                检查客户问题会命中哪些资料
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
            </div>
            <ScrollArea className="min-h-0 flex-1 border-t">
              <div className="space-y-3 p-4">
                {matches.length > 0 ? (
                  matches.map(({ article, score }, index) => (
                    <article key={article.id} className="border p-3">
                      <div className="flex items-start gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-[10px] text-primary">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium leading-5">
                            {article.title}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <Progress value={score * 100} className="h-1.5" />
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {Math.round(score * 100)}%
                            </span>
                          </div>
                          <p className="mt-2 line-clamp-3 text-[11px] leading-5 text-muted-foreground">
                            {article.content}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <CheckCircle2 className="mx-auto size-5 text-muted-foreground" />
                    <p className="mt-3 text-sm font-medium">
                      没有达到阈值的资料
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      AI 将建议转人工核实
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </section>
        </div>
      </div>
    </div>
  );
}
