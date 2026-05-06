---
id: "reactor-v5-eliminate-as-dedup"
type: issue
status: analyzing
title: "reactor.md 全面重构 v5：消除残留 as 断言、重复代码模式"
depends_on: ["reactor-v4-comprehensive"]
severity: major
created: "2026-05-05T20:00"
updated: "2026-05-05T20:00"
stale: false
---

## 问题描述

前序 issue v1-v4 已修复继承、interface extends、MeasurePolicy class、CHAR_WIDTH_RATIO 重复计算等问题。源码中仍残留 `as` 类型断言和 `text.length * charWidth(fontSize)` 重复代码模式。

## 残留问题清单

### 1. `as` 类型断言（6 处）

| # | 文件 | 行号 | 代码 | 分类 |
|---|------|------|------|------|
| 1 | `test-utils.ts` | 4 | `return value as T` (narrowTo) | 类型守卫绕过 |
| 2 | `test-utils.ts` | 8 | `return value as T` (narrowValue) | 类型守卫绕过 |
| 3 | `test-utils.ts` | 34 | `measureText: vi.fn(() => ({ width: 10 } as TextMetrics))` | Mock 对象 |
| 4 | `test-utils.ts` | 46 | `return Object.assign(ctx) as CanvasRenderingContext2D` | Mock 对象 |
| 5 | `test-utils.ts` | 56 | `return Object.assign(canvas) as HTMLCanvasElement` | Mock 对象 |
| 6 | `core/recomposer.ts` | 10 | `return this._cache as T` | 泛型容器 |

### 2. `text.length * charWidth(fontSize)` 重复模式（12 处，6 个文件）

| 文件 | 出现次数 |
|------|---------|
| `basic/text.ts` | 2 |
| `overlay/dialog.ts` | 1 |
| `overlay/dropdown-menu.ts` | 2 |
| `feedback/snackbar.ts` | 2 |
| `container/top-app-bar.ts` | 2 |
| `interaction/text-field.ts` | 2 |
| `renderer/draw-command.ts` | 1 |

### 3. narrowTo/narrowValue 使用（42 处，11 个测试文件）

这些函数本质上是 `as T` 的包装，绕过了类型安全检查。

## 修复方案

### Phase 1: 提取 textPixelWidth 工具函数

在 `constants.ts` 中新增 `textPixelWidth(text: string, fontSize: number): number`，替换所有 `text.length * charWidth(fontSize)` 模式。

### Phase 2: 消除 RememberCacheStore._cache as T

将 `RememberCacheStore` class 替换为闭包工厂函数，通过类型捕获消除 `as T`。

### Phase 3: 消除 test-utils.ts 中的 as 断言

- 移除 `narrowTo`/`narrowValue` 函数
- `TextMetrics` mock：提供完整属性的对象字面量
- `CanvasRenderingContext2D` mock：提供完整方法的对象字面量
- `HTMLCanvasElement` mock：提供完整属性的对象字面量

### Phase 4: 更新所有测试文件

替换 `narrowTo`/`narrowValue` 调用为类型安全的替代方案。

## 期望行为

- 源码零 `as` 类型断言（`as const` 和 export alias 除外）
- 消除 textPixelWidth 重复计算模式
- 测试代码无 narrowTo/narrowValue 类型守卫绕过
- 所有测试通过，类型检查零错误
