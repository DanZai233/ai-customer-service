"use client";

import { useMemo, useState } from "react";
import {
  ArrowUp,
  Bot,
  Check,
  CircleUserRound,
  Clock3,
  Globe2,
  Mail,
  Menu,
  MessageCircleMore,
  MoreHorizontal,
  Phone,
  RotateCcw,
  Search,
  Sparkles,
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
import type {
  Conversation,
  ConversationPatch,
} from "@/lib/conversations/types";
import { cn } from "@/lib/utils";

const channelMeta = {
  web: { label: "网页", icon: Globe2 },
  wechat: { label: "微信", icon: MessageCircleMore },
  email: { label: "邮件", icon: Mail },
};

function ConversationList({
  conversations,
  selectedId,
  agentName,
  onSelect,
}: {
  conversations: Conversation[];
  selectedId: string;
  agentName: string;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const filtered = conversations.filter((conversation) => {
    const matchesScope =
      scope === "all" ||
      (scope === "mine" && conversation.assignee === agentName) ||
      (scope === "unassigned" && conversation.assignee === "未分配");
    const matchesQuery =
      `${conversation.customer.name}${conversation.lastMessage}`
        .toLowerCase()
        .includes(query.toLowerCase());
    return matchesScope && matchesQuery;
  });

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="p-4 pb-3">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold">会话收件箱</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {
                conversations.filter((item) => item.status !== "resolved")
                  .length
              }{" "}
              个待处理会话
            </p>
          </div>
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

      <Tabs
        value={scope}
        onValueChange={setScope}
        className="min-h-0 flex-1 gap-0"
      >
        <div className="border-y px-3 py-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mine">我的</TabsTrigger>
            <TabsTrigger value="unassigned">未分配</TabsTrigger>
            <TabsTrigger value="all">全部</TabsTrigger>
          </TabsList>
        </div>
        <ScrollArea className="h-[calc(100%-49px)]">
          <div className="divide-y">
            {filtered.length === 0 ? (
              <p className="px-4 py-10 text-center text-xs text-muted-foreground">
                当前范围没有会话
              </p>
            ) : null}
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
              客户 ID · {conversation.customer.id}
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
                <h2 className="text-xs font-semibold text-muted-foreground">
                  最近订单
                </h2>
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

async function parseConversationResponse(response: Response) {
  const payload = (await response.json()) as {
    data?: Conversation;
    error?: string;
  };
  if (!response.ok || !payload.data) {
    throw new Error(payload.error ?? "操作失败，请稍后重试");
  }
  return payload.data;
}

export function ConversationWorkspace({
  initialConversations,
  agentName,
}: {
  initialConversations: Conversation[];
  agentName: string;
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState(initialConversations[0].id);
  const [draft, setDraft] = useState("");
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(
    () =>
      conversations.find((conversation) => conversation.id === selectedId) ??
      conversations[0],
    [conversations, selectedId],
  );

  function replaceConversation(updated: Conversation) {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === updated.id ? updated : conversation,
      ),
    );
  }

  async function patchConversation(
    conversationId: string,
    patch: ConversationPatch,
  ) {
    const response = await fetch(`/api/conversations/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    return parseConversationResponse(response);
  }

  function selectConversation(id: string) {
    setSelectedId(id);
    const unread = conversations.find((item) => item.id === id)?.unread ?? 0;
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id ? { ...conversation, unread: 0 } : conversation,
      ),
    );
    if (unread > 0) {
      void patchConversation(id, { unread: 0 })
        .then(replaceConversation)
        .catch((requestError: Error) => setError(requestError.message));
    }
  }

  async function updateStatus(status: Conversation["status"]) {
    const previous = selected;
    replaceConversation({ ...selected, status, unread: 0 });
    setError(null);
    setPendingAction("status");

    try {
      replaceConversation(
        await patchConversation(selected.id, { status, unread: 0 }),
      );
    } catch (requestError) {
      replaceConversation(previous);
      setError((requestError as Error).message);
    } finally {
      setPendingAction(null);
    }
  }

  function restoreConversation(previous: Conversation) {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === previous.id ? previous : conversation,
      ),
    );
  }

  async function sendReply() {
    const content = draft.trim();
    if (!content || pendingAction === "send") return;

    const previous = selected;
    const temporaryId = `local-${Date.now()}`;
    setError(null);
    setPendingAction("send");

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selected.id
          ? {
              ...conversation,
              lastMessage: content,
              updatedAt: "刚刚",
              assignee: agentName,
              aiManaged: false,
              status: "open",
              messages: [
                ...conversation.messages,
                {
                  id: temporaryId,
                  role: "agent" as const,
                  sender: agentName,
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

    try {
      const response = await fetch(
        `/api/conversations/${selected.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        },
      );
      replaceConversation(await parseConversationResponse(response));
    } catch (requestError) {
      restoreConversation(previous);
      setDraft(content);
      setError((requestError as Error).message);
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="flex h-full min-h-0">
      <aside className="hidden h-full w-80 shrink-0 border-r lg:block">
        <ConversationList
          conversations={conversations}
          selectedId={selected.id}
          agentName={agentName}
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
                agentName={agentName}
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
            <p className="mt-0.5 text-xs text-muted-foreground">
              {channelMeta[selected.channel].label} ·{" "}
              {selected.status === "open"
                ? "处理中"
                : selected.status === "pending"
                  ? "稍后处理"
                  : "已解决"}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => updateStatus("resolved")}
              disabled={
                selected.status === "resolved" || pendingAction === "status"
              }
              aria-label="标记为已解决"
            >
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
                <DropdownMenuItem
                  onClick={() =>
                    updateStatus(
                      selected.status === "open" ? "pending" : "open",
                    )
                  }
                >
                  {selected.status === "open" ? <Clock3 /> : <RotateCcw />}
                  {selected.status === "open" ? "稍后处理" : "重新打开"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <ScrollArea className="min-h-0 flex-1">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:px-8">
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
          {error && (
            <p
              role="alert"
              className="mx-auto mb-2 max-w-3xl text-xs text-destructive"
            >
              {error}
            </p>
          )}
          <div className="mx-auto max-w-3xl border bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring/30">
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
              <Button
                size="icon-sm"
                className="ml-auto"
                onClick={sendReply}
                disabled={!draft.trim() || pendingAction === "send"}
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
