import { ComposeNode } from '@pug/composer';
import { useTheme } from '@pug/theme';
import { TextComponent } from './text';
import { DrawAPI } from '@pug/renderer';

export interface ButtonProps {
  text: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'base' | 'lg';
  disabled?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  marginBottom?: number;
}

export class Button extends ComposeNode {
  private textNode: ComposeNode;

  constructor(public props: ButtonProps) {
    super();
    this.textNode = TextComponent({
      text: props.text,
      color: this.getTextColor(),
      fontWeight: 500,
      textAlign: 'center',
    });
    this.addChild(this.textNode);
    
    // 添加点击事件处理器
    this.handlers['click'] = (_x: number, _y: number) => {
      if (!this.props.disabled && this.props.onClick) {
        this.props.onClick();
      }
    };
  }

  private getTextColor(): string {
    const theme = useTheme();
    const { variant, disabled } = this.props;

    if (disabled) {
      return theme.colors.disabled;
    }

    switch (variant) {
      case 'primary':
        return '#ffffff';
      case 'secondary':
        return '#ffffff';
      case 'outline':
        return theme.colors.primary;
      case 'text':
        return theme.colors.primary;
      default:
        return '#ffffff';
    }
  }

  private getBackgroundColor(): string {
    const theme = useTheme();
    const { variant, disabled } = this.props;

    if (disabled) {
      return theme.colors.surface;
    }

    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'outline':
        return 'transparent';
      case 'text':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  }

  private getBorderColor(): string {
    const theme = useTheme();
    const { variant, disabled } = this.props;

    if (disabled) {
      return theme.colors.border;
    }

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'text':
        return 'transparent';
      case 'outline':
        return theme.colors.primary;
      default:
        return 'transparent';
    }
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const theme = useTheme();
    const { size, width, height } = this.props;

    let buttonWidth = width;
    let buttonHeight = height;

    if (!buttonHeight) {
      switch (size) {
        case 'sm':
          buttonHeight = 32;
          break;
        case 'lg':
          buttonHeight = 48;
          break;
        default:
          buttonHeight = 40;
      }
    }

    if (!buttonWidth) {
      // 测量文本宽度并添加padding
      const textWidth = this.textNode.measure(constraints).width;
      buttonWidth = textWidth + theme.spacing.base * 2;
    }

    return { 
      width: Math.min(buttonWidth, constraints.maxWidth), 
      height: Math.min(buttonHeight, constraints.maxHeight) 
    };
  }

  place(x: number, y: number, width: number, height: number) {
    super.place(x + (this.props.x || 0), y + (this.props.y || 0), width, height);

    // 放置文本节点
    this.textNode.place(0, 0, width, height);
  }

  draw(drawApi: DrawAPI) {
    const theme = useTheme();
    const borderRadius = theme.borderRadius.base;

    // 绘制按钮背景
    const backgroundColor = this.getBackgroundColor();
    if (backgroundColor !== 'transparent') {
      drawApi.setFillStyle(backgroundColor);
      drawApi.beginPath();
      // 使用 arc 绘制圆角矩形
      drawApi.arc(borderRadius, borderRadius, borderRadius, Math.PI, Math.PI * 1.5);
      drawApi.arc(this.width - borderRadius, borderRadius, borderRadius, Math.PI * 1.5, Math.PI * 2);
      drawApi.arc(this.width - borderRadius, this.height - borderRadius, borderRadius, 0, Math.PI * 0.5);
      drawApi.arc(borderRadius, this.height - borderRadius, borderRadius, Math.PI * 0.5, Math.PI);
      drawApi.closePath();
      drawApi.fill();
    }

    // 绘制按钮边框
    const borderColor = this.getBorderColor();
    if (borderColor !== 'transparent') {
      drawApi.setStrokeStyle(borderColor);
      drawApi.setLineWidth(1);
      drawApi.beginPath();
      // 使用 arc 绘制圆角矩形边框
      drawApi.arc(borderRadius, borderRadius, borderRadius, Math.PI, Math.PI * 1.5);
      drawApi.arc(this.width - borderRadius, borderRadius, borderRadius, Math.PI * 1.5, Math.PI * 2);
      drawApi.arc(this.width - borderRadius, this.height - borderRadius, borderRadius, 0, Math.PI * 0.5);
      drawApi.arc(borderRadius, this.height - borderRadius, borderRadius, Math.PI * 0.5, Math.PI);
      drawApi.closePath();
      drawApi.stroke();
    }

    // 绘制文本
    this.textNode.draw(drawApi);
  }

  onPointerDown(_x: number, _y: number) {
    if (!this.props.disabled && this.props.onClick) {
      this.props.onClick();
    }
  }
}

export function ButtonComponent(props: ButtonProps) {
  return new Button(props);
}
