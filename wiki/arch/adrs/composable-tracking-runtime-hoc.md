---
id: "composable-tracking-runtime-hoc"
type: architecture
status: accepted
title: "@Composable 运行时追踪机制 — HOC 包装方案 (ctx-first)"
depends_on:
  - "../road-map/canvas-ui-runtime.md"
  - "./reactive-state-snapshot-context-based.md"
created: "2026-04-30 16:45"
updated: "2026-05-07 00:00"
stale: false
---

# ADR: @Composable 运行时追踪机制 — HOC 包装方案

## 背景

在确定使用自研 Snapshot + Context 的状态系统后，需要解决核心问题：

> **如何在运行时自动追踪 Composable 函数对 State 的读取依赖？**

Android Compose 使用 Kotlin 编译器插件（Compose Compiler）在编译时插入追踪代码。但 TypeScript 生态缺乏成熟的编译时转换工具链（SWC 插件仍在早期阶段），需要选择运行时替代方案。

## 决策结果

选择 **运行时高阶函数（HOC）包装方案**，通过 `composable()` 函数显式管理 Composable 的生命周期和依赖追踪。**核心创新：包装函数接收 `(ctx: CompositionContext, props: TProps) => void` 签名，ctx-first 设计。**

### 核心设计

```typescript
// ===== 公共 API =====

function composable<TProps>(
  fn: (ctx: CompositionContext, props: TProps) => void,
): ComposableFunction<TProps>;

// ComposableFunction 是外部可调用的签名
type ComposableFunction<TProps> = (props: TProps, ctx: ComposerContext) => ComposableNode | null;

// ===== 使用示例 =====

const MyComponent = composable<{ count: MutableState<number> }>((ctx, { count }) => {
  const value = count.value;

  Box(ctx, () => {
    Text(ctx, `Count: ${value}`);
  });
});
```

### 内部实现原理

```
composable(fn) 执行流程：

1. 返回一个 ComposableFunction 闭包：(props, outerCtx) => ComposableNode | null

2. 当外部调用 composed(props, ctx) 时：
   ├─ 创建新的 CompositionContextImpl(outerCtx.snapshot, outerCtx.recomposer)
   │   └─ 这个 compositionCtx 包含 emittedNodes Map 和 groupStack
   │
   ├─ 创建 RecomposeScope
   │   └─ scope.composeWithTracking = () => { ... }
   │
   ├─ 执行 composeWithTracking():
   │   ├─ outerCtx.snapshot.withReadObserver(readObserver, () => {
   │   │   ├─ outerCtx.recomposer.pushScope(scope)
   │   │   │   └─ 设置当前活跃 Scope（用于 State.read() 追踪）
   │   │   │
   │   │   ├─ fn(compositionCtx, props)  ← ★ 用户代码执行
   │   │   │   ├─ 用户代码读取 state.value
   │   │   │   │   └─ readObserver(state) → scope.addDependency(state.id)
   │   │   │   │
   │   │   │   ├─ 组件调用 ctx.emitLeaf() → 向 compositionCtx.emittedNodes 写入
   │   │   │   ├─ 组件调用 ctx.startGroup() → 压入 groupStack
   │   │   │   └─ 组件调用 ctx.endGroup()  → 弹出 groupStack
   │   │   │
   │   │   └─ finally: outerCtx.recomposer.popScope()
   │   │   └─ 弹出 Scope 栈
   │   └─ })
   │
   └─ return null  （★ 返回 null，因为节点已发射到 compositionCtx.emittedNodes）

3. 外部通过 compositionCtx.emittedNodes 获取完整的 EmittedNode 树
4. 外部通过 compositionCtx.rootNodeId 获取根节点 ID
```

### 关键类型关系

```
ComposerContext (轻量，只读投影)
  ├── snapshot: Snapshot
  └── recomposer: Recomposer
      ↑
      │ composable() 内部创建
      ↓
CompositionContextImpl (丰富，emit 能力)
  ├── extends ComposerContext
  ├── emitLeaf()         → 向 _nodes Map 写入叶子节点
  ├── startGroup()       → 向 _nodes Map 写入容器节点 + 压栈
  ├── endGroup()         → 弹出 groupStack
  ├── emittedNodes       → Map<NodeId, EmittedNode> (只读)
  └── rootNodeId         → number | null
```

## 正面影响

1. **零构建工具改造**：纯运行时实现，无需 SWC/Babel/Rollup 插件配置
2. **Context 显式传递（双重 ctx）**：
   - `ComposerContext` 用于依赖追踪（snapshot/recomposer）
   - `CompositionContext` 用于节点发射（emitLeaf/startGroup/endGroup）
   - 完全符合"禁止 global/static"约束
3. **动态友好**：支持运行时动态创建/销毁 Composable（热更新、插件系统）
4. **调试体验优秀**：调用栈清晰，可直接在 `fn` 内部断点调试
5. **TypeScript 类型安全**：完整泛型推导，IDE 自动补全完善
6. **测试友好**：可注入 MockContext 进行隔离测试
7. **Emit-based 架构天然契合**：
   - 组件返回 void，无中间对象分配
   - EmittedNode 扁平存储在 Map 中，渲染器直接消费
   - 组合/渲染解耦

## 负面影响与风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 性能开销 | 每次多一层函数调用 (~0.1ms) + CompositionContextImpl 创建 | 可忽略不计；V8 引擎内联优化后接近零开销 |
| 手动包裹 | 开发者需记住用 `composable()` | 提供 ESLint 规则 + IDE 代码片段模板 |
| 无法静态分析 | 编译期无法检测未使用的 State 读取 | 通过运行时 Profiler 工具补充 |
| 双重 Context | ComposerContext vs CompositionContext 可能混淆 | 命名清晰：前者用于追踪，后者用于发射；文档强调区别 |
| 函数签名较长 | 需要声明 props 泛型 | 使用类型推断简化：`composable((ctx, props) => ...)` |

## 验证假设

### 前提条件
1. V8 引擎会对高频调用的 `composable()` 进行 JIT 内联优化
2. CompositionContextImpl 创建开销 < 0.01ms
3. 10,000 次 composable() 调用总耗时 < 100ms

### 验证方式
- [x] **Spike**: 实现 composable() 基准测试（1k/10k/100k 组件场景）
- [x] **Profile**: 使用 Chrome DevTools Performance 面板测量实际开销
- [ ] **对比**: 与 Proxy 方案的性能对比数据

## 可逆性评估

**类别**: 🟢 **完全可逆**

| 指标 | 数值 |
|------|------|
| 影响文件数 | ~5 文件（core/composable.ts, core/composition-context.ts, core/recomposer.ts 等） |
| 影响模块数 | 1 模块（reactive-core） |
| 数据迁移 | 无（新代码） |
| API 变更风险 | 低（公共 API 是函数签名，内部实现灵活） |

**回退方案**：
- 未来切换到编译时方案 → 仅需修改 `composable()` 内部实现
- 上层用户代码完全不需要改动
- 回退工作量：~2 天重构 + 测试验证

## 实现约束（来自架构决策）

1. **fn 签名必须是 ctx-first**：`fn(ctx: CompositionContext, props: TProps) => void`
2. **Scope 栈管理**：push/pop 必须成对出现，使用 try-finally 保证安全
3. **依赖冻结**：`markDependenciesComplete()` 后禁止再添加依赖
4. **错误边界**：fn 抛出异常时必须正确 pop Scope，避免栈泄漏
5. **性能预算**：单次 composable() 执行 < 0.5ms（不含子组件）
6. **CompositionContextImpl 每次 composable 调用重新创建**：保证 emit 隔离

## 分阶段演进路线图

| 阶段 | 实现内容 | 目标 |
|------|---------|------|
| **Phase 1 (MVP)** ✅ | 基本 composable() + CompositionContext + 依赖追踪 + Emit-based | 核心功能可用 |
| **Phase 2** ✅ | remember(ctx, calc) 支持 + SideEffect 管理 | 状态持久化与副作用 |
| **Phase 3** | 可选 SWC 插件（编译时增强） | 性能极致优化（可选） |
| **Phase 4** | IDE 插件（语法检查、自动补全） | 开发体验提升 |

## 相关文档

- 上游 ADR: [`reactive-state-snapshot-context-based.md`](./reactive-state-snapshot-context-based.md)
- 下游 ADR: [`component-model-pure-function-call-chain.md`](./component-model-pure-function-call-chain.md)
- 需求文档: [`canvas-ui-runtime.md`](../road-map/canvas-ui-runtime.md)

## 决策记录

| 时间 | 决策者 | 决策内容 |
|------|--------|---------|
| 2026-04-30 16:48 | 用户 + AI | 确认采用运行时 HOC 包装方案，Context 显式传递 |
| 2026-05-07 00:00 | 用户 + AI | **重大升级**：composable() 签名改为 ctx-first `(ctx: CompositionContext, props) => void`；引入 CompositionContext / EmittedNode 架构 |
