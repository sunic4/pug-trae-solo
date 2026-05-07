---
id: "data-flow-management-unidirectional-pattern"
type: architecture
status: accepted
title: "数据流管理 — 单向数据流 + Context 注入"
depends_on:
  - "../road-map/canvas-ui-runtime.md"
  - "./reactive-state-snapshot-context-based.md"
  - "./component-model-pure-function-call-chain.md"
created: "2026-04-30 18:00"
updated: "2026-04-30 18:05"
stale: false
---

# ADR: 数据流管理 — 单向数据流 + Context 注入

## 背景

在确定使用 **纯函数调用链组件模型** 和 **Context-based Snapshot 状态系统** 后，需要明确：

> **应用的数据应该如何在组件树中流动？如何保证数据流向的可预测性和可调试性？**

### 核心挑战

1. **多组件共享状态**：兄弟组件如何访问同一份数据？
2. **跨层级传递**：深层子组件如何获取祖先组件的状态？
3. **状态更新传播**：状态变更后，哪些组件应该重新执行？
4. **副作用隔离**：网络请求、DOM 操作等副作用如何与纯净的数据流协调？

### 候选方案

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| **A) 单向数据流 + Context** | 状态自顶向下流动，事件自底向上冒泡，通过 Context 跨层级共享 | 可预测性强；调试简单；与 Compose 模型完美契合 | 需要显式声明依赖关系 |
| **B) 全局事件总线** | 组件通过发布/订阅模式通信 | 解耦彻底；灵活度高 | 数据流不透明；难以追踪状态变更来源 |
| **C) 双向绑定** | 子组件直接修改父组件传入的 props | 开发效率高（类似 Vue v-model） | 容易产生循环更新；调试困难 |

## 决策结果

选择 **方案 A：单向数据流 + Context 注入模式**，严格遵循以下原则：

```
┌─────────────────────────────────────────────────────┐
│                  单向数据流架构                       │
│                                                     │
│   ┌─────────┐                                       │
│   │  State   │ ← MutableState<T> (单一事实源)        │
│   │ (Source) │                                       │
│   └────┬────┘                                       │
│        │ read()                                     │
│        ▼                                           │
│   ┌─────────┐    props      ┌──────────┐            │
│   │  Parent │ ──────────►  │  Child A  │            │
│   │Composable│              │Composable │            │
│   └────┬────┘              └──────────┘            │
│        │                                          │
│        │ context injection                        │
│        ▼                                          │
│   ┌──────────┐                                    │
│   │  Child B  │ ← 通过 Context 获取 State          │
│   │Composable │                                    │
│   └────┬─────┘                                    │
│        │                                          │
│        │ event callback                           │
│        ▼                                          │
│   ┌─────────┐                                       │
│   │  Action  │ ← 触发 state.value = newValue       │
│   │Handler  │                                       │
│   └─────────┘                                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 核心设计原则

```typescript
// ===== 原则 1：State 向下流动（Props Drilling 或 Context）=====

const App = composable(() => {
  // ✅ 状态定义在顶层（或合适的层级）
  const userState = remember(() => mutableStateOf<User | null>(null));
  const theme = remember(() => mutableStateOf('light'));

  return Column() {
    Header({ user: userState.value });  // Props 显式传递
    
    // 使用 ContextProvider 向下注入（避免 Props Drilling）
    ThemeContext.Provider({ value: theme }) {
      MainContent();  // 子组件通过 context.theme 访问
    };
    
    Footer({ onLogout: () => userState.value = null });  // 回调向上传递
  };
});

// ===== 原则 2：事件向上冒泡（Callback 模式）=====

const TodoItem = composable<{ 
  todo: Todo; 
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}>(({ todo, onDelete, onToggle }) => {
  return Row() {
    Checkbox({ 
      checked: todo.completed,
      onCheckedChange: () => onToggle(todo.id)  // 事件向上冒泡
    });
    Text({ text: todo.title });
    Button({ 
      text: '删除', 
      onClick: () => onDelete(todo.id)  // 事件向上冒泡
    });
  };
});

// ===== 原则 3：Context 用于跨层级共享（避免过度 Props Drilling）=====

interface ThemeContextValue {
  theme: MutableState<string>;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>();

const DeepChildComponent = composable(() => {
  // ✅ 直接从 Context 获取，无需层层传递 props
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return Button({
    text: `当前主题: ${theme.value}`,
    onClick: toggleTheme
  });
});
```

### 数据流分类与实现模式

#### 模式 1：本地状态（Local State）

**适用场景**：组件内部私有状态，不影响其他组件

```typescript
const Counter = composable(() => {
  const count = remember(() => mutableStateOf(0));  // 仅本组件可见
  
  return Column() {
    Text({ text: `Count: ${count.value}` });
    Button({ text: '+', onClick: () => count.value++ });
  };
});
```

#### 模式 2：提升状态（Lifted State）

**适用场景**：多个兄弟组件需要共享同一份状态

```typescript
// ❌ 错误：各自维护独立状态，无法同步
const BadExample = composable(() => {
  return Column() {
    CounterA();  // count = 0
    CounterB();  // count = 0 （独立状态）
  };
});

// ✅ 正确：状态提升到共同父组件
const GoodExample = composable(() => {
  const sharedCount = remember(() => mutableStateOf(0));  // 提升到父级
  
  return Column() {
    CounterDisplay({ count: sharedCount.value });     // 只读展示
    CounterControls({                                 // 只提供修改能力
      onIncrement: () => sharedCount.value++,
      onDecrement: () => sharedCount.value--
    });
  };
});
```

#### 模式 3：Context 共享（Cross-Cutting State）

**适用场景**：主题、用户信息、国际化等需要被深层子组件访问的全局状态

```typescript
// 定义 Context
interface AppConfigContextValue {
  currentUser: MutableState<User | null>;
  locale: MutableState<string>;
  isDarkMode: MutableState<boolean>;
}

export const AppConfigContext = createContext<AppConfigContextValue>();

// 在根组件提供
const AppRoot = composable(() => {
  const currentUser = remember(() => mutableStateOf<User | null>(null));
  const locale = remember(() => mutableStateOf('zh-CN'));
  const isDarkMode = remember(() => mutableStateOf(false));

  return AppConfigContext.Provider({
    value: { currentUser, locale, isDarkMode }
  }) {
    Router();  // 所有子路由都可访问此 Context
  };
});

// 在任意深层组件消费
const UserProfileAvatar = composable(() => {
  const { currentUser } = useContext(AppConfigContext);  // 无需 props 传递
  
  if (!currentUser.value) return null;
  
  return Image({ src: currentUser.value.avatarUrl });
});
```

#### 模式 4：派生状态（Derived State）

**适用场景**：根据现有状态计算得出的值，避免冗余存储

```typescript
const ShoppingCart = composable<Record<string, never>>((ctx) => {
  const items = remember(ctx, () => mutableStateOf<CartItem[]>([]));

  const totalPrice = remember(ctx, () => derivedStateOf(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  ));

  const itemCount = remember(ctx, () => derivedStateOf(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  ));

  Column(ctx, Modifier.create().freeze(), 'spacedBy(4)', 'start', () => {
    Text(ctx, `共 ${itemCount.value} 件商品`, Modifier.create().freeze());
    Text(ctx, `总计: ¥${totalPrice.value.toFixed(2)}`, Modifier.create().freeze());
    CartItemList(ctx, { items: items.value });
  });
});
```

### 副作用管理（Side Effects）

**核心原则**：副作用必须与数据流解耦，通过 `sideEffect` 隔离

```typescript
const UserProfile = composable<{ userId: string }>((ctx, { userId }) => {
  const user = remember(ctx, () => mutableStateOf<User | null>(null));
  const loading = remember(ctx, () => mutableStateOf(true));

  sideEffect(ctx.composerContext, () => {
    loading.value = true;

    fetchUser(userId)
      .then(data => {
        user.value = data;
        loading.value = false;
      })
      .catch(error => {
        console.error('Failed to load user:', error);
        loading.value = false;
      });

    return () => {
      cancelFetchUser(userId);
    };
  });

  if (loading.value) {
    LoadingSpinner(ctx);
    return;
  }

  if (!user.value) {
    ErrorView(ctx, { message: '用户不存在' });
    return;
  }

  Column(ctx, Modifier.create().freeze(), 'spacedBy(8)', 'start', () => {
    Avatar(ctx, { url: user.value.avatarUrl });
    Text(ctx, user.value.name, Modifier.create().freeze());
  });
});
```

## 正面影响

1. **可预测性强**：
   - 数据流向清晰：State → View → Action → State
   - 状态变更来源可追踪（通过 Snapshot 依赖图）
   - 易于推理组件行为

2. **调试体验优秀**：
   - 可通过 DevTools 可视化数据流
   - 时间旅行调试（Time-travel debugging）
   - 状态变更历史记录

3. **与现有架构完美契合**：
   - Context-based Snapshot → 自然支持单向数据流 ✅
   - 纯函数调用链 → 输入（props）→ 输出（UI）✅
   - Recomposition 机制 → 最小化更新范围 ✅

4. **测试友好**：
   - 组件可独立测试（mock props 和 context）
   - 无需全局状态清理
   - 副作用可隔离和模拟

5. **性能优化空间大**：
   - 派生状态自动缓存（derivedStateOf + remember）
   - 未变化的子组件跳过重组
   - Context 消费者精准订阅

## 负面影响与风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Props Drilling 繁琐 | 深层组件需要层层传递 props | 使用 Context Provider 注入跨层级状态 |
| Context 过度使用 | 导致组件耦合度提高 | 遵循"最小知识原则"，仅在必要时使用 Context |
| 派生状态性能问题 | 复杂计算可能阻塞主线程 | 使用 Web Worker 或分片计算；设置合理的 memoization 策略 |
| 学习曲线 | 新手需要理解单向数据流范式 | 提供详细文档和最佳实践示例 |

## 与其他方案的对比

| 维度 | **单向数据流 + Context ✅** | 全局事件总线 | 双向绑定 |
|------|---------------------------|-------------|---------|
| 数据流可预测性 | ⭐⭐⭐⭐⭐ 极强 | ⭐ 弱 | ⭐⭐ 中等 |
| 调试难度 | ⭐ 极易 | ⭐⭐⭐⭐⭐ 极难 | ⭐⭐⭐ 较难 |
| 组件解耦程度 | ⭐⭐⭐⭐ 高 | ⭐⭐⭐⭐⭐ 最高 | ⭐⭐ 低 |
| 开发效率（简单场景） | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐ 高 | ⭐⭐⭐⭐⭐ 最高 |
| 与 Compose 兼容性 | ✅✅ 完美 | ⚠️ 需适配 | ❌ 冲突 |
| 大型项目可维护性 | ⭐⭐⭐⭐⭐ 最佳 | ⭐⭐ 差 | ⭐⭐⭐ 一般 |

## 验证假设

### 前提条件
1. Context 注入的性能开销 < 2% 总帧时间
2. 单向数据流在 100+ 组件的大型应用中仍保持可维护性
3. useEffect 的依赖数组检测机制能准确捕获所有外部依赖

### 验证方式
- [ ] **Spike #1**: 实现 10 层深组件树的 Context 传递性能测试
- [ ] **Spike #2**: 对比 Props Drilling vs Context 的内存占用差异
- [ ] **Spike #3**: 验证复杂派生状态（如购物车总价计算）的 useMemo 缓存命中率

## 可逆性评估

**类别**: 🟢 **高度可逆**

| 指标 | 数值 |
|------|------|
| 影响文件数 | ~5 文件（core/context/, core/hooks/） |
| 影响模块数 | 1-2 模块（data-flow, 部分 reactive-core） |
| 数据迁移 | 无（新代码，无存量数据） |
| API 变更风险 | 低（公共 API 是 Hook 函数，内部实现灵活） |

**回退方案**：
- 如果单向数据流在某些场景下过于僵化 → 引入有限的事件总线用于特定模块间通信
- 回退策略：保留单向数据流作为默认模式，允许在文档化的例外情况下使用事件总线
- 工作量：~2 天实现轻量 EventBus + 编写使用规范

## 实现约束（来自架构决策）

1. **禁止双向绑定**：子组件不得直接修改父组件传入的 props（必须通过回调通知）
2. **Context 层级限制**：最多嵌套 10 层 Context Provider（防止查找链过长）
3. **派生状态必须 memoize**：使用 `useMemo` 包裹计算逻辑，并提供明确的依赖数组
4. **副作用必须隔离**：所有异步操作、DOM 操作必须包裹在 `useEffect` 中
5. **Context 更新粒度**：避免将整个应用状态放入单个 Context（按领域拆分）
6. **Props 不可变**：组件接收的 props 应视为只读（TypeScript readonly 修饰符）

## 反模式与最佳实践

### ❌ 反模式示例

```typescript
// 反模式 1：直接修改 props
const BadComponent = composable<{ count: number }>(({ count }) => {
  return Button({
    text: `${count}`,
    onClick: () => count++  // ❌ 错误！不能直接修改 props
  });
});

// 反模式 2：全局变量作为状态源
let globalCounter = 0;  // ❌ 错误！违反 Context-only 原则

const BadGlobalState = composable(() => {
  return Text({ text: `${globalCounter}` });  // 无法触发重组
});

// 反模式 3：在渲染过程中产生副作用
const BadSideEffect = composable<{ userId: string }>(({ userId }) => {
  fetch(`/api/users/${userId}`);  // ❌ 错误！每次重组都会发起请求
  
  return Text({ text: userId });
});
```

### ✅ 最佳实践示例

```typescript
// 最佳实践 1：状态提升 + 回调分离
const ParentComponent = composable(() => {
  const count = remember(() => mutableStateOf(0));
  
  return Column() {
    Display({ value: count.value });           // 只读
    Controls({ 
      onIncrement: () => count.value++,        // 写权限
      onDecrement: () => count.value--         // 写权限
    });
  };
});

// 最佳实践 2：Context 按领域拆分
const App = composable<Record<string, never>>((ctx) => {
  Scaffold(ctx,
    () => TopAppBar(ctx, 'App'),
    () => {
      Router(ctx);
    },
    () => BottomNavigation(ctx, []),
  );
});

// 最佳实践 3：副作用正确隔离
const DataFetcher = composable<{ url: string }>((ctx, { url }) => {
  const data = remember(ctx, () => mutableStateOf<any>(null));

  sideEffect(ctx.composerContext, () => {
    let cancelled = false;

    fetchData(url).then(result => {
      if (!cancelled) data.value = result;
    });

    return () => { cancelled = true; };
  });

  if (data.value) {
    JsonViewer(ctx, { data: data.value });
  } else {
    LoadingSpinner(ctx);
  }
});
```

## 分阶段实施路线图

| 阶段 | 实现内容 | 目标 | 预计工作量 |
|------|---------|------|-----------|
| **Phase 1 (MVP)** | mutableStateOf/remember/derivedStateOf + 基本 Snapshot API | 支持本地状态和简单的父子通信 | 3-4 天 |
| **Phase 2** | useContext/createContext + Provider 模式 | 支持跨层级状态共享 | 2 天 |
| **Phase 3** | 派生状态优化 + 依赖追踪增强 | 自动化 memoization 和脏检查优化 | 2-3 天 |
| **Phase 4** | 副作用生命周期管理（cleanup/abort） | 完善异步操作和资源释放 | 2 天 |
| **Phase 5** | DevTools 集成 + 数据流可视化 | 提升调试体验 | 3-4 天 |

## 相关文档

- 上游 ADR:
  - [`reactive-state-snapshot-context-based.md`](./reactive-state-snapshot-context-based.md)
  - [`component-model-pure-function-call-chain.md`](./component-model-pure-function-call-chain.md)
- 下游依赖:
  - [`error-handling-global-catch-recovery.md`](./error-handling-global-catch-recovery.md) （错误边界集成）
  - [`performance-optimization-virtualization-caching.md`](./performance-optimization-virtualization-caching.md) （memoization 策略）
- 需求文档: [`canvas-ui-runtime.md`](../road-map/canvas-ui-runtime.md)

## 决策记录

| 时间 | 决策者 | 决策内容 |
|------|--------|---------|
| 2026-04-30 18:05 | 用户 + AI | 确认采用单向数据流 + Context 注入模式，禁止双向绑定和全局变量 |
