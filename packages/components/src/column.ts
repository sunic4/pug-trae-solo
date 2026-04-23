import { ComposeNode } from '@canvas-compose/composer';

export interface ColumnProps {
  width?: number;
  height?: number;
  padding?: number;
  spacing?: number;
  children?: ComposeNode[];
}

export class Column extends ComposeNode {
  constructor(public props: ColumnProps) {
    super();
    if (props.children) {
      props.children.forEach(child => this.addChild(child));
    }
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, spacing = 0, padding = 0 } = this.props;

    let totalWidth = width || constraints.maxWidth;
    let totalHeight = 0;

    // 测量所有子元素
    this.children.forEach(child => {
      const childSize = child.measure({
        minWidth: 0,
        maxWidth: totalWidth - padding * 2,
        minHeight: 0,
        maxHeight: constraints.maxHeight - totalHeight
      });
      totalHeight += childSize.height + spacing;
    });

    // 移除最后一个间距
    if (this.children.length > 0) {
      totalHeight -= spacing;
    }

    totalHeight += padding * 2;

    return {
      width: Math.min(totalWidth, constraints.maxWidth),
      height: Math.min(totalHeight, constraints.maxHeight)
    };
  }

  place(x: number, y: number, width: number, height: number) {
    super.place(x, y, width, height);

    const { padding = 0, spacing = 0 } = this.props;
    let currentY = padding;

    // 放置子元素
    this.children.forEach(child => {
      const childHeight = child.measure({
        minWidth: 0,
        maxWidth: width - padding * 2,
        minHeight: 0,
        maxHeight: height - padding * 2 - currentY
      }).height;

      child.place(padding, currentY, width - padding * 2, childHeight);
      currentY += childHeight + spacing;
    });
  }

  draw(ctx: CanvasRenderingContext2D) {
    // 布局组件不需要绘制自身，只需要绘制子元素，由渲染器负责
  }
}

export function ColumnComponent(props: ColumnProps) {
  return new Column(props);
}
