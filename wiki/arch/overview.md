---
id: "canvas-ui-runtime-overview"
type: architecture
status: accepted
title: "Canvas UI 运行时 — 系统架构总览"
depends_on:
  - "../road-map/canvas-ui-runtime.md"
created: "2026-04-30 17:35"
updated: "2026-04-30 18:40"
stale: false
---

# Canvas UI 运行时 — 系统架构总览

## 项目标识

| 属性 | 值 |
|------|-----|
| **名称** | Pug Canvas UI Runtime |
| **定位** | 移动端优先的 TypeScript Canvas 声明式 UI 运行时 |
| **核心理念** | 零 DOM 依赖 · 细粒度响应式驱动 · Compose 风格 API |
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

## 系统分层架构

```
┌─ AppContext (统一根对象) ───────────────────────────────┐
│  id / canvas / ctx / lifecycle                           │
│  setContent() / start() / stop() / dispose()             │
├──────────┬──────────┬──────────┬──────────┬───────────────┤
│ Reactive │ Renderer │  Layout  │  Input   │   Animation   │
│   Core   │          │          │          │               │
│ ─────── │ ──────── │ ──────── │ ──────── │ ───────────── │
│ Snapshot │ Hybrid   │ Linear   │ Gesture  │ Property-Driven│
│ Context  │ Mode     │ Column/Row│ Recognizer│ Animatable   │
│composable()HOC    │ Modifier │ Modifier │ Transition    │
│State/MutableState │ Chain    │ PointerInput             │
├──────────┴──────────┴──────────┴──────────┴───────────────┤
│              Theme + Configuration (平台层)                 │
│   SafeArea / DPI / Density / Performance / A11y           │
└──────────────────────────────────────────────────────────┘
         ↑ 纯 TypeScript 自研    ↑ 零 DOM 依赖
         ↑ 零全局变量/static     ↑ 单 Canvas 架构
```

---

## 核心架构决策索引

### 🔴 P0 核心层（已确认）

| # | 决策点 | 方案 | ADR 文档 | 状态 |
|---|--------|------|---------|------|
| 1 | 响应式状态系统 | **自研 Snapshot + Context**（禁止 global/static） | [reactive-state-snapshot-context-based.md](./adrs/reactive-state-snapshot-context-based.md) | ✅ accepted |
| 2 | @Composable 追踪 | **运行时 HOC 包装**（`composable()` 函数） | [composable-tracking-runtime-hoc.md](./adrs/composable-tracking-runtime-hoc.md) | ✅ accepted |
| 3 | 渲染架构 | **Hybrid 混合模式**（声明式 API + 轻量 LayoutNode + DrawCommand 缓存） | [rendering-architecture-hybrid-mode.md](./adrs/rendering-architecture-hybrid-mode.md) | ✅ accepted |
| 4 | 布局引擎 | **自研简化线性布局 Column/Row**（无 W3C Flexbox） | [layout-engine-custom-linear-column-row.md](./adrs/layout-engine-custom-linear-column-row.md) | ✅ accepted |

### 🟡 P1 功能层（已确认）

| # | 决策点 | 方案 | ADR 文档 | 状态 |
|---|--------|------|---------|------|
| 5 | 组件模型 | **纯函数调用链**（Compose 风格，无 JSX，尾随 lambda） | [component-model-pure-function-call-chain.md](./adrs/component-model-pure-function-call-chain.md) | ✅ accepted |
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
| 12 | **统一根上下文** | **AppContext = 单 Canvas 实例 + 零全局变量 + setContent() 入口** | [appcontext-unified-root-architecture.md](./adrs/appcontext-unified-root-architecture.md) | ✅ accepted |
| 13 | **数据流管理** | **单向数据流 + Context 注入**（禁止双向绑定和全局变量） | [data-flow-management-unidirectional-pattern.md](./adrs/data-flow-management-unidirectional-pattern.md) | ✅ accepted |
| 14 | **错误处理机制** | **Error Boundary + 全局捕获 + 分级恢复**（三层防御体系） | [error-handling-global-catch-recovery.md](./adrs/error-handling-global-catch-recovery.md) | ✅ accepted |
| 15 | **性能优化方案** | **虚拟化 + 智能缓存 + 增量渲染**（多层次优化体系） | [performance-optimization-virtualization-caching.md](./adrs/performance-optimization-virtualization-caching.md) | ✅ accepted |
| 16 | **测试策略与覆盖率** | **测试金字塔模型**（单元 65-80% + 集成 15-25% + E2E 5-10%） | [testing-strategy-unit-integration-e2e.md](./adrs/testing-strategy-unit-integration-e2e.md) | ✅ accepted |

---

## 模块清单与职责

### core/ — 响应式核心

| 模块 | 职责 | 关键导出 |
|------|------|---------|
| `snapshot.ts` | Snapshot 系统（全局快照、嵌套快照、提交/回滚） | `Snapshot`, `MutableSnapshot` |
| `state.ts` | 可变状态容器 | `MutableState<T>`, `State<T>`, `derivedStateOf()` |
| `recomposer.ts` | 重组调度器（Scope 管理、脏标记、批量更新） | `Recomposer`, `RecomposeScope` |
| `composable.ts` | Composable 函数包装器 | `composable<TProps>()`, `remember<T>()` |

### renderer/ — Canvas 渲染引擎

| 模块 | 职责 | 关键导出 |
|------|------|---------|
| `draw-command.ts` | 不可变绘制指令定义 | `DrawCommand`, `FillRectCmd`, `FillTextCmd`, ... |
| `layer.ts` | 图层管理与 Z-order | `Layer`, `LayerTree` |
| `hybrid-renderer.ts` | Hybrid 渲染管线（重组→缓存→脏区域→绘制） | `HybridRenderer`, `RenderScope` |

### layout/ — 布局引擎

| 模块 | 职责 | 关键导出 |
|------|------|---------|
| `column-row.ts` | Column/Row 线性布局算法 | `Column()`, `Row()` |
| `measure.ts` | Constraints + Measure/Layout 两阶段 | `Constraints`, `MeasureResult`, `Placeable` |
| `modifier-layout.ts` | Modifier 对布局的影响（size/padding/weight/offset） | `LayoutModifier` |

### input/ — 输入事件系统

| 模块 | 职责 | 关键导出 |
|------|------|---------|
| `pointer-events.ts` | Pointer Event 封装与分发 | `PointerEvent`, `HitTestResult` |
| `gesture-recognizers.ts` | 手势识别器（Tap/Drag/Pinch/Fling） | `TapGesture`, `DragGesture`, `PinchGesture` |

### animation/ — 动画系统

| 模块 | 职责 | 关键导出 |
|------|------|---------|
| `animatable.ts` | 可动画值容器 | `Animatable<T>` |
| `animation-spec.ts` | 动画规格族系 | `tween()`, `spring()`, `keyframes()`, `repeatable()` |
| `transition.ts` | 多属性协同过渡 | `updateTransition<S>()`, `animate*AsState()` |

### components/ — 组件库

| 分类 | 组件 | 说明 |
|------|------|------|
| **基础原子** | `Text`, `Image`, `Box`, `Column`, `Row`, `Spacer`, `Surface` | 最小可演示集 |
| **交互组件** | `Button`, `TextField`, `Switch`, `Checkbox`, `RadioButton`, `Slider` | 用户输入 |
| **容器组件** | `Card`, `Scaffold`, `LazyColumn`, `LazyRow`, `TabRow`, `BottomNavigation` | 复杂页面构建 |
| **弹窗组件** | `Dialog`, `ModalBottomSheet`, `DropdownMenu`, `Popup` | 覆盖层 |
| **导航组件** | `NavHost`, `NavController` | 页面路由 |

### platform/ — 平台适配

| 模块 | 职责 |
|------|------|
| `safe-area.ts` | 安全区域检测与注入 |
| `density.ts` | DPI 缩放、Dp 单位转换 |
| `performance.ts` | FPS Monitor、Recomposition Counter |
| `accessibility.ts` | 无障碍语义树 |

---

## 核心数据流

```
用户交互 (Touch/Keyboard)
    ↓
Input System (PointerEvent 封装)
    ↓ Hit Test
Gesture Recognizer (识别 Tap/Drag/Pinch)
    ↓ 回调执行
State 更新 (MutableState.value = newValue)
    ↓
Snapshot.write(state, newValue)
    ↓ 标记 RecomposeScope 脏
Recomposer.collectDirtyScopes()
    ↓ requestAnimationFrame
Phase 1: Recomposition
    ├─ 执行 dirty Scope.composable()
    ├─ 生成新的 DrawCommand[]
    └─ 缓存到 LayoutNode
Phase 2: Layout (仅 dirty 节点)
    ├─ Constraints 传递
    ├─ Measure/Placement 计算
    └─ 更新 Position 信息
Phase 3: Render (仅脏区域)
    ├─ 计算脏区域包围盒
    ├─ ctx.clearRect(dirtyRect)
    ├─ ctx.clip(dirtyRegion)
    ├─ 按 Layer 顺序遍历受影响节点
    │   ├─ 批量合并相同类型 DrawCommand
    │   └─ cmd.execute(ctx) → Canvas 2D API
    └─ ctx.restore()
    ↓
屏幕像素更新 (60fps)
```

---

## 公共 API 示例

```typescript
import {
  AppContext,
  composable,
  remember,
  mutableStateOf,
  Column, Row, Text, Button, Box,
  Modifier,
  Arrangement, Alignment,
  Color, Dp, Sp, FontWeight
} from 'pug-canvas-ui';

// 创建应用上下文（通过构造函数，非 static）
const app = new AppContext({
  canvas: '#app-canvas',
  width: 375,
  height: 667 // iPhone SE 尺寸
});

// setContent() — 设置根组件（唯一组合入口）
app.setContent((ctx) => {  // ← ctx 是 ComposerContext (AppContext 的只读子集)
  const count = remember(() => mutableStateOf(0));
  
  return Column({
    modifier: Modifier
      .fillMaxSize()
      .padding(24.dp)
      .background(ctx.theme.colors.surface),
    verticalArrangement: Arrangement.spacedBy(16.dp),
    horizontalAlignment: Alignment.CenterHorizontally
  }) {
    
    Text({
      text: 'Canvas UI Demo',
      fontSize: 28.sp,
      fontWeight: FontWeight.Bold,
      color: ctx.theme.colors.onSurface
    });
    
    Text({
      text: `Count: ${count.value}`,
      fontSize: 48.sp,
      color: ctx.theme.colors.primary
    });
    
    Row({
      horizontalArrangement: Arrangement.spacedBy(12.dp)
    }) {
      Button({
        text: '-',
        onClick: () => count.value--,
        modifier: Modifier.size(56.dp)
      });
      
      Button({
        text: '+',
        onClick: () => count.value++,
        modifier: Modifier.size(56.dp).background(ctx.theme.colors.primaryContainer)
      });
      
      Button({
        text: 'Reset',
        onClick: () => { count.value = 0; }
      });
    };
  };
});

// 启动应用
app.start();

// 响应尺寸变化
window.addEventListener('resize', () => {
  app.resize(window.innerWidth, window.innerHeight);
});

// 页面卸载时销毁（释放所有资源）
window.addEventListener('unload', () => {
  app.dispose();
});
```

---

## 性能目标

| 指标 | 目标值 | 备注 |
|------|--------|------|
| **帧率** | ≥ 55fps (稳定) | 移动端 Chrome/Safari |
| **帧预算** | < 16.67ms (60fps) | 含 JS + Layout + Render |
| **启动时间** | < 100ms (首帧) | 不含 WASM（无 WASM 依赖） |
| **内存占用** | < 50MB (1000 节点场景) | 含 LayoutNode + DrawCommand 缓存 |
| **包体积 (gzipped)** | < 40KB (核心) | 不含组件库 |
| **包体积 (完整)** | < 80KB (含基础组件) | Text/Button/Column/Row 等 |

---

## 项目结构

```
pug-canvas-ui/
├── src/
│   ├── index.ts                  # 公共 API 导出入口
│   ├── core/                     # 响应式核心
│   │   ├── snapshot.ts
│   │   ├── state.ts
│   │   ├── recomposer.ts
│   │   └── composable.ts
│   ├── renderer/                 # Canvas 渲染
│   │   ├── draw-command.ts
│   │   ├── layer.ts
│   │   └── hybrid-renderer.ts
│   ├── layout/                   # 布局引擎
│   │   ├── column-row.ts
│   │   ├── measure.ts
│   │   └── constraint.ts
│   ├── input/                    # 手势系统
│   │   ├── pointer-events.ts
│   │   └── gesture-recognizers.ts
│   ├── animation/                # 动画系统
│   │   ├── animatable.ts
│   │   ├── animation-spec.ts
│   │   └── transition.ts
│   ├── components/               # 组件库
│   │   ├── basic/
│   │   ├── interaction/
│   │   └── layout/
│   └── platform/                 # 平台适配
│       ├── safe-area.ts
│       ├── density.ts
│       └── performance.ts
├── __tests__/                    # 测试文件
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tsup.config.ts
└── README.md
```

---

## 下一步行动

### 立即可执行

1. **初始化项目**：执行 `cc-init` 生成 CodeStyle 和 AGENTS.md
2. **Spike 验证**：按优先级实现以下 Spike
   - `snapshot-context-spike` (验证 Context-based State 系统)
   - `composable-hoc-spike` (验证 HOC 追踪性能)
   - `hybrid-renderer-spike` (验证 Hybrid 渲染管线)
   - `linear-layout-spike` (验证 Column/Row 算法正确性)

### 近期目标 (Phase 1)

基于 [`canvas-ui-runtime.yaml`](../road-map/canvas-ui-runtime.yaml) 中的 Feature 清单：
- **feat-01 ~ feat-07**: 核心跑通（状态+重组+渲染+布局）

---

## 变更历史

| 时间 | 变更内容 | 操作者 |
|------|---------|--------|
| 2026-04-30 17:35 | 初始版本，11 个 ADR 全部确认 | AI |
| 2026-04-30 18:40 | 新增 5 个 ADR：数据流管理、错误处理、性能优化、测试策略（共 16 个） | AI |
