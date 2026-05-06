---
id: "reactor-eliminate-unsafe-types-v3"
type: issue
status: reported
title: "消除源码残留 unknown/as 及重复代码，配置 @/ 路径别名"
depends_on: ["reactor-eliminate-unsafe-types-v2"]
severity: major
created: "2026-05-05T15:00"
updated: "2026-05-05T15:00"
stale: false
---

## 问题描述

前序 issue v1/v2 已修复大部分 `any`/`unknown`/`as`/内联 import/interface extends 问题。源码中仍残留少量违规项，且缺少 `@/` 路径别名配置。

## 残留问题清单

### 1. `as` 类型断言（源码 1 处）

| 文件 | 行号 | 代码 |
|------|------|------|
| `core/snapshot.ts` | 55 | `(wrapper as { value: T }).value` |

### 2. `unknown` 类型（测试工具 2 处）

| 文件 | 行号 | 代码 |
|------|------|------|
| `test-utils.ts` | 24 | `Record<string, unknown>` |
| `test-utils.ts` | 63 | `Record<string, unknown>` |

### 3. 类型守卫绕过（等效 as，2 处）

| 文件 | 行号 | 模式 |
|------|------|------|
| `test-utils.ts` | 3-11 | `narrowTo<T>` — type guard always true |
| `core/recomposer.ts` | 4-6 | `isObjectOfType<T>` — type guard always true |

### 4. 重复代码

| 位置 | 描述 |
|------|------|
| `SnapshotImpl` vs `MutableSnapshotImpl` | resolveValue/read/withReadObserver/setWriteObserver/nextStateId 5 个方法完全重复 |

### 5. 缺少 `@/` 路径别名

当前所有跨模块导入使用 `../../` 相对路径（约 100 处），可读性差且重构困难。

## 修复方案

### Phase 1: 消除 `as { value: T }`

引入 `StateValueSlot` 类型，通过闭包捕获值类型，消除 `getValue` 中的 `as` 断言。

### Phase 2: 消除 `Record<string, unknown>`

替换为 `Partial<CanvasRenderingContext2D>` / `Partial<HTMLCanvasElement>`。

### Phase 3: 消除类型守卫绕过

- `narrowTo` → 使用 `Partial<T>` + 类型安全构造
- `isObjectOfType` → 引入 `CacheSlot` 闭包封装

### Phase 4: 消除重复代码

`MutableSnapshotImpl` 通过组合持有 `SnapshotImpl` 实例，委托共享方法。

### Phase 5: 配置 `@/` 路径别名

tsconfig.json + vite.config.ts + tsup.config.ts 添加路径别名，重构跨模块导入。

## 期望行为

- 源码零 `as`、零 `unknown`
- 消除 SnapshotImpl/MutableSnapshotImpl 重复代码
- 跨模块导入统一使用 `@/` 路径别名
- 所有测试通过，类型检查零错误
