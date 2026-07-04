# 工程基座

## 职责

提供工作台导航、响应式布局、主题令牌、通用组件、质量脚本和项目约定，是其他模块共享的运行基础。

## 代码入口

- `src/app/layout.tsx`：根布局、字体和全局元数据。
- `src/app/(workspace)/layout.tsx`：客服工作区布局。
- `src/components/app-shell.tsx`：桌面/移动导航。
- `src/components/ui`：基于 shadcn/Radix 的通用控件。
- `src/app/globals.css`：Tailwind 4 主题和全局样式。

## 工程约定

- Next.js App Router，服务端组件优先，交互下沉到客户端组件。
- TypeScript 严格模式；所有 API 输入在运行时校验。
- 页面模块不直接创建数据库或模型客户端，统一从服务层延迟获取。
- 图标使用 Lucide；页面区块保持非卡片化，卡片只用于独立对象。

## 验收

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

桌面和移动视口均需验证导航、页面高度、文本溢出和错误覆盖层。
