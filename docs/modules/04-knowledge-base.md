# 知识库

## 职责

维护客服可引用的业务知识，支持搜索、状态区分、草稿新增和检索效果测试。

## 代码入口

- `src/app/(workspace)/knowledge/page.tsx`
- `src/components/knowledge/knowledge-workspace.tsx`
- `src/lib/knowledge-data.ts`

## 当前实现

- 仅已发布文章进入 AI 上下文。
- 关键词匹配返回评分和命中文章。
- 浏览器可新增草稿，但数据暂存在客户端状态。
- 单元测试覆盖物流知识排序和草稿隔离。

## 生产化边界

1. 将文章、版本、发布记录和权限迁移到 PostgreSQL。
2. 接入 pgvector、RAGFlow 或 FastGPT 做混合检索与重排。
3. 记录答案引用、未命中问题、反馈和评测集。
4. 发布流程增加审核人与回滚版本。
