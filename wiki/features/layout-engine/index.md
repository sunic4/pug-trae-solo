---
id: "feat-06"
type: feature
status: done
title: "Constraints + Measure/Layout 两阶段布局引擎"
origin_type: req
depends_on: []
created: "2026-05-01 11:45"
updated: "2026-05-01 11:45"
stale: false
---

# feat-06: Constraints + Measure/Layout 两阶段布局引擎

## 实现思路概述

实现 Compose 风格的两阶段布局引擎：
1. **Constraints** — 父到子的尺寸约束传递（min/max width/height）
2. **MeasureResult** — 测量结果（尺寸 + 对齐线）
3. **Placeable** — 可放置对象（测量结果 + 位置）
4. **MeasurePolicy** — 测量策略接口（Column/Row 各自实现）

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/layout/types.ts` | 布局共享类型 |
| 新建 | `src/layout/constraints.ts` | Constraints 实现 |
| 新建 | `src/layout/measure.ts` | MeasureResult + Placeable + Measurable |
| 新建 | `src/layout/measure-policy.ts` | MeasurePolicy + 线性布局策略 |
| 修改 | `src/layout/index.ts` | 模块导出 |
| 修改 | `src/index.ts` | 顶层导出 |

## 接口与类型引用

### constraints.ts

```typescript
interface Constraints {
  readonly minWidth: number
  readonly maxWidth: number
  readonly minHeight: number
  readonly maxHeight: number
}

// 工厂方法
Constraints.tight(width, height): Constraints
Constraints.loose(maxWidth, maxHeight): Constraints
Constraints.unconstrained(): Constraints
Constraints.fixed(width, height): Constraints
```

### measure.ts

```typescript
interface MeasureResult {
  readonly width: number
  readonly height: number
  readonly alignmentLines: Map<string, number>
}

interface Placeable {
  readonly measureResult: MeasureResult
  position: { x: number; y: number }
  place(x: number, y: number): void
}

interface Measurable {
  measure(constraints: Constraints): Placeable
}
```

### measure-policy.ts

```typescript
interface MeasurePolicy {
  measure(measurables: Measurable[], constraints: Constraints): MeasureResult
  minIntrinsicWidth(measurables: Measurable[], height: number): number
  minIntrinsicHeight(measurables: Measurable[], width: number): number
}

// 线性布局策略
function linearMeasurePolicy(orientation: 'horizontal' | 'vertical', arrangement: Arrangement, alignment: Alignment): MeasurePolicy
```

## 测试策略

| 项目 | 内容 |
|------|------|
| 测试金字塔 | 单元 85% : 集成 15% |
| Mock 策略 | Measurable 用 mock 实现 |
| 关键路径 | 1) Constraints 工厂 2) Measure/Layout 两阶段 3) 线性布局策略 |
| 边界测试 | 1) 零尺寸约束 2) 无限约束 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
