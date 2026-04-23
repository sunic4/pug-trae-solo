import { ComposeNode } from '@canvas-compose/composer';
import { useTheme } from '@canvas-compose/theme';

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  width?: number;
  height?: number;
}

export class Checkbox extends ComposeNode {
  constructor(public props: CheckboxProps) {
    super();
    this.handlers['click'] = this.onClick.bind(this);
    this.handlers['pointerdown'] = this.onPointerDown.bind(this);
  }

  private onClick() {
    // 处理点击事件，切换选中状态
    const { checked, onCheckedChange } = this.props;
    if (onCheckedChange) {
      onCheckedChange(!checked);
    }
  }

  private onPointerDown() {
    // 处理指针按下事件
    const { checked, onCheckedChange } = this.props;
    if (onCheckedChange) {
      onCheckedChange(!checked);
    }
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const theme = useTheme();
    const { width, height, label } = this.props;

    let checkboxWidth = 20;
    let checkboxHeight = 20;

    if (label) {
      // 测量文本宽度
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = `${theme.typography.fontSize.base}px ${theme.typography.fontFamily}`;
        const textWidth = ctx.measureText(label).width;
        checkboxWidth += textWidth + 8; // 8px 间距
      }
    }

    return { 
      width: Math.min(width || checkboxWidth, constraints.maxWidth), 
      height: Math.min(height || checkboxHeight, constraints.maxHeight) 
    };
  }

  place(x: number, y: number, width: number, height: number) {
    super.place(x, y, width, height);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const theme = useTheme();
    const { checked, label } = this.props;

    const checkboxSize = 20;
    const checkboxX = 0;
    const checkboxY = (this.height - checkboxSize) / 2;

    // 绘制复选框背景
    ctx.fillStyle = checked ? theme.colors.primary : theme.colors.background;
    ctx.strokeStyle = checked ? theme.colors.primary : theme.colors.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(checkboxX, checkboxY, checkboxSize, checkboxSize, 4);
    ctx.fill();
    ctx.stroke();

    // 绘制勾选标记
    if (checked) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(checkboxX + 5, checkboxY + 10);
      ctx.lineTo(checkboxX + 8, checkboxY + 13);
      ctx.lineTo(checkboxX + 15, checkboxY + 6);
      ctx.stroke();
    }

    // 绘制标签
    if (label) {
      ctx.fillStyle = theme.colors.text;
      ctx.font = `${theme.typography.fontSize.base}px ${theme.typography.fontFamily}`;
      ctx.textBaseline = 'middle';
      ctx.fillText(label, checkboxX + checkboxSize + 8, this.height / 2);
    }
  }
}

export function CheckboxComponent(props: CheckboxProps) {
  return new Checkbox(props);
}
