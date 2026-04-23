import { RendererType } from '@pug/renderer';
import { renderApp } from './src/utils/renderUtils';

// 渲染应用
const { renderer } = renderApp(RendererType.NODE_CANVAS, {
  width: 400,
  height: 1000
});

// 保存截图
const path = require('path');
const outputPath = path.join(__dirname, 'demo-screenshot.png');

// 使用 NodeCanvasRenderer 的 saveToFile 方法保存截图
(renderer as any).saveToFile(outputPath).then(() => {
  console.log(`Screenshot saved to ${outputPath}`);
}).catch((error: any) => {
  console.error('Failed to save screenshot:', error);
});
