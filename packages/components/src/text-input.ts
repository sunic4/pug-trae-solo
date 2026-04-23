import { ComposeNode } from '@pug/composer';
import { useTheme } from '@pug/theme';
import { DrawAPI } from '@pug/renderer';

export interface TextInputProps {
  value: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}

export class TextInput extends ComposeNode {
  private isFocused = false;

  constructor(public props: TextInputProps) {
    super();
    this.handlers['click'] = this.onClick.bind(this);
    this.handlers['pointerdown'] = this.onPointerDown.bind(this);
  }

  private onClick() {
    // 处理点击事件，获取焦点
    this.isFocused = true;
    this.markDirty();
  }

  private onPointerDown() {
    // 处理指针按下事件
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
    super.place(x, y, width, height);
  }

  draw(drawApi: DrawAPI) {
    const theme = useTheme();
    const { value, placeholder } = this.props;
    const borderRadius = theme.borderRadius.base;

    // 绘制输入框背景
    drawApi.setFillStyle(this.isFocused ? theme.colors.surface : theme.colors.background);
    drawApi.setStrokeStyle(this.isFocused ? theme.colors.primary : theme.colors.border);
    drawApi.setLineWidth(1);
    drawApi.beginPath();
    // 使用 arc 绘制圆角矩形
    drawApi.arc(borderRadius, borderRadius, borderRadius, Math.PI, Math.PI * 1.5);
    drawApi.arc(this.width - borderRadius, borderRadius, borderRadius, Math.PI * 1.5, Math.PI * 2);
    drawApi.arc(this.width - borderRadius, this.height - borderRadius, borderRadius, 0, Math.PI * 0.5);
    drawApi.arc(borderRadius, this.height - borderRadius, borderRadius, Math.PI * 0.5, Math.PI);
    drawApi.closePath();
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

    if (key === 'Backspace') {
      const newValue = value.slice(0, -1);
      if (onValueChange) {
        onValueChange(newValue);
      }
    } else if (key.length === 1 && /[a-zA-Z0-9\s]/.test(key)) {
      const newValue = value + key;
      if (onValueChange) {
        onValueChange(newValue);
      }
    }

    this.markDirty();
  }
}

export function TextInputComponent(props: TextInputProps) {
  return new TextInput(props);
}
