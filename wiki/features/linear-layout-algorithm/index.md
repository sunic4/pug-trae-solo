---
id: "feat-07"
type: feature
status: done
title: "线性布局算法实现 (Column/Row + Weight + LayoutNode)"
origin_type: req
depends_on: ["feat-06"]
created: "2026-05-01 15:00"
updated: "2026-05-01 15:00"
stale: false
---

# feat-07: 线性布局算法实现 (Column/Row + Weight + LayoutNode)

## 实现思路概述

feat-06 已实现基础 Constraints + Measure/Layout 两阶段管线 + LinearMeasurePolicy（Arrangement/Alignment）。本特性在此基础上增强：

1. **LayoutNode** — 布局树节点，连接布局引擎与渲染层，支持父子关系和位置管理
2. **Weight-based sizing** — Compose 风格 `Modifier.weight()` 权重分配剩余空间
3. **IntrinsicSize 增强** — 完善 min/max intrinsic width/height 计算

设计原则（来自 ADR #4）：
- 禁止 W3C Flexbox 术语，使用 Compose 风格 API
- Weight 权重分配遵循 Compose 语义：先测量非权重子节点，再按权重分配剩余空间
- LayoutNode 轻量设计，可直接映射到渲染层 LayerNode

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/layout/layout-node.ts` | LayoutNode 布局树节点 + LayoutTree |
| 修改 | `src/layout/measure-policy.ts` | 增强 LinearMeasurePolicy 支持 weight |
| 修改 | `src/layout/types.ts` | 新增 LayoutNode/WeightConfig 类型 |
| 修改 | `src/layout/index.ts` | 模块导出 |
| 修改 | `src/index.ts` | 顶层导出 |

## 接口与类型引用

### types.ts 新增

```typescript
interface WeightConfig {
  weight: number
  fill: boolean
}

interface LayoutNode {
  readonly id: number
  parent: LayoutNode | null
  children: LayoutNode[]
  measurable: Measurable | null
  measureResult: MeasureResult | null
  position: { x: number; y: number }
  weight: WeightConfig | null
  measure(constraints: Constraints): void
  layout(): void
  addChild(child: LayoutNode): void
  removeChild(child: LayoutNode): void
}
```

### layout-node.ts

```typescript
class LayoutNodeImpl implements LayoutNode { ... }
class LayoutTree {
  root: LayoutNode | null
  measureAndLayout(constraints: Constraints): void
}
function createLayoutNode(id: number, measurable?: Measurable, weight?: WeightConfig): LayoutNode
function createLayoutTree(): LayoutTree
```

### measure-policy.ts 增强

LinearMeasurePolicy.measure 增加 weight 支持：
1. 分离 weighted 和 non-weighted 子节点
2. 先测量 non-weighted 子节点
3. 计算剩余空间
4. 按权重比例分配给 weighted 子节点

## 测试策略

| 项目 | 内容 |
|------|------|
| 测试金字塔 | 单元 85% : 集成 15% |
| Mock 策略 | 无外部依赖，纯计算 |
| 关键路径 | 1) Weight 权重分配 2) LayoutNode 树遍历 3) 嵌套布局 |
| 边界测试 | 1) 全部 weighted 2) 无 weighted 3) 权重为 0 |

## 风险与依赖

| 风险 | 缓解 |
|------|------|
| Weight 分配精度 | 使用浮点数，允许微小误差 |
| 嵌套布局性能 | O(n) 算法，n=子节点数 |
| LayoutNode 内存 | 轻量设计，~80 bytes/node |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] LayoutNode 支持树结构、测量和布局
- [x] LinearMeasurePolicy 支持 weight 权重分配
- [x] impl-checklist.yaml 所有条目=done
