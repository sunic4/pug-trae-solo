# Code Style — pug-canvas-ui

> 来源：ARCH 文档优先 + TypeScript 严格模式最佳实践

---

## 1. TypeScript 配置

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUncheckedIndexedAccess": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

- 所有文件使用 `.ts` 扩展名（禁止 `.tsx`，项目无 JSX）
- 禁止 `any`，必须提供具体类型或泛型约束
- 禁止非空断言 `!`，使用类型守卫或 `null` 检查
- 优先使用 `interface` 定义对象形状，`type` 用于联合/交叉/工具类型

---

## 2. 命名规范

| 类别 | 风格 | 示例 |
|------|------|------|
| 类 / 接口 / 类型 | PascalCase | `AppContext`, `ComposerContext`, `DrawCommand` |
| 函数 / 方法 | camelCase | `composable()`, `mutableStateOf()`, `measure()` |
| 常量（真正不可变） | camelCase 或 UPPER_SNAKE | `DEFAULT_DENSITY`, `maxCacheSize` |
| 私有字段 | `_` 前缀 | `_value`, `_running`, `_disposed` |
| 枚举 | PascalCase 值 | `ErrorSeverity.Warning`, `LayoutDirection.Ltr` |
| 泛型参数 | 单字母或 PascalCase | `T`, `TProps`, `S` |
| 文件名 | kebab-case | `draw-command.ts`, `layout-engine.ts` |
| 目录名 | kebab-case | `reactive-core/`, `layout/` |

---

## 3. 架构硬约束（来自 ADR）

### 3.1 禁止全局变量 / static 可变字段

```typescript
// ❌ 禁止
let globalCounter = 0;
class Foo { static instance: Foo; }

// ✅ 允许
const PI = 3.14159;
class Bar { static create(opts): Bar { return new Bar(opts); } }
```

### 3.2 禁止 JSX

```typescript
// ❌ 禁止
<Text text="Hello" />

// ✅ 正确：纯函数调用链，ctx 显式传递
Text(ctx, 'Hello')
```

### 3.3 禁止 DOM 依赖

```typescript
// ❌ 禁止
document.createElement('div');
element.appendChild(child);

// ✅ 正确：仅使用 Canvas 2D API
ctx.fillRect(x, y, w, h);
ctx.fillText(text, x, y);
```

### 3.4 禁止 W3C Flexbox 术语

```typescript
// ❌ 禁止
flexGrow, flexShrink, flexBasis, alignSelf, display: 'flex'

// ✅ 正确：Compose 风格
Modifier.weight(1f), Arrangement.SpaceBetween, Alignment.CenterHorizontally
```

### 3.5 禁止双向绑定

```typescript
// ❌ 禁止：子组件直接修改 props
props.count++;

// ✅ 正确：回调向上冒泡
Button(ctx, () => onIncrement(), '+')
```

### 3.6 禁止静默吞错

```typescript
// ❌ 禁止
try { risky(); } catch (e) { }

// ✅ 正确：处理或 rethrow
try { risky(); } catch (e) { handleError(e); }
```

### 3.7 显式 Context 传递（禁止隐式/全局上下文）

所有 Composable 函数和组件调用必须显式传递 `ctx: CompositionContext` 作为第一个参数。禁止通过全局变量、模块级单例或闭包捕获隐式获取 context。

```typescript
// ❌ 禁止：隐式 context / 全局获取
Text({ text: 'Hello' })
getCurrentContext().emitNode(...)

// ✅ 正确：ctx 始终作为第一个参数显式传递
Text(ctx, 'Hello')
Column(ctx, Modifier.create().freeze(), 'start', () => {
  Text(ctx, 'Child')
})
```

---

## 4. Composable 函数规范

### 4.1 必须使用 `composable()` HOC 包装

```typescript
const MyComponent = composable<{ name: string }>((ctx, { name }) => {
  const count = remember(ctx, () => mutableStateOf(0, ctx.snapshot))
  Column(ctx, Modifier.create().fillMaxSize().freeze(), 'start', () => {
    Text(ctx, `Hello, ${name}! Count: ${count.value}`)
    Button(ctx, () => { count.value++ }, '+')
  })
})
```

### 4.2 签名约定

- 第一个参数：`ctx: CompositionContext`（显式上下文，用于 emit 节点和访问 snapshot/recomposer）
- 第二个参数：`props: TProps`（泛型约束的组件属性）
- 返回类型：`void`（组件通过 `ctx.startGroup()` / `ctx.endGroup()` 向 CompositionContext emit 节点，不返回对象）

```typescript
function composable<TProps>(
  fn: (ctx: CompositionContext, props: TProps) => void,
): ComposableFunction<TProps>
```

### 4.3 尾随 Lambda（Trailing Lambda）

容器组件使用尾随 lambda 声明子组件，lambda 内部继续显式传递 `ctx`：

```typescript
Column(ctx, Modifier.create().fillMaxSize().freeze(), 'start', 'start', () => {
  Text(ctx, 'Child 1')
  Text(ctx, 'Child 2')
  Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
    Text(ctx, 'Nested A')
    Text(ctx, 'Nested B')
  })
})

Button(ctx, onClick, () => {
  Text(ctx, 'Click Me')
})
```

### 4.4 条件渲染

条件渲染通过 if 语句在 childrenFn 内部控制，不返回 null：

```typescript
Column(ctx, mod, 'start', () => {
  Text(ctx, 'Always shown')
  if (isLoggedIn) {
    Text(ctx, `Welcome, ${user.name}`)
    Button(ctx, onLogout, () => { Text(ctx, 'Logout') })
  } else {
    Button(ctx, onLogin, () => { Text(ctx, 'Login') })
  }
})
```

---

## 5. 状态管理规范

### 5.1 状态声明

```typescript
const MyCounter = composable<{}>((ctx) => {
  const count = remember(ctx, () => mutableStateOf(0, ctx.snapshot))
  Column(ctx, Modifier.create().freeze(), 'center', () => {
    Text(ctx, `Count: ${count.value}`)
    Button(ctx, () => { count.value++ }, '+')
  })
})
```

- `remember(ctx, calculation)` — 跨重组缓存值，首次执行 `calculation` 后续复用
- `mutableStateOf(initialValue, ctx.snapshot)` — 创建可观察状态，绑定到当前 snapshot
- 状态变更自动触发依赖该状态的 RecomposeScope 重新组合

### 5.2 状态提升

```typescript
const Parent = composable<{}>((ctx) => {
  const sharedCount = remember(ctx, () => mutableStateOf(0, ctx.snapshot))
  Column(ctx, Modifier.create().freeze(), 'start', () => {
    CounterDisplay(ctx, sharedCount.value)
    CounterControls(ctx, () => { sharedCount.value++ })
  })
})
```

多组件共享状态时，将状态提升到共同祖先 composable，通过 props 向下传递、回调向上冒泡。

### 5.3 Context 跨层级共享

```typescript
const ThemeContextKey = 'theme' as const

const ThemedApp = composable<{}>((ctx) => {
  const theme = remember(ctx, () => mutableStateOf(defaultTheme, ctx.snapshot))
  Column(ctx, Modifier.create().freeze(), 'start', () => {
    DeepChild(ctx, theme.value)
  })
})

const DeepChild = composable<{ theme: Theme }>((ctx, { theme }) => {
  Surface(ctx, () => { Text(ctx, 'Themed content') }, { color: theme.surface })
})
```

---

## 6. Modifier 规范

### 6.1 链式调用

```typescript
Modifier.create()
  .padding(16.dp)
  .fillMaxWidth()
  .background(Color.White)
  .clickable(() => handleClick())
  .freeze();
```

### 6.2 必须 freeze()

组件接收的 Modifier 必须是 `ReadonlyModifier`（freeze 后的实例）。

### 6.3 执行顺序

从外到内：`padding` 先于 `background` 先于 `clickable`。

---

## 7. 错误处理规范

### 7.1 三层防御

| 层级 | 机制 | 场景 |
|------|------|------|
| Layer 1 | 局部 try-catch | 预期内的操作错误 |
| Layer 2 | ErrorBoundary | 组件树级别隔离 |
| Layer 3 | GlobalErrorHandler | 全局最后防线 |

### 7.2 错误对象标准化

所有抛出的错误必须是 `AppError` 或其子类实例：

```typescript
throw new AppError(
  message,
  ErrorCode.NETWORK_TIMEOUT,
  ErrorSeverity.WARNING,
  '网络连接超时，请重试',
  true
);
```

---

## 8. 测试规范

### 8.1 测试金字塔

| 层级 | 占比 | 工具 |
|------|------|------|
| 单元测试 | 65-80% | Vitest |
| 集成测试 | 15-25% | Vitest + MSW |
| E2E 测试 | 5-10% | Playwright |

### 8.2 命名规范（BDD 风格）

```typescript
describe('ComponentName', () => {
  describe('when [condition]', () => {
    it('should [expected behavior]', () => {});
  });
});
```

### 8.3 文件命名

```
__tests__/utils/format.test.ts
__tests__/components/Button.test.ts
__tests__/integration/auth-flow.test.ts
e2e/user-journey.spec.ts
```

### 8.4 覆盖率门禁

| 模块 | 行覆盖率 | 分支覆盖率 |
|------|---------|-----------|
| core | ≥ 94% | ≥ 88% |
| components | ≥ 85% | ≥ 75% |
| utils | ≥ 99% | ≥ 95% |

---

## 9. 性能规范

### 9.1 帧预算

- 单帧重组 + 布局 + 渲染 < 16ms（60 FPS）
- 单次 `composable()` 执行 < 0.5ms
- Context 传递开销 < 1% 总帧时间

### 9.2 禁止反模式

```typescript
// ❌ 渲染路径中创建新对象（破坏引用相等性，导致不必要的子组件重组）
Column(ctx, mod, 'start', () => {
  Text(ctx, 'label', Modifier.create().padding(8).freeze())
})

// ✅ 使用 remember 缓存不可变配置，仅在依赖变化时重建
const paddedMod = remember(ctx, () => Modifier.create().padding(8).freeze())
Column(ctx, mod, 'start', () => {
  Text(ctx, 'label', paddedMod)
})

// ❌ 在 composable 函数体内创建 Snapshot（每个重组周期都产生新实例）
const MyBad = composable<{}>((ctx) => {
  const localSnapshot = createSnapshot()
  const state = mutableStateOf(0, localSnapshot)
})

// ✅ 始终使用 ctx.snapshot（与 Recomposer 生命周期绑定）
const MyGood = composable<{}>((ctx) => {
  const state = remember(ctx, () => mutableStateOf(0, ctx.snapshot))
})

// ❌ 在 childrenFn 中执行重计算（每次父组件重组都重新执行）
Column(ctx, mod, 'start', () => {
  const expensive = heavyCompute(data.value)
  Text(ctx, expensive)
})

// ✅ 将计算结果提升为 remember 缓存
const cached = remember(ctx, () => heavyCompute(data.value), [data.value])
Column(ctx, mod, 'start', () => {
  Text(ctx, cached)
})
```

---

## 10. 文件组织

### 10.1 模块结构

```
src/
├── core/              # 响应式核心 (snapshot, state, recomposer, composable)
├── renderer/          # Canvas 渲染 (draw-command, layer, hybrid-renderer)
├── layout/            # 布局引擎 (column-row, measure, modifier-layout)
├── input/             # 手势系统 (pointer-events, gesture-recognizers)
├── animation/         # 动画系统 (animatable, animation-spec, transition)
├── components/        # 组件库 (basic/, interaction/, layout/)
├── platform/          # 平台适配
└── index.ts           # 公共 API 导出
```

### 10.2 导出规范

- 每个模块通过 `index.ts` 统一导出公共 API
- 内部实现使用 `internal/` 子目录，不对外导出
- 公共 API 必须通过 `src/index.ts` 统一入口导出

---

## 11. 格式化

- 缩进：2 空格
- 行宽：120 字符
- 分号：不使用
- 引号：单引号
- 尾随逗号：多行时使用

> {待确认：具体 Prettier/ESLint 配置待项目初始化后补充}
