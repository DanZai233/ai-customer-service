"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  FileJson2,
  KeyRound,
  LoaderCircle,
  Plus,
  RotateCcw,
  ServerCog,
  ShieldCheck,
  Trash2,
  X,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { copyText } from "@/lib/client/clipboard";
import type { ApiKeyScope, PublicApiKey } from "@/lib/developer/api-keys";

const scopeOptions: Array<{
  value: ApiKeyScope;
  label: string;
  description: string;
}> = [
  {
    value: "conversations:read",
    label: "读取会话",
    description: "查询客户、会话和消息记录",
  },
  {
    value: "conversations:write",
    label: "写入会话",
    description: "创建会话并追加客户消息",
  },
  {
    value: "ai:generate",
    label: "调用 AI",
    description: "预留给生成式回复接口",
  },
];

function buildSnippets(baseUrl: string, apiKey: string) {
  const body = {
    externalId: "order-consultation-10086",
    channel: "web",
    customer: {
      externalId: "customer-9527",
      name: "张女士",
      email: "zhang@example.com",
    },
    message: {
      externalId: "message-001",
      content: "我的订单什么时候发货？",
    },
    tags: ["订单咨询"],
  };
  const json = JSON.stringify(body, null, 2);
  return {
    curl: `curl -X POST '${baseUrl}/api/v1/conversations' \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H 'Content-Type: application/json' \\
  -H 'Idempotency-Key: order-consultation-10086' \\
  --data '${json}'`,
    javascript: `const response = await fetch("${baseUrl}/api/v1/conversations", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.LUMA_API_KEY}\`,
    "Content-Type": "application/json",
    "Idempotency-Key": "order-consultation-10086",
  },
  body: JSON.stringify(${json}),
});

if (!response.ok) throw new Error(await response.text());
const { data } = await response.json();`,
    python: `import os
import requests

response = requests.post(
    "${baseUrl}/api/v1/conversations",
    headers={
        "Authorization": f"Bearer {os.environ['LUMA_API_KEY']}",
        "Idempotency-Key": "order-consultation-10086",
    },
    json=${json.replaceAll("true", "True").replaceAll("false", "False").replaceAll("null", "None")},
    timeout=15,
)
response.raise_for_status()
conversation = response.json()["data"]`,
    nextjs: `// app/api/support/route.ts
export async function POST(request: Request) {
  const input = await request.json();
  const response = await fetch("${baseUrl}/api/v1/conversations", {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${process.env.LUMA_API_KEY}\`,
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(input),
  });
  return new Response(response.body, { status: response.status });
}`,
  };
}

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

function CopyButton({
  value,
  label = "复制",
}: {
  value: string;
  label?: string;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await copyText(value);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    window.setTimeout(() => setStatus("idle"), 1600);
  }

  return (
    <Button variant="outline" size="sm" onClick={copy}>
      {status === "copied" ? <Check /> : <Copy />}
      {status === "copied"
        ? "已复制"
        : status === "failed"
          ? "复制失败"
          : label}
    </Button>
  );
}

function CodeExample({ code }: { code: string }) {
  return (
    <div className="relative min-h-72 overflow-auto border bg-zinc-950 p-4 text-zinc-100">
      <pre className="pr-20 font-mono text-xs leading-5 whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
      <div className="absolute top-3 right-3">
        <CopyButton value={code} />
      </div>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "从未";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function DeveloperConsole({
  initialKeys,
  canManage,
  baseUrl,
}: {
  initialKeys: PublicApiKey[];
  canManage: boolean;
  baseUrl: string;
}) {
  const [keys, setKeys] = useState(initialKeys);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [name, setName] = useState("生产环境接入");
  const [scopes, setScopes] = useState<ApiKeyScope[]>([
    "conversations:read",
    "conversations:write",
  ]);
  const [expiresInDays, setExpiresInDays] = useState("90");
  const [creating, setCreating] = useState(false);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const snippetKey = createdSecret ?? "${LUMA_API_KEY}";
  const snippets = buildSnippets(baseUrl, snippetKey);

  function toggleScope(scope: ApiKeyScope) {
    setScopes((current) =>
      current.includes(scope)
        ? current.filter((item) => item !== scope)
        : [...current, scope],
    );
  }

  async function createKey() {
    setCreating(true);
    setError(null);
    try {
      const data = await requestJson<PublicApiKey & { secret: string }>(
        "/api/developer/keys",
        {
          method: "POST",
          body: JSON.stringify({
            name,
            scopes,
            expiresInDays:
              expiresInDays === "never" ? null : Number(expiresInDays),
          }),
        },
      );
      setKeys((current) => [data, ...current]);
      setCreatedSecret(data.secret);
      setSheetOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "创建失败");
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(keyId: string) {
    setRevokingId(keyId);
    setError(null);
    try {
      const data = await requestJson<PublicApiKey>(
        `/api/developer/keys/${keyId}`,
        { method: "DELETE" },
      );
      setKeys((current) =>
        current.map((item) => (item.id === keyId ? data : item)),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "吊销失败");
    } finally {
      setRevokingId(null);
    }
  }

  const activeKeys = keys.filter((key) => key.status === "active").length;

  return (
    <div className="h-full overflow-auto bg-muted/15 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">开发者中心</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              管理开放 API、服务端密钥与接入代码
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">API v1</Badge>
            {!canManage && <Badge variant="secondary">只读</Badge>}
          </div>
        </header>

        <section className="grid gap-px overflow-hidden border bg-border sm:grid-cols-3">
          {[
            { label: "有效密钥", value: String(activeKeys), icon: KeyRound },
            { label: "开放接口", value: "3", icon: ServerCog },
            { label: "契约版本", value: "OpenAPI 3.1", icon: FileJson2 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-background p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{label}</span>
                <Icon className="size-4" />
              </div>
              <p className="mt-3 font-mono text-lg font-semibold">{value}</p>
            </div>
          ))}
        </section>

        {createdSecret && (
          <section className="mt-4 border border-emerald-300 bg-emerald-50 p-4 text-emerald-950">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="size-4" />
                  新密钥已创建，仅显示这一次
                </div>
                <p className="mt-1 text-xs text-emerald-800">
                  立即保存到服务端密钥管理器，关闭提示后无法恢复。
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CopyButton value={createdSecret} label="复制密钥" />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="关闭密钥提示"
                  onClick={() => setCreatedSecret(null)}
                >
                  <X />
                </Button>
              </div>
            </div>
            <code className="mt-3 block overflow-x-auto border border-emerald-200 bg-white p-3 font-mono text-xs">
              {createdSecret}
            </code>
          </section>
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <Tabs defaultValue="quickstart" className="mt-4 gap-4">
          <TabsList>
            <TabsTrigger value="quickstart">快速接入</TabsTrigger>
            <TabsTrigger value="keys">API 密钥</TabsTrigger>
            <TabsTrigger value="reference">接口参考</TabsTrigger>
          </TabsList>

          <TabsContent value="quickstart">
            <section className="border bg-background">
              <div className="border-b p-4">
                <h2 className="text-sm font-semibold">创建第一条客户会话</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  选择语言后复制。网站和 App 请由服务端转发，避免泄露 API Key。
                </p>
              </div>
              <Tabs defaultValue="curl" className="gap-0">
                <div className="border-b px-3 py-2">
                  <TabsList variant="line">
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="nextjs">网站服务端</TabsTrigger>
                  </TabsList>
                </div>
                {Object.entries(snippets).map(([language, code]) => (
                  <TabsContent key={language} value={language}>
                    <CodeExample code={code} />
                  </TabsContent>
                ))}
              </Tabs>
            </section>
          </TabsContent>

          <TabsContent value="keys">
            <section className="border bg-background">
              <div className="flex items-center justify-between gap-3 border-b p-4">
                <div>
                  <h2 className="text-sm font-semibold">服务端 API 密钥</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    按环境或系统分别创建，发生泄露时可单独吊销。
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setSheetOpen(true)}
                  disabled={!canManage}
                >
                  <Plus />
                  创建密钥
                </Button>
              </div>
              {keys.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  还没有 API 密钥
                </div>
              ) : (
                <div className="divide-y">
                  {keys.map((key) => (
                    <div
                      key={key.id}
                      className="flex flex-wrap items-center gap-4 p-4"
                    >
                      <span className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <KeyRound className="size-4" />
                      </span>
                      <div className="min-w-48 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">{key.name}</p>
                          <Badge
                            variant={
                              key.status === "active" ? "outline" : "secondary"
                            }
                          >
                            {key.status === "active"
                              ? "有效"
                              : key.status === "revoked"
                                ? "已吊销"
                                : "已过期"}
                          </Badge>
                        </div>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          {key.prefix}••••••{key.hint}
                        </p>
                      </div>
                      <div className="min-w-40 text-xs text-muted-foreground">
                        <p>最近使用：{formatDate(key.lastUsedAt)}</p>
                        <p className="mt-1">
                          到期：
                          {key.expiresAt
                            ? formatDate(key.expiresAt)
                            : "永不过期"}
                        </p>
                      </div>
                      {key.status === "active" && (
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          title="吊销密钥"
                          aria-label={`吊销 ${key.name}`}
                          disabled={!canManage || revokingId === key.id}
                          onClick={() => revokeKey(key.id)}
                        >
                          {revokingId === key.id ? (
                            <LoaderCircle className="animate-spin" />
                          ) : (
                            <Trash2 />
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="reference">
            <section className="border bg-background">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
                <div>
                  <h2 className="text-sm font-semibold">OpenAPI 3.1 契约</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    可导入 Postman、Apifox、Insomnia 或用于生成 SDK。
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/api/openapi.json" target="_blank" rel="noreferrer">
                    <ExternalLink />
                    打开 JSON
                  </a>
                </Button>
              </div>
              <div className="divide-y">
                {[
                  ["POST", "/api/v1/conversations", "创建或复用客户会话"],
                  [
                    "GET",
                    "/api/v1/conversations/{conversationId}",
                    "读取会话和消息",
                  ],
                  [
                    "POST",
                    "/api/v1/conversations/{conversationId}/messages",
                    "追加客户消息",
                  ],
                ].map(([method, path, description]) => (
                  <div
                    key={`${method}-${path}`}
                    className="grid gap-2 p-4 sm:grid-cols-[64px_minmax(0,1fr)_200px] sm:items-center"
                  >
                    <Badge
                      variant={method === "GET" ? "secondary" : "default"}
                      className="w-fit font-mono"
                    >
                      {method}
                    </Badge>
                    <code className="overflow-x-auto font-mono text-xs">
                      {path}
                    </code>
                    <span className="text-xs text-muted-foreground">
                      {description}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t bg-muted/30 p-4 text-xs text-muted-foreground">
                所有接口返回 <code className="font-mono">X-Request-Id</code>
                ；写接口支持 <code className="font-mono">Idempotency-Key</code>
                。
              </div>
            </section>
          </TabsContent>
        </Tabs>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="sm:max-w-md">
            <SheetHeader className="border-b">
              <SheetTitle>创建 API 密钥</SheetTitle>
              <SheetDescription>
                按最小权限创建，密钥只会显示一次。
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-5 overflow-auto px-4">
              <label className="block space-y-2 text-sm font-medium">
                密钥名称
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={50}
                />
              </label>
              <fieldset>
                <legend className="text-sm font-medium">权限范围</legend>
                <div className="mt-2 divide-y border">
                  {scopeOptions.map((scope) => (
                    <label
                      key={scope.value}
                      className="flex cursor-pointer items-start gap-3 p-3"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 size-4 accent-primary"
                        checked={scopes.includes(scope.value)}
                        onChange={() => toggleScope(scope.value)}
                      />
                      <span>
                        <span className="block text-sm font-medium">
                          {scope.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {scope.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="block space-y-2 text-sm font-medium">
                有效期
                <Select value={expiresInDays} onValueChange={setExpiresInDays}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 天</SelectItem>
                    <SelectItem value="90">90 天</SelectItem>
                    <SelectItem value="365">1 年</SelectItem>
                    <SelectItem value="never">永不过期</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              {error && (
                <p role="alert" className="text-xs text-destructive">
                  {error}
                </p>
              )}
            </div>
            <SheetFooter className="border-t">
              <Button
                onClick={createKey}
                disabled={
                  creating || name.trim().length < 2 || scopes.length === 0
                }
              >
                {creating ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <KeyRound />
                )}
                创建密钥
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setName("生产环境接入");
                  setScopes(["conversations:read", "conversations:write"]);
                  setExpiresInDays("90");
                }}
              >
                <RotateCcw />
                恢复默认
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
