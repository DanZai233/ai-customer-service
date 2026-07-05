# 外部服务接入

## AI 模型

系统使用 AI SDK 的 OpenAI Compatible Provider。管理员在“设置 → AI 配置”中保存 Base URL、API Key 和 Model ID，保存后立即生效。

未配置时 `/api/ai/suggest` 返回 `503`，避免在生产环境把模拟内容误认为模型输出。

火山引擎方舟与 OpenAI 兼容服务的配置说明参见 [大模型配置](model-configuration.md)。

## PostgreSQL

设置 `DATABASE_URL` 后，收件箱会使用 PostgreSQL 仓储。首次运行：

```bash
npm run db:migrate
npm run db:seed
```

`DATABASE_URL` 是必需配置。Docker Compose 会自动启动数据库、执行迁移和基础种子脚本；数据库不可用时服务不会回退到内存数据。

## 尚未上线的原生连接器

微信、邮件和 Chatwoot 目前没有运行中的原生连接器，也没有环境变量占位配置。后续连接器需要完成以下数据流后才能在渠道页标记为可用：

1. 订阅 Chatwoot 的 `message_created` 和 `conversation_status_changed` Webhook。
2. 用 `conversation_id` 作为幂等键，把客户消息写入会话服务。
3. AI 托管状态下调用 `/api/ai/suggest`；人工接管后停止自动回复。
4. 通过 Chatwoot Messages API 将审核后的回复写回原会话。

生产环境必须验证 Webhook 签名，并避免把 Chatwoot Token 暴露给浏览器。

## 健康检查

`GET /api/health` 返回服务状态以及当前 AI 模式，可供容器编排和监控系统探活。

## 开放 API

管理员可在“开发者中心”创建独立 API Key，并一键复制 cURL、JavaScript、Python 或 Next.js 服务端示例。正式契约由 `GET /api/openapi.json` 提供，公共接口统一位于 `/api/v1`。

API Key 只能保存在服务端。网站或 App 应通过自有服务端代理请求，不能把密钥写入公开 JavaScript 包或客户端安装包。
