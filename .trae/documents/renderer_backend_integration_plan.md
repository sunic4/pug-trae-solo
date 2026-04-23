# 渲染后端与组件解耦计划

## 1. 项目分析

### 当前渲染架构

项目采用了可扩展的渲染器架构，通过 `Renderer` 接口定义了渲染器的基本功能：

- **渲染器接口**：[renderer-interface.ts](file:///workspace/packages/renderer/src/renderer-interface.ts) 定义了统一的渲染器接口
- **Canvas 2D 实现**：[canvas-renderer.ts](file:///workspace/packages/renderer/src/canvas-renderer.ts) 实现了基于浏览器 Canvas 2D API 的渲染器
- **NodeCanvas 实现**：[nodecanvas-renderer.ts](file:///workspace/packages/renderer/src/nodecanvas-renderer.ts) 实现了基于 Node.js Canvas 的渲染器
- **渲染器工厂**：[renderer-factory.ts](file:///workspace/packages/renderer/src/renderer-factory.ts) 用于创建不同类型的渲染器

### 组件架构

组件通过 `ComposeNode` 基类实现，包含以下核心方法：

- `measure()`：计算组件的尺寸
- `place()`：定位组件
- `draw()`：绘制组件

组件的绘制逻辑依赖于 Canvas 2D API 的上下文对象（`CanvasRenderingContext2D`），这可能会导致组件与特定渲染后端的耦合。

## 2. 解耦方案

### 2.1 目标

- 渲染后端与组件完全解耦
- 相同的组件代码可以在不同的渲染后端上运行
- 构建示例不需要修改就可以直接接入到不同的后端

### 2.2 实现方案

#### 1. 抽象绘制接口

创建一个抽象的绘制接口，封装不同渲染后端的差异：

- 定义统一的绘制操作（绘制矩形、文本、路径等）
- 为每个渲染后端实现对应的绘制操作
- 组件使用抽象绘制接口，而不是直接使用 Canvas 2D API

#### 2. 渲染上下文注入

- 在渲染器中创建渲染上下文
- 将渲染上下文传递给组件的 `draw()` 方法
- 组件使用渲染上下文进行绘制，而不是直接使用 Canvas API

#### 3. 渲染器工厂扩展

- 扩展渲染器工厂，支持更多的渲染后端
- 提供统一的渲染器创建接口
- 允许在运行时切换渲染后端

## 3. 具体实现步骤

### 步骤 1：创建抽象绘制接口

**文件**：`packages/renderer/src/draw-api.ts`

```typescript
/**
 * 抽象绘制接口
 * 封装不同渲染后端的绘制操作
 */
export interface DrawAPI {
  // 颜色操作
  setFillStyle(color: string | CanvasGradient | CanvasPattern): void;
  setStrokeStyle(color: string | CanvasGradient | CanvasPattern): void;
  setLineWidth(width: number): void;
  
  // 基本形状
  fillRect(x: number, y: number, width: number, height: number): void;
  strokeRect(x: number, y: number, width: number, height: number): void;
  clearRect(x: number, y: number, width: number, height: number): void;
  
  // 文本
  setFont(font: string): void;
  setTextAlign(align: CanvasTextAlign): void;
  setTextBaseline(baseline: CanvasTextBaseline): void;
  fillText(text: string, x: number, y: number, maxWidth?: number): void;
  measureText(text: string): TextMetrics;
  
  // 路径
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
  closePath(): void;
  fill(): void;
  stroke(): void;
  
  // 状态管理
  save(): void;
  restore(): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
  scale(x: number, y: number): void;
}

/**
 * Canvas 2D 绘制 API 实现
 */
export class Canvas2DDrawAPI implements DrawAPI {
  constructor(private ctx: CanvasRenderingContext2D) {}
  
  // 实现所有 DrawAPI 方法...
  setFillStyle(color: string | CanvasGradient | CanvasPattern): void {
    this.ctx.fillStyle = color;
  }
  
  setStrokeStyle(color: string | CanvasGradient | CanvasPattern): void {
    this.ctx.strokeStyle = color;
  }
  
  setLineWidth(width: number): void {
    this.ctx.lineWidth = width;
  }
  
  fillRect(x: number, y: number, width: number, height: number): void {
    this.ctx.fillRect(x, y, width, height);
  }
  
  // 其他方法实现...
}

/**
 * NodeCanvas 绘制 API 实现
 */
export class NodeCanvasDrawAPI implements DrawAPI {
  constructor(private ctx: any) {}
  
  // 实现所有 DrawAPI 方法...
  setFillStyle(color: string | CanvasGradient | CanvasPattern): void {
    this.ctx.fillStyle = color;
  }
  
  // 其他方法实现...
}
```

### 步骤 2：修改组件基类

**文件**：`packages/composer/src/node.ts`

```typescript
import { DrawAPI } from '@pug/renderer';

export abstract class ComposeNode {
  // 其他属性和方法...
  
  /**
   * 绘制组件
   * @param drawApi 绘制 API
   */
  abstract draw(drawApi: DrawAPI): void;
}
```

### 步骤 3：修改渲染器实现

**文件**：`packages/renderer/src/canvas-renderer.ts`

```typescript
import { Canvas2DDrawAPI } from './draw-api.js';

// 修改 drawNode 方法
private drawNode(node: ComposeNode): void {
  if (node.dirty) {
    // 保存当前状态
    this.ctx.save();
    
    // 移动到节点的位置
    this.ctx.translate(node.x, node.y);
    
    // 创建绘制 API 实例
    const drawApi = new Canvas2DDrawAPI(this.ctx);
    
    // 调用节点的 draw 方法
    node.draw(drawApi);
    
    // 恢复状态
    this.ctx.restore();
  }
  
  // 递归绘制子节点
  for (const child of node.children) {
    this.drawNode(child);
  }
}
```

**文件**：`packages/renderer/src/nodecanvas-renderer.ts`

```typescript
import { NodeCanvasDrawAPI } from './draw-api.js';

// 修改 drawNode 方法
private drawNode(node: ComposeNode): void {
  if (node.dirty) {
    // 保存当前状态
    this.ctx.save();
    
    // 移动到节点的位置
    this.ctx.translate(node.x, node.y);
    
    // 创建绘制 API 实例
    const drawApi = new NodeCanvasDrawAPI(this.ctx);
    
    // 调用节点的 draw 方法
    node.draw(drawApi);
    
    // 恢复状态
    this.ctx.restore();
  }
  
  // 递归绘制子节点
  for (const child of node.children) {
    this.drawNode(child);
  }
}
```

### 步骤 4：修改现有组件

修改所有组件的 `draw` 方法，使用 `DrawAPI` 而不是直接使用 Canvas 2D API。

**文件**：`packages/components/src/text.ts`

```typescript
draw(drawApi: DrawAPI): void {
  const theme = useTheme();
  const fontSize = this.props.fontSize || theme.typography.fontSize.base;
  const fontWeight = this.props.fontWeight || theme.typography.fontWeight.normal;
  const fontFamily = theme.typography.fontFamily;
  const color = this.props.color || theme.colors.text;
  
  drawApi.setFont(`${fontWeight} ${fontSize}px ${fontFamily}`);
  drawApi.setFillStyle(color);
  drawApi.setTextAlign(this.props.textAlign || 'left');
  drawApi.fillText(this.props.text, 0, fontSize);
}
```

**文件**：`packages/components/src/button.ts`

```typescript
draw(drawApi: DrawAPI): void {
  const theme = useTheme();
  const { backgroundColor, textColor } = this.getColors();
  const borderRadius = 8;
  
  // 绘制按钮背景
  drawApi.setFillStyle(backgroundColor);
  drawApi.beginPath();
  drawApi.roundRect(0, 0, this.width, this.height, borderRadius);
  drawApi.fill();
  
  // 绘制按钮文本
  this.textNode.draw(drawApi);
}
```

### 步骤 5：创建多后端示例应用

**文件**：`apps/multi-renderer-demo/main.ts`

```typescript
import { Composer } from '@pug/composer';
import { RendererFactory, RendererType } from '@pug/renderer';
import { TextComponent, ButtonComponent, ColumnComponent, BoxComponent } from '@pug/components';
import { useTheme } from '@pug/theme';

// 共享的组件树
function App() {
  const theme = useTheme();
  
  return BoxComponent({
    backgroundColor: theme.colors.background,
    width: 400,
    height: 300,
    padding: 20,
    children: [
      TextComponent({
        text: 'Multi-Renderer Demo',
        fontSize: 24,
        fontWeight: 600,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 20,
      }),
      ColumnComponent({
        spacing: 15,
        children: [
          ButtonComponent({
            text: 'Primary Button',
            variant: 'primary',
            onClick: () => console.log('Primary button clicked'),
          }),
          ButtonComponent({
            text: 'Secondary Button',
            variant: 'secondary',
            onClick: () => console.log('Secondary button clicked'),
          }),
          TextComponent({
            text: 'This app works on multiple renderers!',
            fontSize: 16,
            color: theme.colors.text,
          }),
        ],
      }),
    ],
  });
}

// 渲染到浏览器 Canvas
function renderToBrowserCanvas() {
  const canvas = document.getElementById('browser-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  
  const composer = new Composer();
  const rootNode = composer.startCompose(App);
  composer.endCompose();
  composer.recompose();
  
  const renderer = RendererFactory.create(RendererType.CANVAS_2D, {
    width: canvas.width,
    height: canvas.height,
  });
  renderer.setRoot(rootNode);
}

// 渲染到 NodeCanvas（服务器端）
async function renderToNodeCanvas() {
  const composer = new Composer();
  const rootNode = composer.startCompose(App);
  composer.endCompose();
  composer.recompose();
  
  const renderer = RendererFactory.create(RendererType.NODE_CANVAS, {
    width: 400,
    height: 300,
  });
  renderer.setRoot(rootNode);
  renderer.renderFrame();
  
  // 保存截图
  await (renderer as any).saveToFile('./nodecanvas-demo.png');
  console.log('NodeCanvas rendering saved to nodecanvas-demo.png');
}

// 导出渲染函数
export { renderToBrowserCanvas, renderToNodeCanvas };
```

**文件**：`apps/multi-renderer-demo/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Multi-Renderer Demo</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
    }
    .canvas-container {
      margin: 20px 0;
      padding: 10px;
      border: 1px solid #ddd;
    }
    h2 {
      margin-top: 40px;
    }
  </style>
</head>
<body>
  <h1>Multi-Renderer Demo</h1>
  <p>This demo shows the same app running on different renderers.</p>
  
  <h2>Browser Canvas Renderer</h2>
  <div class="canvas-container">
    <canvas id="browser-canvas" width="400" height="300"></canvas>
  </div>
  
  <h2>NodeCanvas Renderer</h2>
  <p>NodeCanvas rendering is done on the server. Check the console for the output file path.</p>
  
  <script type="module" src="./main.ts"></script>
  <script type="module">
    import { renderToBrowserCanvas } from './main.ts';
    renderToBrowserCanvas();
  </script>
</body>
</html>
```

### 步骤 6：创建服务器端渲染脚本

**文件**：`apps/multi-renderer-demo/server.ts`

```typescript
import { renderToNodeCanvas } from './main.ts';

console.log('Rendering app to NodeCanvas...');
renderToNodeCanvas().then(() => {
  console.log('Rendering completed successfully!');
}).catch((error) => {
  console.error('Rendering failed:', error);
});
```

## 4. 依赖和风险

### 4.1 依赖

- **node-canvas**：用于 Node.js 环境的 Canvas 渲染
- **TypeScript**：用于类型安全
- **Vite**：用于构建和开发

### 4.2 风险

1. **API 兼容性**：不同渲染后端的 API 可能存在差异，需要确保抽象接口能够覆盖所有必要的功能
2. **性能**：抽象接口可能会带来一定的性能开销，需要在设计时考虑性能优化
3. **复杂度**：增加抽象层会增加代码复杂度，需要确保代码结构清晰

### 4.3 解决方案

1. **API 兼容性**：
   - 仔细设计抽象接口，确保它能够覆盖所有渲染后端的共同功能
   - 为不同的渲染后端提供特定的扩展
   - 处理边缘情况和 API 差异

2. **性能**：
   - 避免在绘制过程中创建过多的临时对象
   - 缓存常用的绘制操作
   - 优化渲染管道

3. **复杂度**：
   - 保持抽象接口简洁明了
   - 提供详细的文档和示例
   - 编写单元测试确保各个渲染后端的兼容性

## 5. 测试和验证

### 5.1 单元测试

- 测试抽象绘制接口的实现
- 测试组件在不同渲染后端上的表现
- 测试渲染器工厂的功能

### 5.2 集成测试

- 测试完整的渲染流程
- 测试在不同环境下的渲染结果一致性
- 测试性能和内存使用

### 5.3 验证步骤

1. 运行浏览器渲染示例：`npm run dev -- --port 3000`
2. 运行 Node.js 渲染示例：`node server.ts`
3. 比较不同渲染后端生成的结果
4. 验证组件在不同渲染后端上的行为一致

## 6. 总结

本计划提供了一个完整的方案，用于实现渲染后端与组件的解耦，使得相同的组件代码可以在不同的渲染后端上运行。通过创建抽象绘制接口，我们可以封装不同渲染后端的差异，让组件专注于业务逻辑而不是渲染细节。

该方案利用了项目现有的渲染器架构，通过扩展接口和实现新的抽象层，实现了与现有代码的无缝集成。同时，提供了详细的示例应用，展示如何在不同的渲染后端上运行相同的组件。

通过这种方式，我们可以轻松地添加新的渲染后端，而不需要修改现有的组件代码，从而提高了代码的可维护性和可扩展性。