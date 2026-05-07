---
id: "rendering-architecture-hybrid-mode"
type: architecture
status: accepted
title: "Canvas 渲染架构 — Emit-based + renderEmittedTree (Map<NodeId, EmittedNode>)"
depends_on:
  - "../road-map/canvas-ui-runtime.md"
  - "./reactive-state-snapshot-context-based.md"
  - "./composable-tracking-runtime-hoc.md"
created: "2026-04-30 16:50"
updated: "2026-05-07 00:00"
stale: false
---

# ADR: Canvas 渲染架构 — Emit-based + renderEmittedTree

## 背景

在确定使用自研 Snapshot 状态系统和运行时 composable() 追踪机制后，以及完成 Emit-based Composition 模型升级后，Canvas 渲染器的底层工作模式需要更新：

> **如何将声明式 Composable 通过 ctx 发射的 EmittedNode Map 高效地映射到 Canvas 2D 绘制调用？**

## 决策结果

选择 **Emit-based + renderEmittedTree 模式**，核心设计为：

```
Composable 函数（声明式，ctx-first，void 返回）
    ↓ 重组时执行
    ↓ 组件调用 ctx.emitLeaf() / ctx.startGroup() / ctx.endGroup()
Map<NodeId, EmittedNode>（扁平节点描述集合）
    ↓ 通过 rootCtx.emittedNodes 获取
renderEmittedTree(ctx, nodes, rootNodeId, w, h)
    ↓ 遍历 Map（从 rootNodeId 开始递归）
    ↓ measureEmittedNode() → 布局测量
    ↓ renderEmittedNode()  → DrawCommand 生成
Canvas 2D 批量绘制
```

### 核心数据结构

```typescript
// ===== EmittedNode（组件 emit 的产物）=====

type EmittedNode = {
  readonly id: NodeId                    // 全局唯一 ID
  readonly data: unknown                  // 组件数据（text 内容、图片 src 等）
  readonly modifier: ReadonlyModifier     // 修饰符链（size/padding/background 等）
  readonly measurePolicy: MeasurePolicy   // 测量策略（如何计算尺寸）
  readonly drawPolicy: DrawPolicy         // 绘制策略（如何绘制到 Canvas）
  readonly layoutChildren: ((contentArea, measuredSizes, childrenIds) => ChildLayout[]) | null
  readonly parentId: NodeId | null       // 父节点 ID（null = 根）
  childrenIds: NodeId[]                   // 子节点 ID 列表
}

// ===== DrawPolicy（绘制策略）=====

type DrawPolicy = (scope: DrawScope, bounds: Rect) => void;

// ===== ChildLayout（子节点布局结果）=====

type ChildLayout = {
  readonly nodeId: number
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}
```

### renderEmittedTree 渲染管线

```typescript
function renderEmittedTree(
  ctx: DrawContext,
  nodes: Map<number, EmittedNode>,
  rootNodeId: number,
  width: number,
  height: number,
): DrawCommand[] {
  const scope = createDrawScope(ctx)
  const measuredSizes: MeasuredSizeMap = new Map()
  const root = nodes.get(rootNodeId)!
  renderEmittedNode(scope, root, nodes, 0, 0, width, height, measuredSizes)
  return scope.getCommands()
}
```

### renderEmittedNode 递归渲染

```
renderEmittedNode(scope, node, nodes, x, y, w, h):
  1. measureEmittedNode(node, nodes, constraints)
     ├─ 提取 padding 从 modifier
     ├─ 为每个 child 创建 Measurable（递归 measureEmittedNode）
     ├─ 调用 node.measurePolicy.measure(children, constraints)
     └─ 缓存结果到 measuredSizes[node.id]

  2. applySizeModifiers(node.modifier, measured, availableW, availableH)
     → 应用 size/fillMaxWidth/fillMaxHeight 等

  3. scope.save()
     → 保存 Canvas 状态

  4. applyDrawModifiers(scope, node.modifier, bounds)
     → 应用 translate/clip/alpha/transform 等

  5. node.drawPolicy(scope, bounds)
     → 实际绘制（fillText/fillRect/drawImage 等）

  6. 计算内容区域（减去 padding）

  7. 处理子节点：
     ├─ 如果 node.layoutChildren !== null：
     │   → 调用 layoutChildren(contentArea, sizes, childIds)
     │   → 获取 ChildLayout[]（精确位置）
     │   → 对每个 ChildLayout 递归 renderEmittedNode
     └─ 否则（默认顺序排列）：
       → 对每个 childId 递归 renderEmittedNode

  8. scope.restore()
     → 恢复 Canvas 状态
```

### setContent 入口 → 渲染管线完整流程

```typescript
export function setContent(
  canvas: HTMLCanvasElement,
  appComposable: (ctx: CompositionContext) => void,
): AppHost {
  // 1. 初始化 Canvas + CanvasHost
  // 2. createAppContext() → ComposerContext { snapshot, recomposer }

  // 3. 用 composable() 包装根函数
  const wrappedComposable = composable<{}>((ctx: CompositionContext) => {
    rootCtx = ctx              // 捕获 CompositionContext
    appComposable(rootCtx)     // 执行用户代码 → emit 节点到 ctx
  })

  // 4. 渲染循环
  function render(): void {
    if (rootCtx && rootCtx.rootNodeId !== null) {
      const commands = renderEmittedTree(
        host.ctx,                        // Canvas 2D context
        rootCtx.emittedNodes,            // Map<NodeId, EmittedNode>
        rootCtx.rootNodeId,             // 根节点 ID
        width, height,                   // Canvas 尺寸
      )
      host.render(commands)              // 批量执行 DrawCommand
    }
  }

  // 5. scheduleRecompose 触发 requestAnimationFrame → render()
}
```

## 正面影响

1. **完美契合 Emit-based Composition 架构**：
   - 组件返回 void，不构建中间树
   - EmittedNode 扁平存储在 Map 中，查找 O(1)
   - 渲染器直接消费 Map，无序列化/反序列化开销

2. **极致性能保障**：
   - **measureEmittedNode 缓存**：避免重复测量（measuredSizes Map）
   - **DrawCommand 批量合并**：连续相同类型命令合并，减少 GPU 状态切换
   - **save/restore 配对**：每节点独立状态管理，无污染
   - **layoutChildren 策略模式**：Column/Row/Box 各自定义布局算法

3. **内存可控**：
   - EmittedNode 是扁平对象 (~100 bytes/node)，存在 Map 中
   - 相比递归嵌套对象树节省引用开销
   - measuredSizes 共享缓存，避免重复计算

4. **渐进式增强能力**：
   - MVP 阶段可用简化版（~已实现）
   - 后续增加脏区域检测、增量更新
   - 不影响上层公共 API

5. **组合/渲染完全解耦**：
   - CompositionContext 只负责 emit
   - renderEmittedTree 只负责消费 Map
   - 两者通过 Map<NodeId, EmittedNode> 连接

## 与旧架构的对比（已废弃）

| 维度 | **Emit-based + renderEmittedTree ✅ (当前)** | ~~Hybrid + LayoutNode Tree~~ (旧) |
|------|---------------------------------------------|----------------------------------|
| 节点来源 | **组件 ctx.emit() → Map<NodeId, EmittedNode>** | ~~组件 return LayoutNode/LefNode → 递归树~~ |
| 数据结构 | **扁平 Map** | ~~嵌套对象树~~ |
| 渲染入口 | **renderEmittedTree(ctx, map, rootId)** | ~~递归遍历 ComponentNode tree~~ |
| 布局信息 | **EmittedNode.measurePolicy + layoutChildren** | ~~LayoutNode.measureResult + position~~ |
| 绘制信息 | **EmittedNode.drawPolicy 闭包** | ~~LayoutNode.cachedCommands[]~~ |
| 组合/渲染耦合 | **低（通过 Map 解耦）** | ~~高（直接操作节点对象）~~ |

## 负面影响与风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Map 遍历顺序 | Map 按 insertion order 遍历，需从 rootNodeId 开始 DFS | renderEmittedNode 从 root 开始递归，不依赖 Map 顺序 |
| 首帧/全屏变化退化 | 全屏 clear + 全量重绘 | 接受此场景的性能损失；后续增量优化 |
| EmittedNode ID 管理 | 需要 _nextId 自增分配 | CompositionContextImpl 内部管理，用户无感知 |
| 内存占用（Map） | 每个 EmittedNode 存储在 Map 中 | 重组时整体替换 Map，旧 Map 由 GC 回收 |

## 实现约束

1. **EmittedNode 必须不可变**：所有字段使用 `readonly`，防止意外修改
2. **drawPolicy 必须是闭包**：`(scope: DrawScope, bounds: Rect) => void`，捕获绘制逻辑
3. **measurePolicy 必须实现 MeasurePolicy 接口**：包含 measure() + minIntrinsicWidth/Height
4. **groupStack 必须 balance**：startGroup/endGroup 必须配对
5. **rootNodeId 自动设置**：第一个 emit 的节点自动成为 root

## 分阶段实现路线图

| 阶段 | 实现内容 | 目标 | 状态 |
|------|---------|------|------|
| **Phase 1 (MVP)** ✅ | renderEmittedTree + measureEmittedNode + EmittedNode Map | 核心功能跑通 | done |
| **Phase 2** | 脏区域检测 + 增量渲染（仅重绘变化的 EmittedNode） | 性能提升 | todo |
| **Phase 3** | OffscreenCanvas 缓存（静态内容提升到离屏 Canvas） | 生产级性能 | todo |
| **Phase 4** | DrawCommand 批量合并优化 + 图层管理 | 极致性能 | todo |

## 相关文档

- 上游 ADR:
  - [`reactive-state-snapshot-context-based.md`](./reactive-state-snapshot-context-based.md)
  - [`composable-tracking-runtime-hoc.md`](./composable-tracking-runtime-hoc.md)
  - [`component-model-pure-function-call-chain.md`](./component-model-pure-function-call-chain.md)
- 需求文档: [`canvas-ui-runtime.md`](../road-map/canvas-ui-runtime.md)

## 决策记录

| 时间 | 决策者 | 决策内容 |
|------|--------|---------|
| 2026-04-30 16:55 | 用户 + AI | 确认采用 Hybrid 混合渲染架构，轻量 LayoutNode + DrawCommand 缓存 + 精确脏区域 |
| 2026-05-07 00:00 | 用户 + AI | **重大升级**：从 LayoutNode 树渲染迁移到 renderEmittedTree(Map<NodeId, EmittedNode>) 架构 |
