import { ComposeNode } from '@pug/composer';
import { TextComponent } from './text';
import { DrawAPI } from '@pug/renderer';
import { drawRoundedRect, getThemeFromContext } from './utils';
import { AppContext } from '@pug/core';

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
  marginTop?: number;
  padding?: number;
  backgroundColor?: string;
  color?: string;
  appContext?: AppContext;
}

export class Button extends ComposeNode<ButtonProps> {
  private textNode: ComposeNode;
  private isHovered = false;
  private isActive = false;

  constructor(props: ButtonProps, key?: string) {
    super(key, props, props.appContext);
    this.textNode = TextComponent({
      text: props.text,
      color: this.getTextColor(),
      fontWeight: 500,
      textAlign: 'center',
      appContext: this.appContext
    });
    this.addChild(this.textNode);
    
    // 添加事件处理器
    this.handlers['click'] = (_x: number, _y: number) => {
      if (!this.props.disabled && this.props.onClick) {
        this.props.onClick();
      }
    };
    
    this.handlers['mouseenter'] = () => {
      if (!this.props.disabled) {
        this.isHovered = true;
        this.markDirty();
      }
    };
    
    this.handlers['mouseleave'] = () => {
      if (!this.props.disabled) {
        this.isHovered = false;
        this.isActive = false;
        this.markDirty();
      }
    };
    
    this.handlers['mousedown'] = () => {
      if (!this.props.disabled) {
        this.isActive = true;
        this.markDirty();
      }
    };
    
    this.handlers['mouseup'] = () => {
      if (!this.props.disabled) {
        this.isActive = false;
        this.markDirty();
      }
    };
    
    this.markLayoutDirty();
  }

  private getTheme() {
    return getThemeFromContext(this.appContext);
  }

  private getColor(colors: Record<string, string>): string {
    const theme = this.getTheme();
    const { variant, disabled } = this.props;

    if (disabled) {
      return colors.disabled || theme.colors.disabled;
    }

    if (this.isActive) {
      return colors[`${variant}Active`] || colors[variant] || colors.default || theme.colors.primary;
    }

    if (this.isHovered) {
      return colors[`${variant}Hover`] || colors[variant] || colors.default || theme.colors.primary;
    }

    return colors[variant] || colors.default || theme.colors.primary;
  }

  private getTextColor(): string {
    const theme = this.getTheme();
    const colors = {
      primary: '#ffffff',
      secondary: '#ffffff',
      outline: theme.colors.primary,
      text: theme.colors.primary,
      default: '#ffffff',
      disabled: theme.colors.disabled
    };

    return this.getColor(colors);
  }

  private getBackgroundColor(): string {
    const theme = this.getTheme();
    const colors = {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      outline: 'transparent',
      text: 'transparent',
      default: theme.colors.primary,
      disabled: theme.colors.surface
    };

    return this.getColor(colors);
  }

  private getBorderColor(): string {
    const theme = this.getTheme();
    const colors = {
      primary: 'transparent',
      secondary: 'transparent',
      outline: theme.colors.primary,
      text: 'transparent',
      default: 'transparent',
      disabled: theme.colors.border
    };

    return this.getColor(colors);
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const theme = this.getTheme();
    const { size, width, height } = this.props;

    // 计算按钮高度
    const buttonHeight = height || {
      sm: 32,
      lg: 48,
      base: 40
    }[size] || 40;

    // 计算按钮宽度
    const buttonWidth = width || (() => {
      const textWidth = this.textNode.measure(constraints).width;
      return textWidth + theme.spacing.base * 2;
    })();

    return { 
      width: Math.min(buttonWidth, constraints.maxWidth), 
      height: Math.min(buttonHeight, constraints.maxHeight) 
    };
  }

  place(x: number, y: number, width: number, height: number) {
    const thisX = x + (this.props.x || 0);
    const thisY = y + (this.props.y || 0);
    super.place(thisX, thisY, width, height);

    // 放置文本节点 - 使用相对坐标
    this.textNode.place(0, 0, width, height);
  }

  draw(drawApi: DrawAPI) {
    const theme = this.getTheme();
    const borderRadius = theme.borderRadius.base;

    // 绘制按钮背景
    const backgroundColor = this.getBackgroundColor();
    if (backgroundColor !== 'transparent') {
      drawApi.setFillStyle(backgroundColor);
      drawRoundedRect(drawApi, 0, 0, this.width, this.height, borderRadius);
      drawApi.fill();
    }

    // 绘制按钮边框
    const borderColor = this.getBorderColor();
    if (borderColor !== 'transparent') {
      drawApi.setStrokeStyle(borderColor);
      drawApi.setLineWidth(1);
      drawRoundedRect(drawApi, 0, 0, this.width, this.height, borderRadius);
      drawApi.stroke();
    }

    // 绘制文本
    this.textNode.draw(drawApi);
  }


}

export function ButtonComponent(props: ButtonProps) {
  return new Button(props);
}
