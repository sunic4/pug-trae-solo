---
id: "appcontext-unified-root-architecture"
type: architecture
status: accepted
title: "AppContext 统一根上下文 — 单 Canvas 架构 + 零全局变量"
depends_on:
  - "../road-map/canvas-ui-runtime.md"
  - "./reactive-state-snapshot-context-based.md"
  - "./composable-tracking-runtime-hoc.md"
  - "./rendering-architecture-hybrid-mode.md"
  - "./layout-engine-custom-linear-column-row.md"
  - "./component-model-pure-function-call-chain.md"
  - "./modifier-chain-builder-freeze-pattern.md"
  - "./gesture-system-custom-with-modifier.md"
  - "./animation-system-property-driven.md"
created: "2026-04-30 17:45"
updated: "2026-04-30 18:00"
stale: false
---

# ADR: AppContext 统一根上下文 — 单 Canvas 架构 + 零全局变量

## 背景

在完成全部 9 个基础 ADR 后，审查发现以下关键问题：
1. **缺少统一的顶层编排对象**：各模块（Renderer/Layout/Input/Animation）如何互相访问未明确定义
2. **存在隐式全局依赖风险**：`generateStateId()`、Canvas 引用传递路径不清晰
3. **单 Canvas 架构约束不够强制**：未明确"一个 App = 一个 Canvas"

本 ADR 定义 **AppContext** 作为应用的唯一根对象，解决以上所有问题。

## 决策结果

### 核心契约

```
✅ AppContext 是应用唯一的根对象
✅ 禁止任何全局变量/static 字段（除了纯常量）
✅ 一个 AppContext 实例 = 一个 <canvas> 元素 = 一个完整 UI 世界
✅ 通过构造函数或工厂函数创建（禁止 static 方法）
✅ setContent() 为组合唯一入口
✅ dispose() 时销毁所有资源
```

### 完整类型定义

```typescript
/**
 * AppContext — 应用根上下文（= 应用世界的"上帝对象"）
 * 
 * 设计原则：
 * 1. 所有运行时状态都挂载在此实例上
 * 2. 各子模块通过此实例互相访问
 * 3. Composable 函数接收其只读子集（ComposerContext）
 * 4. 生命周期与 Canvas 绑定
 */
class AppContext {
  
  // ===== 身份标识 =====
  readonly id: string;                    // UUID，per 实例唯一
  
  // ===== Canvas 目标（单 Canvas 架构）=====
  readonly canvas: HTMLCanvasElement;    // 唯一绑定的 <canvas> 元素
  private _ctx: CanvasRenderingContext2D;   // 2D 渲染上下文（私有，仅内部使用）
  
  // ===== 组合核心 =====
  readonly composer: ComposerCore;
  //   ├── snapshot: Snapshot              // 状态快照系统
  //   ├── recomposer: Recomposer         // 重组调度器
  //   └── scopeManager: ScopeManager     // Scope 栈管理
  
  // ===== 主题系统 =====
  readonly theme: Theme;
  //   ├── colors: ColorScheme            // 颜色体系
  //   ├── typography: Typography          // 字体体系
  //   ├── shapes: ShapeScheme             // 形状体系
  //   └── spacing: Spacing                // 间距体系
  
  // ===== 平台配置 =====
  readonly configuration: Configuration;
  //   ├── density: Density               // DPI 缩放
  //   ├── layoutDirection: LayoutDirection // LTR / RTL
  //   ├── screenSize: Size               // 屏幕尺寸
  //   └── safeArea: EdgeInsets           // 安全区域
  
  // ===== 渲染管线 =====
  readonly renderer: HybridRenderer;
  //   ├── dirtyRegions: Rect[]           // 脏区域列表
  //   ├── layerManager: LayerManager      // 图层管理
  //   └── drawCache: DrawCommandCache     // 绘制缓存
  
  // ===== 布局引擎 =====
  readonly layoutEngine: LayoutEngine;
  //   ├── measureCache: MeasureCache      // 测量缓存
  //   └── nodeTree: LayoutNodeTree       // 节点树
  
  // ===== 输入系统 =====
  readonly inputManager: InputManager;
  //   ├── pointerProcessor               // Pointer 事件处理
  //   ├── gestureFactory                 // 手势识别器工厂
  //   └── focusManager: FocusManager     // 焦点管理
  
  // ===== 动画系统 =====
  readonly animationClock: AnimationClock;
  //   ├── frameTimeNanos: number         // 当前帧时间戳
  //   └── activeAnimations: Set<Animatable>
  
  // ===== 生命周期 =====
  readonly lifecycle: Lifecycle;
  //   ├── state: LifecycleState
  //   └── onDispose(callback): void
  
  // ===== 私有状态（禁止外部直接访问）=====
  private _running: boolean = false;
  private _rafId: number | null = null;
  private _rootComposable: ComposableFunction<any> | null = null;
  private _disposed: boolean = false;
  
  // ===== 构造函数（唯一入口）=====
  constructor(options: AppContextOptions);
  
  // ===== 公共 API =====
  
  /**
   * 设置根组件（组合入口）
   * @param content 根 Composable 函数
   */
  setContent(content: (ctx: ComposerContext) => ComposableNode): void;
  
  /** 启动渲染循环 */
  start(): void;
  
  /** 暂停渲染循环 */
  stop(): void;
  
  /** 调整 Canvas 尺寸 */
  resize(width: number, height: number): void;
  
  /** 销毁整个应用上下文及所有资源 */
  dispose(): void;
  
  // ===== 只读访问器 =====
  
  get isRunning(): boolean;
  get isDisposed(): boolean;
}

// ===== 构造选项 =====

interface AppContextOptions {
  /** Canvas 元素引用或 CSS 选择器 */
  canvas: string | HTMLCanvasElement;
  
  /** 初始宽度（px），默认取 canvas.width */
  width?: number;
  
  /** 初始高度（px），默认取 canvas.height */
  height?: number;
  
  /** 自定义主题（默认 Material You Light） */
  theme?: Theme;
  
  /** 平台配置覆盖 */
  configuration?: Partial<Configuration>;
  
  /** 调试模式开关（默认 false） */
  debug?: boolean;
}

// ===== ComposerContext（暴露给 Composable 的安全子集）=====

interface ComposerContext {
  // 从 AppContext 投射的只读视图
  readonly snapshot: Snapshot;
  readonly recomposer: Recomposer;
  readonly layoutDirection: LayoutDirection;
  readonly density: Density;
  readonly theme: Theme;                   // 只读主题访问
  readonly configuration: Configuration;   // 只读配置访问
}
```

### 使用示例

```typescript
import {
  AppContext,
  composable,
  remember,
  mutableStateOf,
  Column, Text, Button, Modifier,
  Arrangement, Alignment,
  Color, Dp, Sp
} from 'pug-canvas-ui';

// ===== 1. 创建 AppContext（通过构造函数，非 static）====

const app = new AppContext({
  canvas: '#my-canvas',
  width: 375,
  height: 667,
  theme: {
    colors: {
      primary: Color(0xFF6750A4),
      onPrimary: Color(0xFFFFFFFF),
      // ... 完整颜色体系
    },
    typography: { /* ... */ },
    shapes: { /* ... */ },
    spacing: { /* ... */ }
  },
  configuration: {
    density: Density(2.0),  // Retina 屏幕
    layoutDirection: LayoutDirection.Ltr
  },
  debug: true  // 开发模式开启性能监控
});

// ===== 2. setContent() — 设置根组件（唯一组合入口）====

app.setContent((ctx) => {  // ← ctx 是 ComposerContext（AppContext 的只读子集）
  
  const count = remember(() => mutableStateOf(0));
  const isEnabled = remember(() => mutableStateOf(true));
  
  return Column({
    modifier: Modifier
      .fillMaxSize()
      .padding(16.dp)
      .background(ctx.theme.colors.surface),  // ✅ 通过 ctx 访问主题
    verticalArrangement: Arrangement.spacedBy(12.dp),
    horizontalAlignment: Alignment.CenterHorizontally
  }) {
    
    // 标题
    Text({ 
      text: 'Canvas UI Demo',
      fontSize: 28.sp,
      fontWeight: FontWeight.Bold,
      color: ctx.theme.colors.onSurface
    });
    
    // 计数显示
    Text({ 
      text: `Count: ${count.value}`,
      fontSize: 48.sp,
      color: ctx.theme.colors.primary
    });
    
    // 按钮行
    Row({
      modifier: Modifier.fillMaxWidth(),
      horizontalArrangement: Arrangement.spacedBy(12.dp)
    }) {
      
      Button({
        text: '-',
        onClick: () => count.value--,
        enabled: count.value > 0,
        modifier: Modifier.size(56.dp).background(ctx.theme.colors.secondaryContainer)
      });
      
      Button({
        text: '+',
        onClick: () => count.value++,
        modifier: Modifier.size(56.dp).background(ctx.theme.colors.primaryContainer)
      });
      
      Button({
        text: isEnabled.value ? 'Disable' : 'Enable',
        onClick: () => { isEnabled.value = !isEnabled.value; }
      });
    };
    
    // 条件渲染
    if (!isEnabled.value) {
      Text({
        text: '⚠️ 功能已禁用',
        color: ctx.theme.colors.error,
        fontSize: 14.sp
      });
    }
  };
});

// ===== 3. 启动应用 ====

app.start();  // 开始 requestAnimationFrame 循环

// ===== 4. 响应尺寸变化（如横竖屏切换）====

window.addEventListener('resize', () => {
  app.resize(window.innerWidth, window.innerHeight);
});

// ===== 5. 销毁（如页面卸载）====

window.addEventListener('unload', () => {
  app.dispose();  // 释放所有资源：Canvas、内存、事件监听器等
});
```

### 内部模块协作图

```
┌─ AppContext (this) ──────────────────────────────┐
│                                                    │
│  this.composer                                     │
│    ├─ snapshot.read(state) → 记录依赖             │
│    ├─ recomposer.invalidate(scope) → 标记脏        │
│    └─ recomposer.recompose() → 执行 composable     │
│                       ↓                             │
│  this.renderer                                    │
│    ├─ 接收 dirty Scopes                            │
│    ├─ 执行 LayoutNode.measure()                     │
│    │   └→ 调用 this.layoutEngine.measure()          │
│    ├─ 生成 DrawCommand[]                           │
│    └─ this.ctx.clearRect/fill/... → Canvas 绘制    │
│                                                    │
│  this.inputManager                                 │
│    ├─ 接收原生 PointerEvent                        │
│    ├─ hitTest(position) → 遍历 this.layoutEngine.nodeTree
│    ├─ gestureRecognizer.detect() → 识别手势        │
│    └─ callback() → 触发 State 变更 → 触发重组     │
│                                                    │
│  this.animationClock                               │
│    ├─ rAF 每帧更新 frameTimeNanos                  │
│    ├─ 遍历 activeAnimations → 更新 Animatable.value
│    └─ value 变更 → State 写入 → 触发重组           │
│                                                    │
│  this.theme / this.configuration                   │
│    └─ 被 ComposerContext 投影 → Composable 只读访问 │
│                                                    │
└────────────────────────────────────────────────────┘
```

### 禁止事项（硬性约束）

```typescript
/**
 * ⛔ 禁止清单（编译期 lint + 运行时检查）
 */

// ❌ 1. 禁止模块级可变变量
let globalCounter = 0;           // BAD!
let cachedContext: AppContext;   // BAD!

// ✅ 允许纯常量
const PI = 3.14159;              // OK (不可变)
const DEFAULT_DENSITY = 1.0;    // OK (不可变)

// ❌ 2. 禁止 class static 字段（除纯工厂方法外）
class Foo {
  static instance: Foo;          // BAD! 单例模式
  static cache = new Map();      // BAD! 全局缓存
}
class Bar {
  static create(options): Bar {  // OK! 工厂方法（无状态）
    return new Bar(options);
  }
}

// ❌ 3. 禁止闭包捕获外部可变状态
let external = 0;
const badFunc = () => { external++ };  // BAD!

// ✅ 正确做法：所有可变状态通过参数传入
const goodFunc = (state: MutableState<number>) => { 
  state.value++; 
};

// ❌ 4. 禁止直接 import 其他模块的单例
import { singletonRenderer } from './renderer';  // BAD!

// ✅ 正确做法：通过 AppContext 访问
const render = (ctx: AppContext) => {
  ctx.renderer.execute(...);  // OK! 通过实例访问
};
```

## 对其他 ADR 的影响与修改指南

### ADR#1 (Snapshot) — 需要小改

**修改点**: `generateStateId()` 改为从 AppContext 获取 ID 分配器

```typescript
// Before (有问题)
class MutableState<T> {
  constructor(initialValue: T, private snapshot: Snapshot) {
    this._id = generateStateId(); // ← 全局函数？
  }
}

// After (正确)
class MutableState<T> {
  constructor(
    initialValue: T, 
    private snapshot: Snapshot,
    private idGenerator: IdGenerator  // ← 从 AppContext 注入
  ) {
    this._id = idGenerator.nextId();
  }
}
```

### ADR#2 (Composable HOC) — 需要微调

**修改点**: `ComposerContext` 明确为 `AppContext` 的投影类型

```typescript
// 明确关系
interface ComposerContext {
  // 这些属性都是从 AppContext 投影的只读视图
  readonly snapshot: Snapshot;           // = appContext.composer.snapshot
  readonly recomposer: Recomposer;      // = appContext.composer.recomposer
  readonly layoutDirection: LayoutDirection; // = appContext.configuration.layoutDirection
  readonly density: Density;             // = appContext.configuration.density
  readonly theme: Theme;                 // = appContext.theme (只读)
  readonly configuration: Configuration; // = appContext.configuration (只读)
}
```

### ADR#3 (Hybrid Renderer) — 需要中改

**修改点**: 移除 `DrawCommand.execute(ctx)` 参数，改为闭包捕获 AppContext

```typescript
// Before
interface DrawCommand {
  execute(ctx: CanvasRenderingContext2D): void; // ← ctx 从哪来？
}

// After
interface DrawCommand {
  // 不再接收参数，执行时从闭合的 AppContext 获取 ctx
  execute(): void; 
}

// 内部实现
class FillRectCommand implements DrawCommand {
  constructor(
    private host: AppContext,  // ← 闭合捕获
    private x: number,
    private y: number,
    private w: number,
    private h: number,
    private color: Color
  ) {}
  
  execute(): void {
    this.host._ctx.fillStyle = this.color.toCss();
    this.host._ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}
```

### ADR#4 (Layout Engine) — 需要小改

**修改点**: MeasurePolicy 接收 AppContext 以访问 density/theme

```typescript
// 新增
interface MeasurePolicy {
  measure(
    measurables: Measurable[],
    constraints: Constraints,
    context: AppContext  // ← 新增：可访问 density 等
  ): MeasureResult;
}
```

### ADR#5-8 — 微调即可

- **ADR#5 (Component)**: Composable 可通过 `ctx.theme` 直接访问主题 ✅ 无需大改
- **ADR#6 (Modifier)**: 纯数据结构，无需修改 ✅
- **ADR#7 (Gesture)**: InputManager 通过 `host.layoutEngine.nodeTree` 做 Hit Test ✅
- **ADR#8 (Animation)**: Animatable 通过 `host.animationClock.frameTimeNanos` 驱动 ✅

## 正面影响

1. **架构清晰度大幅提升**：
   - 一目了然：所有状态在哪里、谁持有谁
   - 消除隐式依赖：不再猜测"这个值从哪来"

2. **零全局变量保证**：
   - 编译期可通过 ESLint 规则检测
   - 运行时可通过 `debug` 模式验证

3. **测试友好性极佳**：
   ```typescript
   test('should recompose on state change', () => {
     const app = new AppContext({ canvas: document.createElement('canvas') });
     
     let renderCount = 0;
     app.setContent(() => {
       renderCount++;
       return Box();
     });
     
     app.start();
     expect(renderCount).toBe(1);
     
     app.dispose(); // 自动清理，无需手动 reset
   });
   ```

4. **单 Canvas 强约束**：
   - 构造时绑定唯一 Canvas
   - 不支持多 Canvas（简化架构）
   - 生命周期完全可控

5. **API 符合直觉**：
   - `new AppContext()` — 创建
   - `.setContent(fn)` — 设置内容
   - `.start()` — 启动
   - `.dispose()` — 销毁
   - 类似 Android `ComposeView.setContent { }`

## 负面影响与风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| AppContext 较"重" | 包含所有子系统，初学者可能感到复杂 | 提供分层文档：入门只需知道 `setContent` + `start` |
| 模块耦合在 AppContext 上 | 测试时需要 Mock 整个 AppContext | 提供 `createTestContext()` 工厂函数生成轻量 Mock |
| 未来多 Canvas 需求 | 当前设计不支持一个 App 多 Canvas | 添加说明：如需多 Canvas，创建多个 AppContext 实例 |

## 验证假设

### 前提条件
1. AppContext 实例的内存占用 < 5KB（不含子系统）
2. 属性访问开销 < 0.001ms（直接对象属性读取）
3. dispose() 能 100% 清理所有事件监听器和 rAF 句柄

### 验证方式
- [ ] **Spike #1**: 实现 AppContext MVP + 内存泄漏检测
- [ ] **Spike #2**: 100 次 create/dispose 循环无内存增长
- [ ] **Spike #3**: ESLint 规则实现（检测全局变量）

## 可逆性评估

🟡 **部分可逆**

| 指标 | 数值 |
|------|------|
| 影响文件数 | ~15 文件（所有模块都需要接收 AppContext 参数） |
| 影响模块数 | 全部 9 个模块 |
| 数据迁移 | 无（新代码） |
| API 变更风险 | 低（公共 API 是 AppContext 方法，内部重构自由） |

**回退方案**：
- 如果发现 AppContext 过于臃肿 → 拆分为 `AppHost` + `AppContext`（当前方案就是过渡态）
- 回退工作量：~2 天接口调整

## 实现约束（来自本 ADR）

1. **禁止 static 创建方法**：必须使用 `new AppContext()` 或实例工厂函数
2. **setContent() 是唯一组合入口**：不允许其他方式设置根组件
3. **ComposerContext 必须是投影**：不能包含可写属性
4. **dispose() 必须幂等**：多次调用不会报错
5. **所有子系统构造时接收 AppContext**：禁止模块间直接 import 单例

## 相关文档

- 上游 ADR:
  - [`reactive-state-snapshot-context-based.md`](./reactive-state-snapshot-context-based.md)
  - [`composable-tracking-runtime-hoc.md`](./composable-tracking-runtime-hoc.md)
  - [`rendering-architecture-hybrid-mode.md`](./rendering-architecture-hybrid-mode.md)
  - [`layout-engine-custom-linear-column-row.md`](./layout-engine-custom-linear-column-row.md)
  - [`component-model-pure-function-call-chain.md`](./component-model-pure-function-call-chain.md)
  - [`modifier-chain-builder-freeze-pattern.md`](./modifier-chain-builder-freeze-pattern.md)
  - [`gesture-system-custom-with-modifier.md`](./gesture-system-custom-with-modifier.md)
  - [`animation-system-property-driven.md`](./animation-system-property-driven.md)

## 决策记录

| 时间 | 决策者 | 决策内容 |
|------|--------|---------|
| 2026-04-30 18:00 | 用户 + AI | 确认 AppContext 作为统一根对象；禁用 static；setContent() 为入口；零全局变量 |
