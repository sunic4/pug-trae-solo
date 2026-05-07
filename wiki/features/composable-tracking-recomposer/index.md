---
id: "feat-02"
type: feature
status: done
title: "@Composable 函数追踪与重组调度器 (remember ctx-first)"
origin_type: req
depends_on: ["feat-01"]
created: "2026-05-01 10:30"
updated: "2026-05-07 00:00"
stale: false
---

# feat-02: @Composable 函数追踪与重组调度器

## 实现思路概述

在 feat-01 的基础上，增强 Composable 追踪和重组调度能力：

1. **remember(ctx, calculation)** — ctx-first 参数，在 Composable 作用域内持久化状态
2. **derivedStateOf()** — 计算派生状态，带缓存
3. **Skip 机制** — 重组时比较输入是否变化，未变化则跳过执行
4. **SideEffect** — 重组完成后的副作用回调

### remember() 签名升级

```typescript
function remember<T>(
  ctx: CompositionContext,
  calculation: () => T,
  keys?: readonly RememberKey[],
): T
```

**关键变化**：
- 第一个参数是 `ctx: CompositionContext`（不是旧的 ComposerContext 或隐式获取）
- 在当前 Scope 内缓存计算结果
- keys 变化时重新计算，否则返回缓存值
- 依赖 `ctx.recomposer.currentScope` 获取当前 Scope

### 使用示例

```typescript
setContent(canvas, (rootCtx) => {
  const count = remember(rootCtx, () => mutableStateOf(0));
  const doubled = remember(rootCtx, () => count.value * 2, [count.value]);

  Column(rootCtx, Modifier.create().padding(16).freeze(), 'center', 'center', () => {
    Text(rootCtx, `Count: ${count.value}`);
    Text(rootCtx, `Doubled: ${doubled}`);

    Button(rootCtx, '+', () => { count.value++; });
  });
});
```

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/core/remember.ts` | remember(ctx, calc) 实现 |
| 新建 | `src/core/derived-state.ts` | derivedStateOf() 实现 |
| 修改 | `src/core/recomposer.ts` | 增加 Skip 机制 + 批量重组 |
| 修改 | `src/core/composable.ts` | 集成 remember + SideEffect |
| 修改 | `src/core/index.ts` | 新增导出 |
| 修改 | `src/index.ts` | 新增导出 |

## 接口与类型引用

### remember.ts

```typescript
type RememberKey = string | number | boolean | null | undefined

function remember<T>(
  ctx: CompositionContext,
  calculation: () => T,
  keys?: readonly RememberKey[],
): T
```

- ctx 必须是 CompositionContext（包含 recomposer 用于 Scope 管理）
- keys 变化时重新计算，否则返回缓存值

### derived-state.ts

```typescript
interface DerivedState<T> extends State<T> {
  readonly dependencies: Set<StateId>
}

function derivedStateOf<T>(calc: () => T): DerivedState<T>
```

### sideEffect()

```typescript
function sideEffect(ctx: ComposerContext, effect: () => void): void
```

## 测试策略

| 项目 | 内容 |
|------|------|
| 测试金字塔 | 单元 80% : 集成 20% |
| Mock 策略 | 无外部依赖 |
| 关键路径 | 1) remember(ctx, calc) 跨重组缓存 2) derivedStateOf 惰性计算 3) Skip 跳过未变化 4) SideEffect 延迟执行 |
| 边界测试 | 1) remember 无 keys 2) derivedStateOf 循环依赖 3) SideEffect 抛异常 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] remember() 签名为 ctx-first
- [x] 核心路径覆盖率 ≥ 90%
