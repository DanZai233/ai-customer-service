"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpenText,
  Bot,
  Cable,
  Menu,
  MessageSquareText,
  Settings,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/inbox", label: "会话", icon: MessageSquareText },
  { href: "/knowledge", label: "知识库", icon: BookOpenText },
  { href: "/ai", label: "AI 助手", icon: Bot },
  { href: "/analytics", label: "数据分析", icon: BarChart3 },
  { href: "/channels", label: "渠道", icon: Cable },
  { href: "/team", label: "团队", icon: Users },
];

function Brand() {
  return (
    <Link
      href="/inbox"
      className="flex items-center gap-3"
      aria-label="Luma 首页"
    >
      <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <MessageSquareText className="size-4" aria-hidden="true" />
      </span>
      <span className="text-sm font-semibold md:hidden">Luma 客服中台</span>
    </Link>
  );
}

function Navigation({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex gap-1", compact ? "flex-col" : "flex-col px-2")}>
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        const item = (
          <Link
            href={href}
            aria-label={compact ? label : undefined}
            className={cn(
              "flex h-10 items-center rounded-md text-sm transition-colors",
              compact ? "w-10 justify-center" : "gap-3 px-3",
              active
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {!compact && <span>{label}</span>}
          </Link>
        );

        if (!compact) return <div key={href}>{item}</div>;

        return (
          <Tooltip key={href}>
            <TooltipTrigger asChild>{item}</TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div className="flex h-dvh min-h-[640px] overflow-hidden bg-background">
        <aside className="hidden w-16 shrink-0 flex-col items-center border-r bg-muted/20 py-3 md:flex">
          <Brand />
          <Separator className="my-3 w-8" />
          <Navigation compact />
          <div className="mt-auto flex flex-col items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/settings">
                    <Settings className="size-4" />
                    <span className="sr-only">设置</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">设置</TooltipContent>
            </Tooltip>
            <Avatar className="size-8">
              <AvatarFallback className="bg-foreground text-xs text-background">
                周
              </AvatarFallback>
            </Avatar>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 md:hidden">
            <Brand />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="size-5" />
                  <span className="sr-only">打开导航</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="border-b p-4 text-left">
                  <SheetTitle>Luma 客服中台</SheetTitle>
                </SheetHeader>
                <div className="py-3">
                  <Navigation />
                </div>
              </SheetContent>
            </Sheet>
          </header>
          <div className="min-h-0 flex-1">{children}</div>
        </div>
      </div>
    </TooltipProvider>
  );
}
