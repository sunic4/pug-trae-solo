---
id: "feat-04"
type: feature
status: done
title: "图层管理与脏区域检测"
origin_type: req
depends_on: ["feat-03", "feat-02"]
created: "2026-05-01 14:30"
updated: "2026-05-01 14:30"
stale: false
---

# feat-04: 图层管理与脏区域检测

## 实现思路概述

基于 ADR #3 (Hybrid 混合渲染架构)，实现图层树与脏区域检测，这是渲染性能优化的核心基础设施：

1. **LayerNode** — 轻量 Retained 图层节点，缓存 DrawCommand，支持 dirty 标记
2. **LayerTree** — 图层树管理，维护父子关系，支持 Z-order 排序
3. **DirtyRegion** — 脏区域追踪与合并，支持矩形区域添加和最小包围盒计算
4. **HybridRenderer** — 混合渲染器，集成图层树 + 脏区域优化渲染

设计原则（来自 ADR #3）：
- LayerNode 缓存 DrawCommand，重组时对比新旧命令更新 dirty 标记
- 脏区域安全边距 2px，防止抗锯齿边缘伪影
- 缓存一致性：更新 cachedCommands 时原子操作
- MVP 阶段：基础 dirty boolean + 矩形区域合并

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/renderer/layer.ts` | LayerNode 图层节点 + LayerTree 图层树 |
| 新建 | `src/renderer/dirty-region.ts` | DirtyRegion 脏区域追踪与合并 |
| 修改 | `src/renderer/types.ts` | 新增 LayerNode/DirtyRegion 类型 |
| 修改 | `src/renderer/canvas-host.ts` | 集成图层树渲染 + 脏区域裁剪 |
| 修改 | `src/renderer/index.ts` | 模块导出 |
| 修改 | `src/index.ts` | 顶层导出 |

## 接口与类型引用

### types.ts 新增

```typescript
interface LayerNode {
  readonly id: NodeId
  parent: LayerNode | null
  children: LayerNode[]
  cachedCommands: DrawCommand[]
  dirty: boolean
  bounds: Rect
  markDirty(): void
  markClean(): void
  updateCommands(commands: DrawCommand[]): void
  addChild(child: LayerNode): void
  removeChild(child: LayerNode): void
}

interface DirtyRegion {
  readonly rects: ReadonlyArray<Rect>
  add(rect: Rect): void
  merge(): Rect
  clear(): void
  isEmpty(): boolean
}
```

### layer.ts

```typescript
class LayerNodeImpl implements LayerNode { ... }
class LayerTree {
  root: LayerNode | null
  insert(parent: LayerNode | null, node: LayerNode): void
  remove(node: LayerNode): void
  collectDirty(): LayerNode[]
}
function createLayerNode(id: NodeId, bounds?: Rect): LayerNode
function createLayerTree(): LayerTree
```

### dirty-region.ts

```typescript
class DirtyRegionImpl implements DirtyRegion { ... }
function createDirtyRegion(): DirtyRegion
function mergeRects(rects: ReadonlyArray<Rect>): Rect
```

### canvas-host.ts 修改

CanvasHost 新增 `renderLayers(tree: LayerTree)` 方法，使用脏区域裁剪优化渲染。

## 测试策略

| 项目 | 内容 |
|------|------|
| 测试金字塔 | 单元 85% : 集成 15% |
| Mock 策略 | Mock CanvasRenderingContext2D |
| 关键路径 | 1) LayerNode dirty 标记传播 2) DirtyRegion 合并 3) 图层树脏节点收集 |
| 边界测试 | 1) 空图层树 2) 全脏 vs 无脏 3) 脏区域为空矩形 |

## 风险与依赖

| 风险 | 缓解 |
|------|------|
| 脏区域合并精度 | 安全边距 2px |
| LayerNode 内存 | 轻量设计，~100 bytes/node |
| 与 Recomposer 集成 | feat-02 已提供 RecomposeScope，后续集成 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] LayerNode 支持 dirty 标记和命令缓存
- [x] LayerTree 支持增删节点和脏节点收集
- [x] DirtyRegion 支持区域添加、合并和清除
- [x] CanvasHost 支持基于图层树的脏区域优化渲染
