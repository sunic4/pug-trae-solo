import { RendererType } from '@pug/renderer';
import { renderApp } from './src/utils/renderUtils';

// 创建canvas元素
const canvas = document.getElementById('app') as HTMLCanvasElement;

if (!canvas) {
  console.error('Failed to get canvas element');
  throw new Error('Failed to get canvas element');
}

// 渲染应用
renderApp(RendererType.CANVAS_2D, {
  width: canvas.width,
  height: canvas.height,
  canvas: canvas
});
