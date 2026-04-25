import { ComposeNode } from '@pug/composer';
import { DrawAPI } from '@pug/renderer';
import { drawRoundedRect, getThemeFromContext } from './utils';
import { AppContext } from '@pug/core';

export interface TextInputProps {
  value: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  appContext?: AppContext;
}

export class TextInput extends ComposeNode<TextInputProps> {
  private isFocused = false;

  constructor(props: TextInputProps, key?: string) {
    super(key, props, props.appContext);
    this.handlers['click'] = (x: number, y: number) => this.onClick(x, y);
    this.markLayoutDirty();
  }

  private onClick(_x: number, _y: number) {
    // 处理点击事件，获取焦点
    this.isFocused = true;
    this.markDirty();
  }



  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width = 200, height = 40 } = this.props;

    return { 
      width: Math.min(width, constraints.maxWidth), 
      height: Math.min(height, constraints.maxHeight) 
    };
  }

  place(x: number, y: number, width: number, height: number) {
    const thisX = x + (this.props.x || 0);
    const thisY = y + (this.props.y || 0);
    super.place(thisX, thisY, width, height);
  }

  draw(drawApi: DrawAPI) {
    const theme = getThemeFromContext(this.appContext);
    const { value, placeholder } = this.props;
    const borderRadius = theme.borderRadius.base;

    // 绘制输入框背景
    drawApi.setFillStyle(this.isFocused ? theme.colors.surface : theme.colors.background);
    drawApi.setStrokeStyle(this.isFocused ? theme.colors.primary : theme.colors.border);
    drawApi.setLineWidth(1);
    drawRoundedRect(drawApi, 0, 0, this.width, this.height, borderRadius);
    drawApi.fill();
    drawApi.stroke();

    // 绘制文本
    drawApi.setFillStyle(theme.colors.text);
    drawApi.setFont(`${theme.typography.fontSize.base}px ${theme.typography.fontFamily}`);
    drawApi.setTextBaseline('middle');

    const text = value || placeholder || '';
    const textX = 12;
    const textY = this.height / 2;

    drawApi.fillText(text, textX, textY);

    // 绘制光标
    if (this.isFocused && value) {
      const textWidth = drawApi.measureText(value).width;
      drawApi.setFillStyle(theme.colors.text);
      drawApi.fillRect(textX + textWidth + 2, textY - 8, 2, 16);
    }
  }

  // 处理键盘输入
  onKeyDown(key: string) {
    const { value, onValueChange } = this.props;

    switch (key) {
      case 'Backspace':
        const newValue = value.slice(0, -1);
        if (onValueChange) {
          onValueChange(newValue);
        }
        break;
      case 'Enter':
        // 处理 Enter 键
        break;
      case 'Tab':
        // 处理 Tab 键
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown':
        // 处理箭头键
        break;
      default:
        // 处理普通字符
        if (key.length === 1 && /[a-zA-Z0-9\s]/.test(key)) {
          const newValue = value + key;
          if (onValueChange) {
            onValueChange(newValue);
          }
        }
    }

    this.markDirty();
  }
}

export function TextInputComponent(props: TextInputProps) {
  return new TextInput(props);
}
