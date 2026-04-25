import { ComposeNode } from '@pug/composer';
import { DrawAPI } from '@pug/renderer';
import { getThemeFromContext } from './utils';
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
  wordWrap?: boolean;
  appContext?: AppContext;
}

export class Text extends ComposeNode<TextProps> {
  constructor(props: TextProps, key?: string) {
    super(key, props, props.appContext);
    this.markLayoutDirty();
  }

  private getTheme() {
    return getThemeFromContext(this.appContext);
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const theme = this.getTheme();
    const fontSize = this.props.fontSize || theme.typography.fontSize.base;
    const fontWeight = this.props.fontWeight || theme.typography.fontWeight.normal;
    const fontFamily = theme.typography.fontFamily;
    const lineHeight = this.props.lineHeight || fontSize * 1.5;
    const wordWrap = this.props.wordWrap || false;

    // 计算文本宽度
    const calculateWidth = (): number => {
      if (typeof window !== 'undefined' && window.document) {
        // 浏览器环境
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return 0;
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(this.props.text);
        return metrics.width;
      } else {
        // 非浏览器环境，使用估算值
        const averageCharWidth = fontSize * 0.6;
        return this.props.text.length * averageCharWidth;
      }
    };

    // 计算文本换行后的高度
    const calculateHeight = (width: number): number => {
      if (!wordWrap) return lineHeight;

      if (typeof window !== 'undefined' && window.document) {
        // 浏览器环境
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return lineHeight;
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

        const words = this.props.text.split(' ');
        let lines = 1;
        let currentWidth = 0;

        for (const word of words) {
          const wordWidth = ctx.measureText(word).width;
          if (currentWidth + wordWidth > width) {
            lines++;
            currentWidth = wordWidth + ctx.measureText(' ').width;
          } else {
            currentWidth += wordWidth + ctx.measureText(' ').width;
          }
        }

        return lines * lineHeight;
      } else {
        // 非浏览器环境，使用估算值
        const averageCharWidth = fontSize * 0.6;
        const words = this.props.text.split(' ');
        let lines = 1;
        let currentWidth = 0;

        for (const word of words) {
          const wordWidth = word.length * averageCharWidth;
          if (currentWidth + wordWidth > width) {
            lines++;
            currentWidth = wordWidth + averageCharWidth; // 空格宽度
          } else {
            currentWidth += wordWidth + averageCharWidth; // 空格宽度
          }
        }

        return lines * lineHeight;
      }
    };

    const width = Math.min(this.props.width || calculateWidth(), constraints.maxWidth);
    const height = Math.min(this.props.height || calculateHeight(width), constraints.maxHeight);

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
    const lineHeight = this.props.lineHeight || fontSize * 1.5;
    const wordWrap = this.props.wordWrap || false;

    // 设置绘制属性
    drawApi.setFont(`${fontWeight} ${fontSize}px ${fontFamily}`);
    drawApi.setFillStyle(color);
    drawApi.setTextAlign(textAlign);
    drawApi.setTextBaseline('top');

    if (wordWrap) {
      // 实现文本换行
      const words = this.props.text.split(' ');
      let lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = drawApi.measureText(testLine).width;

        if (testWidth <= this.width) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      // 绘制每一行文本
      lines.forEach((line, index) => {
        const textX = {
          left: 0,
          center: this.width / 2,
          right: this.width
        }[textAlign] || 0;
        const textY = index * lineHeight + (this.height - lines.length * lineHeight) / 2;
        drawApi.fillText(line, textX, textY);
      });
    } else {
      // 计算文本位置
      const textX = {
        left: 0,
        center: this.width / 2,
        right: this.width
      }[textAlign] || 0;
      const textY = (this.height - lineHeight) / 2;

      drawApi.fillText(this.props.text, textX, textY);
    }
  }
}

export function TextComponent(props: TextProps) {
  return new Text(props);
}
