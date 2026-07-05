"use client";

import { useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  PlugZap,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  AiProviderKind,
  PublicAiProviderSettings,
  WorkspaceSettings,
} from "@/lib/settings/types";

type Notice = {
  tone: "success" | "error" | "info";
  text: string;
} | null;

type AiDraft = {
  kind: AiProviderKind;
  provider: string;
  baseURL: string;
  model: string;
  enabled: boolean;
};

const arkBaseURL = "https://ark.cn-beijing.volces.com/api/v3";

function toAiDraft(settings: PublicAiProviderSettings): AiDraft {
  return {
    kind: settings.kind,
    provider: settings.provider,
    baseURL: settings.baseURL,
    model: settings.model ?? "",
    enabled: settings.enabled,
  };
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const payload = (await response.json()) as {
    data?: T;
    error?: string;
  };
  if (!response.ok || payload.data === undefined) {
    throw new Error(payload.error || "请求失败，请稍后重试");
  }
  return payload.data;
}

function StatusNotice({ notice }: { notice: Notice }) {
  if (!notice) return null;
  const Icon = notice.tone === "success" ? CheckCircle2 : CircleAlert;
  return (
    <div
      role="status"
      className={`flex items-start gap-2 border px-3 py-2 text-xs ${
        notice.tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : notice.tone === "error"
            ? "border-destructive/30 bg-destructive/5 text-destructive"
            : "bg-muted/50 text-muted-foreground"
      }`}
    >
      <Icon className="mt-0.5 size-3.5 shrink-0" />
      <span className="leading-5">{notice.text}</span>
    </div>
  );
}

export function SystemSettings({
  initialSettings,
  canManage,
}: {
  initialSettings: {
    workspace: WorkspaceSettings;
    ai: PublicAiProviderSettings;
  };
  canManage: boolean;
}) {
  const [workspace, setWorkspace] = useState(initialSettings.workspace);
  const [ai, setAi] = useState(initialSettings.ai);
  const [savedAi, setSavedAi] = useState(() => toAiDraft(initialSettings.ai));
  const [aiDraft, setAiDraft] = useState(() => toAiDraft(initialSettings.ai));
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [clearApiKey, setClearApiKey] = useState(false);
  const [workspaceNotice, setWorkspaceNotice] = useState<Notice>(null);
  const [aiNotice, setAiNotice] = useState<Notice>(null);
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  const [savingAi, setSavingAi] = useState(false);
  const [testingAi, setTestingAi] = useState(false);

  const aiDirty =
    JSON.stringify(aiDraft) !== JSON.stringify(savedAi) ||
    Boolean(apiKey) ||
    clearApiKey;

  function updateWorkspace<K extends keyof WorkspaceSettings>(
    key: K,
    value: WorkspaceSettings[K],
  ) {
    setWorkspace((current) => ({ ...current, [key]: value }));
    setWorkspaceNotice(null);
  }

  function updateAi(patch: Partial<AiDraft>) {
    setAiDraft((current) => ({ ...current, ...patch }));
    setAiNotice(null);
  }

  function changeProvider(kind: AiProviderKind) {
    updateAi(
      kind === "volcengine"
        ? {
            kind,
            provider: "火山引擎方舟",
            baseURL: arkBaseURL,
          }
        : {
            kind,
            provider: "OpenAI Compatible",
            baseURL: "",
          },
    );
  }

  async function saveWorkspace() {
    setSavingWorkspace(true);
    setWorkspaceNotice(null);
    try {
      const data = await requestJson<WorkspaceSettings>(
        "/api/settings/workspace",
        { method: "PATCH", body: JSON.stringify(workspace) },
      );
      setWorkspace(data);
      setWorkspaceNotice({ tone: "success", text: "工作空间配置已保存" });
    } catch (error) {
      setWorkspaceNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "保存失败",
      });
    } finally {
      setSavingWorkspace(false);
    }
  }

  async function saveAi() {
    setSavingAi(true);
    setAiNotice(null);
    try {
      const data = await requestJson<PublicAiProviderSettings>(
        "/api/settings/ai",
        {
          method: "PATCH",
          body: JSON.stringify({
            ...aiDraft,
            apiKey: apiKey.trim() || undefined,
            clearApiKey,
          }),
        },
      );
      const nextDraft = toAiDraft(data);
      setAi(data);
      setAiDraft(nextDraft);
      setSavedAi(nextDraft);
      setApiKey("");
      setClearApiKey(false);
      setShowApiKey(false);
      setAiNotice({ tone: "success", text: "AI 配置已保存并立即生效" });
    } catch (error) {
      setAiNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "保存失败",
      });
    } finally {
      setSavingAi(false);
    }
  }

  async function testAi() {
    setTestingAi(true);
    setAiNotice({ tone: "info", text: "正在连接模型服务" });
    try {
      const data = await requestJson<{
        provider: string;
        model: string | null;
        response: string;
      }>("/api/settings/ai/test", { method: "POST", body: "{}" });
      const now = new Date().toISOString();
      setAi((current) => ({
        ...current,
        lastTestedAt: now,
        lastTestStatus: "success",
        lastTestMessage: `连接成功${data.response ? `，模型返回：${data.response}` : ""}`,
      }));
      setAiNotice({
        tone: "success",
        text: `${data.provider} / ${data.model ?? "当前模型"} 连接成功`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "连接失败";
      setAi((current) => ({
        ...current,
        lastTestedAt: new Date().toISOString(),
        lastTestStatus: "error",
        lastTestMessage: message,
      }));
      setAiNotice({ tone: "error", text: message });
    } finally {
      setTestingAi(false);
    }
  }

  const keyPlaceholder = clearApiKey
    ? "保存后清除当前密钥"
    : ai.apiKeyConfigured
      ? `已保存密钥 ···· ${ai.apiKeyHint ?? ""}`
      : "输入 API Key";

  return (
    <TooltipProvider>
      <div className="h-full overflow-auto bg-muted/15 p-4 sm:p-6">
        <div className="mx-auto max-w-5xl">
          <header className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">设置</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                工作空间、AI 模型与数据安全
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-normal">
                PostgreSQL
              </Badge>
              {!canManage && <Badge variant="secondary">只读</Badge>}
            </div>
          </header>

          <Tabs defaultValue="ai" className="gap-4">
            <TabsList>
              <TabsTrigger value="workspace">工作空间</TabsTrigger>
              <TabsTrigger value="ai">AI 配置</TabsTrigger>
              <TabsTrigger value="security">安全</TabsTrigger>
            </TabsList>

            <TabsContent value="workspace" className="space-y-4">
              <section className="border bg-background p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold">基本信息</h2>
                  <Button
                    size="sm"
                    onClick={saveWorkspace}
                    disabled={!canManage || savingWorkspace}
                  >
                    {savingWorkspace ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      <Save />
                    )}
                    保存
                  </Button>
                </div>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium">
                    工作空间名称
                    <Input
                      value={workspace.name}
                      onChange={(event) =>
                        updateWorkspace("name", event.target.value)
                      }
                      disabled={!canManage}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    默认时区
                    <Select
                      value={workspace.timezone}
                      onValueChange={(value) =>
                        updateWorkspace(
                          "timezone",
                          value as WorkspaceSettings["timezone"],
                        )
                      }
                      disabled={!canManage}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Shanghai">
                          Asia/Shanghai
                        </SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    服务语言
                    <Select
                      value={workspace.language}
                      onValueChange={(value) =>
                        updateWorkspace(
                          "language",
                          value as WorkspaceSettings["language"],
                        )
                      }
                      disabled={!canManage}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zh-CN">简体中文</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    工作日服务时间
                    <Input
                      value={workspace.businessHours}
                      onChange={(event) =>
                        updateWorkspace("businessHours", event.target.value)
                      }
                      disabled={!canManage}
                    />
                  </label>
                </div>
                <div className="mt-5">
                  <StatusNotice notice={workspaceNotice} />
                </div>
              </section>
              <section className="border bg-background p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold">自动解决会话</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      客户明确确认问题解决后自动关闭会话
                    </p>
                  </div>
                  <Switch
                    checked={workspace.autoResolve}
                    onCheckedChange={(value) =>
                      updateWorkspace("autoResolve", value)
                    }
                    disabled={!canManage}
                    aria-label="自动解决会话"
                  />
                </div>
              </section>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <section className="border bg-background p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <KeyRound className="size-4 text-primary" />
                  <h2 className="text-sm font-semibold">模型服务</h2>
                  <Badge
                    variant={ai.configured ? "default" : "secondary"}
                    className="font-normal"
                  >
                    {ai.configured ? "已启用" : "未配置"}
                  </Badge>
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={testAi}
                      disabled={
                        !canManage || testingAi || aiDirty || !ai.configured
                      }
                      title={aiDirty ? "请先保存当前更改" : undefined}
                    >
                      {testingAi ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        <PlugZap />
                      )}
                      测试连接
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveAi}
                      disabled={!canManage || savingAi || !aiDirty}
                    >
                      {savingAi ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        <Save />
                      )}
                      保存配置
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium">
                    供应商类型
                    <Select
                      value={aiDraft.kind}
                      onValueChange={(value) =>
                        changeProvider(value as AiProviderKind)
                      }
                      disabled={!canManage}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="volcengine">火山引擎方舟</SelectItem>
                        <SelectItem value="openai-compatible">
                          OpenAI 兼容接口
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    供应商名称
                    <Input
                      value={aiDraft.provider}
                      onChange={(event) =>
                        updateAi({ provider: event.target.value })
                      }
                      disabled={!canManage || aiDraft.kind === "volcengine"}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium sm:col-span-2">
                    Base URL
                    <Input
                      value={aiDraft.baseURL}
                      onChange={(event) =>
                        updateAi({ baseURL: event.target.value })
                      }
                      disabled={!canManage}
                      spellCheck={false}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium sm:col-span-2">
                    Model ID / Endpoint ID
                    <Input
                      value={aiDraft.model}
                      onChange={(event) =>
                        updateAi({ model: event.target.value })
                      }
                      disabled={!canManage}
                      placeholder="例如 ep-20260703xxxx"
                      spellCheck={false}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium sm:col-span-2">
                    API Key
                    <div className="flex gap-2">
                      <div className="relative min-w-0 flex-1">
                        <Input
                          type={showApiKey ? "text" : "password"}
                          value={apiKey}
                          onChange={(event) => {
                            setApiKey(event.target.value);
                            setClearApiKey(false);
                            setAiNotice(null);
                          }}
                          disabled={!canManage || clearApiKey}
                          placeholder={keyPlaceholder}
                          className="pr-10"
                          autoComplete="new-password"
                          spellCheck={false}
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="absolute top-0.5 right-1"
                              onClick={() => setShowApiKey((value) => !value)}
                              disabled={!apiKey}
                              aria-label={
                                showApiKey ? "隐藏 API Key" : "显示 API Key"
                              }
                            >
                              {showApiKey ? <EyeOff /> : <Eye />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {showApiKey ? "隐藏 API Key" : "显示 API Key"}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      {ai.apiKeyConfigured && (
                        <Button
                          type="button"
                          variant={clearApiKey ? "outline" : "destructive"}
                          onClick={() => {
                            setClearApiKey((value) => !value);
                            setApiKey("");
                            setShowApiKey(false);
                            setAiNotice(null);
                          }}
                          disabled={!canManage}
                        >
                          {clearApiKey ? <RotateCcw /> : <Trash2 />}
                          {clearApiKey ? "保留密钥" : "清除密钥"}
                        </Button>
                      )}
                    </div>
                  </label>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4 border-t pt-4">
                  <div>
                    <p className="text-sm font-medium">启用模型服务</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      停用后 AI 回复接口将明确返回不可用
                    </p>
                  </div>
                  <Switch
                    checked={aiDraft.enabled}
                    onCheckedChange={(enabled) => updateAi({ enabled })}
                    disabled={!canManage}
                    aria-label="启用模型服务"
                  />
                </div>
              </section>

              <StatusNotice notice={aiNotice} />

              {ai.lastTestedAt && (
                <section className="border bg-background p-4">
                  <div className="flex items-start gap-3">
                    {ai.lastTestStatus === "success" ? (
                      <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />
                    ) : (
                      <CircleAlert className="mt-0.5 size-4 text-destructive" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">最近连接测试</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(ai.lastTestedAt).toLocaleString("zh-CN")} ·{" "}
                        {ai.lastTestMessage}
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <section className="border bg-background p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary" />
                    <h2 className="text-sm font-semibold">客户数据保护</h2>
                  </div>
                  <Button
                    size="sm"
                    onClick={saveWorkspace}
                    disabled={!canManage || savingWorkspace}
                  >
                    {savingWorkspace ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      <Save />
                    )}
                    保存
                  </Button>
                </div>
                <div className="mt-5 flex items-center justify-between gap-4 border-t pt-5">
                  <div>
                    <p className="text-sm font-medium">隐藏敏感信息</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      在会话工作台中遮盖手机号与邮箱
                    </p>
                  </div>
                  <Switch
                    checked={workspace.maskSensitive}
                    onCheckedChange={(value) =>
                      updateWorkspace("maskSensitive", value)
                    }
                    disabled={!canManage}
                    aria-label="隐藏敏感信息"
                  />
                </div>
                <div className="mt-5 flex items-center justify-between gap-4 border-t pt-5">
                  <div>
                    <p className="text-sm font-medium">AI 高风险提示</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      回复涉及退款、合同和账户安全时提示人工确认
                    </p>
                  </div>
                  <Badge variant="outline">提示规则已启用</Badge>
                </div>
                <div className="mt-5">
                  <StatusNotice notice={workspaceNotice} />
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}
