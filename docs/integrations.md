# 外部服务接入

## AI 模型

系统使用 AI SDK 的 OpenAI Compatible Provider。管理员在“设置 → AI 配置”中保存 Base URL、API Key 和 Model ID，保存后立即生效。

未配置时 `/api/ai/suggest` 自动进入演示模式，方便本地开发和界面验收。

火山引擎方舟、DeepSeek、通义千问和 Ollama 的完整样例参见 [大模型配置](model-configuration.md)。

## PostgreSQL

设置 `DATABASE_URL` 后，收件箱会使用 PostgreSQL 仓储。首次运行：

```bash
npm run db:migrate
npm run db:seed
```

不设置 `DATABASE_URL` 时使用内存演示仓储，仅适合界面开发。Docker Compose 会自动启动数据库、执行迁移和种子脚本。

## Chatwoot

建议使用一个独立渠道适配服务完成以下数据流：

1. 订阅 Chatwoot 的 `message_created` 和 `conversation_status_changed` Webhook。
2. 用 `conversation_id` 作为幂等键，把客户消息写入会话服务。
3. AI 托管状态下调用 `/api/ai/suggest`；人工接管后停止自动回复。
4. 通过 Chatwoot Messages API 将审核后的回复写回原会话。

生产环境必须验证 Webhook 签名，并避免把 Chatwoot Token 暴露给浏览器。

## 健康检查

`GET /api/health` 返回服务状态以及当前 AI 模式，可供容器编排和监控系统探活。
