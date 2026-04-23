import { ComposeNode } from '@pug/composer';
import { Renderer, RendererConfig } from './renderer-interface.js';
import { createCanvas } from 'canvas';

/**
 * NodeCanvas 渲染器实现
 * 用于服务器端渲染和测试
 */
export class NodeCanvasRenderer implements Renderer {
  config: RendererConfig;
  private canvas: any;
  private ctx: any;
  private rootNode: ComposeNode | null = null;
  private dirtyRects: Array<{ x: number; y: number; w: number; h: number }> = [];

  constructor(config: RendererConfig) {
    this.config = {
      ...config,
      pixelRatio: config.pixelRatio || 1,
    };

    // 创建 node-canvas 实例
    const pixelRatio = this.config.pixelRatio || 1;
    this.canvas = createCanvas(
      config.width * pixelRatio,
      config.height * pixelRatio
    );
    this.ctx = this.canvas.getContext('2d');
    
    // 应用像素比
    if (this.ctx) {
      this.ctx.scale(pixelRatio, pixelRatio);
    }
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