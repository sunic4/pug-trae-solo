---
id: "reactor-eliminate-unsafe-types-v2"
type: issue
status: reported
title: "消除源码中所有 unknown/as/内联import/interface extends/重复代码"
depends_on: []
severity: major
created: "2026-05-05T14:00"
updated: "2026-05-05T14:00"
stale: false
---

## 问题描述

前序 issue `reactor-eliminate-unsafe-types` 标记为 fixed，但源码中仍残留大量 `unknown`、`as`、内联 import、interface extends 及重复代码，未完全达标。

## 残留问题清单

### 1. `unknown` 类型（源码 9 处）

| 文件 | 行号 | 代码 |
|------|------|------|
| `core/composable.ts` | 5 | `TProps extends Record<string, unknown>` |
| `core/remember.ts` | 5 | `readonly keys: readonly unknown[]` |
| `core/remember.ts` | 8 | `keys?: readonly unknown[]` |
| `core/recomposer.ts` | 9 | `_rememberCache: Record<string, unknown> \| null` |
| `core/recomposer.ts` | 12 | `_lastInputs: readonly unknown[] \| null` |
| `core/recomposer.ts` | 62 | `cache as Record<string, unknown>` |
| `core/recomposer.ts` | 70 | `inputsUnchanged(inputs: readonly unknown[])` |
| `core/snapshot.ts` | 25 | `stateMap: Map<StateId, unknown>` |
| `core/snapshot.ts` | 26 | `stateRefs: Map<StateId, MutableState<unknown>>` |
| `components/basic/types.ts` | 7 | `props?: Record<string, unknown>` |

### 2. `as` 类型断言（源码 4 处）

| 文件 | 行号 | 代码 |
|------|------|------|
| `core/recomposer.ts` | 58 | `this._rememberCache as T` |
| `core/recomposer.ts` | 62 | `cache as Record<string, unknown>` |
| `core/snapshot.ts` | 45 | `store.stateMap.get(stateId) as T` |
| `animation/vector-converter.ts` | 132 | `currentVector as V` |

### 3. 内联 import（2 处）

| 文件 | 行号 | 代码 |
|------|------|------|
| `renderer/types.ts` | 234 | `import('./image-loader').NinePatchConfig` |
| `renderer/types.ts` | 331 | `import('./image-loader').NinePatchConfig` |

### 4. interface extends（19 处）

| 文件 | 数量 | 模式 |
|------|------|------|
| `layout/modifier.ts` | 12 | `XElement extends ModifierElement` |
| `input/gesture-modifier.ts` | 7 | `XElement extends ModifierElement` |
| `animation/animation-spec.ts` | 2 | `TweenSpec/SpringSpec extends AnimationSpec` |
| `animation/gesture-animation.ts` | 1 | `DecaySpec extends AnimationSpec` |
| `core/types.ts` | 3 | `MutableState/MutableSnapshot/DerivedState extends X` |

### 5. 重复代码

| 位置 | 描述 |
|------|------|
| `SnapshotImpl` vs `MutableSnapshotImpl` | resolveValue/read/withReadObserver/setWriteObserver/nextStateId 5 个方法完全重复 |
| `executeFillBody` vs `executeStrokeBody` (draw-batch.ts) | switch 结构完全相同，仅 fill/stroke 不同 |

## 修复方案

### Phase 1: 内联 import → 顶层 import

`renderer/types.ts` 添加 `import type { NinePatchConfig }` 顶层导入。

### Phase 2: 消除 unknown

- `Record<string, unknown>` → 移除约束或使用 `ComposableProps` 类型
- `readonly unknown[]` → `readonly RememberKey[]`（`type RememberKey = string | number | boolean | null | undefined`）
- `Map<StateId, unknown>` → `StateValueStore` 封装类（内部使用闭包消除 unknown）
- `MutableState<unknown>` → 通过闭包捕获类型信息

### Phase 3: 消除 as

- `as T` → 通过闭包或泛型容器消除
- `as V` → 修正 `map()` 返回类型

### Phase 4: interface extends → 交叉类型

所有 `interface X extends Y` 转为 `type X = Y & { ... }`。

### Phase 5: 消除重复代码

- SnapshotImpl/MutableSnapshotImpl → 提取 `SnapshotOperations` 组合对象
- executeFillBody/executeStrokeBody → 提取 `executeShapeBody` 参数化函数

## 期望行为

- 源码中零 `unknown`、零 `as`、零内联 import、零 `interface extends`
- 消除 SnapshotImpl/MutableSnapshotImpl 重复代码
- 所有测试通过，类型检查零错误
