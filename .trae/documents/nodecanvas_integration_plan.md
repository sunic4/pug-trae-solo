# NodeCanvas 接入计划

## 1. 项目分析

### 当前渲染架构

项目采用了可扩展的渲染器架构，通过 `Renderer` 接口定义了渲染器的基本功能：

- **渲染器接口**：[renderer-interface.ts](file:///workspace/packages/renderer/src/renderer-interface.ts) 定义了统一的渲染器接口
- **Canvas 2D 实现**：[canvas-renderer.ts](file:///workspace/packages/renderer/src/canvas-renderer.ts) 实现了基于浏览器 Canvas 2D API 的渲染器
- **渲染器类型**：支持多种渲染后端，包括 Canvas 2D、WebGL、SVG、DOM、CanvasKit 和 Server

### NodeCanvas 简介

NodeCanvas 是一个 Node.js 库，提供了在服务器端使用 Canvas API 的能力，支持：

- 服务器端渲染 Canvas 内容
- 生成图片（PNG、JPEG 等格式）
- 支持基本的 Canvas 2D API 操作

## 2. 接入计划

### 2.1 安装依赖

首先需要安装 node-canvas 及其依赖：

```bash
# 安装 node-canvas 依赖（Ubuntu/Debian）
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# 安装 node-canvas 包
npm install canvas
```

### 2.2 实现 NodeCanvas 渲染器

创建新的渲染器实现文件 `nodecanvas-renderer.ts`：

- 实现 `Renderer` 接口
- 使用 node-canvas 创建 Canvas 实例
- 实现渲染逻辑
- 添加截图功能

### 2.3 扩展渲染器工厂

修改渲染器工厂或创建新的工厂函数，支持创建 NodeCanvas 渲染器：

- 在 `renderer-interface.ts` 中添加 `NODE_CANVAS` 类型
- 创建渲染器创建函数

### 2.4 实现测试工具

创建测试工具，用于：

- 渲染组件
- 生成截图
- 与预期结果比较
- 支持自动化测试

## 3. 具体实现步骤

### 步骤 1：安装依赖

```bash
# 安装 node-canvas 及其系统依赖
npm install canvas
```

### 步骤 2：创建 NodeCanvas 渲染器

**文件**：`packages/renderer/src/nodecanvas-renderer.ts`

```typescript
import { ComposeNode } from '@pug/composer';
import { Renderer, RendererConfig } from './renderer-interface.js';
import { createCanvas, CanvasRenderingContext2D } from 'canvas';

/**
 * NodeCanvas 渲染器实现
 * 用于服务器端渲染和测试
 */
export class NodeCanvasRenderer implements Renderer {
  config: RendererConfig;
  private canvas: any;
  private ctx: CanvasRenderingContext2D;
  private rootNode: ComposeNode | null = null;
  private dirtyRects: Array<{ x: number; y: number; w: number; h: number }> = [];

  constructor(config: RendererConfig) {
    this.config = {
      ...config,
      pixelRatio: config.pixelRatio || 1,
    };

    // 创建 node-canvas 实例
    this.canvas = createCanvas(
      config.width * this.config.pixelRatio,
      config.height * this.config.pixelRatio
    );
    this.ctx = this.canvas.getContext('2d');
    
    // 应用像素比
    this.ctx.scale(this.config.pixelRatio, this.config.pixelRatio);
  }

  setRoot(node: ComposeNode): void {
    this.rootNode = node;
    this.markDirty({ x: 0, y: 0, w: this.config.width, h: this.config.height });
  }

  markDirty(rect: { x: number; y: number; w: number; h: number }): void {
    this.dirtyRects.push(rect);
  }

  renderFrame(): void {
    if (this.dirtyRects.length === 0 || !this.rootNode) {
      return;
    }

    // 清除脏区域
    for (const rect of this.dirtyRects) {
      this.ctx.clearRect(rect.x, rect.y, rect.w, rect.h);
    }

    // 重新计算布局
    if (this.rootNode.layoutDirty) {
      const rootSize = this.rootNode.measure({
        minWidth: 0,
        maxWidth: this.config.width,
        minHeight: 0,
        maxHeight: this.config.height,
      });
      this.rootNode.place(0, 0, rootSize.width, rootSize.height);
    }

    // 绘制节点
    this.drawNode(this.rootNode);

    // 清空脏矩形
    this.dirtyRects = [];
  }

  private drawNode(node: ComposeNode): void {
    // 保存当前状态
    this.ctx.save();

    // 移动到节点的位置
    this.ctx.translate(node.x, node.y);

    // 调用节点的 draw 方法
    if (typeof node.draw === 'function') {
      node.draw(this.ctx);
    }

    // 恢复状态
    this.ctx.restore();

    // 递归绘制子节点
    for (const child of node.children) {
      this.drawNode(child);
    }
  }

  getContext(): any {
    return this.ctx;
  }

  dispose(): void {
    // 清理资源
  }

  /**
   * 生成截图
   * @param format 图片格式：'png' | 'jpeg' | 'webp'
   * @param quality 图片质量（0-1）
   * @returns 图片 Buffer
   */
  toBuffer(format: 'png' | 'jpeg' | 'webp' = 'png', quality: number = 1): Buffer {
    return this.canvas.toBuffer(`image/${format}`, { quality });
  }

  /**
   * 保存截图到文件
   * @param path 文件路径
   * @param format 图片格式
   * @param quality 图片质量
   */
  async saveToFile(path: string, format: 'png' | 'jpeg' | 'webp' = 'png', quality: number = 1): Promise<void> {
    const fs = await import('fs/promises');
    const buffer = this.toBuffer(format, quality);
    await fs.writeFile(path, buffer);
  }
}
```

### 步骤 3：扩展渲染器接口

**文件**：`packages/renderer/src/renderer-interface.ts`

```typescript
// 渲染器类型枚举
export enum RendererType {
  CANVAS_2D = 'canvas2d',
  WEBGL = 'webgl',
  SVG = 'svg',
  DOM = 'dom',
  CANVAS_KIT = 'canvas-kit',
  SERVER = 'server',
  NODE_CANVAS = 'node-canvas'  // 添加 NodeCanvas 类型
}
```

### 步骤 4：创建渲染器工厂

**文件**：`packages/renderer/src/renderer-factory.ts`

```typescript
import { Renderer, RendererConfig, RendererType } from './renderer-interface.js';
import { CanvasRenderer } from './canvas-renderer.js';
import { NodeCanvasRenderer } from './nodecanvas-renderer.js';

/**
 * 渲染器工厂
 */
export class RendererFactory {
  /**
   * 创建渲染器实例
   */
  static create(type: RendererType, config: RendererConfig): Renderer {
    switch (type) {
      case RendererType.CANVAS_2D:
        if (typeof window === 'undefined') {
          throw new Error('Canvas 2D renderer requires browser environment');
        }
        const canvas = document.createElement('canvas');
        canvas.width = config.width;
        canvas.height = config.height;
        return new CanvasRenderer(canvas);
      
      case RendererType.NODE_CANVAS:
        return new NodeCanvasRenderer(config);
      
      default:
        throw new Error(`Renderer type ${type} not implemented`);
    }
  }
}
```

### 步骤 5：更新渲染器导出

**文件**：`packages/renderer/src/index.ts`

```typescript
export * from './renderer-interface.js';
export * from './canvas-renderer.js';
export * from './nodecanvas-renderer.js';
export * from './renderer-factory.js';
export * from './draw-command.js';
export * from './dirty-rect.js';
export * from './text-layout.js';
```

### 步骤 6：创建测试工具

**文件**：`packages/renderer/src/test-utils.ts`

```typescript
import { ComposeNode } from '@pug/composer';
import { RendererFactory, RendererType } from './renderer-factory.js';

/**
 * 渲染组件并生成截图
 * @param component 要渲染的组件
 * @param options 渲染选项
 * @returns 截图 Buffer
 */
export async function renderComponent(
  component: ComposeNode,
  options: {
    width: number;
    height: number;
    format?: 'png' | 'jpeg' | 'webp';
    quality?: number;
  }
) {
  const { width, height, format = 'png', quality = 1 } = options;

  // 创建 NodeCanvas 渲染器
  const renderer = RendererFactory.create(RendererType.NODE_CANVAS, {
    width,
    height,
  });

  // 设置根节点
  renderer.setRoot(component);

  // 渲染一帧
  renderer.renderFrame();

  // 生成截图
  const buffer = (renderer as any).toBuffer(format, quality);

  // 销毁渲染器
  renderer.dispose();

  return buffer;
}

/**
 * 保存组件截图到文件
 * @param component 要渲染的组件
 * @param path 文件路径
 * @param options 渲染选项
 */
export async function saveComponentScreenshot(
  component: ComposeNode,
  path: string,
  options: {
    width: number;
    height: number;
    format?: 'png' | 'jpeg' | 'webp';
    quality?: number;
  }
) {
  const { width, height, format = 'png', quality = 1 } = options;

  // 创建 NodeCanvas 渲染器
  const renderer = RendererFactory.create(RendererType.NODE_CANVAS, {
    width,
    height,
  });

  // 设置根节点
  renderer.setRoot(component);

  // 渲染一帧
  renderer.renderFrame();

  // 保存截图
  await (renderer as any).saveToFile(path, format, quality);

  // 销毁渲染器
  renderer.dispose();
}
```

### 步骤 7：创建示例测试

**文件**：`packages/renderer/tests/nodecanvas.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { TextComponent, ButtonComponent } from '@pug/components';
import { renderComponent, saveComponentScreenshot } from '../src/test-utils.js';

describe('NodeCanvas Renderer', () => {
  it('should render Text component', async () => {
    const text = TextComponent({ text: 'Hello World', fontSize: 24 });
    const buffer = await renderComponent(text, {
      width: 400,
      height: 100,
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should render Button component', async () => {
    const button = ButtonComponent({ text: 'Click Me', variant: 'primary' });
    const buffer = await renderComponent(button, {
      width: 200,
      height: 60,
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should save screenshot to file', async () => {
    const text = TextComponent({ text: 'Test Screenshot', fontSize: 18 });
    const path = './test-screenshot.png';
    await saveComponentScreenshot(text, path, {
      width: 300,
      height: 80,
    });
    
    // 验证文件存在
    const fs = await import('fs/promises');
    const exists = await fs.access(path).then(() => true).catch(() => false);
    expect(exists).toBe(true);
    
    // 清理测试文件
    if (exists) {
      await fs.unlink(path);
    }
  });
});
```

## 4. 依赖和风险

### 4.1 依赖

- **node-canvas**：用于服务器端 Canvas 渲染
- **fs/promises**：用于文件操作（Node.js 内置）

### 4.2 风险

1. **系统依赖**：node-canvas 需要系统级依赖（如 Cairo），可能在某些环境中安装困难
2. **性能**：服务器端渲染可能比浏览器渲染慢，特别是复杂组件
3. **API 兼容性**：node-canvas 的 API 与浏览器 Canvas API 可能存在细微差异
4. **内存使用**：渲染大型组件可能消耗较多内存

### 4.3 解决方案

1. **系统依赖**：提供详细的安装指南，支持 Docker 容器化部署
2. **性能**：对于测试，渲染速度通常不是关键问题；对于生产环境，可以考虑缓存渲染结果
3. **API 兼容性**：在实现中处理 API 差异，确保组件在不同渲染器下表现一致
4. **内存使用**：及时销毁渲染器实例，避免内存泄漏

## 5. 测试和验证

### 5.1 单元测试

- 测试 NodeCanvas 渲染器的基本功能
- 测试截图生成功能
- 测试与现有组件的兼容性

### 5.2 集成测试

- 测试完整的渲染流程
- 测试与测试框架的集成
- 测试自动化截图对比

### 5.3 验证步骤

1. 安装所有依赖
2. 运行单元测试：`npm test`
3. 运行集成测试：`npm run test:integration`
4. 手动验证生成的截图质量

## 6. 总结

本计划提供了一个完整的方案，用于接入 nodecanvas 作为后端渲染器，并实现截图功能用于测试。通过实现新的渲染器和测试工具，我们可以在服务器端渲染组件并生成截图，这对于自动化测试、视觉回归测试和文档生成都非常有用。

该方案利用了项目现有的渲染器架构，通过扩展接口和实现新的渲染器，实现了与现有代码的无缝集成。同时，提供了简洁的 API 用于生成和保存截图，方便在测试中使用。