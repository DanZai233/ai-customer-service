"use client";

import { useState } from "react";
import { Check, KeyRound, Save, ShieldCheck } from "lucide-react";

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

export function SystemSettings() {
  const [saved, setSaved] = useState(false);
  const [autoResolve, setAutoResolve] = useState(true);
  const [maskSensitive, setMaskSensitive] = useState(true);

  function save() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 4000);
  }

  return (
    <div className="h-full overflow-auto bg-muted/15 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">设置</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              工作空间、AI 策略与安全配置
            </p>
          </div>
          <Button size="sm" onClick={save}>
            {saved ? <Check className="size-4" /> : <Save className="size-4" />}
            {saved ? "已保存" : "保存更改"}
          </Button>
        </header>

        <Tabs defaultValue="workspace" className="gap-4">
          <TabsList>
            <TabsTrigger value="workspace">工作空间</TabsTrigger>
            <TabsTrigger value="ai">AI 配置</TabsTrigger>
            <TabsTrigger value="security">安全</TabsTrigger>
          </TabsList>

          <TabsContent value="workspace" className="space-y-4">
            <section className="border bg-background p-5">
              <h2 className="text-sm font-semibold">基本信息</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">
                  工作空间名称
                  <Input defaultValue="Luma 演示客服中心" />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  默认时区
                  <Select defaultValue="asia-shanghai">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia-shanghai">
                        Asia/Shanghai
                      </SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
                <label className="space-y-2 text-sm font-medium">
                  服务语言
                  <Select defaultValue="zh-cn">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh-cn">简体中文</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
                <label className="space-y-2 text-sm font-medium">
                  工作日服务时间
                  <Input defaultValue="09:00 - 21:00" />
                </label>
              </div>
            </section>
            <section className="border bg-background p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold">自动解决会话</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    客户明确表示问题已解决时自动关闭会话。
                  </p>
                </div>
                <Switch
                  checked={autoResolve}
                  onCheckedChange={setAutoResolve}
                  aria-label="自动解决会话"
                />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <section className="border bg-background p-5">
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">OpenAI 兼容模型</h2>
                <Badge variant="secondary" className="ml-auto font-normal">
                  服务端环境变量
                </Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                密钥不会保存在浏览器。请在部署环境中配置以下变量，未配置时系统使用演示模式。
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">
                  AI_BASE_URL
                  <Input value="https://api.example.com/v1" readOnly />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  AI_MODEL
                  <Input value="your-model-id" readOnly />
                </label>
                <label className="space-y-2 text-sm font-medium sm:col-span-2">
                  AI_API_KEY
                  <Input
                    type="password"
                    value="configured-on-server"
                    readOnly
                  />
                </label>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <section className="border bg-background p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">客户数据保护</h2>
              </div>
              <div className="mt-5 flex items-center justify-between gap-4 border-t pt-5">
                <div>
                  <p className="text-sm font-medium">隐藏敏感信息</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    在会话和日志中遮盖手机号、邮箱与证件号码。
                  </p>
                </div>
                <Switch
                  checked={maskSensitive}
                  onCheckedChange={setMaskSensitive}
                  aria-label="隐藏敏感信息"
                />
              </div>
              <div className="mt-5 flex items-center justify-between gap-4 border-t pt-5">
                <div>
                  <p className="text-sm font-medium">高风险操作审批</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    退款、合同和账户操作必须由人工客服确认。
                  </p>
                </div>
                <Badge variant="outline">强制启用</Badge>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
