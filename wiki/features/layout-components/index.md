---
id: "feat-15-ext"
type: feature
status: done
title: "布局组件 (Column/Row/Surface) — L0 布局容器"
origin_type: req
depends_on: ["feat-09", "feat-08", "feat-05", "feat-14"]
created: "2026-05-01 18:30"
updated: "2026-05-07 00:00"
stale: false
---

# feat-15-ext: 布局组件 (Column/Row/Surface)

## 实现思路概述

基于已实现的 LinearMeasurePolicy 布局算法和 Modifier 链系统，实现 L0 层声明式线性布局组件和 Surface 容器组件。

**Emit-based 组件模型**：
- ctx-first 参数：`fn(ctx: CompositionContext, ...props): void`
- Column/Row 通过 `ctx.startGroup(layoutChildren=...)` / `ctx.endGroup()` 发射带布局策略的容器节点
- Surface 是 Material 风格容器：Box + background + clip + elevation(shadow)

### 组件签名（实际 API）

```typescript
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
  options?: {
    modifier?: ReadonlyModifier;
    color?: Color;
    elevation?: number;
    borderRadius?: number;
    alignment?: Alignment;
  },
): void;
```

### 内部 emit 模式

```typescript
function Column(ctx, modifier, arrangement, alignment, childrenFn): void {
  const mod = normalizeModifier(modifier)
  const measurePolicy = linearMeasurePolicy('vertical', arrangement, alignment)
  ctx.startGroup(
    { arrangement, alignment }, mod, measurePolicy, NOOP_DRAW_POLICY,
    (contentArea, measuredSizes, childrenIds) => {
      return layoutColumnChildren(childrenIds, contentArea, measuredSizes, arrangement, alignment)
    },
  )
  if (childrenFn) { childrenFn() }
  ctx.endGroup()
}
```

### 关键类型

```typescript
type EmittedNode = {
  readonly id: NodeId
  readonly data: unknown
  readonly modifier: ReadonlyModifier
  readonly measurePolicy: MeasurePolicy
  readonly drawPolicy: DrawPolicy
  readonly layoutChildren: ((contentArea: Rect, measuredSizes: MeasuredSizeMap, childrenIds: readonly number[]) => ChildLayout[]) | null
  readonly parentId: NodeId | null
  childrenIds: NodeId[]
}
```

> 注意：旧接口定义中的 `ComponentNode` / `kind: 'column'` 等已被 EmittedNode 取代。组件不再返回对象，而是向 ctx 的 Map 中发射节点描述。

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/components/layout/column.ts` | Column 垂直布局组件 |
| 新建 | `src/components/layout/row.ts` | Row 水平布局组件 |
| 新建 | `src/components/layout/surface.ts` | Surface 容器组件 |
| 新建 | `src/components/layout/index.ts` | 布局组件导出 |
| 新建 | `src/components/__tests__/layout-components.test.ts` | 布局组件 单元测试 |
| 修改 | `src/index.ts` | 顶层导出更新 |

## 测试策略

- 测试金字塔: 单元测试 100%
- 关键路径覆盖:
  1. Column/Row 创建与默认参数（ctx-first 调用）
  2. Column/Row 自定义 arrangement/alignment
  3. Column/Row 子组件组合（尾随 lambda）
  4. Surface 创建与默认参数
  5. Surface 自定义 color/elevation/borderRadius
  6. Surface 子组件组合
  7. Column/Row measurePolicy + layoutChildren 正确性
- 边界测试:
  1. 空子组件列表
  2. 嵌套 Column/Row 组合

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] 所有组件签名：ctx-first + void 返回
- [x] Column 正确垂直排列子组件（layoutChildren 策略）
- [x] Row 正确水平排列子组件（layoutChildren 策略）
- [x] Surface 正确组合 background/clip/shadow
- [x] impl-checklist.yaml 所有条目 = done
