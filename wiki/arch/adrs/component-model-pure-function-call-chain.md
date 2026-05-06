---
id: "component-model-pure-function-call-chain"
type: architecture
status: accepted
title: "组件模型 — 纯函数调用链 (Compose 风格, 无 JSX)"
depends_on:
  - "../road-map/canvas-ui-runtime.md"
  - "./composable-tracking-runtime-hoc.md"
  - "./layout-engine-custom-linear-column-row.md"
created: "2026-04-30 17:10"
updated: "2026-04-30 17:15"
stale: false
---

# ADR: 组件模型 — 纯函数调用链 (Compose 风格)

## 背景

在确定使用 `composable()` HOC 追踪机制和 Column/Row 布局引擎后，需要决定：

> **Composable 函数的 API 风格是什么？如何组合子组件？返回值类型是什么？**

三大候选：
- **JSX-like**：需要编译时转换，虚拟节点中间层
- **纯函数调用链**：直接调用，无中间表示
- **Widget Tree**：OOP class 继承，Flutter 风格

## 决策结果

选择 **纯函数调用链模式（Compose 风格）**，完全避免 JSX 和虚拟 DOM。

### 核心设计原则

```
✅ 纯 TypeScript 函数调用
✅ 无 JSX Transform
✅ 无虚拟节点/虚拟 DOM
✅ 直接返回 LayoutNode
✅ 尾随 lambda 支持子组件声明
```

### 公共 API 规范

```typescript
// ===== 基础类型定义 =====

interface ComposableFunction<TProps = void> {
  (props: TProps): ComposableNode;
}

type ComposableNode = 
  | LayoutNode          // 容器组件（Column/Row/Box等）
  | LeafNode            // 叶子组件（Text/Image等）
  | null;               // 条件渲染返回 null

// ===== composable() HOC 定义 =====

function composable<TProps extends Record<string, any> = Record<string, never>>(
  fn: (props: TProps, context: ComposerContext) => ComposableNode
): ComposableFunction<TProps>;

// ===== 内置布局组件签名 =====

function Column(options?: {
  modifier?: Modifier;
  verticalArrangement?: Arrangement.Vertical;
  horizontalAlignment?: Alignment.Horizontal;
}, content?: () => ComposableNode): LayoutNode;

function Row(options?: {
  modifier?: Modifier;
  horizontalArrangement?: Arrangement.Horizontal;
  verticalAlignment?: Alignment.Vertical;
}, content?: () => ComposableNode): LayoutNode;

function Box(options?: {
  modifier?: Modifier;
  contentAlignment?: Alignment;
}, content?: () => ComposableNode): LayoutNode;

// ===== 叶子组件签名 =====

function Text(options: {
  text: string;
  modifier?: Modifier;
  fontSize?: Sp;
  fontWeight?: FontWeight;
  color?: Color;
  maxLines?: number;
  overflow?: TextOverflow;
  textAlign?: TextAlign;
}): LeafNode;

function Image(options: {
  src: ImageSource;
  modifier?: Modifier;
  contentScale?: ContentScale;
  placeholder?: ComposableNode;
}): LeafNode;

function Button(options: {
  text?: string;
  onClick: () => void;
  enabled?: boolean;
  modifier?: Modifier;
  content?: () => ComposableNode; // 自定义内容
}): LeafNode;

// ===== 使用示例 =====

const Greeting = composable<{ name: string }>(({ name }) => {
  const count = remember(() => mutableStateOf(0));
  
  return Column({
    modifier: Modifier.padding(16.dp).background(Color.White),
    verticalArrangement: Arrangement.spacedBy(8.dp)
  }) {
    
    // 子组件通过尾随 lambda 声明
    Text({ 
      text: `Hello, ${name}!`,
      fontSize: 24.sp,
      fontWeight: FontWeight.Bold 
    });
    
    Text({ text: `Count: ${count.value}` });
    
    Button({
      text: 'Increment',
      onClick: () => count.value++
    });
  };
});
```

### 尾随 Lambda（Trailing Lambda）语法

这是本方案的核心创新点，提供类似 JSX 的嵌套体验但无需编译时转换：

```typescript
// ===== 方式 1：options.content 参数 =====

Column({
  modifier: Modifier.fillMaxSize(),
  content: () => {
    Text({ text: 'Child 1' });
    Text({ text: 'Child 2' });
  }
});

// ===== 方式 2：尾随 lambda（更简洁）=====

Column({ modifier: Modifier.fillMaxSize() }) {
  Text({ text: 'Child 1' });   // ← 自动作为 content 参数
  Text({ text: 'Child 2' });   // ← 自动作为 content 参数
}

// ===== 实现原理（TypeScript 函数重载）======

function Column(
  options: { modifier?: Modifier } & { content?: () => ComposableNode }
): LayoutNode;

// 当最后一个参数是函数时，自动映射到 options.content
function Column(
  modifier: Modifier,
  content: () => ComposableNode
): LayoutNode;
```

### 条件渲染与列表

```typescript
// ===== 条件渲染 =====

const UserProfile = composable<{ user: User | null }>(({ user }) => {
  return Column() {
    if (user) {
      // 已登录状态
      Avatar({ url: user.avatarUrl });
      Text({ text: user.name });
    } else {
      // 未登录状态
      Text({ text: 'Please login' });
      Button({ text: 'Login', onClick: showLoginDialog });
    }
  };
});

// ===== 列表渲染 =====

const MessageList = composable<{ messages: Message[] }>(({ messages }) => {
  return LazyColumn({
    modifier: Modifier.fillMaxSize()
  }) {
    messages.forEach((msg) => {
      MessageBubble({ 
        key: msg.id,       // 列表 key（用于 Diff）
        message: msg 
      });
    });
  };
});
```

## 正面影响

1. **与已完成决策完美契合**：
   - `composable()` HOC → 函数即组件 ✅
   - Context 显式传递 → `(props, ctx)` 参数 ✅
   - Column/Row 布局 → 直接函数调用 ✅
   - Hybrid 渲染 → 返回 LayoutNode 零开销 ✅

2. **零构建工具依赖**：
   - 不需要 JSX Transform
   - 不需要 Babel/SWC 插件配置
   - 不需要 `.tsx` 文件扩展名
   - 纯 `.ts` 文件即可运行

3. **性能最优**：
   - 无虚拟 DOM 中间层（节省内存和 CPU）
   - 无虚拟节点创建/回收（减少 GC 压力）
   - 函数直接操作 LayoutNode（零抽象损耗）

4. **调试体验优秀**：
   - 调用栈每一层对应真实代码位置
   - 断点可直接设置在组件函数内部
   - 无编译后代码映射问题

5. **TypeScript 类型安全**：
   - Props 类型完整推导
   - 组件返回类型明确（ComposableNode）
   - IDE 自动补全完善

## 负面影响与风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| React 开发者适应期 | 不熟悉 JSX-less 风格 | 提供迁移指南；API 设计直觉化 |
| 深度嵌套缩进多 | 5+ 层嵌套时代码右移严重 | 使用 IDE 自动格式化；提取子组件 |
| 无 JSX 语法高亮 | 编辑器可能无法识别自定义 DSL | 开发 VSCode 插件；或接受当前限制 |
| 尾随 lambda 需要函数重载 | TypeScript 重载可能复杂 | 封装在库内部，用户无感知 |

## 与其他方案的对比

| 维度 | **纯函数调用链 ✅** | JSX-like | Widget Tree |
|------|-------------------|----------|-------------|
| 编译时依赖 | ❌ 无需 | ⚠️ 需要 JSX Transform | ❌ 无需 |
| 虚拟节点 | ❌ 无 | ✅ 有（VDOM） | ⚠️ 轻量 Element |
| 性能 | ⭐⭐⭐⭐⭐ 最优 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐ 良好 |
| 学习曲线（React 开发者） | ⭐⭐⭐ 中等 | ⭐ 极低 | ⭐⭐ 较陡 |
| 代码简洁性 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ 一般 |
| 可组合性 | ✅✅ 函数组合 | ✅ JSX 嵌套 | ⚠️ 类继承 |
| 与 HOC 兼容性 | ✅✅ 完美 | ⚠️ 需适配 | ❌ 冲突 |

## 验证假设

### 前提条件
1. TypeScript 函数重载可完美实现尾随 lambda 语法
2. 深度嵌套（5-7 层）时代码可读性仍可接受
3. IDE 对自定义 DSL 的支持足够好（自动补全、跳转定义）

### 验证方式
- [ ] **Spike #1**: 实现核心组件 API + 尾随 lambda 语法验证
  - 测试：Column/Row/Box/Text/Button 的组合使用
  - 验证：TypeScript 类型推导正确性
- [ ] **Spike #2**: 复杂 UI 示例实现（如聊天界面、设置页）
  - 评估：代码可读性和开发效率
  - 记录：嵌套深度、代码行数、开发时间
- [ ] **Spike #3**: IDE 集成测试
  - VSCode 自动补全、错误提示、重构功能

## 可逆性评估

**类别**: 🟢 **高度可逆**

| 指标 | 数值 |
|------|------|
| 影响文件数 | ~4 文件（components/api.ts, components/builtins.ts 等） |
| 影响模块数 | 1 个模块（components） |
| 数据迁移 | 无（新代码） |
| API 变更风险 | 低（公共 API 是函数签名，内部实现灵活） |

**回退方案**：
- 未来如果需要 JSX 支持 → 添加可选的 JSX Transform 层
- 回退策略：保留函数式 API 作为底层，JSX 作为语法糖
- 工作量：~3 天 JSX 适配器开发
- 用户代码可选择任一风格

## 实现约束（来自架构决策）

1. **禁止 JSX 语法**：公共 API 不支持 `<Component />` 写法
2. **必须支持尾随 lambda**：`Column() { Child() }` 必须工作
3. **返回类型严格**：所有 Composable 函数必须返回 `ComposableNode`（不可返回 undefined）
4. **Props 类型安全**：必须使用泛型约束 Props 类型
5. **key 属性支持**：列表渲染时必须支持 `key` 用于 Diff 优化
6. **条件返回 null**：允许返回 `null` 表示不渲染（条件渲染）

## 分阶段实现路线图

| 阶段 | 实现内容 | 目标 | 预计工作量 |
|------|---------|------|-----------|
| **Phase 1 (MVP)** | Column/Row/Box/Text/Image + 基础 Modifier | 能构建简单界面 | 2-3 天 |
| **Phase 2** | Button/TextField/Switch + 交互事件 | 可交互原型 | 2 天 |
| **Phase 3** | LazyColumn/LazyRow + key 支持 | 虚拟滚动列表 | 2-3 天 |
| **Phase 4** | Scaffold/Card/Dialog + 复杂组件 | 完整组件库 | 3-4 天 |
| **Phase 5** | 动画组件 + 过渡效果 | 生产级体验 | 2-3 天 |

## 相关文档

- 上游 ADR:
  - [`composable-tracking-runtime-hoc.md`](./composable-tracking-runtime-hoc.md)
  - [`layout-engine-custom-linear-column-row.md`](./layout-engine-custom-linear-column-row.md)
- 需求文档: [`canvas-ui-runtime.md`](../road-map/canvas-ui-runtime.md)

## 决策记录

| 时间 | 决策者 | 决策内容 |
|------|--------|---------|
| 2026-04-30 17:15 | 用户 + AI | 确认采用纯函数调用链模型（Compose 风格），支持尾随 lambda，禁止 JSX |
