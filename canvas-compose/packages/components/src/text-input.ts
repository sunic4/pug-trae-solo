import { ComposeNode } from '@canvas-compose/composer';
import { useTheme } from '@canvas-compose/theme';

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

  draw(ctx: CanvasRenderingContext2D) {
    const theme = useTheme();
    const { value, placeholder } = this.props;

    // 绘制输入框背景
    ctx.fillStyle = this.isFocused ? theme.colors.surface : theme.colors.background;
    ctx.strokeStyle = this.isFocused ? theme.colors.primary : theme.colors.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(0, 0, this.width, this.height, theme.borderRadius.base);
    ctx.fill();
    ctx.stroke();

    // 绘制文本
    ctx.fillStyle = theme.colors.text;
    ctx.font = `${theme.typography.fontSize.base}px ${theme.typography.fontFamily}`;
    ctx.textBaseline = 'middle';

    const text = value || placeholder || '';
    const textX = 12;
    const textY = this.height / 2;

    ctx.fillText(text, textX, textY);

    // 绘制光标
    if (this.isFocused && value) {
      const textWidth = ctx.measureText(value).width;
      ctx.fillStyle = theme.colors.text;
      ctx.fillRect(textX + textWidth + 2, textY - 8, 2, 16);
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
