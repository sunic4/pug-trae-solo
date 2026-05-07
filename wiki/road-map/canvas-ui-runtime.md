---
id: "canvas-ui-runtime"
type: requirement
status: implemented
title: "移动端优先的 TypeScript Canvas UI 运行时"
depends_on: []
created: "2026-04-30 16:06"
updated: "2026-04-30 16:10"
stale: false
---

# 移动端优先的 TypeScript Canvas UI 运行时

## 背景

构建一个完全基于 HTML5 Canvas 的声明式 UI 运行时，参考 Android Jetpack Compose 的设计理念：
- **细粒度响应式驱动**：通过 State/Snapshot 系统实现最小化 UI 更新
- **智能重组机制**：仅重新执行受状态变更影响的 Composable 函数
- **零 DOM 依赖**：所有渲染通过 Canvas 2D API 完成
- **移动端优先**：针对触摸交互、安全区域、性能约束优化

目标受众：需要在 Canvas 上构建复杂 UI 的应用（游戏 HUD、数据可视化大屏、跨平台 Hybrid 应用等）

## 模块划分

### 模块: Reactive Core（响应式核心）
| 属性 | 值 |
|------|-----|
| 职责 | 状态管理、变更检测、重组调度 |
| 输入 | State 对象创建/读取/写入 |
| 输出 | 重组范围（Scope）通知、脏节点标记 |
| 不做 | 不涉及渲染、不涉及布局计算 |
| 依赖 | 无（底层模块） |
| 复杂度 | 接口数 ~15 / 数据结构数 ~8 |
| 风险点 | 循环依赖检测、重组栈溢出防护、大量状态变更时的批处理性能 |

#### 核心能力
- [x] `State<T>` / `MutableState<T>` 响应式状态容器
- [x] `derivedStateOf()` 计算派生状态（带缓存）
- [x] `remember()` 组合内状态持久化
- [x] Snapshot 系统（全局快照、嵌套快照、提交/回滚）
- [x] 重组调度器（合并批量更新、优先级队列）
- [x] 变更作用域（Recompose Scope）自动管理
- [x] `@Composable` 函数标记与追踪（编译时/运行时）
- [x] 跳过策略（equals 比较稳定跳过、unchanged 优化）
- [x] SideEffect / LaunchedEffect 生命周期副作用

### 模块: Renderer（渲染引擎）
| 属性 | 值 |
|------|-----|
| 职责 | Canvas 2D 绘制调用、图层管理、脏区域优化 |
| 输入 | 绘制指令（DrawCommand）、图层树 |
| 输出 | Canvas 像素输出 |
| 不做 | 不处理事件、不做布局计算 |
| 依赖 | Reactive Core（接收重组触发信号） |
| 复杂度 | 接口数 ~20 / 外部依赖 Canvas API |
| 风险点 | 大量 DrawCall 时的性能瓶颈、离屏 Canvas 内存占用、抗锯齿与像素对齐 |

#### 核心能力
- [x] Canvas 上下文封装与管理
- [x] 绘制指令抽象（DrawCommand / DrawScope）
- [x] 图层树（Layer Tree）管理
- [x] 脏区域（Dirty Rect）计算与裁剪
- [x] 离屏缓存（Offscreen Buffer）策略
- [x] 批量绘制合并（Batching）
- [x] 矢量图形绘制：Rect / Circle / RoundRect / Path / Line
- [x] 图片绘制与变换（缩放、旋转、九宫格）
- [x] 文本绘制（单行/多行、省略号、样式）
- [x] 混合模式（Blend Mode）与透明度
- [x] 阴影与滤镜效果

### 模块: Layout（布局引擎）
| 属性 | 值 |
|------|-----|
| 职责 | 测量（Measure）、放置（Position）、尺寸约束传递 |
| 输入 | 父组件约束（Constraints）、子组件固有尺寸（IntrinsicSize） |
| 输出 | 子组件位置与尺寸（Placement） |
| 不做 | 不绘制、不处理事件 |
| 依赖 | 无（纯计算模块，但被 Renderer 消费） |
| 复杂度 | 接口数 ~12 / 算法复杂度高 |
| 风险点 | 约束循环依赖检测、无限布局递归防护、线性布局性能优化 |

#### 核心能力
- [x] Constraints 系统（min/max width/height）
- [x] Measure / Layout 两阶段管线
- [x] Placeable 抽象（测量结果 + 放置方法）
- [x] IntrinsicSize 计算（min/max preferred size）
- [x] 线性布局算法（Column/Row、Arrangement、Alignment、Weight 权重分配）
- [x] 约束布局基础版（相对定位、百分比约束）
- [x] 绝对定位与偏移修饰符（offset / padding）
- [x] 文本测量与换行算法
- [x] 修饰符链（Modifier Chain）：size / padding / background / offset / clickable 等

### 模块: Input（输入事件系统）
| 属性 | 值 |
|------|-----|
| 职责 | Pointer 事件分发、手势识别、焦点管理 |
| 输入 | 原始 PointerEvent / KeyboardEvent |
| 输出 | 高级手势事件（Tap / LongPress / Drag 等）、状态变更信号 |
| 不做 | 不触发业务逻辑、不修改 UI 结构 |
| 依赖 | Layout（命中测试需要布局坐标）、Reactive Core（事件可触发状态变更） |
| 复杂度 | 接口数 ~18 / 状态机复杂度高 |
| 风险点 | 手势冲突仲裁（如点击 vs 拖拽）、多指触控同步、事件冒泡性能 |

#### 核心能力
- [x] Pointer Event 封装（position / pressure / pointerId / type）
- [x] 命中测试（Hit Test）遍历组件树
- [x] 事件冒泡与拦截机制（consume / intercept）
- [x] 点击手势识别器（Tap / DoubleTap）
- [x] 长按手势识别器（LongPress）
- [x] 拖拽手势识别器（Drag / HorizontalDrag / VerticalDrag）
- [x] 缩放手势识别器（Pinch / Rotate）
- [x] 快速滑动识别器（Fling + VelocityTracker）
- [x] 手势冲突解决策略（互斥/协作/自定义优先级）
- [x] 焦点管理（FocusRequester / FocusManager）
- [x] 键盘输入与 IME 集成

### 模块: Animation（动画系统）
| 属性 | 值 |
|------|-----|
| 职责 | 属性插值、时间轴管理、动画状态驱动 |
| 输入 | 目标值 / 动画规格（Spec）/ 触发条件 |
| 输出 | 每帧插值结果（驱动 State 变更 → 触发重组） |
| 不做 | 不直接绘制、不处理用户输入 |
| 依赖 | Reactive Core（Animatable 本质是随时间变化的 State）、Renderer（可能需要逐帧回调） |
| 复杂度 | 接口数 ~15 / 数学计算密集 |
| 风险点 | 动画帧丢帧处理、大量并发动画性能、Spring 物理模拟稳定性 |

#### 核心能力
- [x] AnimationSpec 族系（Tween / Spring / Keyframes / Repeatable / Infinite）
- [x] Animatable<T> 可动画值容器
- [x] animate*AsState 简易 API（animateColorAsState / animateFloatAsState 等）
- [x] updateTransition 状态间过渡动画
- [x] Crossfade 淡入淡出
- [x] AnimatedContent 内容转场
- [x] 动画生命周期（pause / resume / cancel / snapTo）
- [x] VectorConverter 类型转换（Color / Dp / Offset / Size 等）
- [x] Physics-based 动画（Spring damping/stiffness、Decay 惯性）

### 模块: Components（组件库）
| 属性 | 值 |
|------|-----|
| 职责 | 提供可复用的预构建 UI 组件 |
| 输入 | 组件属性（Props） |
| 输出 | 组合了 Layout + Renderer + Input 的完整 UI 单元 |
| 不做 | 不包含业务逻辑 |
| 依赖 | 全部上述模块（聚合层） |
| 复杂度 | 组件数 ~30+ / 主要是组合工作 |
| 风险点 | API 设计一致性、可扩展性（Slot API / CompositionLocal） |

#### 核心能力（Emit-based Composition 模型 — 2026-05-07 架构升级后）

> **架构迁移说明（2026-05-07）**：组件模型已从"返回 ComponentNode 树"全面迁移到 **Emit-based Composition 模型**：
> - 所有组件签名：`fn(ctx: CompositionContext, ...props): void`（ctx-first，void 返回）
> - 叶子组件通过 `ctx.emitLeaf()` 发射节点到 Map
> - 容器组件通过 `ctx.startGroup()` / `ctx.endGroup()` 发射节点
> - 渲染器通过 `renderEmittedTree(Map<NodeId, EmittedNode>)` 消费
> - 分为 L0（原子）和 L1（组合）两层

- **L0 原子组件**（直接 emit 节点，全部公共导出）
  - [x] Text（文本：ctx.emitLeaf + textMeasurePolicy + textDrawPolicy）
  - [x] Image（图片：ctx.emitLeaf）
  - [x] Spacer（占位：ctx.emitLeaf + ConstrainedMeasurePolicy）
  - [x] Box（容器：ctx.startGroup/endGroup + BoxAlignmentMeasurePolicy）
  - [x] Column / Row（线性布局：ctx.startGroup + linearMeasurePolicy + layoutColumnChildren/layoutRowChildren）
  - [x] Surface（Material容器：ctx.startGroup/endGroup）
  - [x] Slider（滑块：ctx.emitLeaf）
  - [x] Checkbox（选择：ctx.emitLeaf）
  - [x] TextField（输入框：ctx.emitLeaf）
  - [x] CircularProgressIndicator / LinearProgressIndicator（进度：ctx.emitLeaf）
- **L1 组合组件**（组合 L0 组件，同样 ctx-first + void 返回）
  - [x] Button（Surface + Text + clickable Modifier）
  - [x] FAB（Surface + 圆形裁剪）
  - [x] ~~Card~~（**已从公共 API 移除**，转为内部组件，demo 通过 `M.card()` 封装使用 Surface 实现）
  - [x] Scaffold（topBar/content/bottomBar/snackbarHost 四槽位）
  - [x] TopAppBar（Row + title + actions）
  - [x] TabRow（Surface + Row + indicator）
  - [x] BottomNavigation（Row + BottomNavItem[]）
  - [x] Snackbar（Surface + Text + Button）
  - [x] Dialog（Surface半透明 + content + buttons）
  - [x] ModalBottomSheet（底部弹出面板）
  - [x] DropdownMenu（下拉菜单）
  - [x] Popup（轻量弹出层）
  - [x] LazyColumn / LazyRow（虚拟列表：item/lazyItem、itemKey）

> **Demo 覆盖情况**（5 Tab 演示应用）：
> | Tab | 页面 | 覆盖组件 |
> |-----|------|---------|
> | 首页 | home-page.ts | Text, Button, Box, Surface, Column, Row, Spacer, M 主题工具全量 |
> | 交互 | interaction-page.ts | Slider, Checkbox, Button, TextField, FAB, Snackbar |
> | 布局 | layout-page.ts | Column, Row, Box, Surface, Spacer, Modifier 链 (全部 Arrangement/Alignment) |
> | 反馈 | feedback-page.ts | CircularProgressIndicator, LinearProgressIndicator, Dialog, Snackbar |
> | 列表 | list-page.ts | Column, Button, Box, Surface (M.card), 动态列表渲染 |

> **最终公共 API**：约 **41 个值导出**（不含 type-only 导出），无 ui.ts barrel 文件。

### 模块: Platform（平台适配与工具）
| 属性 | 值 |
|------|-----|
| 职责 | 设备适配、性能监控、内存管理、无障碍 |
| 输入 | 设备信息、浏览器 API |
| 输出 | 适配后的配置参数、调试信息 |
| 不做 | 不参与核心渲染流程 |
| 依赖 | Renderer（监控渲染性能）、Layout（可视化布局边界） |
| 复杂度 | 接口数 ~10 / 平台相关代码分散 |
| 风险点 | 不同浏览器 Canvas 行为差异、设备碎片化 |

#### 核心能力
- [x] 安全区域（SafeArea）检测与注入
- [x] 屏幕方向变化响应
- [x] DPI 缩放与 Density 管理
- [x] FPS Monitor 与性能 Overlay
- [x] Recomposition Counter（重组计数调试）
- [x] 布局边界可视化（Layout Inspector）
- [x] 对象池（Object Pool）减少 GC 压力
- [x] 离屏 Canvas 生命周期管理
- [x] Accessibility 语义树（Semantics Node）
- [x] 屏幕阅读器 ARIA 兼容层

## 接口契约

### 接口: ReactiveCore ↔ Renderer（重组触发重绘）
| 属性 | 值 |
|------|-----|
| 方向 | ReactiveCore → Renderer |
| 协议 | 内部事件 / 回调 |
| 格式 | TypeScript 类型 |

```typescript
interface RecomposeSignal {
  scopeId: string;
  timestamp: number;
  changedStates: Array<{ stateId: string; oldValue: unknown; newValue: unknown }>;
}

type OnRecomposeCallback = (signal: RecomposeSignal) => void;
```

### 接口: Layout ↔ Input（命中测试坐标）
| 属性 | 值 |
|------|-----|
| 方向 | Input → Layout |
| 协议 | 内部函数调用 |
| 格式 | TypeScript 类型 |

```typescript
interface HitTestResult {
  nodeId: string;
  globalToLocalMatrix: Matrix4;
  zIndex: number;
  consume: () => void; // 消费事件阻止冒泡
}

type HitTestFunction = (point: Point) => HitTestResult[];
```

### 接口: Input ↔ ReactiveCore（事件触发状态变更）
| 属性 | 值 |
|------|-----|
| 方向 | Input → ReactiveCore |
| 协议 | 内部函数调用 |
| 格式 | TypeScript 类型 |

```typescript
interface GestureEvent {
  type: 'tap' | 'longPress' | 'drag' | 'pinch' | 'fling';
  targetNodeId: string;
  position: Point;
  velocity?: Velocity; // for fling/drag
  delta?: Offset;       // for drag/pinch
}
```

### 接口: Animation ↔ ReactiveCore（动画驱动状态）
| 属性 | 值 |
|------|-----|
| 方向 | Animation → ReactiveCore（双向） |
| 协议 | 内部订阅 |
| 格式 | TypeScript 类型 |

```typescript
interface AnimationFrame {
  animatableId: string;
  value: number;           // 当前插值
  velocity: number;        // 当前速度（for spring）
  isRunning: boolean;
}
```

### 接口: Components → 所有模块（聚合接口，Emit-based 模型）
| 属性 | 值 |
|------|-----|
| 方向 | Components → 各模块 |
| 协议 | 公共 API 导出 |
| 格式 | TypeScript 类型 |

```typescript
// 公共 API 入口（Emit-based Composition 模型）
interface ComposeRuntime {
  // 应用入口
  setContent: (canvas: HTMLCanvasElement, appComposable: (ctx: CompositionContext) => void) => AppHost

  // Reactive Core
  mutableStateOf: <T>(initial: T, snapshot: Snapshot) => MutableState<T>
  remember: <T>(ctx: CompositionContext, calculation: () => T, keys?: readonly RememberKey[]) => T
  derivedStateOf: <T>(calc: () => T) => DerivedState<T>
  composable: <TProps>(fn: (ctx: CompositionContext, props: TProps) => void) => ComposableFunction<TProps>
  createAppContext: (options?: AppContextOptions) => ComposerContext

  // L0 组件（ctx-first + void 返回）
  Text: (ctx: CompositionContext, text: string, modifier?, style?) => void
  Image: (ctx: CompositionContext, src: ImageSource, modifier?, options?) => void
  Spacer: (ctx: CompositionContext, width?, height?, modifier?) => void
  Box: (ctx: CompositionContext, contentFn?, modifier?, alignment?) => void
  Column: (ctx: CompositionContext, modifier?, arrangement?, alignment?, childrenFn?) => void
  Row: (ctx: CompositionContext, modifier?, arrangement?, alignment?, childrenFn?) => void
  Surface: (ctx: CompositionContext, contentFn?, options?) => void

  // L1 组合组件（同样 ctx-first + void 返回）
  Button: (ctx: CompositionContext, text: string, onClick: () => void, modifier?, options?) => void
  Scaffold: (ctx: CompositionContext, topBar?, content?, bottomBar?, snackbarHost?, options?) => void
  // ... 更多组件

  // 渲染器（内部使用）
  renderEmittedTree: (ctx: DrawContext, nodes: Map<number, EmittedNode>, rootNodeId: number, width: number, height: number) => DrawCommand[]

  // Modifier
  Modifier: ModifierFactory

  // 类型导出
  CompositionContext: typeof import('./core/composition-context').CompositionContext
  EmittedNode: typeof import('./core/composition-context').EmittedNode
  NodeId: number
}
```

## 子 Feature 清单

见附件 [`canvas-ui-runtime.yaml`](./canvas-ui-runtime.yaml)

## 里程碑

| 阶段 | 目标 | 包含 feat | 预期产出 |
|------|------|-----------|---------|
| Phase 1 | 核心跑通 | feat-01 ~ feat-07 | 可声明式绘制基础图形并响应状态变化 |
| Phase 2 | 交互就绪 | feat-08 ~ feat-14 | 完整触摸交互 + Flexbox 布局 + 基础动画 |
| Phase 3 | 组件丰富 | feat-15 ~ feat-22 | 完整基础组件库 + 虚拟列表 + 弹窗 |
| Phase 4 | 生产可用 | feat-23 ~ feat-28 | 导航路由 + 平台适配 + 性能调优 + 无障碍 |

## 风险与缓解

| 风险 | 量化影响 | 缓解措施 |
|------|---------|---------|
| 重组性能瓶颈 | 1000+ 组件时掉帧 | Skip 机制 + Batching + Profiler 引导优化 |
| Canvas 文本渲染质量 | 中文字体显示模糊 | 预加载字体、离屏高清缓存、TextMetrics 精确测量 |
| 手势冲突复杂性 | 自定义手势组合困难 | 提供手势互斥表 + 自定义 GestureDetector 组合 API |
| 内存占用（离屏Canvas） | 低端设备 OOM | LRU 缓存策略 + 按需分配 + 显式释放 API |
| TypeScript 编译时 @Composable | 无法原生支持 | 运行时追踪 + 未来考虑 Babel 插件/SWC transform |
