"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpenText,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  CloudCog,
  Copy,
  Factory,
  GraduationCap,
  HeartPulse,
  Hotel,
  LoaderCircle,
  PackageCheck,
  Search,
  ShoppingBag,
  Store,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { copyText } from "@/lib/client/clipboard";
import { templateGroups } from "@/lib/templates/catalog";
import type { TemplateCatalogItem } from "@/lib/templates/service";

const templateIcons = {
  "ecommerce-retail": ShoppingBag,
  "saas-b2b": CloudCog,
  "education-training": GraduationCap,
  "healthcare-clinic": HeartPulse,
  "financial-services": CircleDollarSign,
  "travel-hospitality": Hotel,
  "local-services": Store,
  "manufacturing-b2b": Factory,
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const payload = (await response.json()) as { data?: T; error?: string };
  if (!response.ok || payload.data === undefined) {
    throw new Error(payload.error || "请求失败");
  }
  return payload.data;
}

export function TemplateGallery({
  initialTemplates,
  canInstall,
}: {
  initialTemplates: TemplateCatalogItem[];
  canInstall: boolean;
}) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  const filteredTemplates = templates.filter((template) => {
    const matchesGroup = group === "all" || template.group === group;
    const searchable =
      `${template.industry}${template.name}${template.description}${template.tags.join("")}`.toLocaleLowerCase(
        "zh-CN",
      );
    return (
      matchesGroup && (!normalizedQuery || searchable.includes(normalizedQuery))
    );
  });
  const selected =
    templates.find((template) => template.id === selectedId) ?? null;
  const installedCount = templates.filter(
    (template) => template.installed,
  ).length;

  async function install(templateId: string) {
    setInstallingId(templateId);
    setNotice(null);
    try {
      const data = await requestJson<{
        template: TemplateCatalogItem;
        createdDocuments: number;
      }>(`/api/templates/${templateId}/install`, {
        method: "POST",
        body: "{}",
      });
      setTemplates((current) =>
        current.map((template) =>
          template.id === templateId ? data.template : template,
        ),
      );
      setNotice(
        data.createdDocuments > 0
          ? `已创建 ${data.createdDocuments} 篇知识草稿，请审核后发布`
          : "模板文章已经存在，无需重复安装",
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "安装失败");
    } finally {
      setInstallingId(null);
    }
  }

  async function copyExample() {
    if (!selected) return;
    try {
      await copyText(JSON.stringify(selected.integrationExample, null, 2));
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
    window.setTimeout(() => setCopyStatus("idle"), 1600);
  }

  return (
    <div className="h-full overflow-auto bg-muted/15 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">行业模板</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              安装经过场景化整理的知识草稿与接入案例
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{templates.length} 套模板</Badge>
            <Badge variant="secondary">已安装 {installedCount}</Badge>
          </div>
        </header>

        <section className="grid gap-px overflow-hidden border bg-border sm:grid-cols-3">
          {[
            ["覆盖行业", String(templates.length), Building2],
            [
              "知识文章",
              String(
                templates.reduce((sum, item) => sum + item.totalDocuments, 0),
              ),
              BookOpenText,
            ],
            ["安装方式", "草稿审核", PackageCheck],
          ].map(([label, value, Icon]) => (
            <div key={String(label)} className="bg-background p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{String(label)}</span>
                <Icon className="size-4" />
              </div>
              <p className="mt-3 font-mono text-lg font-semibold">
                {String(value)}
              </p>
            </div>
          ))}
        </section>

        <div className="mt-4 flex flex-col gap-3 border bg-background p-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索行业、场景或标签"
              className="pl-9"
            />
          </div>
          <Select value={group} onValueChange={setGroup}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部行业</SelectItem>
              {templateGroups.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {notice && (
          <div
            role="status"
            className="mt-4 border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
          >
            {notice}
          </div>
        )}

        <section className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredTemplates.map((template) => {
            const Icon =
              templateIcons[template.id as keyof typeof templateIcons] ??
              Building2;
            return (
              <article
                key={template.id}
                className="flex min-h-80 flex-col border bg-background p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold">{template.name}</h2>
                      {template.installed && (
                        <Badge variant="outline">已安装</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {template.industry} · {template.group}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {template.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {template.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="font-normal"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 border-t pt-4">
                  <p className="text-xs font-medium">典型问题</p>
                  <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                    {template.sampleQuestions.slice(0, 2).map((question) => (
                      <li key={question}>“{question}”</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 pt-5">
                  <span className="text-xs text-muted-foreground">
                    {template.installedDocuments}/{template.totalDocuments}{" "}
                    篇已安装
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedId(template.id)}
                    >
                      查看
                      <ChevronRight />
                    </Button>
                    <Button
                      size="sm"
                      disabled={
                        !canInstall ||
                        template.installed ||
                        installingId === template.id
                      }
                      onClick={() => install(template.id)}
                    >
                      {installingId === template.id ? (
                        <LoaderCircle className="animate-spin" />
                      ) : template.installed ? (
                        <Check />
                      ) : (
                        <PackageCheck />
                      )}
                      {template.installed
                        ? "已安装"
                        : template.installedDocuments > 0
                          ? "补齐"
                          : "安装"}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {filteredTemplates.length === 0 && (
          <div className="mt-4 border bg-background p-12 text-center text-sm text-muted-foreground">
            没有匹配的行业模板
          </div>
        )}

        <Sheet
          open={Boolean(selected)}
          onOpenChange={(open) => !open && setSelectedId(null)}
        >
          <SheetContent className="sm:max-w-xl">
            {selected && (
              <>
                <SheetHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{selected.industry}</Badge>
                    <Badge variant="outline">
                      {selected.totalDocuments} 篇知识
                    </Badge>
                  </div>
                  <SheetTitle>{selected.name}</SheetTitle>
                  <SheetDescription>{selected.description}</SheetDescription>
                </SheetHeader>
                <div className="space-y-6 overflow-auto px-4 pb-4">
                  <section>
                    <h3 className="text-sm font-semibold">适用团队</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {selected.suitableFor}
                    </p>
                  </section>
                  <section>
                    <h3 className="text-sm font-semibold">典型客户问题</h3>
                    <div className="mt-2 divide-y border">
                      {selected.sampleQuestions.map((question) => (
                        <p key={question} className="p-3 text-sm">
                          {question}
                        </p>
                      ))}
                    </div>
                  </section>
                  <section>
                    <h3 className="text-sm font-semibold">将创建的知识草稿</h3>
                    <div className="mt-2 divide-y border">
                      {selected.documents.map((document) => (
                        <div key={document.slug} className="p-3">
                          <p className="text-sm font-medium">
                            {document.title}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {document.category}
                          </p>
                          <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">
                            {document.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold">
                        开放 API 接入案例
                      </h3>
                      <Button variant="outline" size="sm" onClick={copyExample}>
                        {copyStatus === "copied" ? <Check /> : <Copy />}
                        {copyStatus === "copied"
                          ? "已复制"
                          : copyStatus === "failed"
                            ? "复制失败"
                            : "复制 JSON"}
                      </Button>
                    </div>
                    <pre className="mt-2 overflow-x-auto border bg-zinc-950 p-3 font-mono text-xs leading-5 text-zinc-100">
                      <code>
                        {JSON.stringify(selected.integrationExample, null, 2)}
                      </code>
                    </pre>
                  </section>
                </div>
                <SheetFooter className="border-t sm:flex-row">
                  <Button
                    className="flex-1"
                    disabled={
                      !canInstall ||
                      selected.installed ||
                      installingId === selected.id
                    }
                    onClick={() => install(selected.id)}
                  >
                    {installingId === selected.id ? (
                      <LoaderCircle className="animate-spin" />
                    ) : selected.installed ? (
                      <Check />
                    ) : (
                      <PackageCheck />
                    )}
                    {selected.installed ? "模板已安装" : "安装为知识草稿"}
                  </Button>
                  {selected.installed && (
                    <Button variant="outline" asChild>
                      <Link href="/knowledge">前往知识库</Link>
                    </Button>
                  )}
                </SheetFooter>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
