# 团队管理

## 职责

管理客服成员、在线状态、角色与接待负载，为权限控制提供人员基础。

## 代码入口

- `src/app/(workspace)/team/page.tsx`
- `src/components/operations/team-settings.tsx`
- `src/lib/team/repository.ts`
- `src/app/api/team/[memberId]/route.ts`

## 当前实现

团队列表直接读取 Better Auth 的 `user` 与有效 `session` 记录；活跃会话按真实会话负责人聚合。所有者和管理员可以持久化修改成员角色与接待容量，最后一名所有者受到降级保护。

页面不再展示虚构成员、满意度、邀请结果或自动分配状态。满意度需等客户评价链路落库后再启用；成员邀请与自动分配也不会在没有真实服务前显示为可用功能。

## 角色目标

- `owner`：工作空间与安全策略全权管理。
- `admin`：团队、渠道、知识和业务设置管理。
- `supervisor`：会话分配、质检、分析和知识审核。
- `agent`：处理会话并使用 AI 建议。
- `analyst`：只读访问分析与会话抽样。

## 数据与接口

- `GET /api/team`：读取当前组织团队概览。
- `PATCH /api/team/:memberId`：更新角色和接待容量。
- `team_member_settings`：存储每位成员的接待容量。
- 在线状态：存在未过期登录会话即视为在线。
- 活跃会话：负责人姓名匹配且状态不是 `resolved` 的会话。

## 后续边界

后续补充邀请令牌、账号禁用、稳定的 `assigneeUserId` 外键、自动分配策略与操作审计。以上功能完成前不会提供无效开关。
