import type { Metadata } from "next";
import { MessageSquareText, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { getAuthContext } from "@/lib/auth/context";

export const metadata: Metadata = { title: "登录" };
export const dynamic = "force-dynamic";

export default async function SignInPage() {
  if (await getAuthContext()) redirect("/inbox");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/20 p-5">
      <section className="w-full max-w-sm border bg-background p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <MessageSquareText className="size-5" />
          </span>
          <div>
            <h1 className="text-lg font-semibold">Luma 客服中台</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">登录工作空间</p>
          </div>
        </div>
        <SignInForm />
        <div className="mt-6 flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground">
          <ShieldCheck className="size-4" />
          企业会话与客户数据受角色权限保护
        </div>
      </section>
    </main>
  );
}
