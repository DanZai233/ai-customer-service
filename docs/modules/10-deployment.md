# 部署运维

## 职责

提供一致的本地/生产构建、数据库迁移、健康检查和持续集成入口。

## 代码入口

- `Dockerfile`：依赖、构建、迁移和运行阶段。
- `docker-compose.yml`：PostgreSQL、迁移任务和 Web 服务。
- `.github/workflows/ci.yml`：远端质量检查。
- `src/app/api/health/route.ts`：运行探活。

## 启动

```bash
docker compose up -d --build
```

启动顺序为数据库健康、迁移与种子任务成功、Web 服务启动。`GET /api/health` 会实际探测数据库，故障时返回 503。

## CI 验收

CI 执行格式检查、lint、TypeScript、单元测试和生产构建。迁移在部署阶段独立执行，不能由多个 Web 实例并发运行。

## 生产边界

正式环境需使用托管 PostgreSQL、TLS、密钥托管、日志/指标采集、备份恢复演练、镜像扫描和渐进发布。
