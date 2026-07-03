# 外部服务接入

## AI 模型

系统使用 AI SDK 的 OpenAI Compatible Provider。复制 `.env.example` 为 `.env.local` 后配置：

```bash
AI_BASE_URL=https://your-provider.example/v1
AI_API_KEY=your-secret
AI_MODEL=your-model-id
```

未配置时 `/api/ai/suggest` 自动进入演示模式，方便本地开发和界面验收。

## Chatwoot

建议使用一个独立渠道适配服务完成以下数据流：

1. 订阅 Chatwoot 的 `message_created` 和 `conversation_status_changed` Webhook。
2. 用 `conversation_id` 作为幂等键，把客户消息写入会话服务。
3. AI 托管状态下调用 `/api/ai/suggest`；人工接管后停止自动回复。
4. 通过 Chatwoot Messages API 将审核后的回复写回原会话。

生产环境必须验证 Webhook 签名，并避免把 Chatwoot Token 暴露给浏览器。

## 健康检查

`GET /api/health` 返回服务状态以及当前 AI 模式，可供容器编排和监控系统探活。
