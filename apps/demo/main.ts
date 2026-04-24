import { RendererType } from '@pug/renderer';
import { renderApp } from './src/utils/renderUtils';

// 创建canvas元素
const canvas = document.getElementById('app') as HTMLCanvasElement;

if (!canvas) {
  console.error('Failed to get canvas element');
  throw new Error('Failed to get canvas element');
}

// 设置canvas大小为窗口大小
function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // 重新渲染应用
  renderApp(RendererType.CANVAS_2D, {
    width: canvas.width,
    height: canvas.height,
    canvas: canvas
  });
}

// 初始设置
setCanvasSize();

// 监听窗口大小变化
window.addEventListener('resize', setCanvasSize);
