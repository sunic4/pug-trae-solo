import { ComposeNode } from '@pug/composer';
import { useTheme } from '@pug/theme';

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
}

export class Text extends ComposeNode {
  constructor(public props: TextProps) {
    super();
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const theme = useTheme();
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
      // Node.js 环境
      try {
        const { createCanvas } = require('canvas');
        const canvas = createCanvas(1000, 100);
        const ctx = canvas.getContext('2d');
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        metrics = ctx.measureText(this.props.text);
      } catch (e) {
        // 如果没有 canvas 模块，使用估算值
        const averageCharWidth = fontSize * 0.6;
        return {
          width: Math.min(this.props.width || this.props.text.length * averageCharWidth, constraints.maxWidth),
          height: Math.min(this.props.height || fontSize * 1.5, constraints.maxHeight)
        };
      }
    }

    const width = Math.min(this.props.width || metrics.width, constraints.maxWidth);
    const height = Math.min(this.props.height || fontSize * 1.5, constraints.maxHeight);

    return { width, height };
  }

  place(x: number, y: number, width: number, height: number) {
    super.place(x + (this.props.x || 0), y + (this.props.y || 0), width, height);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const theme = useTheme();
    const fontSize = this.props.fontSize || theme.typography.fontSize.base;
    const fontWeight = this.props.fontWeight || theme.typography.fontWeight.normal;
    const color = this.props.color || theme.colors.text;
    const textAlign = this.props.textAlign || 'left';
    const fontFamily = theme.typography.fontFamily;

    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'middle';

    const textX = textAlign === 'left' ? 0 : textAlign === 'center' ? this.width / 2 : this.width;
    const textY = this.height / 2;

    ctx.fillText(this.props.text, textX, textY);
  }
}

export function TextComponent(props: TextProps) {
  return new Text(props);
}
