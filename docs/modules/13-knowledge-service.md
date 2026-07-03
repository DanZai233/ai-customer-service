# 知识服务

## 目标

将客服知识、发布状态和检索事件持久化到 PostgreSQL，并为后台管理与 AI 回复提供同一套组织级 API。

## 代码入口

- `src/db/schema.ts`
- `src/lib/knowledge/repository.ts`
- `src/lib/knowledge/search.ts`
- `src/lib/knowledge/validation.ts`
- `src/app/api/knowledge/route.ts`
- `src/app/api/knowledge/[documentId]/route.ts`
- `src/app/api/knowledge/[documentId]/publish/route.ts`
- `src/app/api/knowledge/[documentId]/archive/route.ts`
- `src/app/api/knowledge/search/route.ts`

## 数据模型

- `knowledge_documents`：标题、分类、正文、来源、草稿/发布/归档状态、命中次数和操作人。
- `knowledge_retrievals`：检索问题、命中文档、分数、调用来源和时间。
- 两张表都包含 `organization_id`，所有仓储查询与写入均使用当前登录用户的组织。

## API

- `GET /api/knowledge`：列表、状态筛选、文本筛选与汇总指标，需要 `knowledge.read`。
- `POST /api/knowledge`：创建草稿，需要 `knowledge.write`。
- `GET/PATCH /api/knowledge/:id`：读取或编辑内容，编辑需要 `knowledge.write`。
- `POST /api/knowledge/:id/publish`：发布知识，需要 `knowledge.publish`。
- `POST /api/knowledge/:id/archive`：归档并退出检索，需要 `knowledge.publish`。
- `POST /api/knowledge/search`：运行检索测试并记录命中，需要 `knowledge.read`。

## 检索行为

- 只有 `published` 文档进入检索上下文。
- 当前中文检索综合字符覆盖、连续双字词、标题命中和完整短语命中。
- 后台测试和 AI 回复都会记录检索事件并增加文档命中次数。
- AI 回复按当前会话组织读取最多三条知识，不再使用进程内固定数组。

## 验收

1. 草稿不能被检索，发布后立即可命中，归档后立即退出检索。
2. 创建、编辑、发布和归档分别执行 RBAC 权限检查。
3. 跨组织 ID 不能读取或修改文档。
4. 检索事件与命中次数写入数据库，本月指标来自真实事件。
5. 数据库迁移和种子脚本可重复执行。

## 后续边界

当前检索适合中小规模中文规则库。文档量增长后，可在保持 API 契约不变的前提下增加分块、向量嵌入、混合召回和重排。
