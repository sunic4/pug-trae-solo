import { bootstrap } from './src/bootstrap';

// 创建canvas元素
const canvas = document.getElementById('app') as HTMLCanvasElement;

if (!canvas) {
  console.error('Failed to get canvas element');
  throw new Error('Failed to get canvas element');
}

// 使用 bootstrap 函数启动应用
const cleanup = bootstrap({
  canvas,
  width: window.innerWidth,
  height: window.innerHeight
});

// 监听窗口大小变化（已在 bootstrap 中处理）

// 应用清理
window.addEventListener('unload', cleanup);
