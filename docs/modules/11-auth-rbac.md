# 认证与角色权限

## 职责

提供自托管邮箱密码登录、数据库会话、退出、登录速率限制、租户身份和客服角色权限，保护工作台页面与业务 API。

## 技术实现

- Better Auth：邮箱密码、scrypt 密码哈希、会话 Cookie 和认证 API。
- Drizzle/PostgreSQL：`user`、`account`、`session`、`verification` 表。
- Next.js `proxy.ts`：仅做会话 Cookie 存在性预检查和登录跳转。
- 页面与 Route Handler：读取数据库会话并执行最终权限校验。

## 代码入口

- `src/lib/auth/server.ts`：延迟创建 Better Auth 服务端实例。
- `src/lib/auth/client.ts`：浏览器登录和退出客户端。
- `src/lib/auth/context.ts`：页面/API 会话与权限校验。
- `src/lib/auth/permissions.ts`：角色和权限矩阵。
- `src/app/api/auth/[...all]/route.ts`：认证 API。
- `src/app/(auth)/sign-in`：登录页面。
- `src/proxy.ts`：乐观登录跳转。

## 角色

| 角色         | 主要权限                               |
| ------------ | -------------------------------------- |
| `owner`      | 全部工作空间权限                       |
| `admin`      | 会话、知识、渠道、团队、分析和设置管理 |
| `supervisor` | 会话管理、知识审核、分析和团队只读     |
| `agent`      | 会话处理、知识只读和 AI 助手           |
| `analyst`    | 会话抽样、知识只读和数据分析           |

## 配置

```dotenv
BETTER_AUTH_SECRET=至少32字节的随机密钥
BETTER_AUTH_URL=http://localhost:3000
AUTH_ALLOW_SIGN_UP=false
AUTH_SEED_EMAIL=admin@luma.local
AUTH_SEED_PASSWORD=仅用于首次创建的强密码
```

`AUTH_ALLOW_SIGN_UP` 默认关闭。种子脚本只在目标邮箱不存在时创建所有者，密码由 Better Auth 哈希后存入 `account` 表。

## 安全边界

- `proxy.ts` 不作为最终授权依据，所有受保护页面和 API 都重新验证数据库会话。
- API 查询使用会话中的 `organizationId`，不接受浏览器传入租户 ID。
- `role` 和 `organizationId` 禁止在注册输入中设置。
- 生产环境必须轮换默认密码和 `BETTER_AUTH_SECRET`，并接入审计、邮件验证和密码重置邮件。

## 验收

1. 未登录访问 `/inbox` 跳转 `/sign-in`。
2. 错误密码不能创建会话；正确密码进入工作台。
3. 退出后原会话失效。
4. 无权限角色直接访问页面或 API 分别得到跳转或 403。
5. 数据库中只存在密码哈希，不存在明文密码。
