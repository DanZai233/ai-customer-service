# AI 助手

## 职责

为人工客服生成可审核的回复建议，结合知识上下文进行流式输出，并在未配置模型时提供明确的演示回退。

## 主要流程

1. 客户问题发送到 `POST /api/ai/suggest`。
2. 服务端提取最新问题并构建知识上下文。
3. 已配置模型时通过 AI SDK 6 流式调用；否则返回演示建议。
4. 浏览器使用 AI Elements 渲染 Markdown 和流式状态。

## 代码入口

- `src/app/(workspace)/ai/page.tsx`
- `src/components/ai/assistant-panel.tsx`
- `src/app/api/ai/suggest/route.ts`
- `src/lib/ai/provider.ts`

## 模型供应商

- 火山引擎方舟：`AI_PROVIDER=volcengine` + `ARK_*`。
- 其他 OpenAI 兼容服务：`AI_BASE_URL`、`AI_API_KEY`、`AI_MODEL`。
- 详细配置见 `docs/model-configuration.md`。

## 安全边界

- API Key 只读取服务端环境变量，不返回浏览器。
- 退款、合同、账户安全和赔付必须提示人工确认。
- 当前知识上下文仍为本地检索，生产环境需增加引用记录、评测和成本审计。
