# 系统设置

## 职责

提供工作空间、AI 模型和安全策略的真实运行时配置界面。配置按组织写入 PostgreSQL，保存后无需重新部署。

## 代码入口

- `src/app/(workspace)/settings/page.tsx`
- `src/components/operations/system-settings.tsx`
- `src/app/api/settings/route.ts`
- `src/app/api/settings/workspace/route.ts`
- `src/app/api/settings/ai/route.ts`
- `src/app/api/settings/ai/test/route.ts`

## 当前实现

- 持久化工作空间名称、时区、语言和服务时间。
- 自动解决策略在客户消息写入时识别明确的解决确认，并更新会话状态。
- 敏感信息遮盖策略在会话读取时实时处理手机号与邮箱，原始值仍留在数据库中。
- 配置火山引擎方舟或任意 OpenAI 兼容服务。
- API Key 支持加密保存、替换、保留和显式清除。
- 使用已保存配置执行最小连接测试，并显示最近结果。
- `settings.read` 用户可只读查看，`settings.manage` 用户才能保存和测试。

## 验收

1. 刷新页面后所有已保存设置保持不变。
2. AI 配置保存后不重启服务即可用于下一次回复。
3. 页面源数据和 API 响应中不出现 API Key。
4. 存在未保存修改时不能测试旧配置。
5. 无管理权限用户的输入、开关和命令按钮均不可操作。
6. 开启自动解决后，明确确认已解决的客户消息会关闭会话；关闭后不会自动变更状态。
7. 敏感信息开关保存后刷新收件箱立即生效。
