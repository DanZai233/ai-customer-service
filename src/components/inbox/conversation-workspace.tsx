"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  ArrowUp,
  Bot,
  Check,
  ChevronDown,
  CircleUserRound,
  Clock3,
  FileText,
  Globe2,
  Mail,
  Menu,
  MessageCircleMore,
  MoreHorizontal,
  Paperclip,
  Phone,
  Search,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  conversations as initialConversations,
  type Conversation,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const channelMeta = {
  web: { label: "网页", icon: Globe2 },
  wechat: { label: "微信", icon: MessageCircleMore },
  email: { label: "邮件", icon: Mail },
};

function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: Conversation[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = conversations.filter((conversation) =>
    `${conversation.customer.name}${conversation.lastMessage}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="p-4 pb-3">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold">会话收件箱</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              4 个待处理会话
            </p>
          </div>
          <Button variant="outline" size="icon-sm" aria-label="更多会话操作">
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索客户或消息"
            className="pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="mine" className="min-h-0 flex-1 gap-0">
        <div className="border-y px-3 py-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mine">我的</TabsTrigger>
            <TabsTrigger value="unassigned">未分配</TabsTrigger>
            <TabsTrigger value="all">全部</TabsTrigger>
          </TabsList>
        </div>
        <ScrollArea className="h-[calc(100%-49px)]">
          <div className="divide-y">
            {filtered.map((conversation) => {
              const ChannelIcon = channelMeta[conversation.channel].icon;
              const selected = conversation.id === selectedId;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  className={cn(
                    "relative flex w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/60",
                    selected && "bg-primary/7 hover:bg-primary/7",
                  )}
                >
                  {selected && (
                    <span className="absolute inset-y-0 left-0 w-0.5 bg-primary" />
                  )}
                  <Avatar className="size-9 shrink-0">
                    <AvatarFallback className="bg-muted text-xs">
                      {conversation.customer.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {conversation.customer.name}
                      </span>
                      <ChannelIcon
                        className="size-3.5 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                        {conversation.updatedAt}
                      </span>
                    </span>
                    <span className="mt-1.5 flex items-center gap-2">
                      <span className="truncate text-xs text-muted-foreground">
                        {conversation.lastMessage}
                      </span>
                      {conversation.unread > 0 && (
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                          {conversation.unread}
                        </span>
                      )}
                    </span>
                    <span className="mt-2 flex items-center gap-1.5">
                      {conversation.aiManaged && (
                        <Badge
                          variant="outline"
                          className="h-5 gap-1 px-1.5 text-[10px] font-normal"
                        >
                          <Bot className="size-3" /> AI 托管
                        </Badge>
                      )}
                      {conversation.priority === "high" && (
                        <Badge
                          variant="destructive"
                          className="h-5 px-1.5 text-[10px] font-normal"
                        >
                          优先
                        </Badge>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

function CustomerPanel({ conversation }: { conversation: Conversation }) {
  return (
    <aside className="hidden h-full min-h-0 w-72 shrink-0 flex-col border-l bg-muted/10 xl:flex">
      <ScrollArea className="h-full">
        <div className="p-5">
          <div className="flex flex-col items-center text-center">
            <Avatar className="size-14">
              <AvatarFallback className="bg-primary/10 text-base text-primary">
                {conversation.customer.initials}
              </AvatarFallback>
            </Avatar>
            <p className="mt-3 text-sm font-semibold">
              {conversation.customer.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              客户 ID · {conversation.id.slice(5)}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {conversation.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="my-5" />

          <section>
            <h2 className="text-xs font-semibold text-muted-foreground">
              联系信息
            </h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex gap-3">
                <Phone className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">手机</dt>
                  <dd className="mt-0.5">{conversation.customer.phone}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="mt-0.5 size-4 text-muted-foreground" />
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">邮箱</dt>
                  <dd className="mt-0.5 truncate">
                    {conversation.customer.email}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <CircleUserRound className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">客户信息</dt>
                  <dd className="mt-0.5">
                    {conversation.customer.city} · {conversation.customer.plan}
                  </dd>
                </div>
              </div>
            </dl>
          </section>

          {conversation.order && (
            <>
              <Separator className="my-5" />
              <section>
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-muted-foreground">
                    最近订单
                  </h2>
                  <Button variant="ghost" size="xs">
                    查看全部
                  </Button>
                </div>
                <div className="mt-3 border bg-background p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs">
                      {conversation.order.id}
                    </span>
                    <Badge variant="outline" className="font-normal">
                      {conversation.order.status}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm font-semibold">
                    {conversation.order.amount}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {conversation.order.placedAt}
                  </p>
                </div>
              </section>
            </>
          )}

          <Separator className="my-5" />
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground">
              会话属性
            </h2>
            <dl className="mt-3 grid grid-cols-[76px_1fr] gap-y-3 text-xs">
              <dt className="text-muted-foreground">负责人</dt>
              <dd>{conversation.assignee}</dd>
              <dt className="text-muted-foreground">来源</dt>
              <dd>{channelMeta[conversation.channel].label}</dd>
              <dt className="text-muted-foreground">成为客户</dt>
              <dd>{conversation.customer.since}</dd>
            </dl>
          </section>
        </div>
      </ScrollArea>
    </aside>
  );
}

export function ConversationWorkspace() {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState(initialConversations[0].id);
  const [draft, setDraft] = useState("");
  const [mobileListOpen, setMobileListOpen] = useState(false);

  const selected = useMemo(
    () =>
      conversations.find((conversation) => conversation.id === selectedId) ??
      conversations[0],
    [conversations, selectedId],
  );

  function selectConversation(id: string) {
    setSelectedId(id);
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id ? { ...conversation, unread: 0 } : conversation,
      ),
    );
  }

  function toggleAiManaged() {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selected.id
          ? {
              ...conversation,
              aiManaged: !conversation.aiManaged,
              assignee: conversation.aiManaged ? "周宁" : "Luma AI",
            }
          : conversation,
      ),
    );
  }

  function sendReply() {
    const content = draft.trim();
    if (!content) return;

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selected.id
          ? {
              ...conversation,
              lastMessage: content,
              updatedAt: "刚刚",
              messages: [
                ...conversation.messages,
                {
                  id: `local-${Date.now()}`,
                  role: "agent" as const,
                  sender: "周宁",
                  content,
                  time: new Intl.DateTimeFormat("zh-CN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }).format(new Date()),
                },
              ],
            }
          : conversation,
      ),
    );
    setDraft("");
  }

  return (
    <div className="flex h-full min-h-0">
      <aside className="hidden h-full w-80 shrink-0 border-r lg:block">
        <ConversationList
          conversations={conversations}
          selectedId={selected.id}
          onSelect={selectConversation}
        />
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-muted/15">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4">
          <Sheet open={mobileListOpen} onOpenChange={setMobileListOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="size-5" />
                <span className="sr-only">打开会话列表</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>会话列表</SheetTitle>
              </SheetHeader>
              <ConversationList
                conversations={conversations}
                selectedId={selected.id}
                onSelect={(id) => {
                  selectConversation(id);
                  setMobileListOpen(false);
                }}
              />
            </SheetContent>
          </Sheet>
          <Avatar className="size-9">
            <AvatarFallback className="bg-muted text-xs">
              {selected.customer.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">
                {selected.customer.name}
              </p>
              {selected.priority === "high" && (
                <span className="size-1.5 rounded-full bg-destructive" />
              )}
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" /> 在线 ·{" "}
              {channelMeta[selected.channel].label}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant={selected.aiManaged ? "outline" : "default"}
              size="sm"
              onClick={toggleAiManaged}
              className="hidden sm:flex"
            >
              {selected.aiManaged ? (
                <UserRoundCheck className="size-4" />
              ) : (
                <Bot className="size-4" />
              )}
              {selected.aiManaged ? "人工接管" : "交给 AI"}
            </Button>
            <Button variant="outline" size="icon-sm" aria-label="标记为已解决">
              <Check className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="更多会话操作"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Clock3 />
                  稍后处理
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive />
                  归档会话
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <ScrollArea className="min-h-0 flex-1">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:px-8">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <Separator className="flex-1" />
              今天
              <Separator className="flex-1" />
            </div>
            {selected.messages.map((message) => {
              if (message.role === "system") {
                return (
                  <div
                    key={message.id}
                    className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
                  >
                    <Sparkles className="size-3.5 text-primary" />
                    {message.content}
                  </div>
                );
              }

              const outgoing =
                message.role === "assistant" || message.role === "agent";
              return (
                <div
                  key={message.id}
                  className={cn("flex gap-2.5", outgoing && "justify-end")}
                >
                  {!outgoing && (
                    <Avatar className="mt-1 size-7">
                      <AvatarFallback className="text-[10px]">
                        {selected.customer.initials}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("max-w-[78%]", outgoing && "text-right")}>
                    {message.sender && (
                      <p className="mb-1 text-[11px] text-muted-foreground">
                        {message.sender}
                      </p>
                    )}
                    <div
                      className={cn(
                        "inline-block rounded-md px-3.5 py-2.5 text-left text-sm leading-6 shadow-xs",
                        outgoing
                          ? "bg-foreground text-background"
                          : "border bg-background",
                      )}
                    >
                      {message.content}
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {message.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <footer className="shrink-0 border-t bg-background p-3 sm:p-4">
          <div className="mx-auto max-w-3xl border bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring/30">
            <div className="flex items-center gap-1 border-b px-2 py-1.5">
              <Button variant="ghost" size="xs">
                <MessageCircleMore />
                回复
              </Button>
              <Button
                variant="ghost"
                size="xs"
                className="text-muted-foreground"
              >
                内部备注
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                className="ml-auto"
                aria-label="选择回复身份"
              >
                <ChevronDown className="size-3.5" />
              </Button>
            </div>
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendReply();
                }
              }}
              placeholder="输入回复，按 Enter 发送，Shift + Enter 换行"
              className="min-h-20 resize-none border-0 shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center gap-1 px-2 pb-2">
              <Button variant="ghost" size="icon-sm" aria-label="添加附件">
                <Paperclip className="size-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" aria-label="插入快捷回复">
                <FileText className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-primary">
                <Sparkles className="size-4" />
                AI 润色
              </Button>
              <Button
                size="icon-sm"
                className="ml-auto"
                onClick={sendReply}
                disabled={!draft.trim()}
                aria-label="发送回复"
              >
                <ArrowUp className="size-4" />
              </Button>
            </div>
          </div>
        </footer>
      </main>

      <CustomerPanel conversation={selected} />
    </div>
  );
}
