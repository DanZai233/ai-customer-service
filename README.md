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

- PostgreSQL 多渠道会话队列、聊天工作台和客户资料
- 绑定真实登录坐席的人工回复、状态流转与负责人筛选
- 知识管理、检索测试和草稿发布边界
- AI SDK 6 流式回复接口与 OpenAI 兼容模型适配
- 火山引擎方舟（豆包）与 OpenAI 兼容模型后台配置
- PostgreSQL 实时数据分析、真实渠道能力状态、团队负载和系统设置
- Docker、健康检查与 GitHub Actions CI
- PostgreSQL 持久化、Drizzle SQL 迁移与会话读写 API
- Better Auth 自托管登录、数据库会话与五级客服 RBAC
- PostgreSQL 运行时配置中心与加密的模型密钥存储
- PostgreSQL 知识服务、发布工作流与组织级检索事件
- 可识别的基础数据种子；不使用运行时内存模拟或模型伪回复

详细边界和生产化替换点参见 [系统架构](docs/architecture.md)、[外部服务接入](docs/integrations.md) 与 [大模型配置](docs/model-configuration.md)。

各功能的职责、代码入口、API、验收方式和后续边界参见 [模块说明目录](docs/modules/README.md)。

## Docker

```bash
./scripts/docker-up.sh
```

该脚本会生成持久化根密钥与随机初始密码，启动 PostgreSQL、执行迁移和种子脚本，再启动 Web 服务。随后访问 [http://localhost:3000](http://localhost:3000)，登录后在“设置 → AI 配置”中填写火山引擎或其他模型信息；修改后无需重新部署。
