import { createCanvas } from 'canvas';

// 测试简单的 Canvas 绘制
async function testCanvas() {
  console.log('Testing NodeCanvas...');
  
  // 创建 canvas 实例
  const canvas = createCanvas(400, 300);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Could not get canvas context');
    return;
  }
  
  // 绘制背景
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, 400, 300);
  
  // 绘制标题
  ctx.font = '24px Arial';
  ctx.fillStyle = '#333333';
  ctx.textAlign = 'center';
  ctx.fillText('NodeCanvas Test', 200, 50);
  
  // 绘制按钮
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(150, 100, 100, 40);
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText('Button', 200, 125);
  
  // 绘制文本
  ctx.fillStyle = '#333333';
  ctx.font = '14px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('This is a test of NodeCanvas rendering', 50, 200);
  
  // 保存到文件
  const fs = await import('fs/promises');
  const buffer = canvas.toBuffer('image/png');
  await fs.writeFile('./nodecanvas-test-simple.png', buffer);
  
  console.log('Test completed successfully!');
  console.log('Screenshot saved to nodecanvas-test-simple.png');
}

testCanvas().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});