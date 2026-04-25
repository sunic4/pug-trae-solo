import { ComposeNode } from '@pug/composer';
import { useTheme } from '@pug/theme';
import { DrawAPI } from '@pug/renderer';
import { AppContext } from '@pug/core';

export interface TextProps {
  text: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  marginBottom?: number;
  marginRight?: number;
  marginTop?: number;
  marginLeft?: number;
  appContext?: AppContext;
}

export class Text extends ComposeNode<TextProps> {
  constructor(props: TextProps, key?: string, appContext?: AppContext) {
    super(key, props, appContext || props.appContext);
    this.markLayoutDirty();
  }

  private getTheme() {
    // 优先从 appContext 获取主题，否则使用全局主题
    if (this.appContext) {
      return this.appContext.theme.theme;
    }
    return useTheme();
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const theme = this.getTheme();
    const fontSize = this.props.fontSize || theme.typography.fontSize.base;
    const fontWeight = this.props.fontWeight || theme.typography.fontWeight.normal;
    const fontFamily = theme.typography.fontFamily;

    // 文本测量
    let metrics;
    if (typeof window !== 'undefined' && window.document) {
      // 浏览器环境
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return { width: 0, height: 0 };
      }
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      metrics = ctx.measureText(this.props.text);
    } else {
      // 非浏览器环境，使用估算值
      const averageCharWidth = fontSize * 0.6;
      return {
        width: Math.min(this.props.width || this.props.text.length * averageCharWidth, constraints.maxWidth),
        height: Math.min(this.props.height || fontSize * 1.5, constraints.maxHeight)
      };
    }

    const width = Math.min(this.props.width || metrics.width, constraints.maxWidth);
    const height = Math.min(this.props.height || fontSize * 1.5, constraints.maxHeight);

    return { width, height };
  }

  place(x: number, y: number, width: number, height: number) {
    const thisX = x + (this.props.x || 0);
    const thisY = y + (this.props.y || 0);
    super.place(thisX, thisY, width, height);
  }

  draw(drawApi: DrawAPI) {
    const theme = this.getTheme();
    const fontSize = this.props.fontSize || theme.typography.fontSize.base;
    const fontWeight = this.props.fontWeight || theme.typography.fontWeight.normal;
    const color = this.props.color || theme.colors.text;
    const textAlign = this.props.textAlign || 'left';
    const fontFamily = theme.typography.fontFamily;

    drawApi.setFont(`${fontWeight} ${fontSize}px ${fontFamily}`);
    drawApi.setFillStyle(color);
    drawApi.setTextAlign(textAlign);
    drawApi.setTextBaseline('middle');

    const textX = textAlign === 'left' ? 0 : textAlign === 'center' ? this.width / 2 : this.width;
    const textY = this.height / 2;

    drawApi.fillText(this.props.text, textX, textY);
  }
}

export function TextComponent(props: TextProps) {
  return new Text(props, undefined, props.appContext);
}
