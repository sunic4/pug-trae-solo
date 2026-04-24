import { ComposeNode } from '@canvas-compose/composer';

export interface RowProps {
  width?: number;
  height?: number;
  padding?: number;
  spacing?: number;
  children?: ComposeNode[];
}

export class Row extends ComposeNode {
  constructor(public props: RowProps) {
    super();
    if (props.children) {
      props.children.forEach(child => this.addChild(child));
    }
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { height, spacing = 0, padding = 0 } = this.props;

    let totalWidth = 0;
    let totalHeight = height || constraints.maxHeight;

    // 测量所有子元素
    this.children.forEach(child => {
      const childSize = child.measure({
        minWidth: 0,
        maxWidth: constraints.maxWidth - totalWidth,
        minHeight: 0,
        maxHeight: totalHeight - padding * 2
      });
      totalWidth += childSize.width + spacing;
    });

    // 移除最后一个间距
    if (this.children.length > 0) {
      totalWidth -= spacing;
    }

    totalWidth += padding * 2;

    return {
      width: Math.min(totalWidth, constraints.maxWidth),
      height: Math.min(totalHeight, constraints.maxHeight)
    };
  }

  place(x: number, y: number, width: number, height: number) {
    super.place(x, y, width, height);

    const { padding = 0, spacing = 0 } = this.props;
    let currentX = padding;

    // 放置子元素
    this.children.forEach(child => {
      const childWidth = child.measure({
        minWidth: 0,
        maxWidth: width - padding * 2 - currentX,
        minHeight: 0,
        maxHeight: height - padding * 2
      }).width;

      child.place(currentX, padding, childWidth, height - padding * 2);
      currentX += childWidth + spacing;
    });
  }

  draw(ctx: CanvasRenderingContext2D) {
    // 布局组件不需要绘制自身，只需要绘制子元素，由渲染器负责
  }
}

export function RowComponent(props: RowProps) {
  return new Row(props);
}
