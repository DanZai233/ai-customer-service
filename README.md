# Luma AI Customer Service

Luma 是一套面向成长型团队的 AI 客服与人工协作系统。项目采用模块化交付，每个业务模块对应独立 Git 提交，便于审查、回滚和持续迭代。

## 技术栈

- Next.js 16、React 19、TypeScript
- Tailwind CSS 4、shadcn/ui、Lucide Icons
- Vercel AI SDK 6（AI 模块）
- Vitest（单元测试）

## 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。

## 校验

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## 已实现模块

- 多渠道会话队列、聊天工作台和客户资料
- AI/人工接管、回复发送和 AI 草稿
- 知识管理、检索测试和草稿发布边界
- AI SDK 6 流式回复接口与 OpenAI 兼容模型适配
- 火山引擎方舟（豆包）专用环境变量预设
- 数据分析、渠道配置、团队负载和系统设置
- Docker、健康检查与 GitHub Actions CI
- PostgreSQL 持久化、Drizzle SQL 迁移与会话读写 API

详细边界和生产化替换点参见 [系统架构](docs/architecture.md)、[外部服务接入](docs/integrations.md) 与 [大模型配置](docs/model-configuration.md)。

各功能的职责、代码入口、API、验收方式和后续边界参见 [模块说明目录](docs/modules/README.md)。

## Docker

```bash
docker compose up --build
```

该命令会启动 PostgreSQL、执行迁移和种子脚本，再启动 Web 服务。随后访问 [http://localhost:3000](http://localhost:3000)，探活地址为 `/api/health`。
