import { ComposeNode } from '@pug/composer';
import { useTheme } from '@pug/theme';
import { DrawAPI } from '@pug/renderer';

export interface BoxProps {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  marginBottom?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  children?: ComposeNode[];
}

export class Box extends ComposeNode {
  constructor(public props: BoxProps) {
    super();
    if (props.children) {
      props.children.forEach(child => this.addChild(child));
    }
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, padding = 0, margin = 0 } = this.props;

    let boxWidth = width || constraints.maxWidth - margin * 2;
    let boxHeight = height || constraints.maxHeight - margin * 2;

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
    this.children.forEach(child => {
      const childHeight = child.measure({
        minWidth: 0,
        maxWidth: width - padding * 2,
        minHeight: 0,
        maxHeight: height - padding * 2 - currentY
      }).height;
      child.place(padding, currentY, width - padding * 2, childHeight);
      currentY += childHeight;
      // 处理marginBottom
      if (child.props && 'marginBottom' in child.props && child.props.marginBottom) {
        currentY += child.props.marginBottom;
      }
    });
  }

  draw(drawApi: DrawAPI) {
    const theme = useTheme();
    const { backgroundColor = theme.colors.surface, borderColor, borderWidth = 0, borderRadius = theme.borderRadius.base } = this.props;

    // 绘制背景
    if (backgroundColor) {
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

    // 绘制边框
    if (borderColor && borderWidth > 0) {
      drawApi.setStrokeStyle(borderColor);
      drawApi.setLineWidth(borderWidth);
      drawApi.beginPath();
      // 使用 arc 绘制圆角矩形边框
      drawApi.arc(borderRadius, borderRadius, borderRadius, Math.PI, Math.PI * 1.5);
      drawApi.arc(this.width - borderRadius, borderRadius, borderRadius, Math.PI * 1.5, Math.PI * 2);
      drawApi.arc(this.width - borderRadius, this.height - borderRadius, borderRadius, 0, Math.PI * 0.5);
      drawApi.arc(borderRadius, this.height - borderRadius, borderRadius, Math.PI * 0.5, Math.PI);
      drawApi.closePath();
      drawApi.stroke();
    }
  }
}

export function BoxComponent(props: BoxProps) {
  return new Box(props);
}
