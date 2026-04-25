import { ComposeNode } from '@pug/composer';
import { DrawAPI } from '@pug/renderer';
import { drawRoundedRect, getThemeFromContext } from './utils';
import { AppContext } from '@pug/core';
import { getCurrentAppContext } from '@pug/reactivity';

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  appContext?: AppContext;
}

export class Checkbox extends ComposeNode<CheckboxProps> {
  constructor(props: CheckboxProps, key?: string) {
    const appContext = props.appContext || getCurrentAppContext();
    super(key, props, appContext);
    this.handlers['click'] = (x: number, y: number) => this.onClick(x, y);
    this.markLayoutDirty();
  }

  private onClick(_x: number, _y: number) {
    // 处理点击事件，切换选中状态
    const { checked, onCheckedChange } = this.props;
    if (onCheckedChange) {
      onCheckedChange(!checked);
    }
  }



  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const theme = getThemeFromContext(this.appContext);
    const { width, height, label } = this.props;

    let checkboxWidth = 20;
    let checkboxHeight = 20;

    if (label) {
      // 测量文本宽度
      if (typeof document !== 'undefined') {
        // 浏览器环境
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.font = `${theme.typography.fontSize.base}px ${theme.typography.fontFamily}`;
          const textWidth = ctx.measureText(label).width;
          checkboxWidth += textWidth + 8; // 8px 间距
        }
      } else {
        // 服务器端环境，使用默认文本宽度估计
        checkboxWidth += label.length * 8 + 8; // 8px 间距
      }
    }

    return { 
      width: Math.min(width || checkboxWidth, constraints.maxWidth), 
      height: Math.min(height || checkboxHeight, constraints.maxHeight) 
    };
  }

  place(x: number, y: number, width: number, height: number) {
    const thisX = x + (this.props.x || 0);
    const thisY = y + (this.props.y || 0);
    super.place(thisX, thisY, width, height);
  }

  draw(drawApi: DrawAPI) {
    const theme = getThemeFromContext(this.appContext);
    const { checked, label } = this.props;

    const checkboxSize = 20;
    const checkboxX = 0;
    const checkboxY = (this.height - checkboxSize) / 2;
    const borderRadius = 4;

    // 绘制复选框背景
    drawApi.setFillStyle(checked ? theme.colors.primary : theme.colors.background);
    drawApi.setStrokeStyle(checked ? theme.colors.primary : theme.colors.border);
    drawApi.setLineWidth(1);
    drawRoundedRect(drawApi, checkboxX, checkboxY, checkboxSize, checkboxSize, borderRadius);
    drawApi.fill();
    drawApi.stroke();

    // 绘制勾选标记
    if (checked) {
      drawApi.setStrokeStyle('#ffffff');
      drawApi.setLineWidth(2);
      drawApi.beginPath();
      drawApi.moveTo(checkboxX + 5, checkboxY + 10);
      drawApi.lineTo(checkboxX + 8, checkboxY + 13);
      drawApi.lineTo(checkboxX + 15, checkboxY + 6);
      drawApi.stroke();
    }

    // 绘制标签
    if (label) {
      drawApi.setFillStyle(theme.colors.text);
      drawApi.setFont(`${theme.typography.fontSize.base}px ${theme.typography.fontFamily}`);
      drawApi.setTextBaseline('middle');
      drawApi.fillText(label, checkboxX + checkboxSize + 8, this.height / 2);
    }
  }
}

export function CheckboxComponent(props: CheckboxProps) {
  return new Checkbox(props);
}
