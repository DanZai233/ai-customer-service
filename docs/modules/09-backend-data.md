# 数据后端

## 职责

提供多租户 PostgreSQL 数据模型、Drizzle 迁移、种子数据、仓储接口、运行时校验和健康探测。

## 代码入口

- `src/db/schema.ts`：表、枚举、索引和外键。
- `src/db/client.ts`：延迟初始化连接与探活。
- `src/db/seed.ts`：可重复执行的基础数据种子。
- `drizzle/`：版本化 SQL 迁移。
- `src/lib/conversations`：仓储契约和实现。

## 命令

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

## 数据原则

- 业务表必须包含 `organizationId` 并在查询条件中校验。
- 外部消息使用唯一外部 ID 保证幂等。
- 金额使用最小货币单位整数存储。
- 写入关联数据时使用事务；数据库客户端不得在模块加载期连接。

## 当前边界

客户、会话、消息和订单已持久化；知识、团队、设置、审计和分析事件仍需迁移。
