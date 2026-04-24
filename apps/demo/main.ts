import { RendererType } from '@pug/renderer';
import { renderApp } from './src/utils/renderUtils';

// 创建canvas元素
const canvas = document.getElementById('app') as HTMLCanvasElement;

if (!canvas) {
  console.error('Failed to get canvas element');
  throw new Error('Failed to get canvas element');
}

// 保持 renderer 引用，避免每次重新创建
let renderResult: any = null;

// 设置canvas大小为窗口大小
function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // 如果没有渲染过，首次渲染
  if (!renderResult) {
    renderResult = renderApp(RendererType.CANVAS_2D, {
      width: canvas.width,
      height: canvas.height,
      canvas: canvas
    });
  } else {
    // 只是调整 renderer 的大小，而不是重新创建
    renderResult.renderer.resize(canvas.width, canvas.height);
    renderResult.renderer.renderFrame();
  }
}

// 初始设置
setCanvasSize();

// 监听窗口大小变化
window.addEventListener('resize', setCanvasSize);
