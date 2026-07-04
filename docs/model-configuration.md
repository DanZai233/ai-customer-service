# 大模型配置

模型连接信息保存在 PostgreSQL，管理员可以在“设置 → AI 配置”中修改。保存后下一次 AI 请求立即使用新配置，不需要修改环境变量、重建镜像或重启服务。

## 火山引擎方舟（豆包）

在供应商类型中选择“火山引擎方舟”，填写：

- Base URL：默认 `https://ark.cn-beijing.volces.com/api/v3`
- Model ID / Endpoint ID：已开通模型的 ID，或方舟推理接入点 `ep-...`
- API Key：方舟控制台生成的 API Key

保存后点击“测试连接”。测试会发起一个最多 8 个输出 Token 的最小请求，并在数据库记录结果与时间。

## OpenAI 兼容服务

选择“OpenAI 兼容接口”，填写供应商名称、Base URL、Model ID 和 API Key。常见 Base URL：

| 服务        | Base URL 示例                                       |
| ----------- | --------------------------------------------------- |
| DeepSeek    | `https://api.deepseek.com`                          |
| 通义千问    | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| 本地 Ollama | `http://host.docker.internal:11434/v1`              |

模型 ID 以对应供应商控制台当前提供的值为准。本地 Ollama 通常可使用任意非空 API Key 占位。

## 密钥处理

- API Key 通过受保护的服务端接口提交。
- 服务端使用 AES-256-GCM 加密后写入 PostgreSQL。
- 页面只显示是否已配置和末四位，不回传明文或数据库密文。
- API Key 输入留空并保存会保留旧值；使用“清除密钥”才会删除。
- 每个组织保存独立配置，AI 请求按当前登录用户的组织读取。

## 部署根密钥

配置加密主密钥不属于日常业务配置，不能在后台修改。Docker Compose 首次启动时自动生成并保存到 `luma-secrets` 卷；直接使用 Node.js 部署时，通过 `CONFIG_ENCRYPTION_KEY` 或 `CONFIG_ENCRYPTION_KEY_FILE` 提供。

根密钥丢失后已有 API Key 无法解密。生产环境应备份密钥并限制读取权限。

## 演示模式

缺少 Base URL、Model ID 或 API Key，或者模型服务被停用时，系统进入演示模式，不会请求外部模型。`GET /api/health` 会返回当前 AI 模式和模型 ID。
