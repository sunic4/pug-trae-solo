---
id: "reactor-v4-comprehensive"
type: issue
status: fixed
title: "reactor.md 全面重构 v4：消除类型守卫绕过、重复代码、简化 MeasurePolicy"
depends_on: ["reactor-eliminate-unsafe-types-v3", "reactor-composition-dedup-simplify"]
severity: major
created: "2026-05-05T19:30"
updated: "2026-05-05T19:50"
stale: false
---

## 问题描述

前序 issue v1/v2/v3 及 composition-dedup-simplify 已修复大部分问题。源码中仍残留类型守卫绕过（等效 `as`）和重复代码，部分 MeasurePolicy 仍为 class 而非工厂函数。

## 残留问题清单

### 1. 类型守卫绕过（等效 `as`，2 处）

| 文件 | 行号 | 模式 |
|------|------|------|
| `test-utils.ts` | 3-11 | `narrowTo<T>` — type guard always returns true |
| `core/recomposer.ts` | 8-16 | `createCacheSlot` — type guard always returns true |

### 2. 重复 CHAR_WIDTH_RATIO 计算（6 处）

`charWidth()` 工具函数已存在于 `constants.ts`，但以下文件仍直接使用 `fontSize * CHAR_WIDTH_RATIO`：

| 文件 | 代码 |
|------|------|
| `basic/text.ts` | `fontSize * CHAR_WIDTH_RATIO` |
| `overlay/dialog.ts` | `14 * CHAR_WIDTH_RATIO` |
| `overlay/dropdown-menu.ts` | `14 * CHAR_WIDTH_RATIO` |
| `feedback/snackbar.ts` | `DEFAULT_FONT_SIZE * CHAR_WIDTH_RATIO` |
| `container/top-app-bar.ts` | `fontSize * CHAR_WIDTH_RATIO` |
| `interaction/text-field.ts` | `fontSize * CHAR_WIDTH_RATIO` |

### 3. MeasurePolicy class 应转为工厂函数（4 处）

`ConstrainedMeasurePolicy` 和 `SquareMeasurePolicy` 已转为工厂函数，但以下仍为 class：

| 文件 | class | 原因 |
|------|-------|------|
| `shared/measure-policies.ts` | `BoxAlignmentMeasurePolicy` | 可用 `createMeasurePolicy` |
| `shared/equal-split-measure-policy.ts` | `EqualSplitMeasurePolicy` | 可用 `createMeasurePolicy` |
| `container/scaffold.ts` | `ScaffoldMeasurePolicy` | 可用 `createMeasurePolicy` |
| `lazy/lazy-column.ts` | `LazyLayoutMeasurePolicy` | 可用 `createMeasurePolicy` |

## 修复方案

### Phase 1: 消除类型守卫绕过

- `narrowTo<T>` → 移除，改用 `Object.assign` 构造完整 mock 对象
- `createCacheSlot` → 移除 `CacheSlot` 抽象，`RememberCacheStore` 直接存储 object

### Phase 2: 使用 charWidth() 工具函数

替换所有 `fontSize * CHAR_WIDTH_RATIO` 为 `charWidth(fontSize)`。

### Phase 3: MeasurePolicy class → 工厂函数

将 `BoxAlignmentMeasurePolicy`、`EqualSplitMeasurePolicy`、`ScaffoldMeasurePolicy`、`LazyLayoutMeasurePolicy` 转为使用 `createMeasurePolicy` 的工厂函数。

## 期望行为

- 源码零类型守卫绕过
- 消除 CHAR_WIDTH_RATIO 重复计算
- MeasurePolicy 统一使用工厂函数模式
- 所有测试通过，类型检查零错误
