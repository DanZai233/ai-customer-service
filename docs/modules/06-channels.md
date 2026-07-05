# 渠道管理

## 职责

展示开放 API、Web、微信和邮件渠道的真实接入状态与会话数据。

## 代码入口

- `src/app/(workspace)/channels/page.tsx`
- `src/components/operations/channel-settings.tsx`
- `src/lib/channels/repository.ts`
- `docs/integrations.md`

## 当前实现

页面从 PostgreSQL 聚合每个渠道的全部会话和未结会话，并根据有效的 `conversations:write` API Key 判断标准 API 是否可接入。最近调用时间读取 API Key 的真实 `lastUsedAt`。

已移除虚构的生产网站、客服邮箱、CDN 脚本、Chatwoot 连接和本地状态开关。微信、邮件原生连接器未实现时会明确标记为未上线；通过标准 API 写入的历史数据仍计入对应渠道统计。

## 已上线接入

- `POST /api/v1/conversations`：创建客户、会话和首条消息。
- `POST /api/v1/conversations/:id/messages`：追加客户消息。
- `GET /api/v1/conversations/:id`：读取会话及消息。
- 开发者中心可创建、吊销 API Key，并复制 cURL、JavaScript、Python 与 Next.js 示例。

## 原生连接器目标契约

1. 外部 Webhook 经过签名验证和租户解析。
2. 使用外部消息 ID 保证幂等写入。
3. 原始事件进入队列后再规范化为客户、会话和消息。
4. 回复通过渠道适配器发送，并记录外部回执和失败重试。

## 安全边界

渠道密钥只允许服务端保存；必须提供重放保护、速率限制、重试队列、死信和审计日志。
