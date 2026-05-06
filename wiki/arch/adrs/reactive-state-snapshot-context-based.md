---
id: "reactive-state-snapshot-context-based"
type: architecture
status: accepted
title: "响应式状态系统：基于 Context 的自研 Snapshot"
depends_on:
  - "../road-map/canvas-ui-runtime.md"
created: "2026-04-30 16:35"
updated: "2026-04-30 16:40"
stale: false
---

# ADR: 响应式状态系统 — 基于 Context 的自研 Snapshot

## 背景

Canvas UI 运行时需要一个细粒度的响应式状态系统来驱动 UI 重组。参考 Android Jetpack Compose 的设计理念：
- 状态变更应自动触发受影响 Composable 函数的重新执行
- 需要支持最小化更新（跳过未变化的节点）
- 必须零 DOM 依赖，纯 TypeScript 实现
- 移动端优先，性能敏感

## 决策结果

选择 **自研基于 Context 的 Snapshot 系统**，完全模拟 Compose 的 State/Snapshot 语义。

### 核心约束

1. ❌ **禁止使用 global/static 全局变量**
2. ✅ **所有状态通过 Context（组合上下文）注入和维护**
3. ✅ 支持多 Canvas 实例独立运行（无全局污染）
4. ✅ 100% API 兼容 Android Compose 风格

## 架构设计

### Context 体系

```typescript
interface ComposerContext {
  readonly snapshot: Snapshot;
  readonly recomposer: Recomposer;
  readonly layoutDirection: LayoutDirection;
  readonly density: Density;
}

interface Snapshot {
  readonly id: SnapshotId;
  readonly parent: Snapshot | null;

  // 读取追踪
  read<T>(state: MutableState<T>): T;

  // 写入标记
  write<T>(state: MutableState<T>, value: T): void;

  // 事务操作
  takeMutableSnapshot(): MutableSnapshot;
}

interface MutableSnapshot extends Snapshot {
  apply(): Array<RecomposeScope>;
  dispose(): void;
}
```

### 核心数据结构

```typescript
class MutableState<T> {
  private _value: T;
  private readonly _id: StateId;

  constructor(initialValue: T, private snapshot: Snapshot) {
    this._value = initialValue;
    this._id = generateStateId();
  }

  get value(): T {
    this.snapshot.read(this); // 通过 Context 追踪依赖
    return this._value;
  }

  set value(newValue: T) {
    if (this._value === newValue) return; // 引用相等性优化
    this._value = newValue;
    this.snapshot.write(this, newValue); // 标记脏数据并触发重组
  }
}

class RecomposeScope {
  readonly id: ScopeId;
  private readonly composed: ComposableFunction;
  private readonly dependencies: Set<StateId> = new Set();

  invalidate(): void { /* 标记为脏，等待下一帧重组 */ }
  recompose(): void { /* 重新执行 composable 函数 */ }
}
```

### Context 注入流程

```
┌─ CanvasHost.create()
│   ├─ 创建 RootContext (含 Snapshot + Recomposer)
│   ├─ 创建 GlobalSnapshot (根快照)
│   └─ 启动 Recomposition Loop
│       │
│   └─ @Composable App()  ← 接收 context 参数
│       ├─ context.snapshot.read(stateA)  ← 自动记录依赖
│       ├─ context.recomposer.currentScope ← 当前重组范围
│       └─ @Composable Child()  ← context 向下传递
│           └─ ...
│
└─ 每帧结束:
    ├─ 收集所有 invalidated Scopes
    ├─ 按拓扑排序执行重组
    └─ 触发渲染（仅绘制变化区域）
```

## 正面影响

1. **100% Compose 兼容**：API 与 Android Jetpack Compose 完全一致，降低学习成本
2. **多实例安全**：每个 Canvas 实例拥有独立的 Context，互不干扰
3. **可测试性强**：可注入 MockContext 进行单元测试，无需全局状态清理
4. **零外部依赖**：纯自研，包体积可控（预计 < 12KB gzipped）
5. **完全可控**：可根据 Canvas 场景深度定制（如批量合并、优先级队列）

## 负面影响与风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 开发成本高 | 预计 2000+ 行核心代码，2-3 周研发 | 先实现 MVP（核心路径），渐进增强 |
| 边界情况复杂 | 循环依赖、大规模状态、嵌套快照 | 编写详尽的单元测试 + Spike 验证 |
| 无社区经验借鉴 | 从零开始，可能踩坑 | 参考 Compose 开源实现 + 性能基准测试 |
| Context 传递开销 | 每层 Composable 都需接收 context | 使用隐式参数或闭包捕获，避免显式传递 |

## 验证假设

### 前提条件
1. JavaScript 单线程模型可简化 Snapshot 并发控制（无需锁机制）
2. Context 传递性能开销 < 1% 总帧时间
3. 依赖追踪算法在 1000+ State 对象时仍保持 < 16ms 帧预算

### 验证方式
- [ ] **Spike #1**: 实现 100 个 MutableState 对象的读写性能测试
- [ ] **Spike #2**: 验证 Context 传递在 10 层深组件树中的开销
- [ ] **Spike #3**: 测试循环依赖检测机制的准确性

## 可逆性评估

**类别**: 🟡 **部分可逆**

| 指标 | 数值 |
|------|------|
| 影响文件数 | ~15 文件（core/state/, core/snapshot/, core/recomposer/） |
| 影响模块数 | 2-3 模块（reactive-core, 部分 renderer） |
| 数据迁移 | 无（新代码，无存量数据） |
| API 变更风险 | 中等（如果切换方案需修改公共 API） |

**回退方案**：
- 如果自研 Snapshot 性能不达标 → 切换为 Signal-based 底层 + 保留 Compose API 适配层
- 回退工作量：~3 天重构 Adapter Layer
- 风险：上层 API 可能需要微调

## 实现约束（来自架构决策）

1. **禁止 global/static**：所有状态必须通过 `ComposerContext` 注入
2. **Context 生命周期**：与 Canvas 实例绑定，`dispose()` 时自动清理
3. **Snapshot 嵌套**：支持最多 5 层嵌套快照（防止栈溢出）
4. **State ID 分配**：使用递增计数器（per-Context 实例），保证唯一性
5. **内存管理**：disposed 的 Scope 必须释放对 State 的引用，避免内存泄漏

## 相关文档

- 需求文档: [`canvas-ui-runtime.md`](../road-map/canvas-ui-runtime.md)
- Feature 清单: [`canvas-ui-runtime.yaml`](../road-map/canvas-ui-runtime.yaml)
- 后续 Spike: `snapshot-context-spike.md` (待创建)

## 决策记录

| 时间 | 决策者 | 决策内容 |
|------|--------|---------|
| 2026-04-30 16:40 | 用户 + AI | 确认采用自研 Snapshot + Context 方案，禁止 global static |
