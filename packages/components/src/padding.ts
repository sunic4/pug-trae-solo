import { ComposeNode } from '@pug/composer';
import { DrawAPI } from '@pug/renderer';

export interface PaddingProps {
  padding?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  child?: ComposeNode;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class Padding extends ComposeNode {
  constructor(public props: PaddingProps) {
    super();
    if (props.child) {
      this.addChild(props.child);
    }
    this.markLayoutDirty();
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, padding = 0, paddingLeft = padding, paddingRight = padding, paddingTop = padding, paddingBottom = padding } = this.props;

    let paddingWidth = width || constraints.maxWidth;
    let paddingHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      const child = this.children[0];
      const childSize = child.measure({
        minWidth: 0,
        maxWidth: paddingWidth - paddingLeft - paddingRight,
        minHeight: 0,
        maxHeight: paddingHeight - paddingTop - paddingBottom,
      });

      if (!width) {
        paddingWidth = childSize.width + paddingLeft + paddingRight;
      }
      if (!height) {
        paddingHeight = childSize.height + paddingTop + paddingBottom;
      }
    }

    return { 
      width: Math.min(paddingWidth, constraints.maxWidth), 
      height: Math.min(paddingHeight, constraints.maxHeight) 
    };
  }

  place(x: number, y: number, width: number, height: number) {
    const { x: offsetX = 0, y: offsetY = 0, padding = 0, paddingLeft = padding, paddingRight = padding, paddingTop = padding, paddingBottom = padding } = this.props;
    super.place(x + offsetX, y + offsetY, width, height);

    // 放置子元素
    if (this.children.length > 0) {
      const child = this.children[0];
      const childSize = child.measure({
        minWidth: 0,
        maxWidth: width - paddingLeft - paddingRight,
        minHeight: 0,
        maxHeight: height - paddingTop - paddingBottom,
      });

      child.place(paddingLeft, paddingTop, childSize.width, childSize.height);
    }
  }

  draw(_drawApi: DrawAPI) {
    // 布局组件不需要绘制自身，只需要绘制子元素，由渲染器负责
  }
}

export function PaddingComponent(props: PaddingProps) {
  return new Padding(props);
}
