---
id: "feat-01"
type: feature
status: done
title: "响应式状态系统核心 (State/Snapshot)"
origin_type: req
depends_on: []
created: "2026-05-01 10:00"
updated: "2026-05-01 10:00"
stale: false
---

# feat-01: 响应式状态系统核心 (State/Snapshot)

## 实现思路概述

实现 Compose 风格的响应式状态系统，核心由三部分组成：
1. **State/MutableState** — 响应式状态容器，读写时自动与 Snapshot 交互
2. **Snapshot** — 快照系统，管理状态读写追踪和事务（apply/dispose）
3. **Recomposer** — 重组调度器，收集脏 Scope 并按拓扑排序执行重组

数据流：`State.write() → Snapshot 标记脏 → Recomposer 收集 → Scope.recompose()`

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/core/types.ts` | 共享类型定义（ID 类型、接口契约） |
| 新建 | `src/core/state.ts` | State/MutableState 实现 + mutableStateOf 工厂 |
| 新建 | `src/core/snapshot.ts` | Snapshot/MutableSnapshot 实现 |
| 新建 | `src/core/recomposer.ts` | RecomposeScope + Recomposer 实现 |
| 新建 | `src/core/composable.ts` | composable() HOC + ComposerContext |
| 修改 | `src/core/index.ts` | 模块公共 API 导出 |
| 修改 | `src/index.ts` | 顶层公共 API 导出 |

## 接口与类型引用

### types.ts — 共享 ID 类型

```typescript
type StateId = number
type SnapshotId = number
type ScopeId = number
```

### state.ts — 状态容器

```typescript
interface State<T> {
  readonly value: T
}

interface MutableState<T> extends State<T> {
  value: T
}

function mutableStateOf<T>(initialValue: T, snapshot: Snapshot): MutableState<T>
```

### snapshot.ts — 快照系统

```typescript
interface Snapshot {
  readonly id: SnapshotId
  readonly parent: Snapshot | null
  read<T>(state: MutableState<T>): T
  write<T>(state: MutableState<T>, value: T): void
  takeMutableSnapshot(): MutableSnapshot
}

interface MutableSnapshot extends Snapshot {
  apply(): ScopeId[]
  dispose(): void
}
```

### recomposer.ts — 重组调度

```typescript
interface RecomposeScope {
  readonly id: ScopeId
  invalidate(): void
  recompose(): void
}

interface Recomposer {
  currentScope: RecomposeScope | null
  pushScope(scope: RecomposeScope): void
  popScope(): void
  scheduleRecompose(scope: RecomposeScope): void
  performRecompose(): void
}
```

### composable.ts — Composable HOC

```typescript
interface ComposerContext {
  readonly snapshot: Snapshot
  readonly recomposer: Recomposer
}

type ComposableFunction<TProps> = (props: TProps, ctx: ComposerContext) => ComposableNode | null
type ComposableNode = unknown

function composable<TProps extends Record<string, unknown>>(
  fn: (props: TProps, ctx: ComposerContext) => ComposableNode | null
): ComposableFunction<TProps>
```

## 测试策略

| 项目 | 内容 |
|------|------|
| 测试金字塔 | 单元 80% : 集成 20% : E2E 0% |
| Mock 策略 | 无外部依赖，不需要 Mock；Snapshot 内部状态用真实对象 |
| 关键路径 | 1) State 读写追踪 2) Snapshot 事务 apply/dispose 3) Recomposer 调度重组 |
| 边界测试 | 1) 嵌套快照回滚 2) 空 Scope 重组 3) 大量 State 并发写入 |

## 风险与依赖

| 风险 | 缓解 |
|------|------|
| 循环依赖检测 | Recomposer 维护执行栈，检测回环时抛出 |
| 嵌套快照深度 | 限制最大 5 层，超出抛出 |
| State ID 冲突 | per-Snapshot 递增计数器 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] 核心路径覆盖率 ≥ 90%
- [x] 无 console.log/debugger/TODO 残留
- [x] 公共 API 有 JSDoc
