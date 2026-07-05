# 运行时配置中心

## 目标

把需要频繁调整的工作空间与大模型配置保存到 PostgreSQL。管理员保存后，后续请求立即读取新配置，无需修改环境变量、重建镜像或重启服务。

## 代码入口

- `src/db/schema.ts`
- `src/lib/settings/service.ts`
- `src/lib/settings/crypto.ts`
- `src/lib/settings/validation.ts`
- `src/app/api/settings/route.ts`
- `src/app/api/settings/workspace/route.ts`
- `src/app/api/settings/ai/route.ts`
- `src/app/api/settings/ai/test/route.ts`

## 数据模型

- `organization_settings`：时区、语言、服务时间、自动解决和敏感信息遮盖策略。
- `ai_provider_settings`：供应商、Base URL、Model ID、启用状态、加密后的 API Key 和最近测试结果。
- 所有设置都以 `organization_id` 隔离，接口只使用当前登录用户所属组织。

## 密钥安全

- API Key 使用 AES-256-GCM 加密后写入 PostgreSQL。
- 浏览器只会收到 `apiKeyConfigured` 和末四位提示，不会收到明文或密文。
- `CONFIG_ENCRYPTION_KEY` 或 `CONFIG_ENCRYPTION_KEY_FILE` 是部署根密钥，不能通过后台修改。
- 如果未单独设置配置根密钥，当前版本会兼容使用 Better Auth 根密钥。

## API

- `GET /api/settings`：读取当前组织的公开配置，需要 `settings.read`。
- `PATCH /api/settings/workspace`：更新工作空间设置，需要 `settings.manage`。
- `PATCH /api/settings/ai`：更新 AI 配置；API Key 留空时保留旧值，需要 `settings.manage`。
- `POST /api/settings/ai/test`：用已保存配置发起最小模型请求并记录结果，需要 `settings.manage`。

## 运行时行为

- AI 回复接口在每次请求时按组织读取数据库配置。
- 自动解决设置用于客户消息写入策略；敏感信息设置用于会话读取时的手机号与邮箱遮盖。
- 模型客户端只按非敏感连接参数和 API Key 哈希缓存，不把明文密钥放进缓存键。
- 没有完整配置或配置被停用时，AI 回复接口返回 `503`，不生成模拟内容。
- 旧版 `ARK_*` 或 `AI_*` 变量只会在种子阶段、数据库尚无配置时导入一次，不参与后续运行时读取。

## 验收

1. 管理员能读取和更新本组织设置。
2. 普通无权限角色不能修改配置。
3. 配置响应中不出现 API Key 明文或数据库密文。
4. 保存新模型配置后无需重启，下一次 AI 请求立即使用新配置。
5. 修改部署根密钥后，旧密文不能被解密，避免静默使用错误密钥。
6. 工作空间策略保存后无需重启，下一次会话读写立即使用新值。
