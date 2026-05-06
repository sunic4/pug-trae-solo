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

// ✅ 正确：纯函数调用链
Text({ text: 'Hello' });
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
Button({ onClick: () => onIncrement() });
```

### 3.6 禁止静默吞错

```typescript
// ❌ 禁止
try { risky(); } catch (e) { }

// ✅ 正确：处理或 rethrow
try { risky(); } catch (e) { handleError(e); }
```

---

## 4. Composable 函数规范

### 4.1 必须使用 `composable()` HOC 包装

```typescript
const MyComponent = composable<{ name: string }>(({ name }, ctx) => {
  const count = remember(() => mutableStateOf(0));
  return Column() {
    Text({ text: `Hello, ${name}! Count: ${count.value}` });
    Button({ text: '+', onClick: () => count.value++ });
  };
});
```

### 4.2 签名约定

- 第一个参数：`props`（泛型约束 `Record<string, any>`）
- 第二个参数：`ctx: ComposerContext`（只读，AppContext 的投影）
- 返回类型：`ComposableNode`（`LayoutNode | LeafNode | null`）

### 4.3 尾随 Lambda（Trailing Lambda）

```typescript
// 容器组件使用尾随 lambda 声明子组件
Column({ modifier: Modifier.fillMaxSize() }) {
  Text({ text: 'Child 1' });
  Text({ text: 'Child 2' });
}
```

### 4.4 条件渲染

```typescript
// 返回 null 表示不渲染
if (!user) return null;
return Text({ text: user.name });
```

---

## 5. 状态管理规范

### 5.1 状态声明

```typescript
// 本地状态
const count = remember(() => mutableStateOf(0));

// 派生状态
const total = useMemo(() => items.value.reduce((s, i) => s + i.price, 0), [items]);
```

### 5.2 状态提升

```typescript
// 多组件共享状态 → 提升到共同父组件
const sharedCount = remember(() => mutableStateOf(0));
CounterDisplay({ count: sharedCount.value });
CounterControls({ onIncrement: () => sharedCount.value++ });
```

### 5.3 Context 跨层级共享

```typescript
const ThemeContext = createContext<ThemeContextValue>();
ThemeContext.Provider({ value: theme }) {
  DeepChild();
}
const { theme } = useContext(ThemeContext);
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
// ❌ 渲染路径中创建新对象（破坏引用相等性）
Child({ options: { color: 'red' } });

// ✅ useMemo 缓存
const options = useMemo(() => ({ color: 'red' }), []);
Child({ options });

// ❌ 内联函数
Button({ onClick: () => handleClick() });

// ✅ useCallback
const onClick = useCallback(() => handleClick(), []);
Button({ onClick });
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
