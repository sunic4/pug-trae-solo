# API 参考文档

> 框架的完整 API 参考，包括所有模块的接口、方法和使用示例

**日期**：2026-04-26
**状态**：Updated

---

## 1. 核心模块 (core)

### 1.1 AppContext

**创建应用上下文**

```typescript
function createAppContext(config: AppContextConfig): AppContext;
```

**参数**：
- `config`：应用上下文配置
  - `theme`：主题（可选）
  - `composer`：组合器（可选）
  - `renderer`：渲染器（可选）
  - `maxNavigationHistory`：最大导航历史长度（可选，默认 50）

**返回值**：AppContext 实例

**示例**：
```typescript
import { createAppContext } from '@pug/core';
import { defaultTheme } from '@pug/theme';

const appContext = createAppContext({
  theme: defaultTheme,
  maxNavigationHistory: 50
});
```

**AppContext 接口**

```typescript
interface AppContext {
  // 主题服务
  theme: ThemeContext;
  
  // 组件组合器
  composer: Composer;
  
  // 渲染器
  renderer: Renderer | null;
  
  // 插件容器
  plugins: PluginContainer;
  
  // 获取配置
  getConfig(): AppContextConfig;
  
  // 销毁上下文
  dispose(): void;
  
  // 事件监听器管理
  addEventListener(event: string, listener: () => void): void;
  removeEventListener(event: string, listener: () => void): void;
  
  // 信号管理
  registerSignal<T>(signal: { dispose?: () => void }): void;
  
  // 错误处理
  addErrorHandler(handler: (error: Error) => void): void;
  removeErrorHandler(handler: (error: Error) => void): void;
  
  // 导航历史限制
  getMaxNavigationHistory(): number;
}

// 插件接口
interface Plugin {
  name: string;
  initialize?: (appContext: AppContext) => void;
  dispose?: () => void;
}

// 插件容器接口
interface PluginContainer {
  get<T extends Plugin>(name: string): T | null;
  register(plugin: Plugin): void;
  unregister(name: string): void;
  dispose(): void;
}
```

### 1.2 测试工具

**创建测试应用上下文**

```typescript
function createTestAppContext(overrides?: Partial<AppContextConfig>): AppContext;
```

**参数**：
- `overrides`：覆盖默认配置的选项（可选）

**返回值**：测试用的 AppContext 实例

**示例**：
```typescript
import { createTestAppContext } from '@pug/core';

const appContext = createTestAppContext({
  maxNavigationHistory: 10
});
```

**测试信号**

```typescript
function testSignal<T>(initialValue: T): {
  signal: Signal<T>;
  updates: T[];
  dispose: () => void;
  assertUpdates: (expected: T[]) => void;
  assertValue: (expected: T) => void;
};
```

**参数**：
- `initialValue`：信号的初始值

**返回值**：包含信号和测试辅助函数的对象

**示例**：
```typescript
import { testSignal } from '@pug/core';

const { signal, updates, assertUpdates } = testSignal(0);
signal.value = 1;
signal.value = 2;
assertUpdates([0, 1, 2]);
```

**测试效果**

```typescript
function testEffect(fn: () => void | Promise<void>): {
  dispose: () => void;
  runCount: number;
  lastError: Error | null;
  assertRunCount: (expected: number) => void;
  assertError: (expectedMessage: string) => void;
};
```

**参数**：
- `fn`：效果函数

**返回值**：包含效果和测试辅助函数的对象

**示例**：
```typescript
import { testEffect } from '@pug/core';

const { dispose, assertRunCount } = testEffect(() => {
  console.log('Effect ran');
});

assertRunCount(1);
dispose();
```

**测试组件**

```typescript
function testComponent<T extends ComposeNode>(
  createComponent: (appContext: AppContext) => T,
  appContext?: AppContext
): {
  component: T;
  appContext: AppContext;
  assertExists: () => void;
  assertType: (expectedType: string) => void;
  assertHasChild: (childType: string) => void;
};
```

**参数**：
- `createComponent`：创建组件的函数
- `appContext`：应用上下文（可选）

**返回值**：包含组件和测试辅助函数的对象

**示例**：
```typescript
import { testComponent } from '@pug/core';

const { component, assertExists, assertType } = testComponent(
  (appContext) => new Button({ text: 'Click', appContext })
);

assertExists();
assertType('button');
```

**模拟事件系统**

```typescript
class MockEventSystem {
  on(event: string, callback: () => void): void;
  off(event: string, callback: () => void): void;
  emit(event: string): void;
  clear(): void;
}

function createMockEventSystem(): MockEventSystem;
```

**示例**：
```typescript
import { createMockEventSystem } from '@pug/core';

const eventSystem = createMockEventSystem();
const handler = () => console.log('Event triggered');
eventSystem.on('test', handler);
eventSystem.emit('test');
eventSystem.off('test', handler);
```

**模拟渲染器**

```typescript
class MockRenderer implements Renderer {
  config: RendererConfig;
  setRoot(node: ComposeNode): void;
  setAppContext(appContext: AppContext): void;
  markDirty(rect: DirtyRect): void;
  getRootNode(): ComposeNode | null;
  getDirtyRects(): DirtyRect[];
  clearDirtyRects(): void;
  dispose(): void;
}
```

**示例**：
```typescript
import { MockRenderer } from '@pug/core';

const renderer = new MockRenderer({
  width: 800,
  height: 600
});
```

---

## 2. 响应式模块 (reactivity)

### 2.1 Signal

**创建信号**

```typescript
function signal<T>(initialValue: T, options?: SignalOptions<T>): Signal<T>;

interface SignalOptions<T> {
  persistent?: boolean;
  storageKey?: string;
  serialize?: (value: T) => string;
  deserialize?: (str: string) => T;
}

interface Signal<T> {
  get value(): T;
  set value(v: T);
  subscribe(callback: () => void): () => void;
  clearSubscribers(): void;
  get subscriberCount(): number;
  update(valueOrFn: T | ((current: T) => T)): Promise<void>;
  dispose(): void;
}
```

**参数**：
- `initialValue`：信号的初始值
- `options`：信号配置（可选）
  - `persistent`：是否持久化到本地存储
  - `storageKey`：持久化存储的键名
  - `serialize`：自定义序列化函数
  - `deserialize`：自定义反序列化函数

**返回值**：Signal 实例

**示例**：
```typescript
import { signal } from '@pug/reactivity';

// 基本使用
const count = signal(0);
console.log(count.value); // 0
count.value = 1;
console.log(count.value); // 1

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

### 2.2 Computed

**创建计算信号**

```typescript
function computed<T>(fn: () => T): ComputedSignal<T>;

interface ComputedSignal<T> {
  get value(): T;
  subscribe(callback: () => void): () => void;
  clearSubscribers(): void;
  get subscriberCount(): number;
  dispose(): void;
}
```

**参数**：
- `fn`：计算函数

**返回值**：ComputedSignal 实例

**示例**：
```typescript
import { signal, computed } from '@pug/reactivity';

const count = signal(0);
const doubled = computed(() => count.value * 2);
console.log(doubled.value); // 0
count.value = 1;
console.log(doubled.value); // 2
```

### 2.3 Effect

**创建效果**

```typescript
function effect(fn: () => void | Promise<void>, options?: EffectOptions): Disposable;

interface EffectOptions {
  cleanup?: () => void;
  onError?: (error: Error) => void;
  lazy?: boolean;
  scheduler?: (fn: () => void) => void;
}

interface Disposable {
  dispose(): void;
  run(): void;
}
```

**参数**：
- `fn`：效果函数
- `options`：效果配置（可选）
  - `cleanup`：清理函数
  - `onError`：错误处理函数
  - `lazy`：是否延迟执行
  - `scheduler`：自定义调度器

**返回值**：可销毁对象

**示例**：
```typescript
import { effect } from '@pug/reactivity';

// 基本使用
const dispose = effect(() => {
  console.log(`Count: ${count.value}`);
});

// 异步效果
const disposeAsync = effect(async () => {
  const data = await fetchData(count.value);
  console.log('Data:', data);
});

// 带清理函数
const disposeWithCleanup = effect(() => {
  const subscription = eventBus.subscribe('update', handleUpdate);
  return () => subscription.unsubscribe();
});

// 清理效果
dispose();
disposeAsync();
disposeWithCleanup();
```

### 2.4 依赖跟踪

**跟踪依赖**

```typescript
function trackDependencies(fn: () => void, onDependencyChange: () => void): void;
```

**参数**：
- `fn`：要跟踪依赖的函数
- `onDependencyChange`：依赖变化时的回调函数

**示例**：
```typescript
import { trackDependencies } from '@pug/reactivity';

trackDependencies(() => {
  console.log(`Count: ${count.value}`);
}, () => {
  console.log('Dependency changed');
});
```

---

## 3. 组合模块 (composer)

### 3.1 Composer

**创建组合器**

```typescript
class Composer {
  constructor(appContext?: AppContext);
  setAppContext(appContext: AppContext): void;
  getAppContext(): AppContext | null;
  startCompose(fn: ComposableFunction): ComposeNode;
  endCompose(): void;
  markDirty(node: ComposeNode): void;
  recompose(): void;
  batch<T>(callback: () => T): T;
  addErrorHandler(handler: (error: Error) => void): void;
  removeErrorHandler(handler: (error: Error) => void): void;
  getSlotTable(): SlotTable;
  getRootNode(): ComposeNode | null;
  getDirtyNodes(): Set<ComposeNode>;
  clearDirtyNodes(): void;
  hasDirtyNodes(): boolean;
  dispose(): void;
}

type ComposableFunction = (...args: any[]) => ComposeNode;
```

**示例**：
```typescript
import { Composer } from '@pug/composer';

const composer = new Composer(appContext);
const rootNode = composer.startCompose(() => {
  return new Box({
    children: [
      new Text({ text: 'Hello' })
    ]
  });
});
composer.endCompose();
```

### 3.2 ComposeNode

**节点基类**

```typescript
class ComposeNode {
  constructor(type: string, props?: any, appContext?: AppContext);
  get type(): string;
  get props(): any;
  get children(): ComposeNode[];
  get x(): number;
  set x(value: number);
  get y(): number;
  set y(value: number);
  get width(): number;
  set width(value: number);
  get height(): number;
  set height(value: number);
  get dirty(): boolean;
  get layoutDirty(): boolean;
  get appContext(): AppContext | null;
  set appContext(value: AppContext | null);
  get parent(): ComposeNode | null;
  set parent(value: ComposeNode | null);
  get handlers(): Record<string, (...args: any[]) => void>;
  
  addChild(child: ComposeNode): void;
  removeChild(child: ComposeNode): void;
  clearChildren(): void;
  containsPoint(x: number, y: number): boolean;
  measure(constraints: Constraints): Size;
  place(x: number, y: number, width: number, height: number): void;
  placeChildren(): void;
  draw(drawApi: DrawAPI): void;
  drawCommands(): DrawCommand[];
  markDirty(): void;
  clearDirty(): void;
  markLayoutDirty(): void;
  clearLayoutDirty(): void;
  dispose(): void;
}
```

**示例**：
```typescript
import { ComposeNode } from '@pug/composer';

class CustomNode extends ComposeNode {
  constructor(props: any, appContext: AppContext) {
    super('custom', props, appContext);
  }
  
  measure(constraints: Constraints): Size {
    return {
      width: Math.min(200, constraints.maxWidth),
      height: Math.min(100, constraints.maxHeight)
    };
  }
  
  draw(drawApi: DrawAPI): void {
    drawApi.rect(0, 0, this.width, this.height, {
      fill: '#FF0000'
    });
  }
}
```

---

## 4. 渲染模块 (renderer)

### 4.1 CanvasRenderer

**创建渲染器**

```typescript
class CanvasRenderer implements Renderer {
  constructor(canvas: HTMLCanvasElement, config?: Partial<RendererConfig>, appContext?: AppContext);
  config: RendererConfig;
  setRoot(node: ComposeNode): void;
  setAppContext(appContext: AppContext): void;
  markDirty(rect: DirtyRect): void;
  renderFrame(): void;
  drawCommands(commands: DrawCommand[]): void;
  getContext(): CanvasRenderingContext2D;
  addErrorHandler(handler: (error: Error) => void): void;
  removeErrorHandler(handler: (error: Error) => void): void;
  dispose(): void;
}

interface RendererConfig {
  width: number;
  height: number;
  pixelRatio: number;
  debug: boolean;
}

interface DirtyRect {
  x: number;
  y: number;
  w: number;
  h: number;
}
```

**参数**：
- `canvas`：HTML Canvas 元素
- `config`：渲染器配置（可选）
- `appContext`：应用上下文（可选）

**示例**：
```typescript
import { CanvasRenderer } from '@pug/renderer';

const canvas = document.getElementById('app') as HTMLCanvasElement;
const renderer = new CanvasRenderer(canvas, {
  width: 800,
  height: 600,
  pixelRatio: window.devicePixelRatio || 1,
  debug: false
});

renderer.setRoot(rootNode);
renderer.markDirty({ x: 0, y: 0, w: 800, h: 600 });
```

### 4.2 绘制指令

**执行绘制指令**

```typescript
type DrawCommand =
  | { type: 'rect'; x: number; y: number; w: number; h: number; fill?: string; stroke?: string; strokeWidth?: number }
  | { type: 'text'; x: number; y: number; content: string; font: string; color: string; align?: CanvasTextAlign; baseline?: CanvasTextBaseline }
  | { type: 'clip'; rect: DirtyRect }
  | { type: 'transform'; matrix: number[] }
  | { type: 'image'; img: HTMLImageElement; x: number; y: number; w: number; h: number }
  | { type: 'save' }
  | { type: 'restore' };

function executeDrawCommand(ctx: CanvasRenderingContext2D, command: DrawCommand): void;
```

**示例**：
```typescript
import { executeDrawCommand } from '@pug/renderer';

const commands: DrawCommand[] = [
  { type: 'save' },
  { type: 'rect', x: 0, y: 0, w: 100, h: 100, fill: '#FF0000' },
  { type: 'text', x: 50, y: 50, content: 'Hello', font: '16px sans-serif', color: '#FFFFFF', align: 'center', baseline: 'middle' },
  { type: 'restore' }
];

commands.forEach(cmd => executeDrawCommand(ctx, cmd));
```

### 4.3 文本布局

**测量文本**

```typescript
interface TextMetrics {
  width: number;
  height: number;
  ascent: number;
  descent: number;
}

function measureText(text: string, font: string): TextMetrics;
```

**参数**：
- `text`：要测量的文本
- `font`：字体样式

**返回值**：文本度量信息

**示例**：
```typescript
import { measureText } from '@pug/renderer';

const metrics = measureText('Hello', '16px sans-serif');
console.log('Width:', metrics.width);
console.log('Height:', metrics.height);
```

**布局文本**

```typescript
interface TextLayoutResult {
  lines: string[];
  totalHeight: number;
  lineHeight: number;
  maxWidth: number;
}

function layoutText(text: string, font: string, maxWidth: number): TextLayoutResult;
```

**参数**：
- `text`：要布局的文本
- `font`：字体样式
- `maxWidth`：最大宽度

**返回值**：文本布局结果

**示例**：
```typescript
import { layoutText } from '@pug/renderer';

const result = layoutText('Hello World This Is A Long Text', '16px sans-serif', 200);
console.log('Lines:', result.lines);
console.log('Total height:', result.totalHeight);
```

### 4.4 脏矩形

**合并脏矩形**

```typescript
function mergeDirtyRects(rects: DirtyRect[]): DirtyRect[];
```

**参数**：
- `rects`：脏矩形数组

**返回值**：合并后的脏矩形数组

**示例**：
```typescript
import { mergeDirtyRects } from '@pug/renderer';

const rects: DirtyRect[] = [
  { x: 0, y: 0, w: 100, h: 100 },
  { x: 50, y: 50, w: 100, h: 100 }
];

const merged = mergeDirtyRects(rects);
console.log('Merged rects:', merged);
```

---

## 5. 事件模块 (event)

### 5.1 HitTest

**命中检测**

```typescript
function hitTest(root: ComposeNode, x: number, y: number): ComposeNode | null;
```

**参数**：
- `root`：根节点
- `x`：横坐标
- `y`：纵坐标

**返回值**：命中的节点或 null

**示例**：
```typescript
import { hitTest } from '@pug/event';

const target = hitTest(rootNode, 100, 100);
if (target) {
  console.log('Hit node:', target.type);
}
```

### 5.2 EventDispatcher

**创建事件分发器**

```typescript
class EventDispatcher {
  constructor(rootNode: ComposeNode);
  dispatch(type: string, x: number, y: number): void;
  attachToCanvas(canvas: HTMLCanvasElement): () => void;
  dispose(): void;
}
```

**参数**：
- `rootNode`：根节点

**示例**：
```typescript
import { EventDispatcher } from '@pug/event';

const dispatcher = new EventDispatcher(rootNode);

// 附加到 Canvas
const cleanup = dispatcher.attachToCanvas(canvas);

// 手动分发事件
dispatcher.dispatch('click', 100, 100);

// 清理
cleanup();
dispatcher.dispose();
```

---

## 6. 主题模块 (theme)

### 6.1 主题定义

**创建主题**

```typescript
function createTheme(theme: Partial<Theme>): Theme;

interface Theme {
  colors: {
    primary: string;
    onPrimary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    onError: string;
  };
  typography: {
    h1: FontStyle;
    h2: FontStyle;
    h3: FontStyle;
    body: FontStyle;
    caption: FontStyle;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  corners: {
    none: number;
    small: number;
    medium: number;
    large: number;
    round: number;
  };
}

interface FontStyle {
  size: number;
  weight: string;
  family: string;
}
```

**参数**：
- `theme`：主题配置

**返回值**：主题对象

**示例**：
```typescript
import { createTheme } from '@pug/theme';

const theme = createTheme({
  colors: {
    primary: '#6200EE',
    onPrimary: '#FFFFFF',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    error: '#B00020',
    onError: '#FFFFFF'
  },
  typography: {
    h1: { size: 32, weight: 'bold', family: 'sans-serif' },
    body: { size: 14, weight: 'normal', family: 'sans-serif' }
  },
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32
  },
  corners: {
    none: 0, small: 4, medium: 8, large: 16, round: 9999
  }
});
```

### 6.2 主题上下文

**主题上下文**

```typescript
class ThemeContext {
  constructor(theme?: Theme);
  get theme(): Theme;
  set theme(value: Theme);
  subscribe(callback: () => void): () => void;
  dispose(): void;
}

// 默认主题
export const defaultTheme: Theme;
```

**示例**：
```typescript
import { ThemeContext, defaultTheme } from '@pug/theme';

const themeContext = new ThemeContext(defaultTheme);
console.log('Current theme:', themeContext.theme);

// 订阅主题变化
const unsubscribe = themeContext.subscribe(() => {
  console.log('Theme changed');
});

// 切换主题
themeContext.theme = darkTheme;

// 清理
unsubscribe();
themeContext.dispose();
```

---

## 7. 组件模块 (components)

### 7.1 文本组件

**Text 组件**

```typescript
function TextComponent(props: TextProps): ComposeNode;

interface TextProps {
  text: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  appContext?: AppContext;
}
```

**示例**：
```typescript
import { TextComponent } from '@pug/components';

const text = TextComponent({
  text: 'Hello World',
  fontSize: 16,
  fontWeight: 'bold',
  color: '#000000',
  textAlign: 'center'
});
```

### 7.2 按钮组件

**Button 组件**

```typescript
function ButtonComponent(props: ButtonProps): ComposeNode;

interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  appContext?: AppContext;
}
```

**示例**：
```typescript
import { ButtonComponent } from '@pug/components';

const button = ButtonComponent({
  text: 'Click Me',
  onClick: () => console.log('Clicked'),
  variant: 'primary',
  size: 'medium'
});
```

### 7.3 文本输入组件

**TextInput 组件**

```typescript
function TextInputComponent(props: TextInputProps): ComposeNode;

interface TextInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  width?: number | string;
  appContext?: AppContext;
}
```

**示例**：
```typescript
import { TextInputComponent } from '@pug/components';
import { signal } from '@pug/reactivity';

const text = signal('');

const input = TextInputComponent({
  value: text.value,
  onValueChange: (value) => text.value = value,
  placeholder: 'Enter text here',
  width: 200
});
```

### 7.4 复选框组件

**Checkbox 组件**

```typescript
function CheckboxComponent(props: CheckboxProps): ComposeNode;

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  appContext?: AppContext;
}
```

**示例**：
```typescript
import { CheckboxComponent } from '@pug/components';
import { signal } from '@pug/reactivity';

const checked = signal(false);

const checkbox = CheckboxComponent({
  checked: checked.value,
  onCheckedChange: (value) => checked.value = value,
  label: 'Remember me'
});
```

### 7.5 布局组件

**Column 组件**

```typescript
function ColumnComponent(props: ColumnProps): ComposeNode;

interface ColumnProps {
  children: ComposeNode | ComposeNode[];
  spacing?: number;
  alignItems?: 'start' | 'center' | 'end';
  appContext?: AppContext;
}
```

**示例**：
```typescript
import { ColumnComponent, TextComponent, ButtonComponent } from '@pug/components';

const column = ColumnComponent({
  spacing: 16,
  alignItems: 'center',
  children: [
    TextComponent({ text: 'Header' }),
    ButtonComponent({ text: 'Button', onClick: () => {} })
  ]
});
```

**Row 组件**

```typescript
function RowComponent(props: RowProps): ComposeNode;

interface RowProps {
  children: ComposeNode | ComposeNode[];
  spacing?: number;
  alignItems?: 'start' | 'center' | 'end';
  appContext?: AppContext;
}
```

**示例**：
```typescript
import { RowComponent, TextComponent, ButtonComponent } from '@pug/components';

const row = RowComponent({
  spacing: 16,
  alignItems: 'center',
  children: [
    TextComponent({ text: 'Label' }),
    ButtonComponent({ text: 'Action', onClick: () => {} })
  ]
});
```

**Box 组件**

```typescript
function BoxComponent(props: BoxProps): ComposeNode;

interface BoxProps {
  children?: ComposeNode | ComposeNode[];
  width?: number | string;
  height?: number | string;
  backgroundColor?: string;
  padding?: number;
  appContext?: AppContext;
}
```

**示例**：
```typescript
import { BoxComponent, TextComponent } from '@pug/components';

const box = BoxComponent({
  width: '100%',
  height: 200,
  backgroundColor: '#F0F0F0',
  padding: 16,
  children: TextComponent({ text: 'Content' })
});
```

**Stack 组件**

```typescript
function StackComponent(props: StackProps): ComposeNode;

interface StackProps {
  children: ComposeNode | ComposeNode[];
  appContext?: AppContext;
}
```

**示例**：
```typescript
import { StackComponent, BoxComponent, TextComponent } from '@pug/components';

const stack = StackComponent({
  children: [
    BoxComponent({ width: 200, height: 200, backgroundColor: '#FF0000' }),
    TextComponent({ text: 'Overlay', color: '#FFFFFF' })
  ]
});
```

---

## 8. 导航系统

### 8.1 导航状态

**导航状态**

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

type Page = 'home' | 'details' | 'settings';

interface NavigationHistoryItem {
  page: Page;
  params: Record<string, any>;
}

// 导航状态信号
export const navigationState: Signal<NavigationState>;
```

**示例**：
```typescript
import { navigationState } from './navigationState';

console.log('Current page:', navigationState.value.currentPage);
console.log('Current params:', navigationState.value.params);
```

### 8.2 导航方法

**导航到页面**

```typescript
function navigateTo(page: Page, params: Record<string, any> = {}): void;
```

**参数**：
- `page`：页面名称
- `params`：导航参数

**示例**：
```typescript
import { navigateTo } from './navigationState';

navigateTo('details', { id: 123 });
```

**返回上一页**

```typescript
function navigateBack(): void;
```

**示例**：
```typescript
import { navigateBack, canNavigateBack } from './navigationState';

if (canNavigateBack()) {
  navigateBack();
}
```

**前进到下一页**

```typescript
function navigateForward(): void;
```

**示例**：
```typescript
import { navigateForward, canNavigateForward } from './navigationState';

if (canNavigateForward()) {
  navigateForward();
}
```

**检查是否可以返回**

```typescript
function canNavigateBack(): boolean;
```

**检查是否可以前进**

```typescript
function canNavigateForward(): boolean;
```

**获取导航历史**

```typescript
function getNavigationHistory(): NavigationHistoryItem[];
```

**清理导航**

```typescript
function cleanupNavigation(): void;
```

**重置导航**

```typescript
function resetNavigation(): void;
```

---

## 9. 插件系统

### 9.1 插件接口

```typescript
interface Plugin {
  name: string;
  initialize?: (appContext: AppContext) => void;
  dispose?: () => void;
}
```

**示例**：
```typescript
const apiPlugin: Plugin = {
  name: 'api',
  initialize: (appContext) => {
    console.log('API plugin initialized');
  },
  dispose: () => {
    console.log('API plugin disposed');
  }
};
```

### 9.2 插件容器

```typescript
interface PluginContainer {
  get<T extends Plugin>(name: string): T | null;
  register(plugin: Plugin): void;
  unregister(name: string): void;
  dispose(): void;
}
```

**示例**：
```typescript
// 注册插件
appContext.plugins.register(apiPlugin);

// 获取插件
const api = appContext.plugins.get('api');

// 注销插件
appContext.plugins.unregister('api');

// 清理所有插件
appContext.plugins.dispose();
```

---

## 10. 工具函数

### 10.1 文本工具

**计算文本宽度**

```typescript
function calculateTextWidth(text: string, fontSize: number, fontWeight: string = 'normal'): number;
```

**参数**：
- `text`：文本
- `fontSize`：字体大小
- `fontWeight`：字体粗细

**返回值**：文本宽度

**计算文本高度**

```typescript
function calculateTextHeight(fontSize: number): number;
```

**参数**：
- `fontSize`：字体大小

**返回值**：文本高度

**计算换行文本高度**

```typescript
function calculateWrappedTextHeight(text: string, fontSize: number, maxWidth: number): number;
```

**参数**：
- `text`：文本
- `fontSize`：字体大小
- `maxWidth`：最大宽度

**返回值**：换行后的文本高度

### 10.2 颜色工具

**调整颜色亮度**

```typescript
function adjustColorBrightness(color: string, amount: number): string;
```

**参数**：
- `color`：颜色字符串
- `amount`：亮度调整量（-1 到 1）

**返回值**：调整后的颜色

### 10.3 主题工具

**从上下文获取主题**

```typescript
function getThemeFromContext(appContext?: AppContext): Theme;
```

**参数**：
- `appContext`：应用上下文（可选）

**返回值**：主题对象

---

## 11. 类型定义

### 11.1 核心类型

**尺寸**

```typescript
interface Size {
  width: number;
  height: number;
}
```

**约束**

```typescript
interface Constraints {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}
```

**脏矩形**

```typescript
interface DirtyRect {
  x: number;
  y: number;
  w: number;
  h: number;
}
```

### 11.2 渲染类型

**渲染器接口**

```typescript
interface Renderer {
  setRoot(node: ComposeNode): void;
  setAppContext(appContext: AppContext): void;
  markDirty(rect: DirtyRect): void;
  dispose(): void;
}
```

**绘制 API**

```typescript
interface DrawAPI {
  rect(x: number, y: number, w: number, h: number, options: { fill?: string; stroke?: string; strokeWidth?: number }): void;
  text(x: number, y: number, content: string, options: { font: string; color: string; align?: string; baseline?: string }): void;
  clip(rect: DirtyRect): void;
  transform(matrix: number[]): void;
  image(img: HTMLImageElement, x: number, y: number, w: number, h: number): void;
  save(): void;
  restore(): void;
}
```

### 11.3 事件类型

**事件处理器**

```typescript
type EventHandler = (...args: any[]) => void;
```

**手势类型**

```typescript
type GestureType = 'tap' | 'longPress' | 'drag' | 'pinch';
```

---

## 12. 错误处理

### 12.1 错误类型

**Signal 错误**

- `Error: Cannot access disposed signal`：尝试访问已销毁的信号
- `Error: Cannot set disposed signal`：尝试设置已销毁的信号
- `Error: Cannot subscribe to disposed signal`：尝试订阅已销毁的信号

**AppContext 错误**

- `Error: AppContext has been disposed`：尝试访问已销毁的 AppContext

**Composer 错误**

- `Error: Invalid composable function`：无效的可组合函数
- `Error: Composable function must return a ComposeNode`：可组合函数必须返回 ComposeNode

**Renderer 错误**

- `Error: Invalid canvas element`：无效的 Canvas 元素
- `Error: Could not get canvas context`：无法获取 Canvas 上下文

### 12.2 错误处理策略

**全局错误处理**

```typescript
appContext.addErrorHandler((error) => {
  console.error('App error:', error);
  // 错误上报逻辑
});
```

**局部错误处理**

```typescript
effect(() => {
  try {
    // 可能出错的代码
  } catch (error) {
    console.error('Local error:', error);
  }
});
```

**组件错误处理**

```typescript
class SafeComponent extends ComposeNode {
  draw(drawApi: DrawAPI): void {
    try {
      // 绘制逻辑
    } catch (error) {
      console.error('Component draw error:', error);
    }
  }
}
```

---

## 13. 性能优化

### 13.1 渲染优化

**批量更新**

```typescript
composer.batch(() => {
  // 多个状态更新
  count1.value = 1;
  count2.value = 2;
  count3.value = 3;
});
```

**按需渲染**

```typescript
// 只标记需要更新的节点
node.markDirty();

// 只重绘脏区域
renderer.markDirty({ x: node.x, y: node.y, w: node.width, h: node.height });
```

### 13.2 状态优化

**使用计算信号**

```typescript
// 避免重复计算
const total = computed(() => {
  return items.value.reduce((sum, item) => sum + item.value, 0);
});
```

**避免不必要的依赖**

```typescript
// 只依赖需要的属性
const userName = computed(() => user.value.name);
```

### 13.3 内存优化

**自动清理**

```typescript
// 信号会自动清理订阅者
signal.dispose();

// AppContext 会自动清理所有资源
appContext.dispose();
```

**限制导航历史**

```typescript
// 限制导航历史长度
const appContext = createAppContext({
  maxNavigationHistory: 50
});
```

---

## 14. 最佳实践

### 14.1 状态管理

- **使用信号进行状态管理**：`const count = signal(0);`
- **使用计算信号进行派生状态**：`const doubled = computed(() => count.value * 2);`
- **使用效果进行副作用**：`effect(() => console.log(count.value));`
- **持久化重要状态**：`const user = signal({}, { persistent: true, storageKey: 'user' });`

### 14.2 组件设计

- **使用函数创建组件**：`const button = ButtonComponent({ text: 'Click' });`
- **使用布局组件组织 UI**：`ColumnComponent({ children: [text, button] });`
- **处理组件错误**：在 `draw` 方法中添加 try-catch
- **优化渲染性能**：只在必要时标记节点为脏

### 14.3 导航管理

- **使用参数传递数据**：`navigateTo('details', { id: 123 });`
- **检查导航可能性**：`if (canNavigateBack()) navigateBack();`
- **清理导航资源**：在应用销毁时调用 `cleanupNavigation()`

### 14.4 测试

- **使用测试工具**：`const { signal, assertUpdates } = testSignal(0);`
- **测试组件**：`const { component, assertExists } = testComponent(() => new Button({}));`
- **模拟事件**：`const eventSystem = createMockEventSystem();`
- **模拟渲染**：`const renderer = new MockRenderer();`

---

## 15. 结论

本 API 参考文档提供了框架的完整 API 文档，包括核心模块、响应式系统、组合系统、渲染系统、事件系统、主题系统、组件库、导航系统和插件系统。通过这些 API，开发者可以构建功能丰富、性能优异的 Canvas 应用。

框架的设计理念是：简洁的 API、高效的渲染、灵活的架构，让开发者能够专注于业务逻辑的实现，而不是底层的渲染细节。