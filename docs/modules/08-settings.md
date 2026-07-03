# 系统设置

## 职责

展示工作空间、AI 供应商、数据模式和安全策略，并作为运行配置的可视入口。

## 代码入口

- `src/app/(workspace)/settings/page.tsx`
- `src/components/operations/system-settings.tsx`
- `src/app/api/system/status/route.ts`

## 当前实现

- 显示 PostgreSQL 或演示数据模式。
- 根据供应商显示 `ARK_*` 或通用 `AI_*` 变量名。
- 只显示 API Key 是否已配置，不暴露密钥内容。
- 工作空间和安全开关目前尚未持久化。

## 配置原则

敏感密钥继续由部署环境或密钥服务管理；设置页未来只提交非敏感策略。密钥轮换和连接测试应通过受保护的服务端接口执行并写审计日志。
