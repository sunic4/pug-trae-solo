# Canvas Compose 设计文档

> 基于 Android Compose 重组原理，使用 Web Canvas + TypeScript 构建的响应式 UI 框架

**日期**：2026-04-23
**状态**：Draft

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

### 1.3 技术选型

| 维度 | 选择 |
|------|------|
| 语言 | TypeScript |
| 运行环境 | 浏览器为主，架构可扩展到其他环境 |
| 事件处理 | 纯 Canvas 事件监听 + 坐标命中检测 |
| 文本渲染 | Canvas 原生 fillText + 隐藏 DOM 辅助测量 |
| 构建工具 | Vite |
| 包管理 | npm monorepo |

---

## 2. 架构设计

### 2.1 四层架构

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
                              ← components ← canvas-compose (聚合)
```

### 2.3 设计原则

- 每层职责单一，通过明确定义的接口通信
- 渲染层可替换（Canvas 2D、WebGL、测试用的 Mock Renderer）
- 响应式层独立于 UI 层，可以单独使用
- 所有模块通过 TypeScript 严格类型约束

---

## 3. 响应式系统

### 3.1 Signal（信号）

核心状态容器，读取时自动追踪依赖，更新时自动通知订阅者。

```typescript
function signal<T>(initialValue: T): Signal<T>;

// 使用
const count = signal(0);
console.log(count.value); // 读取，自动追踪
count.value = 1;          // 更新，触发订阅者
```

**内部实现**：
- 维护一个订阅者集合 `subscribers: Set<Subscriber>`
- 读取时，如果当前处于 Composable 执行上下文中，自动将当前节点注册为订阅者
- 更新时，遍历订阅者集合，标记为 dirty

### 3.2 Computed（计算信号）

派生状态，自动追踪依赖并在依赖变化时重新计算。

```typescript
function computed<T>(fn: () => T): ComputedSignal<T>;

// 使用
const count = signal(0);
const doubled = computed(() => count.value * 2);
```

### 3.3 Effect（副作用）

在依赖变化时执行副作用，用于日志、同步外部系统等。

```typescript
function effect(fn: () => void): Disposable;

// 使用
effect(() => {
  console.log(`Count changed: ${count.value}`);
});
```

### 3.4 重组机制

```
状态变化 → Signal 通知订阅者 → Composer 标记脏节点
  → 下帧批量重组 → 只执行标记的 Composable 函数
  → 生成新的子树 → Layout 重新测量受影响区域 → Canvas 重绘脏矩形
```

### 3.5 Composer（组合器）

重组的调度中心。

```typescript
class Composer {
  private currentSlot: number = 0;
  private nodes: Map<number, ComposeNode> = new Map();
  private dirtyNodes: Set<ComposeNode> = new Set();

  startCompose(fn: ComposableFunction): ComposeNode;
  endCompose();
  recordRead(signal: Signal): void;
  markDirty(node: ComposeNode): void;
  recompose(): void;
}
```

**槽位机制**：每个 Composable 函数按调用顺序分配槽位索引。重组时，通过槽位匹配新旧节点，实现就地更新。如果某个槽位的节点类型变了，销毁旧节点、创建新节点。

### 3.6 与 Compose 的对应关系

| Compose 概念 | 本框架实现 |
|---|---|
| `mutableStateOf()` | `signal()` |
| `remember { }` | Composer 的 remember 缓存 |
| `derivedStateOf()` | `computed()` |
| `SideEffect` / `LaunchedEffect` | `effect()` |
| `@Composable` 编译器插桩 | 运行时上下文追踪 |
| 重组范围（Recomposition Scope） | Composer Node 的脏标记 |

---

## 4. 布局系统

### 4.1 三阶段流程

```
Measure（测量）→ Place（放置）→ Draw（绘制）
```

- **Measure**：父节点向子节点传递约束（Constraints），子节点返回自身尺寸
- **Place**：父节点根据子节点尺寸，决定子节点在父容器中的位置
- **Draw**：按照布局结果，将每个节点绘制到 Canvas

### 4.2 约束系统

```typescript
interface Constraints {
  minWidth: number;
  maxWidth: number;   // Infinity 表示不限制
  minHeight: number;
  maxHeight: number;
}
```

### 4.3 LayoutNode 接口

```typescript
interface LayoutNode {
  measure(constraints: Constraints): Size;
  placeChildren();
  draw(canvas: CanvasRenderingContext2D): void;
}
```

### 4.4 布局与重组的协作

```
状态变化 → 重组 → 更新节点树
  → 标记受影响节点的 layoutDirty = true
  → 下一帧：只重新测量/放置 layoutDirty 的节点
  → 标记受影响节点的 drawDirty = true
  → Canvas 只重绘 drawDirty 的区域
```

**优化**：如果 Text 组件的文本变了但尺寸没变，其父 Column 不需要重新测量，只需重绘该 Text 的区域。

---

## 5. Canvas 渲染层

### 5.1 渲染器

```typescript
class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dirtyRects: Rect[] = [];

  private frameLoop() {
    if (this.dirtyRects.length > 0) {
      for (const rect of this.dirtyRects) {
        this.ctx.clearRect(rect.x, rect.y, rect.w, rect.h);
      }
      this.drawDirtyNodes();
      this.dirtyRects = [];
    }
    requestAnimationFrame(() => this.frameLoop());
  }
}
```

### 5.2 绘制指令

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

## 6. 事件系统

### 6.1 命中检测

```typescript
class EventDispatcher {
  private hitTest(x: number, y: number): LayoutNode | null {
    // 反向遍历绘制顺序（后绘制的在上面）
    for (let i = this.drawOrder.length - 1; i >= 0; i--) {
      const node = this.drawOrder[i];
      if (node.containsPoint(x, y)) {
        if (node.children.length > 0) {
          const child = this.hitTestInChildren(node, x, y);
          if (child) return child;
        }
        return node;
      }
    }
    return null;
  }

  dispatchEvent(type: string, x: number, y: number) {
    const target = this.hitTest(x, y);
    if (target && target.handlers[type]) {
      target.handlers[type](x, y);
    }
  }
}
```

### 6.2 Canvas 事件监听

在 Canvas 元素上直接监听鼠标/触摸/滚轮事件，通过坐标转换后分发给命中检测系统。

### 6.3 文本输入

文本输入时临时创建隐藏的 `<textarea>` 元素捕获键盘输入，所有视觉渲染在 Canvas 上完成。聚焦时创建，失焦时销毁。

### 6.4 滚动处理

可滚动容器通过 Canvas `clip()` + `translate()` 实现内容偏移，监听 `wheel` 事件更新滚动偏移量（作为 Signal，自动触发重绘）。

### 6.5 手势识别

支持基础手势：点击（tap）、长按（long press）、拖拽（drag）、缩放（pinch）。通过事件序列模式匹配实现。

---

## 7. 主题系统

### 7.1 主题定义

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

### 7.2 主题切换

主题本身是一个 Signal，切换主题自动触发所有依赖组件的重组。

```typescript
const currentTheme = signal(lightTheme);
// 切换时：
currentTheme.value = darkTheme;
```

---

## 8. 组件 API

### 8.1 基础组件

| 组件 | 说明 |
|------|------|
| `Text` | 文本显示 |
| `Button` | 可点击按钮 |
| `TextInput` | 文本输入框 |
| `Checkbox` | 复选框 |
| `Image` | 图片显示 |

### 8.2 布局组件

| 组件 | 说明 |
|------|------|
| `Column` | 垂直排列 |
| `Row` | 水平排列 |
| `Box` | 自由定位容器 |
| `Stack` | 层叠布局 |
| `Padding` | 内边距包装 |
| `Spacer` | 弹性空白 |

### 8.3 列表组件

| 组件 | 说明 |
|------|------|
| `LazyColumn` | 垂直懒加载列表 |
| `LazyRow` | 水平懒加载列表 |

### 8.4 Modifier 系统

链式修饰符 API，借鉴 Compose 的 Modifier 模式：

```typescript
Text("Hello")
  .modifier(
    Modifier
      .padding(16)
      .background('#F0F0F0')
      .cornerRadius(8)
      .clickable(() => console.log('clicked'))
  )
```

每个 Modifier 元素参与布局和绘制流程，但不影响组件的核心逻辑。

---

## 9. 项目结构

```
canvas-compose/
├── packages/
│   ├── reactivity/          # 响应式核心（独立包）
│   │   ├── signal.ts
│   │   ├── computed.ts
│   │   ├── effect.ts
│   │   └── index.ts
│   │
│   ├── composer/            # 组合层
│   │   ├── composer.ts
│   │   ├── node.ts
│   │   ├── slot-table.ts
│   │   ├── applier.ts
│   │   └── index.ts
│   │
│   ├── layout/              # 布局层
│   │   ├── constraints.ts
│   │   ├── measure.ts
│   │   ├── place.ts
│   │   └── index.ts
│   │
│   ├── renderer/            # 渲染层
│   │   ├── canvas-renderer.ts
│   │   ├── draw-command.ts
│   │   ├── dirty-rect.ts
│   │   ├── text-layout.ts
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
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── index.ts
│   │
│   ├── components/          # 组件库
│   │   ├── text.ts
│   │   ├── button.ts
│   │   ├── text-input.ts
│   │   ├── checkbox.ts
│   │   ├── image.ts
│   │   ├── column.ts
│   │   ├── row.ts
│   │   ├── box.ts
│   │   ├── stack.ts
│   │   ├── lazy-list.ts
│   │   ├── modifier.ts
│   │   └── index.ts
│   │
│   └── canvas-compose/      # 主入口包
│       └── index.ts
│
├── apps/
│   └── demo/                # 示例应用
│       ├── index.html
│       ├── main.ts
│       └── counter-app.ts
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 10. 错误处理

1. **Signal 在非 Composable 上下文中读取**：抛出明确错误，提示必须在 Composable 函数内使用
2. **循环依赖检测**：Computed 的依赖链中出现循环时，抛出错误并中断
3. **布局溢出**：子组件尺寸超出父约束时，提供 warn 模式（默认裁剪）和 strict 模式（抛错）
4. **Canvas 绘制异常**：单个节点的 draw 方法出错不影响其他节点，try-catch 隔离

---

## 11. 测试策略

1. **单元测试**：reactivity 包的 Signal/Computed/Effect 行为
2. **快照测试**：组件的 DrawCommand 列表对比
3. **布局测试**：给定约束，验证测量和放置结果
4. **命中测试**：验证事件分发的正确性
5. **视觉回归测试**：Canvas 截图对比（可选，后期引入）

---

## 12. 里程碑规划

### Phase 1：核心引擎
- reactivity 包（Signal/Computed/Effect）
- composer 包（Composer/Node/SlotTable）
- 最小可运行的 Canvas 渲染循环

### Phase 2：布局与渲染
- layout 包（Constraints/Measure/Place）
- renderer 包（CanvasRenderer/DrawCommand/DirtyRect）
- 基础布局组件（Column/Row/Box）

### Phase 3：事件与交互
- event 包（HitTest/Dispatcher/Gesture）
- 基础交互组件（Text/Button/TextInput/Checkbox）
- Modifier 系统

### Phase 4：完善组件库
- 列表组件（LazyColumn/LazyRow）
- 主题系统
- Image 组件
- 完整的 Modifier 链

### Phase 5：优化与发布
- 性能优化（脏矩形合并、批量绘制）
- 文档与示例
- npm 包发布
