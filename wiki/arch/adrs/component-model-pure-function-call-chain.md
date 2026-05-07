---
id: "component-model-pure-function-call-chain"
type: architecture
status: accepted
title: "组件模型 — Emit-based 纯函数调用链 (ctx-first, void 返回, 无 JSX)"
depends_on:
  - "../road-map/canvas-ui-runtime.md"
  - "./composable-tracking-runtime-hoc.md"
  - "./layout-engine-custom-linear-column-row.md"
created: "2026-04-30 17:10"
updated: "2026-05-07 00:00"
stale: false
---

# ADR: 组件模型 — Emit-based 纯函数调用链

## 背景

在确定使用 `composable()` HOC 追踪机制和 Column/Row 布局引擎后，需要决定：

> **Composable 函数的 API 风格是什么？如何组合子组件？返回值类型是什么？**

三大候选：
- **JSX-like**：需要编译时转换，虚拟节点中间层
- **Emit-based 纯函数调用链**：通过 ctx 显式发射节点，void 返回值
- **Widget Tree**：OOP class 继承，Flutter 风格

## 决策结果

选择 **Emit-based 纯函数调用链模式（Compose 风格）**，核心特征为 **ctx-first 参数 + void 返回 + emit 节点**。

### 核心设计原则

```
✅ 纯 TypeScript 函数调用
✅ 无 JSX Transform
✅ 无虚拟节点/虚拟 DOM
✅ ctx: CompositionContext 作为第一个参数
✅ 返回 void（不返回节点树）
✅ 通过 ctx.emitLeaf() / ctx.startGroup() / ctx.endGroup() 发射节点
✅ 尾随 lambda 支持子组件声明
```

### 公共 API 规范

```typescript
// ===== 核心类型 =====

interface CompositionContext extends ComposerContext {
  emitLeaf(data, modifier, measurePolicy, drawPolicy): void
  startGroup(data, modifier, measurePolicy, drawPolicy?, layoutChildren?): void
  endGroup(): void
  readonly emittedNodes: Map<NodeId, EmittedNode>
  rootNodeId: NodeId | null
}

// ===== composable() HOC 定义 =====

function composable<TProps>(
  fn: (ctx: CompositionContext, props: TProps) => void,
): ComposableFunction<TProps>;

// ComposableFunction 的签名（外部调用视角）
type ComposableFunction<TProps> = (props: TProps, ctx: ComposerContext) => ComposableNode | null;

// ===== L0 原子组件签名（实际源码）=====

function Text(
  ctx: CompositionContext,
  text: string,
  modifier?: ReadonlyModifier,
  style?: TextStyle,
): void;

function Image(
  ctx: CompositionContext,
  src: ImageSource,
  modifier?: ReadonlyModifier,
  options?: ImageOptions,
): void;

function Spacer(
  ctx: CompositionContext,
  width?: number,
  height?: number,
  modifier?: ReadonlyModifier,
): void;

function Box(
  ctx: CompositionContext,
  contentFn?: () => void,
  modifier?: ReadonlyModifier,
  alignment?: Alignment,
): void;

function Column(
  ctx: CompositionContext,
  modifier?: ReadonlyModifier,
  arrangement?: Arrangement,
  alignment?: Alignment,
  childrenFn?: () => void,
): void;

function Row(
  ctx: CompositionContext,
  modifier?: ReadonlyModifier,
  arrangement?: Arrangement,
  alignment?: Alignment,
  childrenFn?: () => void,
): void;

function Surface(
  ctx: CompositionContext,
  contentFn?: () => void,
  options?: SurfaceOptions,
): void;
```

### 组件内部实现模式

所有组件遵循统一的 emit 模式：

```typescript
function Text(ctx: CompositionContext, text: string, modifier, style): void {
  const mod = normalizeModifier(modifier)
  const measurePolicy = textMeasurePolicy(text, style)
  const drawPolicy = textDrawPolicy(text, style)
  ctx.emitLeaf({ text, style }, mod, measurePolicy, drawPolicy)
}

function Column(ctx: CompositionContext, modifier, arrangement, alignment, childrenFn): void {
  const mod = normalizeModifier(modifier)
  const measurePolicy = linearMeasurePolicy('vertical', arrangement, alignment)
  ctx.startGroup({ arrangement, alignment }, mod, measurePolicy, NOOP_DRAW_POLICY,
    (contentArea, measuredSizes, childrenIds) => {
      return layoutColumnChildren(childrenIds, contentArea, measuredSizes, arrangement, alignment)
    },
  )
  if (childrenFn) { childrenFn() }
  ctx.endGroup()
}
```

### 使用示例

```typescript
const Greeting = composable<{ name: string }>((ctx, { name }) => {
  const count = remember(ctx, () => mutableStateOf(0));

  Column(ctx, Modifier.create().padding(16).freeze(), 'spacedBy(8)', 'start', () => {

    Text(ctx, `Hello, ${name}!`, Modifier.create().freeze(), {
      fontSize: 24,
      fontWeight: 'bold',
    });

    Text(ctx, `Count: ${count.value}`, Modifier.create().freeze());

    Button(ctx, 'Increment', () => count.value++);
  });
});
```

### 尾随 Lambda（Trailing Lambda）语法

```typescript
// 方式：尾随 lambda（子组件声明）

Column(ctx, Modifier.create().fillMaxSize().freeze(), 'spacedBy(16)', 'center', () => {
  Text(ctx, 'Child 1', Modifier.create().freeze());
  Text(ctx, 'Child 2', Modifier.create().freeze());
});

// 实现原理：childrenFn 是最后一个可选参数
function Column(
  ctx: CompositionContext,
  modifier?: ReadonlyModifier,
  arrangement?: Arrangement,
  alignment?: Alignment,
  childrenFn?: () => void,
): void;
```

### 条件渲染与列表

```typescript
const UserProfile = composable<{ user: User | null }>((ctx, { user }) => {
  Column(ctx, Modifier.create().padding(16).freeze(), 'spacedBy(8)', 'start', () => {
    if (user) {
      Avatar(ctx, { url: user.avatarUrl });
      Text(ctx, user.name);
    } else {
      Text(ctx, 'Please login');
      Button(ctx, 'Login', showLoginDialog);
    }
  });
});

const MessageList = composable<{ messages: Message[] }>((ctx, { messages }) => {
  LazyColumn(ctx, messages.length, (index) => {
    MessageBubble(ctx, messages[index]);
  });
});
```

## 正面影响

1. **与已完成决策完美契合**：
   - `composable()` HOC → 函数即组件 ✅
   - **CompositionContext 显式传递 → `(ctx, props)` 参数，ctx 在前** ✅
   - Column/Row 布局 → 直接函数调用 ✅
   - **renderEmittedTree() → 遍历 emittedNodes Map，无需返回值** ✅

2. **零构建工具依赖**：
   - 不需要 JSX Transform
   - 不需要 Babel/SWC 插件配置
   - 不需要 `.tsx` 文件扩展名
   - 纯 `.ts` 文件即可运行

3. **性能最优**：
   - **无虚拟 DOM 中间层**
   - **无返回值构造开销** — 组件直接向 Map 写入，不创建中间对象
   - **EmittedNode 扁平存储** — Map 查找 O(1)，遍历高效
   - 渲染器直接消费 Map，零抽象损耗

4. **调试体验优秀**：
   - 调用栈每一层对应真实代码位置
   - 断点可直接设置在组件函数内部
   - emittedNodes Map 可在运行时检查完整树结构

5. **TypeScript 类型安全**：
   - Props 类型完整推导
   - CompositionContext 接口明确
   - IDE 自动补全完善

## 与旧架构的对比（已废弃）

| 维度 | **Emit-based ✅ (当前)** | ~~返回 ComponentNode~~ (已废弃) |
|------|--------------------------|-------------------------------|
| 返回类型 | `void` | ~~`ComposableNode / LayoutNode / LeafNode`~~ |
| 上下文获取 | **显式 `ctx` 参数第一** | ~~隐式 `getCurrentContext()`~~ |
| 节点创建 | **`ctx.emitLeaf()` / `ctx.startGroup()`** | ~~`return new LayoutNode(...)` / `return new LeafNode(...)`~~ |
| 树结构 | **Map<NodeId, EmittedNode> 扁平存储** | ~~递归嵌套对象树~~ |
| 渲染入口 | **`renderEmittedTree(map, rootId)`** | ~~递归遍历 ComponentNode tree~~ |
| 数据流向 | **单向：组件 → ctx → Map → 渲染器** | ~~双向：组件返回树 → 上层组装~~ |

### 已移除的概念

- ❌ `ComponentNode` / `ComponentBase` 返回类型
- ❌ `getCurrentContext()` / `getCurrentCompositionContext()` 隐式上下文获取
- ❌ `"return object"` 组件模型
- ❌ `ComposableNode = LayoutNode | LeafNode | null` 联合返回
- ❌ 组件函数返回树结构供上层组装

## 负面影响与风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| React 开发者适应期 | 不熟悉 emit 模式 + ctx-first | 提供迁移指南；API 设计直觉化 |
| 深度嵌套缩进多 | 5+ 层嵌套时代码右移严重 | 使用 IDE 自动格式化；提取子组件 |
| ctx 参数传递冗余 | 每个组件调用都需传入 ctx | TypeScript 类型系统保证正确性；IDE 自动补全 |
| 无 JSX 语法高亮 | 编辑器可能无法识别自定义 DSL | 开发 VSCode 插件；或接受当前限制 |

## 实现约束

1. **禁止 JSX 语法**：公共 API 不支持 `<Component />` 写法
2. **必须支持尾随 lambda**：`Column(ctx, mod, arr, align, () => { ... })` 必须工作
3. **必须返回 void**：所有组件函数返回 void，不可返回任何节点对象
4. **ctx 必须是第一个参数**：`fn(ctx: CompositionContext, ...props)` 签名不可省略 ctx
5. **必须使用 emit API**：组件内部只能通过 ctx.emitLeaf/startGroup/endGroup 创建节点
6. **Props 类型安全**：必须使用泛型约束 Props 类型

## L0 / L1 分层组件架构

```
L0 — 原子组件（直接 emit 节点到 ctx）
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

L1 — 组合组件（组合 L0 组件，自身也是 void 返回）
├── Button        → Surface + Text + clickable Modifier
├── FAB           → Surface + Icon/Text + 圆形裁剪
├── Snackbar      → Surface + Text + Button
├── Dialog        → Surface(半透明背景) + content + buttons
├── TopAppBar     → Row(navigationIcon + title + actions)
├── BottomNav     → Row(BottomNavItem[])
├── TabRow        → Surface + Row(Tab[] + indicator)
└── Scaffold      → topBar + content + bottomBar + snackbarHost
```

## 相关文档

- 上游 ADR:
  - [`composable-tracking-runtime-hoc.md`](./composable-tracking-runtime-hoc.md)
  - [`layout-engine-custom-linear-column-row.md`](./layout-engine-custom-linear-column-row.md)
- 下游文档:
  - [`rendering-architecture-hybrid-mode.md`](./rendering-architecture-hybrid-mode.md)
  - [`appcontext-unified-root-architecture.md`](./appcontext-unified-root-architecture.md)
- 需求文档: [`canvas-ui-runtime.md`](../road-map/canvas-ui-runtime.md)

## 决策记录

| 时间 | 决策者 | 决策内容 |
|------|--------|---------|
| 2026-04-30 17:15 | 用户 + AI | 确认采用纯函数调用链模型（Compose 风格），支持尾随 lambda，禁止 JSX |
| 2026-05-07 00:00 | 用户 + AI | **重大升级**：从"返回 ComponentNode"迁移到"Emit-based + ctx-first + void 返回"模型 |
