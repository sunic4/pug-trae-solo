import { describe, it, expect } from 'vitest';
import { TextComponent, ButtonComponent } from '@pug/components';
import { renderComponent, saveComponentScreenshot } from '../src/test-utils.js';

describe('NodeCanvas Renderer', () => {
  it('should render Text component', async () => {
    const text = TextComponent({ text: 'Hello World', fontSize: 24 });
    const buffer = await renderComponent(text, {
      width: 400,
      height: 100,
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should render Button component', async () => {
    const button = ButtonComponent({ text: 'Click Me', variant: 'primary' });
    const buffer = await renderComponent(button, {
      width: 200,
      height: 60,
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should save screenshot to file', async () => {
    const text = TextComponent({ text: 'Test Screenshot', fontSize: 18 });
    const path = './test-screenshot.png';
    await saveComponentScreenshot(text, path, {
      width: 300,
      height: 80,
    });
    
    // 验证文件存在
    const fs = await import('fs/promises');
    const exists = await fs.access(path).then(() => true).catch(() => false);
    expect(exists).toBe(true);
    
    // 清理测试文件
    if (exists) {
      await fs.unlink(path);
    }
  });
});