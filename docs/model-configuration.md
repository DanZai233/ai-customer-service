# 大模型配置

系统通过服务端环境变量连接 OpenAI 兼容接口。API Key 不会发送到浏览器，也不会由设置页保存。

## 启用方式

复制配置文件并填写一个模型服务：

```bash
cp .env.example .env.local
```

修改 `.env.local` 后重启开发服务。访问 `/settings` 的“AI 配置”页确认状态，或请求 `/api/health` 查看 `aiMode` 和 `aiModel`。

## 火山引擎方舟（豆包）

```dotenv
AI_PROVIDER=volcengine
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
ARK_API_KEY=你的方舟 API Key
ARK_MODEL=你的 Model ID 或 Endpoint ID
```

`ARK_BASE_URL` 可省略，系统默认使用北京区域地址。`ARK_MODEL` 可填写已开通服务的 Model ID；需要多应用隔离或更细粒度管理时，也可填写方舟控制台创建的 `ep-...` Endpoint ID。

Docker 运行时修改配置后重新创建 Web 容器：

```bash
docker compose up -d --no-build --force-recreate luma
```

## DeepSeek

```dotenv
AI_PROVIDER_NAME=DeepSeek
AI_BASE_URL=https://api.deepseek.com
AI_API_KEY=你的 DeepSeek API Key
AI_MODEL=deepseek-v4-flash
```

## 通义千问（阿里云百炼）

```dotenv
AI_PROVIDER_NAME=通义千问
AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_API_KEY=你的百炼 API Key
AI_MODEL=你的模型 ID
```

生产环境建议按照阿里云控制台给出的地域和业务空间地址替换共享 Base URL。

## 本地 Ollama

先在宿主机拉取并运行所需模型，再配置：

```dotenv
AI_PROVIDER_NAME=Ollama
AI_BASE_URL=http://localhost:11434/v1
AI_API_KEY=ollama
AI_MODEL=你的本地模型名称
```

应用运行在 Docker 内时，将 `localhost` 改为 `host.docker.internal`。

## 其他服务

OpenAI、Azure 网关或其他兼容服务只需提供对应的 Base URL、API Key 和模型 ID。若三项中任意一项缺失，系统会明确进入演示模式，不会发起外部模型请求。
