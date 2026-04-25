import { ComposeNode } from '@pug/composer';
import { DrawCommand, executeDrawCommand } from './draw-command';
import { DirtyRect } from './dirty-rect';
import { Canvas2DDrawAPI } from './draw-api';
import { Renderer, RendererConfig } from './renderer-interface';
import { AppContext } from '@pug/core';

export class CanvasRenderer implements Renderer {
  config: RendererConfig;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dirtyRects: DirtyRect[] = [];
  private rootNode: ComposeNode | null = null;
  private animationFrameId: number | null = null;
  private appContext: AppContext | null = null;

  constructor(canvas: HTMLCanvasElement, config?: Partial<RendererConfig>, appContext?: AppContext) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    this.ctx = ctx;
    this.config = {
      width: canvas.width,
      height: canvas.height,
      pixelRatio: window.devicePixelRatio || 1,
      debug: false,
      ...config
    };
    this.appContext = appContext || null;
    this.startFrameLoop();
  }

  setRoot(node: ComposeNode): void {
    this.rootNode = node;
    // 传递 appContext 给根节点
    if (this.appContext) {
      node.appContext = this.appContext;
    }
    this.markDirty({ x: 0, y: 0, w: this.canvas.width, h: this.canvas.height });
  }

  setAppContext(appContext: AppContext): void {
    this.appContext = appContext;
    // 传递 appContext 给根节点
    if (this.rootNode) {
      this.rootNode.appContext = appContext;
    }
  }

  markDirty(rect: DirtyRect): void {
    this.dirtyRects.push(rect);
  }

  private startFrameLoop(): void {
    const frameLoop = () => {
      if (this.dirtyRects.length > 0) {
        this.renderFrame();
      }
      this.animationFrameId = requestAnimationFrame(frameLoop);
    };
    frameLoop();
  }

  renderFrame(): void {
    // 只清除脏区域，而不是整个画布
    if (this.dirtyRects.length > 0) {
      for (const rect of this.dirtyRects) {
        this.ctx.clearRect(rect.x, rect.y, rect.w, rect.h);
      }
    }

    // 绘制所有节点
    if (this.rootNode) {
      // 检查是否需要重新计算整个布局
      if (this.rootNode.layoutDirty) {
        // 对根节点进行布局计算
        const rootSize = this.rootNode.measure({
          minWidth: 0,
          maxWidth: this.canvas.width,
          minHeight: 0,
          maxHeight: this.canvas.height
        });
        this.rootNode.place(0, 0, rootSize.width, rootSize.height);
      } else {
        // 只对脏节点进行布局计算
        this.updateDirtyNodesLayout(this.rootNode);
      }
      
      // 绘制所有节点，不管是否是脏的（确保初始渲染完整）
      this.drawAllNodes(this.rootNode);
    }

    // 清空脏矩形
    this.dirtyRects = [];
  }

  private drawAllNodes(node: ComposeNode): void {
    // 保存当前状态
    this.ctx.save();
    
    // 移动到节点的位置
    this.ctx.translate(node.x, node.y);
    
    // 只绘制脏节点，初始渲染时所有节点都是脏的
    if (node.dirty) {
      // 优先使用 draw 方法，如果没有则使用 drawCommands 方法
      if (typeof node.draw === 'function') {
        const drawApi = new Canvas2DDrawAPI(this.ctx);
        node.draw(drawApi);
      } else if (typeof node.drawCommands === 'function') {
        const commands = node.drawCommands();
        this.drawCommands(commands);
      }
      
      // 清除节点的脏标记
      node.clearDirty();
    }
    
    // 恢复状态
    this.ctx.restore();
    
    // 递归绘制子节点
    for (const child of node.children) {
      this.drawAllNodes(child);
    }
  }

  private updateDirtyNodesLayout(node: ComposeNode): void {
    if (node.layoutDirty) {
      // 重新计算当前节点的布局
      const parent = node.parent;
      if (parent) {
        // 获取父节点的约束
        const constraints = {
          minWidth: 0,
          maxWidth: parent.width,
          minHeight: 0,
          maxHeight: parent.height
        };
        const nodeSize = node.measure(constraints);
        // 重新放置节点
        // 注意：这里简化处理，实际应该根据父节点的布局逻辑重新计算位置
        node.place(node.x, node.y, nodeSize.width, nodeSize.height);
      }
    }
    
    // 递归处理子节点
    for (const child of node.children) {
      this.updateDirtyNodesLayout(child);
    }
  }

  drawCommands(commands: DrawCommand[]): void {
    for (const cmd of commands) {
      executeDrawCommand(this.ctx, cmd);
    }
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  dispose(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    // 清除 rootNode 引用，避免内存泄漏
    this.rootNode = null;
    // 清空脏矩形
    this.dirtyRects = [];
  }
}
