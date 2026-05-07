---
id: "canvas-ui-runtime-overview"
type: architecture
status: accepted
title: "Canvas UI 运行时 — 系统架构总览"
depends_on:
  - "../road-map/canvas-ui-runtime.md"
created: "2026-04-30 17:35"
updated: "2026-05-07 00:00"
stale: false
---

# Canvas UI 运行时 — 系统架构总览

## 项目标识

| 属性 | 值 |
|------|-----|
| **名称** | Pug Canvas UI Runtime |
| **定位** | 移动端优先的 TypeScript Canvas 声明式 UI 运行时 |
| **核心理念** | 零 DOM 依赖 · 细粒度响应式驱动 · Compose 风格 API · Emit-based 组合模型 |
| **技术栈** | TypeScript 5.x + Canvas 2D API + 纯自研引擎 |

---

## 技术栈

| 类别 | 选型 | 版本 | 用途 |
|------|------|------|------|
| 语言 | TypeScript | 5.x (strict) | 类型安全开发 |
| 渲染目标 | HTML5 Canvas 2D | - | 唯一输出通道 |
| 构建工具 (开发) | Vite | 5.x | HMR + 开发服务器 |
| 构建工具 (发布) | tsup | 8.x | TS → ESM/CJS 打包 |
| 测试框架 | Vitest | 2.x | 单元测试 + 组件测试 |
| 包管理 | pnpm | 9.x | 依赖管理 |

**运行时零依赖**：不依赖 Yoga/Taffy/MobX/React/Vue 等任何第三方 UI 库。

---

## 核心架构：Emit-based Composition 模型

本运行时的核心创新在于 **Emit-based 组合模型**：组件函数不再返回节点树，而是通过 `CompositionContext` 向一个扁平的 `Map<NodeId, EmittedNode>` **发射（emit）节点描述**。渲染器随后遍历这个 Map 完成布局和绘制。

### 架构分层

```
┌─ App 入口: setContent(canvas, (rootCtx) => { ... }) ────────┐
│                                                              │
│  ┌─ composable() HOC ──────────────────────────────────┐    │
│  │  包装 fn(ctx: CompositionContext, props: TProps) => void │    │
│  │  内部创建 CompositionContextImpl                        │    │
│  │  管理 Scope 栈 / 依赖追踪                               │    │
│  └───────────────────────────────────────────────────────┘    │
│                         ↓                                       │
│  ┌─ 组件执行（Emit 阶段）────────────────────────────────┐    │
│  │                                                        │    │
│  │  Text(ctx, "Hello", mod)                               │    │
│  │    → ctx.emitLeaf(data, modifier, measurePolicy, drawPolicy) │
│  │    → 向 emittedNodes Map 写入 EmittedNode              │    │
│  │                                                        │    │
│  │  Column(ctx, mod, arrangement, alignment) {            │    │
│  │    → ctx.startGroup(data, modifier, measurePolicy,     │    │
│  │         drawPolicy, layoutChildren)                    │    │
│  │    → 压入 groupStack                                   │    │
│  │    → 子组件继续 emit...                                │    │
│  │    → ctx.endGroup() → 弹出 groupStack                 │    │
│  │  }                                                     │    │
│  │                                                        │    │
│  └───────────────────────────────────────────────────────┘    │
│                         ↓                                       │
│  ┌─ renderEmittedTree() ─────────────────────────────────┐    │
│  │  遍历 Map<NodeId, EmittedNode>                         │    │
│  │  measureEmittedNode() → 布局测量                       │    │
│  │  renderEmittedNode()  → DrawCommand 生成               │    │
│  │  → Canvas 2D 批量绘制                                  │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 关键类型：CompositionContext 与 EmittedNode

```typescript
type NodeId = number

interface CompositionContext extends ComposerContext {
  emitLeaf(
    data: unknown,
    modifier: ReadonlyModifier,
    measurePolicy: MeasurePolicy,
    drawPolicy: DrawPolicy,
  ): void
  startGroup(
    data: unknown,
    modifier: ReadonlyModifier,
    measurePolicy: MeasurePolicy,
    drawPolicy?: DrawPolicy,
    layoutChildren?: (contentArea, measuredSizes, childrenIds) => ChildLayout[],
  ): void
  endGroup(): void
  readonly emittedNodes: Map<NodeId, EmittedNode>
  rootNodeId: NodeId | null
}

type EmittedNode = {
  readonly id: NodeId
  readonly data: unknown
  readonly modifier: ReadonlyModifier
  readonly measurePolicy: MeasurePolicy
  readonly drawPolicy: DrawPolicy
  readonly layoutChildren: ((...) => ChildLayout[]) | null
  readonly parentId: NodeId | null
  childrenIds: NodeId[]
}
```

### L0 / L1 分层组件架构

```
L0 — 原子组件（直接 emit 节点，全部公共导出）
├── Text          → ctx.emitLeaf()
├── Image         → ctx.emitLeaf()
├── Spacer        → ctx.emitLeaf()
├── Box           → ctx.startGroup() / ctx.endGroup()
├── Column        → ctx.startGroup(layoutChildren=columnLayout) / ctx.endGroup()
├── Row           → ctx.startGroup(layoutChildren=rowLayout) / ctx.endGroup()
├── Surface       → ctx.startGroup() / ctx.endGroup()
├── Slider        → ctx.emitLeaf()
├── Checkbox      → ctx.emitLeaf()
├── TextField     → ctx.emitLeaf()
├── CircularProgress → ctx.emitLeaf()
└── LinearProgress   → ctx.emitLeaf()

L1 — 组合组件（组合 L0 组件，公共导出）
├── Button        → 组合 Surface + Text + clickable Modifier
├── FAB           → 组合 Surface + Icon/Text + 圆形裁剪
├── Snackbar      → 组合 Surface + Text + Button
├── Dialog        → 组合 Surface(半透明背景) + content + buttons
├── TopAppBar     → 组合 Row(navigationIcon + title + actions)
├── BottomNav     → 组合 Row(BottomNavItem[])
├── TabRow        → 组合 Surface + Row(Tab[] + indicator)
├── Scaffold      → 组合 topBar + content + bottomBar + snackbarHost
├── ModalBottomSheet → 底部弹出面板
├── DropdownMenu  → 下拉菜单
├── Popup         → 轻量弹出层
├── LazyColumn    → 虚拟滚动列表（垂直）
└── LazyRow       → 虚拟滚动列表（水平）

内部组件（不公开导出，仅 demo 内部使用）
└── Card          → Surface + clip + elevation（demo 通过 M.card() 封装使用）
```

> **公共 API 总计**：约 **41 个值导出**（不含 type-only 导出），涵盖核心 API、所有 L0/L1 组件、Modifier、动画、导航。

---

## 系统分层架构

```
┌─ Composition Context (显式 ctx 传递) ───────────────────────┐
│  emitLeaf / startGroup / endGroup / emittedNodes             │
│  setContent(canvas, (rootCtx) => { ... })                    │
├──────────┬──────────┬──────────┬──────────┬───────────────┤
│ Reactive │ Renderer │  Layout  │  Input   │   Animation   │
│   Core   │          │          │          │               │
│ ─────── │ ──────── │ ──────── │ ──────── │ ───────────── │
│ Snapshot │ Emit-Based│ Linear   │ Gesture  │ Property-Driven│
│ Context  │ Tree     │ Column/Row│ Recognizer│ Animatable   │
│composable()HOC    │renderEmittedTree│ Modifier│ Transition │
│remember(ctx,calc) │ Map<NodeId,│ PointerInput             │
│State/MutableState │EmittedNode>│                          │
├──────────┴──────────┴──────────┴──────────┴───────────────┤
│              Theme + Configuration (平台层)                 │
│   SafeArea / DPI / Density / Performance / A11y           │
└──────────────────────────────────────────────────────────┘
         ↑ 纯 TypeScript 自研    ↑ 零 DOM 依赖
         ↑ 零全局变量/static     ↑ 单 Canvas 架构
         ↑ 显式 ctx 参数传递     ↑ Emit-based 无返回值
```

---

## 核心架构决策索引

### 🔴 P0 核心层（已确认）

| # | 决策点 | 方案 | ADR 文档 | 状态 |
|---|--------|------|---------|------|
| 1 | 响应式状态系统 | **自研 Snapshot + Context**（禁止 global/static） | [reactive-state-snapshot-context-based.md](./adrs/reactive-state-snapshot-context-based.md) | ✅ accepted |
| 2 | @Composable 追踪 | **运行时 HOC 包装**（`composable()` 函数，ctx-first） | [composable-tracking-runtime-hoc.md](./adrs/composable-tracking-runtime-hoc.md) | ✅ accepted |
| 3 | 渲染架构 | **Emit-based + renderEmittedTree**（CompositionContext → EmittedNode Map → Canvas） | [rendering-architecture-hybrid-mode.md](./adrs/rendering-architecture-hybrid-mode.md) | ✅ accepted |
| 4 | 布局引擎 | **自研简化线性布局 Column/Row**（无 W3C Flexbox） | [layout-engine-custom-linear-column-row.md](./adrs/layout-engine-custom-linear-column-row.md) | ✅ accepted |

### 🟡 P1 功能层（已确认）

| # | 决策点 | 方案 | ADR 文档 | 状态 |
|---|--------|------|---------|------|
| 5 | 组件模型 | **Emit-based 纯函数调用链**（ctx-first，void 返回，禁止 JSX） | [component-model-pure-function-call-chain.md](./adrs/component-model-pure-function-call-chain.md) | ✅ accepted |
| 6 | Modifier 链 | **Builder + Freeze 混合模式**（可变构建 + 冻结只读） | [modifier-chain-builder-freeze-pattern.md](./adrs/modifier-chain-builder-freeze-pattern.md) | ✅ accepted |
| 7 | 手势系统 | **自研手势识别器 + Modifier 声明式集成**（零 DOM） | [gesture-system-custom-with-modifier.md](./adrs/gesture-system-custom-with-modifier.md) | ✅ accepted |
| 8 | 动画系统 | **属性动画优先**（Animatable / animateAsState / Spring） | [animation-system-property-driven.md](./adrs/animation-system-property-driven.md) | ✅ accepted |

### 🟢 工程化基础（已确认）

| # | 决策点 | 方案 | ADR 文档 | 状态 |
|---|--------|------|---------|------|
| 9 | 构建打包 | **Vite (开发) + tsup (发布)** | [engineering-infrastructure-build-tooling-modules-types.md](./adrs/engineering-infrastructure-build-tooling-modules-types.md) | ✅ accepted |
| 10 | 模块化 | **单 Package + 内部模块边界** | 同上 | ✅ accepted |
| 11 | 类型系统 | **Strict Mode + 泛型重度使用** | 同上 | ✅ accepted |

### 🔵 架构集成层（已确认 — 核心约束强化）

| # | 决策点 | 方案 | ADR 文档 | 状态 |
|---|--------|------|---------|------|
| 12 | **统一根上下文** | **AppContext = 单 Canvas 实例 + 零全局变量 + setContent(canvas, fn) 入口** | [appcontext-unified-root-architecture.md](./adrs/appcontext-unified-root-architecture.md) | ✅ accepted |
| 13 | **数据流管理** | **单向数据流 + Context 注入**（禁止双向绑定和全局变量） | [data-flow-management-unidirectional-pattern.md](./adrs/data-flow-management-unidirectional-pattern.md) | ✅ accepted |
| 14 | **错误处理机制** | **Error Boundary + 全局捕获 + 分级恢复**（三层防御体系） | [error-handling-global-catch-recovery.md](./adrs/error-handling-global-catch-recovery.md) | ✅ accepted |
| 15 | **性能优化方案** | **虚拟化 + 智能缓存 + 增量渲染**（多层次优化体系） | [performance-optimization-virtualization-caching.md](./adrs/performance-optimization-virtualization-caching.md) | ✅ accepted |
| 16 | **测试策略与覆盖率** | **测试金字塔模型**（单元 65-80% + 集成 15-25% + E2E 5-10%） | [testing-strategy-unit-integration-e2e.md](./adrs/testing-strategy-unit-integration-e2e.md) | ✅ accepted |

---

## 模块清单与职责

### core/ — 响应式核心 + 组合上下文

| 模块 | 职责 | 关键导出 |
|------|------|---------|
| `snapshot.ts` | Snapshot 系统（全局快照、嵌套快照、提交/回滚） | `Snapshot`, `MutableSnapshot` |
| `state.ts` | 可变状态容器 | `MutableState<T>`, `State<T>`, `derivedStateOf()` |
| `recomposer.ts` | 重组调度器（Scope 管理、脏标记、批量更新） | `Recomposer`, `RecomposeScope` |
| `composable.ts` | Composable 函数包装器 + AppContext 工厂 | `composable<TProps>()`, `createAppContext()` |
| `composition-context.ts` | **Emit-based 组合上下文（核心创新）** | `CompositionContext`, `EmittedNode`, `NodeId` |
| `remember.ts` | 组合内状态持久化（ctx-first） | `remember(ctx, calculation, keys?)` |
| `derived-state.ts` | 计算派生状态 | `derivedStateOf<T>(calc)` |
| `id-generator.ts` | ID 生成器 | `IdGenerator` |
| `types.ts` | 核心类型定义 | `ComposerContext`, `ComposableFunction`, `ComposableNode` |

### renderer/ — Canvas 渲染引擎

| 模块 | 职责 | 关键导出 |
|------|------|---------|
| `component-renderer.ts` | **Emit-based 渲染器（核心创新）** | `renderEmittedTree(ctx, nodes, rootNodeId, w, h)` |
| `draw-command.ts` | 不可变绘制指令定义 | `DrawCommand`, `FillRectCmd`, `FillTextCmd`, ... |
| `draw-scope.ts` | 绘制作用域（save/restore/batching） | `DrawScope`, `createDrawScope()` |
| `draw-batch.ts` | 批量绘制合并 | `batchCommands()`, `BatchKey` |
| `layer.ts` | 图层管理与 Z-order | `Layer`, `LayerTree` |
| `canvas-host.ts` | Canvas 2D 上下文封装与管理 | `CanvasHost`, `createCanvasHost()` |
| `dirty-region.ts` | 脏区域计算与合并 | `DirtyRegion`, `mergeRects()` |
| `path.ts` | 矢量路径构建 | `VectorPathBuilder` |
| `text-style.ts` | 文本样式与测量 | `TextStyle`, `TextMeasurer` |
| `image-loader.ts` | 图像加载与九宫格 | `ImageLoader`, `NinePatchConfig` |

### layout/ — 布局引擎

| 模块 | 职责 | 关键导出 |
|------|------|---------|
| `measure-policy.ts` | 线性布局策略（Column/Row 核心） | `linearMeasurePolicy()` |
| `box-layout.ts` | Box 对齐布局策略 | `BoxAlignmentMeasurePolicy()` |
| `constraints.ts` | 尺寸约束系统 | `Constraints`, `constrainWidth/Height` |
| `layout-node.ts` | 布局节点树（内部使用） | `LayoutNode`, `LayoutTree` |
| `measure.ts` | 测量基础设施 | `Measurable`, `MeasureResult`, `Placeable` |
| `modifier.ts` | Modifier 数据结构（Builder + Freeze） | `Modifier`, `ReadonlyModifier` |
| `types.ts` | 布局类型定义 | `MeasurePolicy`, `Arrangement`, `Alignment`, `WeightConfig` |

### input/ — 输入事件系统

| 模块 | 职责 | 关键导出 |
|------|------|---------|
| `pointer-event.ts` | Pointer Event 封装与分发 | `PointerEvent`, `HitTestResult` |
| `pointer-dispatcher.ts` | 事件分发器 | `PointerEventDispatcher` |
| `gesture-recognizer.ts` | 手势识别器（Tap/Drag/Pinch/Fling） | `TapGesture`, `DragGesture`, `PinchGesture` |
| `pinch-recognizer.ts` | 缩放手势识别 | `PinchRecognizer` |
| `gesture-modifier.ts` | 手势 Modifier 集成 | `clickable()`, `draggable()`, `scrollable()` |
| `event-bubble.ts` | 事件冒泡与拦截 | `consume()`, `intercept()` |
| `focus-manager.ts` | 焦点管理 | `FocusManager`, `FocusRequester` |
| `hit-test.ts` | 命中测试 | `hitTest()`, `isPointInNode()` |
| `keyboard.ts` | 键盘输入处理 | `KeyboardInput` |

### animation/ — 动画系统

| 模块 | 职责 | 关键导出 |
|------|------|---------|
| `animatable.ts` | 可动画值容器 | `Animatable<T>` |
| `animation-spec.ts` | 动画规格族系 | `tween()`, `spring()`, `keyframes()`, `repeatable()` |
| `transition.ts` | 多属性协同过渡 | `updateTransition<S>()`, `animate*AsState()` |
| `gesture-animation.ts` | 手势驱动动画 | `animateTo()`, `decay()` |
| `vector-converter.ts` | 类型转换器 | `ColorConverter`, `DpConverter` |

### components/ — 组件库（L0 + L1）

| 分类 | 层级 | 组件 | 说明 |
|------|------|------|------|
| **basic/** | L0 | `Text`, `Image`, `Box`, `Spacer` | 最小原子组件 |
| **layout/** | L0 | `Column`, `Row`, `Surface` | 布局容器 |
| **interaction/** | L0+L1 | `Button`, `Slider`, `Checkbox`, `TextField`, `FAB` | 用户交互 |
| **feedback/** | L0+L1 | `CircularProgressIndicator`, `LinearProgressIndicator`, `Snackbar` | 反馈组件 |
| **container/** | L1 | `Scaffold`, `TopAppBar`, `BottomNavigation`, `TabRow` | 复杂页面构建 |
| **overlay/** | L1 | `Dialog`, `ModalBottomSheet`, `DropdownMenu`, `Popup` | 覆盖层 |
| **lazy/** | L1 | `LazyColumn`, `LazyRow` | 虚拟滚动列表 |
| **navigation/** | L1 | `NavHost`, `createNavController`, `createNavGraph` | 导航栈 |
| **shared/** | - | 导入共享、布局辅助函数 | 内部工具 |
| **container/** (内部) | L1 | `Card` | **不公开导出**，demo 通过 M.card() 使用 |

### platform/ — 平台适配

| 模块 | 职责 |
|------|------|
| `safe-area.ts` | 安全区域检测与注入 |
| `density.ts` | DPI 缩放、Dp 单位转换 |
| `memory.ts` | 内存监控 |
| `perf-monitor.ts` | FPS Monitor、Recomposition Counter、Layout Inspector |
| `screen-info.ts` | 屏幕信息获取 |
| `accessibility.ts` | 无障碍语义树（Semantics Node + ARIA） |

---

## 核心数据流

```
用户交互 (Touch/Keyboard)
    ↓
Input System (PointerEvent 封装)
    ↓ Hit Test (遍历 EmittedNode 树坐标)
Gesture Recognizer (识别 Tap/Drag/Pinch)
    ↓ 回调执行
State 更新 (MutableState.value = newValue)
    ↓
Snapshot.write(state, newValue)
    ↓ 标记 RecomposeScope 脏
Recomposer.collectDirtyScopes()
    ↓ requestAnimationFrame
Phase 1: Recomposition（重组阶段）
    ├─ 执行 dirty Scope.composable()
    ├─ 创建新的 CompositionContextImpl
    ├─ 执行 fn(compositionCtx, props)
    │   ├─ 组件调用 ctx.emitLeaf() / ctx.startGroup() / ctx.endGroup()
    │   └─ 构建 Map<NodeId, EmittedNode>
    └─ 获取 rootCtx.emittedNodes + rootCtx.rootNodeId
Phase 2: Layout + Render（渲染阶段）
    ├─ renderEmittedTree(ctx, emittedNodes, rootNodeId, width, height)
    │   ├─ 遍历 EmittedNode Map（从 rootNodeId 开始）
    │   ├─ measureEmittedNode() → Constraints 传递 + Measure 计算
    │   ├─ applySizeModifiers() → 应用 size/padding/weight
    │   ├─ node.drawPolicy(scope, bounds) → Canvas 2D 绘制
    │   ├─ node.layoutChildren() → 计算子节点位置（Column/Row/Box）
    │   └─ 递归渲染子节点
    └─ host.render(commands) → 批量 DrawCommand 执行
    ↓
屏幕像素更新 (60fps)
```

---

## 公共 API 示例

```typescript
import {
  setContent,
  composable,
  remember,
  mutableStateOf,
  Column, Row, Text, Button, Box, Surface,
  Modifier,
} from 'pug-canvas-ui';

const canvas = document.getElementById('app-canvas') as HTMLCanvasElement;

setContent(canvas, (rootCtx) => {
  const count = remember(rootCtx, () => mutableStateOf(0));

  Column(rootCtx, Modifier.create()
    .fillMaxWidth().fillMaxHeight()
    .padding(24)
    .freeze(),
    'spacedBy(16)',
    'center',
  () => {

    Text(rootCtx, 'Canvas UI Demo', Modifier.create().freeze(), {
      fontSize: 28,
      fontWeight: 'bold',
      color: { r: 33, g: 33, b: 33, a: 1 },
    });

    Text(rootCtx, `Count: ${count.value}`, Modifier.create().freeze(), {
      fontSize: 48,
      color: { r: 103, g: 80, b: 164, a: 1 },
    });

    Row(rootCtx, Modifier.create().freeze(), 'spacedBy(12)', 'center', () => {

      Button(rootCtx, '-', () => count.value--,
        Modifier.create().size(56, 56).freeze());

      Button(rootCtx, '+', () => count.value++,
        Modifier.create().size(56, 56).freeze());

      Button(rootCtx, 'Reset', () => { count.value = 0; });
    });
  });
});
```

### 关键设计要点说明

1. **`setContent(canvas, (rootCtx) => { ... })`** — 应用入口，接收 canvas 元素和根组合函数
2. **每个组件的第一个参数是 `ctx: CompositionContext`** — 显式传入，无隐式上下文
3. **组件返回 `void`** — 不返回节点树，通过 ctx.emitLeaf/startGroup/endGroup 发射节点
4. **`remember(rootCtx, () => ...)`** — ctx-first 参数，在当前 Scope 内持久化状态
5. **尾随 lambda 用于子组件声明** — `Column(ctx, mod, arr, align, () => { ... })`
6. **`composable()` HOC** — 包装 `(ctx, props) => void` 为可追踪的 ComposableFunction

---

## 性能目标

| 指标 | 目标值 | 备注 |
|------|--------|------|
| **帧率** | ≥ 55fps (稳定) | 移动端 Chrome/Safari |
| **帧预算** | < 16.67ms (60fps) | 含 JS + Layout + Render |
| **启动时间** | < 100ms (首帧) | 不含 WASM（无 WASM 依赖） |
| **内存占用** | < 50MB (1000 节点场景) | 含 EmittedNode Map + DrawCommand 缓存 |
| **包体积 (gzipped)** | < 40KB (核心) | 不含组件库 |
| **包体积 (完整)** | < 80KB (含基础组件) | Text/Button/Column/Row 等 |

---

## 项目结构

```
pug-canvas-ui/
├── src/
│   ├── index.ts                  # 公共 API 导出入口
│   ├── app-host.ts               # setContent() 入口 + 渲染循环
│   ├── core/                     # 响应式核心 + 组合上下文
│   │   ├── composition-context.ts # ★ CompositionContext / EmittedNode
│   │   ├── composable.ts          # composable() HOC / createAppContext()
│   │   ├── remember.ts            # remember(ctx, calc)
│   │   ├── snapshot.ts
│   │   ├── state.ts
│   │   ├── recomposer.ts
│   │   ├── derived-state.ts
│   │   ├── id-generator.ts
│   │   └── types.ts
│   ├── renderer/                 # Canvas 渲染
│   │   ├── component-renderer.ts  # ★ renderEmittedTree()
│   │   ├── draw-command.ts
│   │   ├── draw-scope.ts
│   │   ├── draw-batch.ts
│   │   ├── layer.ts
│   │   ├── canvas-host.ts
│   │   ├── dirty-region.ts
│   │   ├── path.ts
│   │   ├── text-style.ts
│   │   └── image-loader.ts
│   ├── layout/                   # 布局引擎
│   │   ├── column.ts             # Column 组件
│   │   ├── row.ts                # Row 组件
│   │   ├── box.ts                # Box 组件
│   │   ├── surface.ts            # Surface 组件
│   │   ├── measure-policy.ts     # 线性布局算法
│   │   ├── box-layout.ts         # Box 对齐布局
│   │   ├── constraints.ts
│   │   ├── layout-node.ts
│   │   ├── measure.ts
│   │   ├── modifier.ts
│   │   └── types.ts
│   ├── input/                    # 手势系统
│   ├── animation/                # 动画系统
│   ├── components/               # 组件库 (L0 + L1)
│   │   ├── basic/
│   │   ├── interaction/
│   │   ├── layout/
│   │   ├── container/
│   │   ├── feedback/
│   │   ├── lazy/
│   │   ├── overlay/
│   │   ├── navigation/
│   │   ├── shared/
│   │   └── transition/
│   ├── theme/                    # 主题系统
│   └── platform/                 # 平台适配
├── wiki/                         # 项目文档
├── __tests__/                    # 测试文件
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tsup.config.ts
└── codestyle.md
```

---

## 变更历史

| 时间 | 变更内容 | 操作者 |
|------|---------|--------|
| 2026-04-30 17:35 | 初始版本，11 个 ADR 全部确认 | AI |
| 2026-04-30 18:40 | 新增 5 个 ADR：数据流管理、错误处理、性能优化、测试策略（共 16 个） | AI |
| 2026-05-07 00:00 | **重大架构升级**：全面迁移到 Emit-based Composition 模型 | AI |
| | - 新增 CompositionContext / EmittedNode 类型 | |
| | - 组件签名改为 ctx-first + void 返回 | |
| | - 新增 renderEmittedTree() 渲染管线 | |
| | - 新增 L0/L1 分层组件架构 | |
| | - 移除 ComponentNode 返回模式相关描述 | |
| 2026-05-07 | **API 精简 + Demo 重写**：公共 API 收敛至 ~41 个值导出 | AI |
| | - Card 从公共 API 移除（转为内部组件） | |
| | - Demo 重写为 5 Tab 页面（首页/交互/布局/反馈/列表） | |
| | - 新增 M 主题对象（fab/circularProgress/linearProgress/errorButton 等） | |
| | - 删除 ui.ts barrel 文件，页面直接从 @/components/ 导入 | |
| | - 所有页面通过 composable() HOC 包装导出 | |
