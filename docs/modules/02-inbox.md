# 会话工作台

## 职责

聚合网页、微信和邮件会话，供客服读取消息、查看客户与订单信息、发送回复、切换 AI 托管、标记已读和解决会话。

## 主要流程

1. `/inbox` 服务端读取当前组织的会话列表。
2. 客服选择会话时将未读数写回后端。
3. 发送回复时先乐观更新界面，再调用消息 API；失败则恢复原状态。
4. AI/人工切换和解决状态通过会话 PATCH API 持久化。

## 代码入口

- `src/app/(workspace)/inbox/page.tsx`
- `src/components/inbox/conversation-workspace.tsx`
- `src/app/api/conversations`
- `src/lib/conversations`

## API

- `GET /api/conversations`：读取会话与消息。
- `PATCH /api/conversations/:id`：更新状态、负责人、标签、托管和未读数。
- `POST /api/conversations/:id/messages`：写入客户、AI 或人工消息。

## 数据

使用 `customers`、`conversations`、`messages` 和 `orders` 表，通过 `organizationId` 隔离租户。PostgreSQL 是唯一运行时数据源，数据库不可用时接口明确失败。

## 验收与边界

- 已验证消息写入、状态更新、刷新后持久化和失败回滚。
- 附件、内部备注、批量分配、SLA 和实时推送尚未实现。
