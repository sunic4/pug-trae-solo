---
id: "reactor-eliminate-unsafe-types"
type: issue
status: fixed
title: "消除项目中所有 any/unknown/as 及重复代码"
depends_on: []
severity: major
created: "2026-05-05T10:00"
updated: "2026-05-05T12:20"
stale: false
---

## 问题描述

项目源码中存在大量 `any`、`unknown`、`as` 类型断言及重复代码，违反类型安全原则，降低代码可维护性。

## 问题清单

### 1. `any` 类型（源码 0 处，测试 1 处）

| 文件 | 行号 | 代码 |
|------|------|------|
| `input/__tests__/keyboard.test.ts` | 27 | `} as any` |

### 2. `unknown` 类型（源码 12 处）

| 文件 | 行号 | 用途 |
|------|------|------|
| `core/types.ts` | 51 | `setRememberCache(cache: unknown)` |
| `core/types.ts` | 68 | `ComposableNode = unknown` |
| `core/remember.ts` | 4-5,8 | `RememberCache` 的 value/keys |
| `core/recomposer.ts` | 9,12,37,61,70,124 | `_rememberCache`/`_lastInputs`/`errors` |
| `core/snapshot.ts` | 25-26 | `stateMap`/`stateRefs` |
| `renderer/types.ts` | 74 | `DrawCommand.args: ReadonlyArray<unknown>` |
| `renderer/draw-command.ts` | 50 | `createDrawCommand` args 参数 |

### 3. `as` 类型断言（源码 ~50 处）

| 文件 | 数量 | 主要模式 |
|------|------|---------|
| `renderer/draw-batch.ts` | ~35 | `cmd.args[N] as Type` |
| `renderer/draw-command.ts` | ~12 | `cmd.args[N] as number` (executePath) |
| `core/snapshot.ts` | 6 | `as unknown as SnapshotValueResolver`, `as T`, `as MutableState<unknown>` |
| `core/remember.ts` | 2 | `as T` |
| `core/recomposer.ts` | 2 | `as T`, `as RecomposeScopeImpl` |
| `core/derived-state.ts` | 2 | `as { id: StateId }` |
| `layout/modifier.ts` | 11 | `as PaddingElement` 等 |

### 4. 重复代码

| 位置 | 描述 |
|------|------|
| `SnapshotImpl` vs `MutableSnapshotImpl` | resolveValue/read/withReadObserver/setWriteObserver/nextStateId/takeMutableSnapshot 完全重复 |
| `executePath`(draw-command.ts) vs path 执行(draw-batch.ts) | VectorPath 执行逻辑重复 3 次 |
| `executeFillBody` vs `executeStrokeBody` | path 执行分支完全重复 |

### 5. 继承（interface extends）

所有 `extends` 均为 TypeScript interface 扩展（结构化类型），非 class 继承。已在前序 issue `composition-over-inheritance` 中处理 class extends。

## 修复方案

### Phase 1: DrawCommand 判别联合类型

将 `DrawCommand` 从单一接口（`args: ReadonlyArray<unknown>`）重构为判别联合类型，每个命令类型拥有强类型字段。新增 `batchFill`/`batchStroke`/`batchText` 批处理命令类型。

### Phase 2: Snapshot 去重

提取 `SnapshotStore` 操作为独立函数，`SnapshotImpl`/`MutableSnapshotImpl` 通过组合复用，消除 `as unknown as` 模式。

### Phase 3: Core 类型清理

- `ComposableNode = unknown` → `ComposableNode = { readonly kind: string }`
- `setRememberCache(cache: unknown)` → 泛型化
- `MutableState<unknown>` 观察者 → 保留（多态观察者需要）
- `as { id: StateId }` → 直接使用 `state.id`（MutableState 已有 id 属性）

### Phase 4: Path 执行去重

提取 `executePathCommands` 共享函数，消除 draw-command.ts 和 draw-batch.ts 中的重复代码。

### Phase 5: Modifier as 断言消除

直接构造满足接口的对象字面量，消除 `as PaddingElement` 等断言。

### Phase 6: 测试文件清理

消除测试中的 `any` 和 `as unknown as`。

## 期望行为

- 源码中零 `any`、零 `unknown`（除多态观察者必要的 `MutableState<unknown>`）、零 `as`
- 消除 SnapshotImpl/MutableSnapshotImpl 重复代码
- 消除 path 执行重复代码
- 所有测试通过，类型检查零错误
