import { ComposeNode } from '@pug/composer';

// 渲染器配置接口
export interface RendererConfig {
  width: number;
  height: number;
  pixelRatio?: number;
  debug?: boolean;
}

// 渲染器公共接口
export interface Renderer {
  config: RendererConfig;
  
  // 设置根节点
  setRoot(node: ComposeNode): void;
  
  // 渲染一帧
  renderFrame(): void;
  
  // 标记区域为脏
  markDirty(rect: { x: number; y: number; w: number; h: number }): void;
  
  // 获取渲染上下文（取决于具体实现）
  getContext(): any;
  
  // 销毁渲染器
  dispose(): void;
}

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
