import { describe, it, expect, vi } from 'vitest';
import { ButtonComponent } from '../src/button';
import { createTestAppContext } from '@pug/core';

describe('ButtonComponent', () => {
  it('should create a button with correct props', () => {
    // 创建测试用的 AppContext
    const appContext = createTestAppContext();
    
    // 模拟点击事件
    const onClick = vi.fn();
    
    // 创建按钮组件
    const button = ButtonComponent({
      appContext,
      text: 'Test Button',
      onClick,
      variant: 'primary',
      size: 'base'
    });
    
    // 验证按钮属性
    expect(button.props.text).toBe('Test Button');
    expect(button.props.variant).toBe('primary');
    expect(button.props.size).toBe('base');
    
    // 验证点击事件
    expect(button.handlers['click']).toBeDefined();
    
    // 模拟点击
    button.handlers['click'](0, 0);
    expect(onClick).toHaveBeenCalled();
  });
  
  it('should handle disabled state', () => {
    // 创建测试用的 AppContext
    const appContext = createTestAppContext();
    
    // 模拟点击事件
    const onClick = vi.fn();
    
    // 创建禁用的按钮
    const button = ButtonComponent({
      appContext,
      text: 'Disabled Button',
      onClick,
      disabled: true
    });
    
    // 模拟点击
    button.handlers['click'](0, 0);
    // 点击事件不应被调用
    expect(onClick).not.toHaveBeenCalled();
  });
  
  it('should have appContext set', () => {
    // 创建测试用的 AppContext
    const appContext = createTestAppContext();
    
    // 创建按钮组件
    const button = ButtonComponent({
      appContext,
      text: 'Test Button'
    });
    
    // 验证 appContext 被正确设置
    expect(button.appContext).toBe(appContext);
  });
});
