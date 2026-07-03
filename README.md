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

## 模块路线

1. 工程基座与设计系统
2. 多渠道会话工作台与人工接管
3. AI 回复、知识库与业务工具
4. 运营分析、渠道配置与团队管理

详细边界和数据流将在后续模块中补充到 `docs/`。
