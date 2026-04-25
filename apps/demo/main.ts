import { createAppContext } from '@pug/core';
import { CanvasRenderer } from '@pug/renderer';
import { defaultTheme } from '@pug/theme';
import { App } from './src/App';

// 创建canvas元素
const canvas = document.getElementById('app') as HTMLCanvasElement;

if (!canvas) {
  console.error('Failed to get canvas element');
  throw new Error('Failed to get canvas element');
}

// 设置 canvas 大小
const width = window.innerWidth;
const height = window.innerHeight;
canvas.width = width;
canvas.height = height;

// 创建渲染器
const renderer = new CanvasRenderer(canvas, {
  width,
  height
});

// 创建 AppContext
const appContext = createAppContext({
  theme: defaultTheme,
  renderer
});

// 传递 AppContext 给渲染器
renderer.setAppContext(appContext);

// 创建根组件
const rootNode = appContext.composer.startCompose(() => {
  return App(appContext);
});

// 设置根节点
renderer.setRoot(rootNode);

// 初始渲染
renderer.markDirty({ x: 0, y: 0, w: width, h: height });

// 监听窗口大小变化
const handleResize = () => {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;
  canvas.width = newWidth;
  canvas.height = newHeight;
  renderer.config.width = newWidth;
  renderer.config.height = newHeight;
  renderer.markDirty({ x: 0, y: 0, w: newWidth, h: newHeight });
};

window.addEventListener('resize', handleResize);

// 清理函数
const cleanup = () => {
  window.removeEventListener('resize', handleResize);
  renderer.dispose();
  appContext.dispose();
};

// 应用清理
window.addEventListener('unload', cleanup);
