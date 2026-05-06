---
id: "feat-15-ext"
type: feature
status: done
title: "布局组件 (Column/Row/Surface)"
origin_type: req
depends_on: ["feat-09", "feat-08", "feat-05", "feat-14"]
created: "2026-05-01 18:30"
updated: "2026-05-01 18:30"
stale: false
---

# feat-15-ext: 布局组件 (Column/Row/Surface)

## 实现思路概述

基于已实现的 LinearMeasurePolicy 布局算法和 Modifier 链系统，实现声明式线性布局组件和 Surface 容器组件。

1. **Column** — 垂直线性布局，复用 LinearMeasurePolicy(orientation='vertical')，支持 arrangement/alignment/weight
2. **Row** — 水平线性布局，复用 LinearMeasurePolicy(orientation='horizontal')，支持 arrangement/alignment/weight
3. **Surface** — Material 风格容器，Box + background + clip + elevation(shadow)

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/components/layout/column.ts` | Column 垂直布局组件 |
| 新建 | `src/components/layout/row.ts` | Row 水平布局组件 |
| 新建 | `src/components/layout/surface.ts` | Surface 容器组件 |
| 新建 | `src/components/layout/index.ts` | 布局组件导出 |
| 新建 | `src/components/__tests__/layout-components.test.ts` | 布局组件 单元测试 |
| 修改 | `src/index.ts` | 顶层导出更新 |

## 接口与类型定义

```typescript
interface ColumnComponent {
  readonly kind: 'column'
  readonly modifier: ReadonlyModifier
  readonly arrangement: Arrangement
  readonly alignment: Alignment
  readonly children: ComponentNode[]
  readonly measurePolicy: MeasurePolicy
}

interface RowComponent {
  readonly kind: 'row'
  readonly modifier: ReadonlyModifier
  readonly arrangement: Arrangement
  readonly alignment: Alignment
  readonly children: ComponentNode[]
  readonly measurePolicy: MeasurePolicy
}

interface SurfaceComponent {
  readonly kind: 'surface'
  readonly modifier: ReadonlyModifier
  readonly color: Color
  readonly elevation: number
  readonly borderRadius: number
  readonly children: ComponentNode[]
  readonly measurePolicy: MeasurePolicy
}
```

## 测试策略

- 测试金字塔: 单元测试 100%
- 关键路径覆盖:
  1. Column/Row 创建与默认参数
  2. Column/Row 自定义 arrangement/alignment
  3. Column/Row 子组件组合
  4. Surface 创建与默认参数
  5. Surface 自定义 color/elevation/borderRadius
  6. Surface 子组件组合
  7. Column/Row measurePolicy 正确性
- 边界测试:
  1. 空子组件列表
  2. 嵌套 Column/Row 组合

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] Column 正确垂直排列子组件
- [x] Row 正确水平排列子组件
- [x] Surface 正确组合 background/clip/shadow
- [x] impl-checklist.yaml 所有条目 = done
