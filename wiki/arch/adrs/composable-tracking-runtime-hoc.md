---
id: "composable-tracking-runtime-hoc"
type: architecture
status: accepted
title: "@Composable 运行时追踪机制 — HOC 包装方案"
depends_on:
  - "../road-map/canvas-ui-runtime.md"
  - "./reactive-state-snapshot-context-based.md"
created: "2026-04-30 16:45"
updated: "2026-04-30 16:48"
stale: false
---

# ADR: @Composable 运行时追踪机制 — HOC 包装方案

## 背景

在确定使用自研 Snapshot + Context 的状态系统后，需要解决核心问题：

> **如何在运行时自动追踪 Composable 函数对 State 的读取依赖？**

Android Compose 使用 Kotlin 编译器插件（Compose Compiler）在编译时插入追踪代码。但 TypeScript 生态缺乏成熟的编译时转换工具链（SWC 插件仍在早期阶段），需要选择运行时替代方案。

## 决策结果

选择 **运行时高阶函数（HOC）包装方案**，通过 `composable()` 函数显式管理 Composable 的生命周期和依赖追踪。

### 核心设计

```typescript
// ===== 公共 API =====

function composable<TProps extends Record<string, any>>(
  fn: (props: TProps, context: ComposerContext) => ComposableNode
): ComposableFunction<TProps>;

// ===== 使用示例 =====

const MyComponent = composable<{ count: MutableState<number> }>(({ count }, ctx) => {
  const value = count.value; // 自动追踪！
  
  return Box({ modifier: Modifier.onClick(() => count.value++) }) {
    Text(`Count: ${value}`);
  };
});
```

### 内部实现原理

```
composable(fn) 执行流程：

1. Recomposer.beginScope(fn)
   └─ 创建新的 RecomposeScope
   └─ 压入 Scope 栈

2. context.recomposer.pushScope(scope)
   └─ 设置当前活跃 Scope（用于 State.read() 追踪）

3. 执行 fn(props, context)
   ├─ 用户代码执行
   ├─ State.value getter 被调用
   │   └─ context.snapshot.read(state) ← 记录 state → scope 映射
   └─ 返回 ComposableNode 树

4. scope.markDependenciesComplete()
   └─ 冻结当前 Scope 的依赖集合

5. finally: context.recomposer.popScope()
   └─ 弹出 Scope 栈
   └─ 返回结果
```

## 正面影响

1. **零构建工具改造**：纯运行时实现，无需 SWC/Babel/Rollup 插件配置
2. **Context 显式传递**：完全符合"禁止 global/static"约束
3. **动态友好**：支持运行时动态创建/销毁 Composable（热更新、插件系统）
4. **调试体验优秀**：调用栈清晰，可直接在 `fn` 内部断点调试
5. **TypeScript 类型安全**：完整泛型推导，IDE 自动补全完善
6. **测试友好**：可注入 MockContext 进行隔离测试

## 负面影响与风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 性能开销 | 每次多一层函数调用 (~0.1ms) | 可忽略不计；V8 引擎内联优化后接近零开销 |
| 手动包裹 | 开发者需记住用 `composable()` | 提供 ESLint 规则 + IDE 代码片段模板 |
| 无法静态分析 | 编译期无法检测未使用的 State 读取 | 通过运行时 Profiler 工具补充 |
| 函数签名较长 | 需要声明 props 泛型 | 使用类型推断简化：`composable((props) => ...)` |

## 与其他方案的对比

| 维度 | HOC 包装 ✅ | 编译时转换 | Proxy 隐式 |
|------|------------|-----------|-----------|
| 实现复杂度 | 低 (~300 行) | 极高 (~1000+ 行) | 中等 (~200 行) |
| 运行时开销 | ~0.1ms/call | 零 | ~0.05ms/access |
| 构建工具链 | 无需改动 | 需要 SWC 插件 | 无需改动 |
| global/static | ❌ 不需要 | ❌ 不需要 | ⚠️ 需要 contextHolder |
| 调试难度 | 简单 | 困难 | 中等 |
| 动态创建 | ✅ 支持 | ❌ 不支持 | ✅ 支持 |

## 验证假设

### 前提条件
1. V8 引擎会对高频调用的 `composable()` 进行 JIT 内联优化
2. Context 对象传递开销 < 0.01ms（属性访问）
3. 10,000 次 composable() 调用总耗时 < 100ms

### 验证方式
- [ ] **Spike**: 实现 composable() 基准测试（1k/10k/100k 组件场景）
- [ ] **Profile**: 使用 Chrome DevTools Performance 面板测量实际开销
- [ ] **对比**: 与 Proxy 方案的性能对比数据

## 可逆性评估

**类别**: 🟢 **完全可逆**

| 指标 | 数值 |
|------|------|
| 影响文件数 | ~5 文件（core/composable.ts, core/recomposer.ts 等） |
| 影响模块数 | 1 模块（reactive-core） |
| 数据迁移 | 无（新代码） |
| API 变更风险 | 低（公共 API 不变，仅内部实现替换） |

**回退方案**：
- 未来切换到编译时方案 → 仅需修改 `composable()` 内部实现
- 上层用户代码完全不需要改动
- 回退工作量：~2 天重构 + 测试验证

## 实现约束（来自架构决策）

1. **必须接收 Context 参数**：`fn(props, context)` 签名不可省略
2. **Scope 栈管理**：push/pop 必须成对出现，使用 try-finally 保证安全
3. **依赖冻结**：`markDependenciesComplete()` 后禁止再添加依赖
4. **错误边界**：fn 抛出异常时必须正确 pop Scope，避免栈泄漏
5. **性能预算**：单次 composable() 执行 < 0.5ms（不含子组件）

## 分阶段演进路线图

| 阶段 | 实现内容 | 目标 |
|------|---------|------|
| **Phase 1 (MVP)** | 基本 composable() + 依赖追踪 + Skip 机制 | 核心功能可用 |
| **Phase 2** | remember() 支持 + SideEffect 管理 | 状态持久化与副作用 |
| **Phase 3** | 可选 SWC 插件（编译时增强） | 性能极致优化（可选） |
| **Phase 4** | IDE 插件（语法检查、自动补全） | 开发体验提升 |

## 相关文档

- 上游 ADR: [`reactive-state-snapshot-context-based.md`](./reactive-state-snapshot-context-based.md)
- 需求文档: [`canvas-ui-runtime.md`](../road-map/canvas-ui-runtime.md)
- Spike 计划: `composable-hoc-spike.md` (待创建)

## 决策记录

| 时间 | 决策者 | 决策内容 |
|------|--------|---------|
| 2026-04-30 16:48 | 用户 + AI | 确认采用运行时 HOC 包装方案，Context 显式传递 |
