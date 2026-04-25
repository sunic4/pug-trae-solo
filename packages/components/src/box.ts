import { ComposeNode } from '@pug/composer';
import { DrawAPI } from '@pug/renderer';
import { drawRoundedRect, getThemeFromContext } from './utils';
import { AppContext } from '@pug/core';

export interface BoxProps {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  marginBottom?: number;
  marginTop?: number;
  x?: number;
  y?: number;
  width?: number | string;
  height?: number | string;
  flex?: number;
  flexDirection?: 'row' | 'column';
  alignItems?: 'start' | 'center' | 'end';
  justifyContent?: 'start' | 'center' | 'end' | 'space-around' | 'space-between';
  borderBottom?: string;
  overflow?: 'hidden' | 'visible' | 'scroll';
  children?: ComposeNode | ComposeNode[];
  appContext?: AppContext;
}

export class Box extends ComposeNode<BoxProps> {
  constructor(props: BoxProps, key?: string) {
    super(key, props, props.appContext);
    if (props.children) {
      const children = Array.isArray(props.children) ? props.children : [props.children];
      children.forEach(child => this.addChild(child));
    }
    this.markLayoutDirty();
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, padding = 0, margin = 0 } = this.props;

    let boxWidth: number;
    let boxHeight: number;

    // 处理百分比宽度
    if (width === '100%') {
      boxWidth = constraints.maxWidth - margin * 2;
    } else {
      boxWidth = (width as number) || constraints.maxWidth - margin * 2;
    }

    // 处理百分比高度
    if (height === '100%') {
      boxHeight = constraints.maxHeight - margin * 2;
    } else {
      boxHeight = (height as number) || constraints.maxHeight - margin * 2;
    }

    // 测量子元素
    if (this.children.length > 0) {
      let maxChildWidth = 0;
      let maxChildHeight = 0;

      this.children.forEach(child => {
        const childSize = child.measure({
          minWidth: 0,
          maxWidth: boxWidth - padding * 2,
          minHeight: 0,
          maxHeight: boxHeight - padding * 2,
        });
        maxChildWidth = Math.max(maxChildWidth, childSize.width);
        maxChildHeight = Math.max(maxChildHeight, childSize.height);
      });

      if (!width) {
        boxWidth = maxChildWidth + padding * 2;
      }
      if (!height) {
        boxHeight = maxChildHeight + padding * 2;
      }
    }

    return { 
      width: Math.min(boxWidth, constraints.maxWidth), 
      height: Math.min(boxHeight, constraints.maxHeight) 
    };
  }

  place(x: number, y: number, width: number, height: number) {
    const { x: offsetX = 0, y: offsetY = 0, padding = 0 } = this.props;
    super.place(x + offsetX, y + offsetY, width, height);

    // 放置子元素
    let currentY = padding;
    const thisWidth = width;
    this.children.forEach(child => {
      const childHeight = child.measure({
        minWidth: 0,
        maxWidth: thisWidth - padding * 2,
        minHeight: 0,
        maxHeight: height - padding * 2 - currentY
      }).height;
      child.place(padding, currentY, thisWidth - padding * 2, childHeight);
      currentY += childHeight;
      // 处理marginBottom
      if (child.props && 'marginBottom' in child.props && child.props.marginBottom) {
        currentY += child.props.marginBottom;
      }
    });
  }

  draw(drawApi: DrawAPI) {
    const theme = getThemeFromContext(this.appContext);
    const { backgroundColor = theme.colors.surface, borderColor, borderWidth = 0, borderRadius = theme.borderRadius.base } = this.props;

    // 绘制背景
    if (backgroundColor) {
      drawApi.setFillStyle(backgroundColor);
      drawRoundedRect(drawApi, 0, 0, this.width, this.height, borderRadius);
      drawApi.fill();
    }

    // 绘制边框
    if (borderColor && borderWidth > 0) {
      drawApi.setStrokeStyle(borderColor);
      drawApi.setLineWidth(borderWidth);
      drawRoundedRect(drawApi, 0, 0, this.width, this.height, borderRadius);
      drawApi.stroke();
    }
  }
}

export function BoxComponent(props: BoxProps) {
  return new Box(props);
}
