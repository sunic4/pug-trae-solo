# Feature: Example Demo App

## 概述

在 `example/` 目录下创建一个多页面 Canvas UI 演示应用，全面展示 pug-canvas-ui 组件库的能力。

**架构要点（Emit-based 模型）**：
- 入口使用 `setContent(canvas, (rootCtx) => { ... })`
- 每个组件调用传入 `rootCtx` 作为第一参数
- `remember(rootCtx, ...)` 持久化状态
- 页面组件通过 `composable()` 包装，签名 `(ctx, props) => void`
- 无 ComponentNode 返回，无隐式上下文

### 架构设计

```
example/
├── index.html              # HTML 入口 (Canvas 容器)
├── app.ts                  # 主入口: setContent + rootCtx + composable(App)
├── pages/
│   ├── home-page.ts        # 首页: Text/Button/Box/Surface/Column/Row + M 主题工具
│   ├── interaction-page.ts # 交互: Slider/Checkbox/Button/TextField/FAB/Snackbar
│   ├── layout-page.ts      # 布局: Column/Row/Box/Surface + Arrangement/Alignment/Modifier链
│   ├── feedback-page.ts    # 反馈: CircularProgressIndicator/LinearProgressIndicator/Dialog/Snackbar
│   └── list-page.ts        # 列表: 卡片列表 + 动态数量控制 + 选中交互
└── theme/
    └── app-theme.ts        # AppColors + M 主题对象 (含 fab/circularProgress/linearProgress/errorButton)
```

### 导航方案

- **Scaffold** 作为根布局容器
- **BottomNavigation** (5 Tab) 切换主页面：首页 / 交互 / 布局 / 反馈 / 列表
- **mutableStateOf** 驱动选中 Tab 响应式更新
- 页面组件通过 **composable() HOC** 包装，签名 `(ctx, props) => void`

### 页面规划

| 页面 | Tab 标签 | 演示组件 | 核心能力 |
|------|---------|---------|---------|
| Home | 首页 | Text, Button, Box, Surface, Column, Row, Spacer | 基础组件 + M 主题工具 (heading/body/caption/card/section/primaryButton等) |
| Interaction | 交互 | Slider, Checkbox, Button, TextField, FAB, Snackbar | 用户交互 + 状态驱动 + remember |
| Layout | 布局 | Column, Row, Box, Surface, Spacer, Modifier 链 | 布局系统 + Arrangement/Alignment 变体 + 嵌套布局 |
| Feedback | 反馈 | CircularProgressIndicator, LinearProgressIndicator, Dialog, Snackbar | 进度指示器(确定/不确定/多色) + 覆盖层Dialog + Snackbar |
| List | 列表 | Column, Button, Box, Surface (Card via M.card) | 卡片列表渲染 + 动态数量控制 + 点击选中交互 |

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `example/index.html` | HTML 入口，包含 Canvas 元素 |
| 新建 | `example/app.ts` | 应用主入口，组装 Scaffold + 导航 |
| 新建 | `example/pages/home-page.ts` | 首页函数 |
| 新建 | `example/pages/interaction-page.ts` | 交互页函数 |
| 新建 | `example/pages/layout-page.ts` | 布局页函数 |
| 新建 | `example/pages/feedback-page.ts` | 反馈页函数 |
| 新建 | `example/pages/list-page.ts` | 列表页函数 |
| 新建 | `example/theme/app-theme.ts` | 主题颜色与样式工具函数 |

## 接口与类型定义

### 页面函数签名

每个页面是一个普通函数（或 composable 包装），接收 `ctx: CompositionContext`：

```ts
function HomePage(ctx: CompositionContext): void
function InteractionPage(ctx: CompositionContext): void
function LayoutPage(ctx: CompositionContext): void
function FeedbackPage(ctx: CompositionContext): void
function ListPage(ctx: CompositionContext): void
```

### App 入口

```ts
import { setContent, composable, remember, mutableStateOf } from 'pug-canvas-ui';
import { Scaffold } from '@/components/container/scaffold';
import { TopAppBar } from '@/components/container/top-app-bar';
import { BottomNavigation } from '@/components/container/bottom-navigation';
import { HomePageComposable } from './pages/home-page';
import { InteractionPageComposable } from './pages/interaction-page';
import { LayoutPageComposable } from './pages/layout-page';
import { FeedbackPageComposable } from './pages/feedback-page';
import { ListPageComposable } from './pages/list-page';

const TAB_LABELS = ['首页', '交互', '布局', '反馈', '列表'];

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

setContent(canvas, (rootCtx) => {
  const selectedTab = remember(rootCtx, () => mutableStateOf(0, rootCtx.snapshot));
  const showSnackbar = remember(rootCtx, () => mutableStateOf(false, rootCtx.snapshot));
  const snackbarMessage = remember(rootCtx, () => mutableStateOf('', rootCtx.snapshot));
  const showDialog = remember(rootCtx, () => mutableStateOf(false, rootCtx.snapshot));

  AppComposable(rootCtx, { selectedTab, showSnackbar, snackbarMessage, showDialog });
});

// App 函数通过 composable() HOC 包装，内部使用 switch/case 分发到 5 个页面
```

### 关键设计要点

1. **无 ComposableNode 返回**：所有页面函数返回 void
2. **ctx 显式传递**：每个组件调用都传入 rootCtx
3. **remember(ctx, ...) 模式**：状态持久化使用 ctx-first + snapshot 参数
4. **条件渲染**：直接 if/else，无需返回 null
5. **列表渲染**：forEach + 组件调用
6. **composable() HOC 包装**：每个页面导出 `XXXComposable = composable<Props>(XXXPage)`
7. **M 主题对象**：`theme/app-theme.ts` 导出统一主题工具，包含：
   - 文本工具: `M.heading()`, `M.body()`, `M.caption()`
   - 间距工具: `M.spacer()`, `M.gap()`
   - 容器工具: `M.card()`, `M.section()` (基于 Surface 封装)
   - 按钮工具: `M.primaryButton()`, `M.successButton()`, `M.warningButton()`, `M.errorButton()`
   - 反馈工具: `M.fab()`, `M.circularProgress()`, `M.linearProgress()`
8. **无 ui.ts barrel 文件**：各页面直接从 `@/components/` 导入组件，无中间聚合层

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

## DoD 验收标准

- [ ] `example/` 目录下所有 `.ts` 文件类型检查通过 (`tsc --noEmit`)
- [ ] `npm run dev` 可正常启动，浏览器可访问
- [ ] **5 个页面**均可通过底部导航切换 (首页/交互/布局/反馈/列表)
- [ ] 交互组件 (Slider/Checkbox/Button/FAB/TextField/Snackbar) 响应正常
- [ ] 反馈组件 (CircularProgressIndicator/LinearProgressIndicator/Dialog) 渲染正确
- [ ] M 主题对象所有工具函数正常工作
- [ ] 无 console.log/debugger/TODO/HACK/FIXME 残留
- [ ] 代码遵循项目 codestyle.md 规范（ctx-first、void 返回、禁止 JSX、禁止注释）
