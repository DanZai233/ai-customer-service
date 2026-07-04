# 部署运维

## 职责

提供一致的本地/生产构建、首次密钥初始化、数据库迁移、健康检查和持续集成入口。

## 代码入口

- `Dockerfile`：依赖、构建、迁移和运行阶段。
- `docker-compose.yml`：密钥初始化、PostgreSQL、迁移任务和 Web 服务。
- `scripts/docker-up.sh`：一键构建、启动和首次凭证输出。
- `.github/workflows/ci.yml`：远端质量检查。
- `src/app/api/health/route.ts`：运行探活。

## 一键启动

```bash
./scripts/docker-up.sh
```

首次启动会自动生成认证密钥、配置加密密钥和随机管理员密码。脚本在启动完成后显示首次登录账号与密码。模型配置在登录后的“设置 → AI 配置”中完成。

直接执行 `docker compose up -d --build` 也可以启动；初始密码保存在仅初始化/迁移服务挂载的 `luma-bootstrap` 卷。

## 生产端口与访问地址

生产部署可通过项目目录下的 `.env` 设置端口、绑定地址和数据库口令，无需修改 Compose 文件：

```dotenv
LUMA_PORT=39002
LUMA_BIND_ADDRESS=0.0.0.0
APP_BASE_URL=http://example.com:39002
POSTGRES_PORT=15432
POSTGRES_BIND_ADDRESS=127.0.0.1
POSTGRES_PASSWORD=请使用随机强口令
```

`APP_BASE_URL` 必须与浏览器实际访问地址一致，否则 Better Auth 会拒绝登录来源。PostgreSQL 默认只绑定 `127.0.0.1`，容器间仍通过内部 Docker 网络访问。

## 启动顺序

1. `key-init` 创建或复用持久化根密钥。
2. PostgreSQL 通过健康检查。
3. `migrate` 执行 SQL 迁移、基础数据和首次管理员种子。
4. `luma` 启动并通过 `/api/health` 容器健康检查。

## 数据卷

- `luma-postgres`：业务、认证与运行时配置数据。
- `luma-secrets`：认证和配置加密根密钥，必须备份。
- `luma-bootstrap`：首次管理员随机密码，不挂载到 Web 容器。

删除数据卷会重置数据库和密钥。不要在需要保留数据的环境执行 `docker compose down -v`。

## CI 验收

CI 执行格式检查、lint、TypeScript、单元测试和生产构建。迁移在部署阶段独立执行，不能由多个 Web 实例并发运行。

## 生产边界

正式环境应替换默认数据库口令，使用托管 PostgreSQL、TLS、外部密钥托管、日志/指标采集、备份恢复演练、镜像扫描和渐进发布。
