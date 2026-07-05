# 模块说明

本目录按产品和工程边界记录系统模块。每个模块说明职责、主要流程、代码入口、数据/API、配置、验收方式与后续边界。新增模块必须同时新增或更新对应文档，并与代码放在同一个提交中。

| 模块       | 说明                                                       | 当前状态               |
| ---------- | ---------------------------------------------------------- | ---------------------- |
| 工程基座   | [01-foundation.md](01-foundation.md)                       | 已实现                 |
| 会话工作台 | [02-inbox.md](02-inbox.md)                                 | 已实现，已持久化       |
| AI 助手    | [03-ai-assistant.md](03-ai-assistant.md)                   | 已实现，待配置模型凭证 |
| 知识库     | [04-knowledge-base.md](04-knowledge-base.md)               | PostgreSQL/检索已实现  |
| 数据分析   | [05-analytics.md](05-analytics.md)                         | PostgreSQL 实时聚合    |
| 渠道管理   | [06-channels.md](06-channels.md)                           | 配置界面，待真实回调   |
| 团队管理   | [07-team.md](07-team.md)                                   | 配置界面，待鉴权联动   |
| 系统设置   | [08-settings.md](08-settings.md)                           | 运行状态已接入         |
| 数据后端   | [09-backend-data.md](09-backend-data.md)                   | PostgreSQL 已运行      |
| 部署运维   | [10-deployment.md](10-deployment.md)                       | Docker/CI 已运行       |
| 认证与权限 | [11-auth-rbac.md](11-auth-rbac.md)                         | 已实现                 |
| 运行时配置 | [12-runtime-configuration.md](12-runtime-configuration.md) | 已实现                 |
| 知识服务   | [13-knowledge-service.md](13-knowledge-service.md)         | PostgreSQL 检索已实现  |
| 开放 API   | [14-public-api.md](14-public-api.md)                       | 会话接口与密钥已实现   |
| 开发者中心 | [15-developer-console.md](15-developer-console.md)         | 密钥与示例已实现       |
| 行业模板   | [16-industry-templates.md](16-industry-templates.md)       | 8 套模板可一键安装     |

## 状态定义

- **已实现**：核心流程可运行并有验证。
- **演示**：界面和契约已存在，但数据或外部服务仍为本地替代实现。
- **待实现**：仅记录了边界，尚不能完成真实业务流程。
