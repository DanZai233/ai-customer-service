import { ArrowRight, Bot, CircleCheck, MessagesSquare } from "lucide-react";

import { Button } from "@/components/ui/button";

const modules = [
  { icon: CircleCheck, label: "工程基座", status: "已完成" },
  { icon: MessagesSquare, label: "会话工作台", status: "下一模块" },
  { icon: Bot, label: "AI 与知识库", status: "计划中" },
];

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/35 px-6 py-12">
      <section className="w-full max-w-3xl border bg-background p-8 shadow-sm sm:p-12">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <MessagesSquare className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold">Luma 客服中台</p>
            <p className="text-sm text-muted-foreground">工程基座已就绪</p>
          </div>
        </div>

        <h1 className="max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
          AI 先接待，复杂问题交给真正擅长的人。
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          统一管理客户会话、知识库、AI
          回复和人工协作。当前版本正在按模块持续交付。
        </p>

        <div className="mt-10 grid gap-px overflow-hidden border bg-border sm:grid-cols-3">
          {modules.map(({ icon: Icon, label, status }) => (
            <div key={label} className="bg-background p-4">
              <Icon className="mb-3 size-4 text-primary" aria-hidden="true" />
              <p className="text-sm font-medium">{label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{status}</p>
            </div>
          ))}
        </div>

        <Button className="mt-8" disabled>
          进入工作台
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </section>
    </main>
  );
}
