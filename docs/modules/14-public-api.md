# 开放 API 与密钥管理

## 职责

为网站、App、业务系统和渠道适配器提供稳定的服务端接入入口。

## 入口

- `POST /api/v1/conversations`
- `GET /api/v1/conversations/{conversationId}`
- `POST /api/v1/conversations/{conversationId}/messages`
- `GET /api/openapi.json`
- `GET|POST /api/developer/keys`
- `DELETE /api/developer/keys/{keyId}`

## 鉴权

管理员创建的密钥以 `luma_live_` 开头，只在创建响应中返回一次。数据库仅保存 SHA-256 摘要、前缀和末四位，密钥支持权限范围、过期和吊销。

```http
Authorization: Bearer luma_live_xxx
```

权限范围：

- `conversations:read`
- `conversations:write`
- `ai:generate`（为后续生成接口预留）

## 幂等

写接口支持 `Idempotency-Key`。相同 API Key 和幂等键在 24 小时内返回首次结果；若请求体不同则返回 `409 idempotency_conflict`。外部会话 ID 和消息 ID 还会提供资源级幂等保护。

## 错误契约

公共接口使用带机器可读错误码的统一结构，并在响应头和响应体中返回请求 ID：

```json
{
  "error": { "code": "validation_error", "message": "请求数据不合法" },
  "requestId": "..."
}
```

## 当前边界

当前版本提供会话写入和读取；消息推送回调、分页列表、速率限制和正式 SDK 仍属于后续模块。
