import { ComposeNode } from '@pug/composer';

export interface StackProps {
  alignment?: 'start' | 'center' | 'end';
  children?: ComposeNode[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class Stack extends ComposeNode {
  constructor(public props: StackProps) {
    super();
    if (props.children) {
      props.children.forEach(child => this.addChild(child));
    }
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height } = this.props;

    let stackWidth = width || constraints.maxWidth;
    let stackHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let maxChildWidth = 0;
      let maxChildHeight = 0;

      this.children.forEach(child => {
        const childSize = child.measure({
          minWidth: 0,
          maxWidth: stackWidth,
          minHeight: 0,
          maxHeight: stackHeight,
        });
        maxChildWidth = Math.max(maxChildWidth, childSize.width);
        maxChildHeight = Math.max(maxChildHeight, childSize.height);
      });

      if (!width) {
        stackWidth = maxChildWidth;
      }
      if (!height) {
        stackHeight = maxChildHeight;
      }
    }

    return { 
      width: Math.min(stackWidth, constraints.maxWidth), 
      height: Math.min(stackHeight, constraints.maxHeight) 
    };
  }

  place(x: number, y: number, width: number, height: number) {
    const { x: offsetX = 0, y: offsetY = 0, alignment = 'start' } = this.props;
    super.place(x + offsetX, y + offsetY, width, height);

    // 放置子元素
    this.children.forEach(child => {
      const childSize = child.measure({
        minWidth: 0,
        maxWidth: width,
        minHeight: 0,
        maxHeight: height,
      });

      let childX = 0;
      let childY = 0;

      // 处理对齐
      if (alignment === 'center') {
        childX = (width - childSize.width) / 2;
        childY = (height - childSize.height) / 2;
      } else if (alignment === 'end') {
        childX = width - childSize.width;
        childY = height - childSize.height;
      }

      child.place(childX, childY, childSize.width, childSize.height);
    });
  }

  draw(_ctx: CanvasRenderingContext2D) {
    // 布局组件不需要绘制自身，只需要绘制子元素，由渲染器负责
  }
}

export function StackComponent(props: StackProps) {
  return new Stack(props);
}
