import { describe, it, expect } from 'vitest';
import { TextComponent } from '../src/text';
import { createTestAppContext } from '@pug/core';

describe('TextComponent', () => {
  it('should create a text component with correct props', () => {
    // 创建测试用的 AppContext
    const appContext = createTestAppContext();
    
    // 创建文本组件
    const text = TextComponent({
      appContext,
      text: 'Test Text',
      fontSize: 16,
      fontWeight: 500,
      color: '#333333',
      textAlign: 'center'
    });
    
    // 验证文本属性
    expect(text.props.text).toBe('Test Text');
    expect(text.props.fontSize).toBe(16);
    expect(text.props.fontWeight).toBe(500);
    expect(text.props.color).toBe('#333333');
    expect(text.props.textAlign).toBe('center');
  });
  
  it('should have appContext set', () => {
    // 创建测试用的 AppContext
    const appContext = createTestAppContext();
    
    // 创建文本组件
    const text = TextComponent({
      appContext,
      text: 'Test Text'
    });
    
    // 验证 appContext 被正确设置
    expect(text.appContext).toBe(appContext);
  });
  
  it('should use default values for optional props', () => {
    // 创建测试用的 AppContext
    const appContext = createTestAppContext();
    
    // 创建文本组件，只设置必要的属性
    const text = TextComponent({
      appContext,
      text: 'Test Text'
    });
    
    // 验证必要属性
    expect(text.props.text).toBe('Test Text');
    // 可选属性应该是 undefined
    expect(text.props.fontSize).toBeUndefined();
    expect(text.props.fontWeight).toBeUndefined();
    expect(text.props.color).toBeUndefined();
    expect(text.props.textAlign).toBeUndefined();
  });
});
