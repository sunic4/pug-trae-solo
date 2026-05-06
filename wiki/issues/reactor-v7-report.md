---
id: "reactor-v7-comprehensive-refactor"
type: issue
status: reported
title: "reactor.md v7 全面重构：消除残留类型断言、去重 MeasurePolicy 别名、测试质量提升"
depends_on: []
severity: major
created: "2026-05-06T11:30"
updated: "2026-05-06T11:30"
stale: false
---

## 问题描述

基于 [reactor.md](file:///d:/sunfeixiang/pug-trae-solo/reactor.md) 的重构要求，对 pug-canvas-ui 项目进行 v7 轮全面质量提升。前序 v1-v6 已完成大部分重构，但经深度审查发现以下残留问题。

## 当前基线

| 检查项 | 状态 |
|--------|------|
| TypeScript 类型检查 | ✅ 零错误 |
| 单元测试 | ✅ 693 通过 / 0 失败 (38 文件) |
| 导入路径 | ✅ 全部使用 `@/` |
| 内联 import | ✅ 无 |
| 类继承 | ✅ 无（纯组合） |
| any 类型 | ✅ 无 |

## 残留问题清单

### P0：`as T` 生产代码类型断言（1 处）

| # | 文件 | 行号 | 代码 |
|---|------|------|------|
| 1 | [recomposer.ts](file:///d:/sunfeixiang/pug-trae-solo/src/core/recomposer.ts#L68) | 68 | `return this._rememberCache.value as T` |

**根因**：`_rememberCache` 类型为 `RememberCacheEntry<object> | null`，其 `.value` 为 `object`，无法直接赋值给泛型 `T extends object`。

### P1：测试代码 `unknown` + `as T`（1 处）

| # | 文件 | 行号 | 代码 |
|---|------|------|------|
| 1 | [state.test.ts](file:///d:/sunfeixiang/pug-trae-solo/src/core/__tests__/state.test.ts#L10) | 10,14 | `_lastWriteValue: unknown` + `return this._lastWriteValue as T` |

**根因**：MockSnapshot 需要存储任意类型的 write 值，当前用 `unknown` 存储后通过 `as T` 断言取回。

### P2：MeasurePolicy 重复导出别名模式（10+ 处）

多个组件重复使用相同模式导出 MeasurePolicy 别名：

```
ConstrainedMeasurePolicy as SpacerMeasurePolicy      (spacer.ts)
ConstrainedMeasurePolicy as ImageMeasurePolicy        (image.ts)
ConstrainedMeasurePolicy as CheckboxMeasurePolicy     (checkbox.ts)
ConstrainedMeasurePolicy as CircularProgressIndicatorMeasurePolicy  (circular-progress.ts)
ConstrainedMeasurePolicy as LinearProgressIndicatorMeasurePolicy    (linear-progress.ts)
BoxAlignmentMeasurePolicy as BoxMeasurePolicy         (box.ts)
BoxAlignmentMeasurePolicy as SurfaceMeasurePolicy      (surface.ts)
equalSplitMeasurePolicy as EqualSplitMeasurePolicy    (equal-split-measure-policy.ts)
... 以及 dialog/modal-bottom-sheet/dropdown-menu/text-field/snackbar/scaffold/top-app-bar/lazy-column
```

**根因**：每个组件都独立 re-export 同一个工厂函数的别名，形成重复模式。

### P3：代码精简机会

- recomposer.test.ts 缺少 `vi` import（使用了 `vi.fn()` 但未导入）
- 部分组件文件可进一步精简

### P4：测试代码规范化

- state.test.ts MockSnapshot 可改为更安全的类型模式

## 期望行为

1. **零生产代码 `as` 断言**（仅保留 `as const` 和 export alias）
2. **零测试代码 `as T` 断言**
3. **消除 MeasurePolicy 重复别名导出**
4. **代码精简**
5. **测试高质量且类型安全**

## 影响范围

- 核心模块：`core/recomposer.ts`
- 测试模块：`core/__tests__/state.test.ts`, `core/__tests__/recomposer.test.ts`
- 组件模块：10+ 个组件文件的 MeasurePolicy 导出
- 公共 API 入口：`src/index.ts`

## 严重度

**major** - 不影响功能运行，但影响类型安全性和代码可维护性
