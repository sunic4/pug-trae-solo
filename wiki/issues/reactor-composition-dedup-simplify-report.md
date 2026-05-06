---
id: "reactor-composition-dedup-simplify"
type: issue
status: fixed
title: "reactor.md 全面重构：组合替代继承、消除重复、简化代码"
depends_on: []
severity: major
created: "2026-05-05T18:00"
updated: "2026-05-05T19:00"
stale: false
---

## 问题描述

依据 reactor.md 要求，对项目进行全面重构。

## 已确认无需修复项

| 项目 | 状态 | 说明 |
|------|------|------|
| 消除 any | ✅ 已完成 | 源码无 any 类型 |
| 消除 unknown | ✅ 已完成 | 源码无 unknown 类型 |
| 消除 as 类型断言 | ✅ 已完成 | 源码无 as 类型断言（as const 和 export alias 除外） |
| 消除内联 import | ✅ 已完成 | 源码无内联 import |
| @/ 路径别名 | ✅ 已完成 | 所有导入已使用 @/ |

## 已修复项

### 1. interface extends ComponentNode → 组合模式（27 处 → 0 处）

**方案**: 提取 `ComponentBase`（modifier + measurePolicy），组件接口改用 `& ComponentBase` 交集类型。

**影响文件**: types.ts, box.ts, text.ts, image.ts, spacer.ts, column.ts, row.ts, surface.ts, button.ts, checkbox.ts, slider.ts, fab.ts, text-field.ts, card.ts, scaffold.ts, top-app-bar.ts, tab-row.ts, bottom-navigation.ts, circular-progress.ts, linear-progress.ts, snackbar.ts, dialog.ts, popup.ts, dropdown-menu.ts, modal-bottom-sheet.ts, lazy-column.ts, nav-controller.ts, index.ts

### 2. 修复 Bug: absoluteOffset 误调 createOffset

**文件**: [modifier.ts](file:///d:/sunfeixiang/pug-trae-solo/src/layout/modifier.ts#L235)

`absoluteOffset` 方法错误地调用了 `createOffset` 而非 `createAbsoluteOffset`，导致 `absoluteOffset` 与 `offset` 行为完全相同，且 `createAbsoluteOffset` 成为死代码。

### 3. 消除重复代码

| 重复类型 | 修复方案 |
|----------|----------|
| MeasurePolicy.measureWithWeights 委托模式 (8+ 处) | 创建 `createMeasurePolicy` 工厂函数，消除重复委托代码 |
| IdGenerator 接口重复定义 | 移除 types.ts 中的重复定义，统一从 id-generator.ts 导入 |
| mergeRectBounds/mergeRects 重复逻辑 | draw-batch.ts 复用 dirty-region.ts 的 mergeRects |
| computeDistance 重复定义 | pinch-recognizer.ts 复用 gesture-recognizer.ts 的 computeDistance |
| LazyComponentBase 两级继承 | 合并为单层 `& ComponentBase` 交集类型 |

### 4. 代码简化

| 简化项 | 说明 |
|--------|------|
| createCacheSlot | 移除冗余 captured 变量，简化类型守卫 |
| draw-batch.ts switch | 合并 fillCircle/strokeCircle/drawLine 到对应 case 组 |
| 未使用导入 | 移除 draw-batch.ts (Point, VectorPath), text.ts (ComponentNode), lazy-column.ts (ComponentNode) |
| recomposer.ts | 移除未使用的 remember 导入 |
| ConstrainedMeasurePolicy/SquareMeasurePolicy | 从 class 改为工厂函数，消除 class 样板代码 |
| TextMeasurePolicy/TextFieldMeasurePolicy 等 | 从 class 改为工厂函数，使用 createMeasurePolicy |

## 回归验证

- ✅ `npm run typecheck` — 零错误
- ✅ `npm test` — 695 测试全部通过
