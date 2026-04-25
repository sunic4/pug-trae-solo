# 框架架构文档

> 基于 Android Compose 重组原理，使用 Web Canvas + TypeScript 构建的响应式 UI 框架

**日期**：2026-04-26
**状态**：Updated

---

## 1. 概述

### 1.1 目标

构建一个通用的 Canvas UI 框架，核心灵感来源于 Android Compose 的重组（Recomposition）原理。整个应用的所有 UI 渲染在一个 Canvas 上，不依赖传统 DOM 元素进行 UI 渲染。

### 1.2 核心特性

- **声明式 UI**：UI 是状态的函数 `UI = f(state)`
- **智能重组**：基于 Proxy 的细粒度响应式，只更新真正依赖了变化状态的组件
- **三阶段布局**：测量（Measure）→ 放置（Place）→ 绘制（Draw），与 Compose 一致
- **纯 Canvas 渲染**：所有视觉输出通过 Canvas 2D API，支持脏矩形优化
- **纯 Canvas 事件**：通过坐标命中检测处理用户交互，不依赖 DOM 覆盖层
- **可扩展架构**：渲染后端可替换（Canvas 2D / WebGL / OffscreenCanvas）
- **AppContext 管理**：中央上下文管理，支持依赖注入和插件系统
- **响应式状态**：支持状态持久化、异步更新和错误处理
- **导航系统**：完整的导航历史管理，支持前进/后退导航

### 1.3 技术选型

| 维度 | 选择 |
|------|------|
| 语言 | TypeScript |
| 运行环境 | 浏览器为主，架构可扩展到其他环境 |
| 事件处理 | 纯 Canvas 事件监听 + 坐标命中检测 |
| 文本渲染 | Canvas 原生 fillText + 隐藏 DOM 辅助测量 |
| 构建工具 | Vite |
| 包管理 | pnpm monorepo |

---

## 2. 架构设计

### 2.1 五层架构

```
┌─────────────────────────────────────────────────┐
│                   用户代码                        │
│         Composable 函数 + Signal 状态            │
├─────────────────────────────────────────────────┤
│              响应式层 (Reactivity)                │
│   Signal / Computed / Effect / Scope             │
├──────────┬──────────┬───────────────────────────┤
│  组合层   │  布局层   │        渲染层              │
│ Composer │  Layout  │   Canvas Renderer          │
│ Node Tree│ Measure  │   Paint / Clip / Transform │
│          │ Place    │                           │
├──────────┴──────────┴───────────────────────────┤
│              平台层 (Platform)                    │
│   Canvas 2D / WebGL / OffscreenCanvas / ...      │
└─────────────────────────────────────────────────┘
```

**各层职责**：

1. **响应式层**：Signal/Computed/Effect，驱动整个框架的响应式更新。零依赖，可独立使用。
2. **组合层**：管理组件节点树（Composition Tree），协调组件的创建、更新、销毁。依赖响应式层。
3. **布局层**：三阶段布局（测量→放置→绘制），处理约束传播和尺寸计算。依赖组合层。
4. **渲染层**：将布局结果绘制到 Canvas，支持裁剪、变换、混合模式。依赖布局层。
5. **平台层**：抽象渲染后端接口，默认实现为 Canvas 2D，可替换为 WebGL 等。

### 2.2 模块依赖关系

```
reactivity ← composer ← layout ← renderer
                              ← event
                              ← theme
                              ← components ← core (AppContext)
```

### 2.3 设计原则

- 每层职责单一，通过明确定义的接口通信
- 渲染层可替换（Canvas 2D、WebGL、测试用的 Mock Renderer）
- 响应式层独立于 UI 层，可以单独使用
- 所有模块通过 TypeScript 严格类型约束
- AppContext 作为中央管理中心，提供依赖注入和插件系统

---

## 3. AppContext 系统

### 3.1 核心概念

AppContext 是框架的中央上下文管理系统，负责管理应用级资源和服务，提供依赖注入和插件系统。

### 3.2 主要功能

- **资源管理**：主题、渲染器、组合器
- **事件监听器管理**：添加和移除事件监听器
- **信号管理**：注册和清理信号
- **错误处理**：全局错误处理机制
- **插件系统**：可插拔的功能扩展
- **内存管理**：自动清理资源，避免内存泄漏
- **导航历史限制**：限制导航历史长度，避免内存泄漏

### 3.3 使用方法

```typescript
import { createAppContext } from '@pug/core';
import { defaultTheme } from '@pug/theme';
import { CanvasRenderer } from '@pug/renderer';

// 创建应用上下文
const appContext = createAppContext({
  theme: defaultTheme,
  maxNavigationHistory: 50 // 可选，限制导航历史长度
});

// 创建渲染器
const canvas = document.getElementById('app') as HTMLCanvasElement;
const renderer = new CanvasRenderer(canvas, {
  width: 800,
  height: 600
});

// 设置渲染器
appContext.renderer = renderer;

// 注册插件
appContext.plugins.register({
  name: 'api',
  initialize: (app) => {
    // 初始化插件
  },
  dispose: () => {
    // 清理资源
  }
});

// 销毁上下文
appContext.dispose();
```

---

## 4. 响应式系统

### 4.1 Signal（信号）

核心状态容器，读取时自动追踪依赖，更新时自动通知订阅者。

```typescript
function signal<T>(initialValue: T, options?: SignalOptions<T>): Signal<T>;

// 基本使用
const count = signal(0);
console.log(count.value); // 读取，自动追踪
count.value = 1;          // 更新，触发订阅者

// 状态持久化
const user = signal({ name: 'John' }, {
  persistent: true,
  storageKey: 'user-state'
});

// 异步更新
await user.update(current => ({
  ...current,
  name: 'Jane'
}));
```

**SignalOptions**：
- `persistent`：是否持久化到本地存储
- `storageKey`：持久化存储的键名
- `serialize`：自定义序列化函数
- `deserialize`：自定义反序列化函数

### 4.2 Computed（计算信号）

派生状态，自动追踪依赖并在依赖变化时重新计算。

```typescript
function computed<T>(fn: () => T): ComputedSignal<T>;

// 使用
const count = signal(0);
const doubled = computed(() => count.value * 2);
```

### 4.3 Effect（副作用）

在依赖变化时执行副作用，用于日志、同步外部系统等。

```typescript
function effect(fn: () => void | Promise<void>, options?: EffectOptions): Disposable;

// 基本使用
effect(() => {
  console.log(`Count changed: ${count.value}`);
});

// 异步副作用
effect(async () => {
  const data = await fetchData(count.value);
  console.log('Data:', data);
});

// 清理函数
effect(() => {
  const subscription = eventBus.subscribe('update', handleUpdate);
  return () => subscription.unsubscribe();
});
```

**EffectOptions**：
- `cleanup`：清理函数
- `onError`：错误处理函数
- `lazy`：是否延迟执行
- `scheduler`：自定义调度器

### 4.4 重组机制

```
状态变化 → Signal 通知订阅者 → Composer 标记脏节点
  → 下帧批量重组 → 只执行标记的 Composable 函数
  → 生成新的子树 → Layout 重新测量受影响区域 → Canvas 重绘脏矩形
```

### 4.5 Composer（组合器）

重组的调度中心，支持批量更新和错误处理。

```typescript
class Composer {
  startCompose(fn: ComposableFunction): ComposeNode;
  endCompose();
  markDirty(node: ComposeNode): void;
  recompose(): void;
  batch<T>(callback: () => T): T; // 批量更新
  addErrorHandler(handler: (error: Error) => void): void;
}
```

---

## 5. 导航系统

### 5.1 核心功能

- **导航历史管理**：支持前进/后退导航
- **参数传递**：在导航时传递参数
- **动画支持**：页面切换动画
- **历史长度限制**：避免内存泄漏

### 5.2 使用方法

```typescript
import { navigateTo, navigateBack, canNavigateBack, canNavigateForward } from './navigationState';

// 导航到页面
navigateTo('details', { id: 123 });

// 返回上一页
if (canNavigateBack()) {
  navigateBack();
}

// 前进到下一页
if (canNavigateForward()) {
  navigateForward();
}
```

### 5.3 导航状态

```typescript
interface NavigationState {
  currentPage: Page;
  previousPage: Page | null;
  params: Record<string, any>;
  isAnimating: boolean;
  animationProgress: number;
  history: NavigationHistoryItem[];
  historyIndex: number;
}
```

---

## 6. 布局系统

### 6.1 三阶段流程

```
Measure（测量）→ Place（放置）→ Draw（绘制）
```

- **Measure**：父节点向子节点传递约束（Constraints），子节点返回自身尺寸
- **Place**：父节点根据子节点尺寸，决定子节点在父容器中的位置
- **Draw**：按照布局结果，将每个节点绘制到 Canvas

### 6.2 约束系统

```typescript
interface Constraints {
  minWidth: number;
  maxWidth: number;   // Infinity 表示不限制
  minHeight: number;
  maxHeight: number;
}
```

### 6.3 LayoutNode 接口

```typescript
interface LayoutNode {
  measure(constraints: Constraints): Size;
  placeChildren();
  draw(canvas: CanvasRenderingContext2D): void;
}
```

### 6.4 布局与重组的协作

```
状态变化 → 重组 → 更新节点树
  → 标记受影响节点的 layoutDirty = true
  → 下一帧：只重新测量/放置 layoutDirty 的节点
  → 标记受影响节点的 drawDirty = true
  → Canvas 只重绘 drawDirty 的区域
```

**优化**：如果 Text 组件的文本变了但尺寸没变，其父 Column 不需要重新测量，只需重绘该 Text 的区域。

---

## 7. Canvas 渲染层

### 7.1 渲染器

```typescript
class CanvasRenderer {
  setRoot(node: ComposeNode): void;
  markDirty(rect: DirtyRect): void;
  renderFrame(): void;
  dispose(): void;
  addErrorHandler(handler: (error: Error) => void): void;
}
```

### 7.2 性能优化

- **脏矩形合并**：合并重叠的脏区域，减少绘制次数
- **批量更新**：批量处理状态更新，减少渲染次数
- **按需渲染**：只渲染脏节点，避免全量重绘
- **帧率控制**：限制渲染帧率，避免过度渲染

### 7.3 绘制指令

每个节点生成绘制指令列表，由 Renderer 统一执行：

```typescript
type DrawCommand =
  | { type: 'rect'; x: number; y: number; w: number; h: number; fill?: string; stroke?: string }
  | { type: 'text'; x: number; y: number; content: string; font: string; color: string; align?: CanvasTextAlign }
  | { type: 'clip'; rect: Rect }
  | { type: 'transform'; matrix: Matrix }
  | { type: 'image'; img: HTMLImageElement; x: number; y: number; w: number; h: number }
  | { type: 'save' }
  | { type: 'restore' };
```

好处：绘制指令可序列化、回放、测试，方便切换渲染后端。

---

## 8. 事件系统

### 8.1 命中检测

```typescript
class EventDispatcher {
  dispatch(type: string, x: number, y: number): void;
  attachToCanvas(canvas: HTMLCanvasElement): () => void;
  dispose(): void;
}
```

### 8.2 Canvas 事件监听

在 Canvas 元素上直接监听鼠标/触摸/滚轮事件，通过坐标转换后分发给命中检测系统。

### 8.3 文本输入

文本输入时临时创建隐藏的 `<textarea>` 元素捕获键盘输入，所有视觉渲染在 Canvas 上完成。聚焦时创建，失焦时销毁。

### 8.4 滚动处理

可滚动容器通过 Canvas `clip()` + `translate()` 实现内容偏移，监听 `wheel` 事件更新滚动偏移量（作为 Signal，自动触发重绘）。

### 8.5 手势识别

支持基础手势：点击（tap）、长按（long press）、拖拽（drag）、缩放（pinch）。通过事件序列模式匹配实现。

---

## 9. 主题系统

### 9.1 主题定义

```typescript
const theme = createTheme({
  colors: {
    primary: '#6200EE',
    onPrimary: '#FFFFFF',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
  },
  typography: {
    h1: { size: 32, weight: 'bold', family: 'sans-serif' },
    body: { size: 14, weight: 'normal', family: 'sans-serif' },
    caption: { size: 12, weight: 'normal', family: 'sans-serif' },
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  corners: { none: 0, small: 4, medium: 8, large: 16, round: 9999 },
});
```

### 9.2 主题切换

主题本身是一个 Signal，切换主题自动触发所有依赖组件的重组。

```typescript
const currentTheme = signal(lightTheme);
// 切换时：
currentTheme.value = darkTheme;
```

---

## 10. 组件 API

### 10.1 基础组件

| 组件 | 说明 |
|------|------|
| `Text` | 文本显示 |
| `Button` | 可点击按钮 |
| `TextInput` | 文本输入框 |
| `Checkbox` | 复选框 |
| `Image` | 图片显示 |

### 10.2 布局组件

| 组件 | 说明 |
|------|------|
| `Column` | 垂直排列 |
| `Row` | 水平排列 |
| `Box` | 自由定位容器 |
| `Stack` | 层叠布局 |
| `Padding` | 内边距包装 |
| `Spacer` | 弹性空白 |

### 10.3 组件属性系统

使用 Props 对象传递组件配置，支持响应式更新：

```typescript
new Text({
  text: "Hello",
  fontSize: 16,
  color: "#000000",
  textAlign: "center"
});

new Button({
  text: "Click Me",
  onClick: () => console.log('clicked'),
  variant: "primary",
  size: "base"
});
```

组件通过 props 对象接收配置，支持主题系统集成。

---

## 11. 测试系统

### 11.1 测试工具

- **MockRenderer**：用于测试渲染逻辑
- **testSignal**：测试信号的更新和订阅
- **testEffect**：测试副作用的执行
- **testComponent**：测试组件的渲染和布局
- **MockEventSystem**：测试事件处理

### 11.2 使用方法

```typescript
import { createTestAppContext, testSignal, testComponent } from '@pug/core';

// 测试信号
const { signal, updates, assertUpdates } = testSignal(0);
signal.value = 1;
signal.value = 2;
assertUpdates([0, 1, 2]);

// 测试组件
const { component, assertExists, assertType } = testComponent(
  (appContext) => new Button({ text: 'Click', appContext })
);
assertExists();
assertType('button');
```

---

## 12. 插件系统

### 12.1 插件接口

```typescript
interface Plugin {
  name: string;
  initialize?: (appContext: AppContext) => void;
  dispose?: () => void;
}
```

### 12.2 插件容器

```typescript
interface PluginContainer {
  get<T extends Plugin>(name: string): T | null;
  register(plugin: Plugin): void;
  unregister(name: string): void;
  dispose(): void;
}
```

### 12.3 使用方法

```typescript
// 注册插件
appContext.plugins.register({
  name: 'api',
  initialize: (app) => {
    // 初始化 API 服务
  },
  dispose: () => {
    // 清理资源
  }
});

// 使用插件
const apiPlugin = appContext.plugins.get('api');
apiPlugin?.fetchData('/users');
```

---

## 13. 性能优化

### 13.1 渲染优化

- **脏矩形合并**：减少绘制区域
- **批量更新**：减少渲染次数
- **按需渲染**：只渲染脏节点
- **帧率控制**：限制渲染帧率

### 13.2 内存优化

- **自动清理**：信号、事件监听器自动清理
- **导航历史限制**：避免历史记录无限增长
- **资源管理**：插件和服务的生命周期管理

### 13.3 状态优化

- **批量更新**：合并状态更新
- **依赖追踪**：精确的依赖追踪
- **计算缓存**：Computed 缓存计算结果

---

## 14. 错误处理

### 14.1 全局错误处理

```typescript
appContext.addErrorHandler((error) => {
  console.error('App error:', error);
  // 可以在这里添加错误上报逻辑
});
```

### 14.2 组件错误隔离

- **渲染错误**：单个组件渲染错误不影响其他组件
- **事件处理错误**：事件处理错误不影响事件分发
- **副作用错误**：副作用错误不影响其他副作用

### 14.3 错误边界

```typescript
effect(() => {
  try {
    // 可能出错的代码
  } catch (error) {
    // 局部错误处理
  }
}, {
  onError: (error) => {
    // 全局错误处理
  }
});
```

---

## 15. 项目结构

```
pug/
├── packages/
│   ├── reactivity/          # 响应式核心（独立包）
│   │   ├── signal.ts
│   │   ├── computed.ts
│   │   ├── effect.ts
│   │   ├── context.ts
│   │   └── index.ts
│   │
│   ├── composer/            # 组合层
│   │   ├── composer.ts
│   │   ├── node.ts
│   │   ├── slot-table.ts
│   │   └── index.ts
│   │
│   ├── layout/              # 布局层
│   │   ├── constraints.ts
│   │   └── index.ts
│   │
│   ├── renderer/            # 渲染层
│   │   ├── canvas-renderer.ts
│   │   ├── draw-command.ts
│   │   ├── dirty-rect.ts
│   │   ├── text-layout.ts
│   │   ├── renderer-interface.ts
│   │   └── index.ts
│   │
│   ├── event/               # 事件系统
│   │   ├── dispatcher.ts
│   │   ├── hit-test.ts
│   │   ├── gesture.ts
│   │   └── index.ts
│   │
│   ├── theme/               # 主题系统
│   │   ├── theme.ts
│   │   ├── theme-context.ts
│   │   └── index.ts
│   │
│   ├── core/                # 核心系统（AppContext）
│   │   ├── app-context.ts
│   │   ├── test-utils.ts
│   │   └── index.ts
│   │
│   └── components/          # 组件库
│       ├── text.ts
│       ├── button.ts
│       ├── text-input.ts
│       ├── checkbox.ts
│       ├── column.ts
│       ├── row.ts
│       ├── box.ts
│       ├── stack.ts
│       ├── padding.ts
│       ├── spacer.ts
│       ├── list.ts
│       ├── container.ts
│       └── index.ts
│
├── apps/
│   └── demo/                # 示例应用
│       ├── index.html
│       ├── main.ts
│       ├── App.ts
│       └── components/
│           ├── pages/
│           └── NavigationBar.ts
│
├── docs/                    # 文档
│   ├── architecture.md
│   └── api-reference.md
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 16. 最佳实践

### 16.1 状态管理

- **全局状态**：使用 AppContext 管理全局状态
- **页面状态**：使用页面级信号管理页面状态
- **组件状态**：使用组件级信号管理组件状态
- **状态持久化**：对于需要持久化的状态，使用 `persistent: true`

### 16.2 组件设计

- **单一职责**：每个组件只负责一个功能
- **响应式属性**：使用信号作为组件属性
- **错误处理**：在组件中添加错误处理
- **性能优化**：避免在渲染过程中创建新对象

### 16.3 导航管理

- **参数传递**：使用导航参数传递数据
- **历史管理**：合理使用前进/后退导航
- **动画效果**：使用导航动画提升用户体验

### 16.4 测试

- **单元测试**：测试组件的渲染和行为
- **集成测试**：测试组件间的交互
- **性能测试**：测试组件的性能

---

## 17. 后续规划

### 17.1 功能增强

- **列表组件**：实现 LazyColumn 和 LazyRow
- **动画系统**：更丰富的动画效果
- **表单系统**：表单验证和管理
- **国际化**：多语言支持

### 17.2 性能优化

- **WebGL 渲染**：使用 WebGL 提升渲染性能
- **离屏渲染**：使用 OffscreenCanvas 提升性能
- **代码分割**：按需加载组件

### 17.3 生态系统

- **组件库**：扩展组件库
- **工具库**：实用工具和辅助函数
- **模板**：应用模板和脚手架

---

## 18. 结论

本框架提供了一个基于 Canvas 的响应式 UI 系统，结合了 Android Compose 的重组原理和现代前端开发的最佳实践。通过 AppContext 管理、响应式状态、导航系统和性能优化，为开发者提供了一个高效、灵活、可扩展的 UI 开发框架。

框架的设计理念是：简洁的 API、高效的渲染、灵活的架构，让开发者能够专注于业务逻辑的实现，而不是底层的渲染细节。