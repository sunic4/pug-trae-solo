# Feature: Example Demo App

## 概述

在 `example/` 目录下创建一个多页面 Canvas UI 演示应用，通过 5 个页面全面展示 pug-canvas-ui 组件库的能力。

## 实现思路

### 架构设计

```
example/
├── index.html              # HTML 入口 (Canvas 容器)
├── app.ts                  # 主入口: App composable + setContent
├── pages/
│   ├── home-page.ts        # 首页: Text/Card/Button
│   ├── interaction-page.ts # 交互: Button/Slider/Checkbox/FAB/TextField
│   ├── layout-page.ts      # 布局: Column/Row/Box/Surface
│   ├── feedback-page.ts    # 反馈: Snackbar/Progress/Dialog
│   └── list-page.ts        # 列表: LazyColumn + Card 列表
└── theme/
    └── app-theme.ts        # 颜色常量/样式工具
```

### 导航方案

- **Scaffold** 作为根布局容器
- **BottomNavigation** (4 Tab) 切换主页面
- **NavController** 管理路由状态
- **mutableStateOf** 驱动选中 Tab 响应式更新

### 页面规划

| 页面 | 路由 | 演示组件 | 核心能力 |
|------|------|---------|---------|
| Home | `home` | Text, Card, Button, Column | 基础组件 + 组合 |
| Interaction | `interaction` | Button, Slider, Checkbox, FAB, TextField | 用户交互 + 状态驱动 |
| Layout | `layout` | Column, Row, Box, Surface, Spacer | 布局系统 + 对齐 |
| Feedback | `feedback` | Snackbar, CircularProgressIndicator, LinearProgressIndicator, Dialog | 反馈机制 + 覆盖层 |
| List | `list` | LazyColumn, Card | 虚拟列表 + 性能 |

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `example/index.html` | HTML 入口，包含 Canvas 元素 |
| 新建 | `example/app.ts` | 应用主入口，组装 Scaffold + 导航 |
| 新建 | `example/pages/home-page.ts` | 首页 composable |
| 新建 | `example/pages/interaction-page.ts` | 交互页 composable |
| 新建 | `example/pages/layout-page.ts` | 布局页 composable |
| 新建 | `example/pages/feedback-page.ts` | 反馈页 composable |
| 新建 | `example/pages/list-page.ts` | 列表页 composable |
| 新建 | `example/theme/app-theme.ts` | 主题颜色与样式工具函数 |

## 接口与类型定义

### 页面 Composable 签名

每个页面导出一个 `composable()` 包装函数:

```ts
function HomePage(props: {}, ctx: ComposerContext): ComposableNode | null
function InteractionPage(props: { showSnackbar: MutableState<boolean> }, ctx: ComposerContext): ComposableNode | null
function LayoutPage(props: {}, ctx: ComposerContext): ComposableNode | null
function FeedbackPage(props: {}, ctx: ComposerContext): ComposableNode | null
function ListPage(props: {}, ctx: ComposerContext): ComposableNode | null
```

### App 入口签名

```ts
function App(props: {}, ctx: ComposerContext): ComposableNode | null
```

内部使用 `mutableStateOf<number>` 管理 selectedTab，驱动 BottomNavigation 和内容区切换。

## 测试策略

- **手动验证**: 浏览器打开 `npm run dev` 后视觉检查各页面
- **构建验证**: `npm run build` 确保无编译错误
- **类型检查**: `npm run typecheck` 确保 type-safe

### 关键路径覆盖

1. 底部导航切换 → 页面内容响应式更新
2. Slider 拖动 → 数值显示变化
3. Checkbox 点击 → 状态翻转
4. Dialog 显示/消失
5. LazyColumn 滚动渲染

## 风险与依赖

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 渲染器未完整实现部分组件视觉效果 | 页面显示不完整 | 使用已有渲染支持的组件组合 |
| Vite alias 配置需支持 example 目录 | 模块解析失败 | 在 vite.config.ts 中补充 example alias 或使用相对路径 |

## DoD 验收标准

- [ ] `example/` 目录下所有 `.ts` 文件类型检查通过 (`tsc --noEmit`)
- [ ] `npm run dev` 可正常启动，浏览器可访问
- [ ] 5 个页面均可通过底部导航切换
- [ ] 交互组件 (Slider/Checkbox/Button/FAB) 响应正常
- [ ] 无 console.log/debugger/TODO/HACK/FIXME 残留
- [ ] 代码遵循项目 codestyle.md 规范（纯函数调用链、禁止 JSX、禁止注释）
