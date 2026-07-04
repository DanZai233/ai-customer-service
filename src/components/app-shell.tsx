"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpenText,
  Bot,
  Cable,
  CodeXml,
  LogOut,
  LayoutTemplate,
  Menu,
  MessageSquareText,
  Settings,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { authClient } from "@/lib/auth/client";
import {
  can,
  roleLabels,
  type Permission,
  type Role,
} from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";

const navigation = [
  {
    href: "/inbox",
    label: "会话",
    icon: MessageSquareText,
    permission: "conversation.read",
  },
  {
    href: "/knowledge",
    label: "知识库",
    icon: BookOpenText,
    permission: "knowledge.read",
  },
  { href: "/ai", label: "AI 助手", icon: Bot, permission: "ai.use" },
  {
    href: "/analytics",
    label: "数据分析",
    icon: BarChart3,
    permission: "analytics.read",
  },
  {
    href: "/channels",
    label: "渠道",
    icon: Cable,
    permission: "channels.manage",
  },
  { href: "/team", label: "团队", icon: Users, permission: "team.read" },
  {
    href: "/developer",
    label: "开发者",
    icon: CodeXml,
    permission: "settings.read",
  },
  {
    href: "/templates",
    label: "行业模板",
    icon: LayoutTemplate,
    permission: "knowledge.read",
  },
] satisfies Array<{
  href: string;
  label: string;
  icon: typeof MessageSquareText;
  permission: Permission;
}>;

type ShellUser = {
  name: string;
  email: string;
  role: Role;
};

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

function Navigation({
  role,
  compact = false,
}: {
  role: Role;
  compact?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex gap-1", compact ? "flex-col" : "flex-col px-2")}>
      {navigation
        .filter((item) => can(role, item.permission))
        .map(({ href, label, icon: Icon }) => {
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

function UserMenu({ user }: { user: ShellUser }) {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="账户菜单">
          <Avatar className="size-8">
            <AvatarFallback className="bg-foreground text-xs text-background">
              {user.name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="w-52">
        <DropdownMenuLabel>
          <span className="block truncate text-foreground">{user.name}</span>
          <span className="mt-0.5 block truncate font-normal">
            {user.email}
          </span>
          <span className="mt-1 block font-normal text-primary">
            {roleLabels[user.role]}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut}>
          <LogOut />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: ShellUser;
}) {
  return (
    <TooltipProvider>
      <div className="flex h-dvh min-h-[640px] overflow-hidden bg-background">
        <aside className="hidden w-16 shrink-0 flex-col items-center border-r bg-muted/20 py-3 md:flex">
          <Brand />
          <Separator className="my-3 w-8" />
          <Navigation role={user.role} compact />
          <div className="mt-auto flex flex-col items-center gap-2">
            {can(user.role, "settings.read") && (
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
            )}
            <UserMenu user={user} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 md:hidden">
            <Brand />
            <div className="flex items-center gap-1">
              <UserMenu user={user} />
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
                    <Navigation role={user.role} />
                    {can(user.role, "settings.read") && (
                      <div className="px-2 pt-1">
                        <Link
                          href="/settings"
                          className="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Settings className="size-4" />
                          设置
                        </Link>
                      </div>
                    )}
                    <div className="mt-3 border-t px-5 pt-3">
                      <p className="truncate text-sm font-medium">
                        {user.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {roleLabels[user.role]} · {user.email}
                      </p>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </header>
          <div className="min-h-0 flex-1">{children}</div>
        </div>
      </div>
    </TooltipProvider>
  );
}
