import { ComposeNode } from '@canvas-compose/composer';

export interface ContainerProps {
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  padding?: number;
  margin?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  children?: ComposeNode[];
}

export class Container extends ComposeNode {
  constructor(public props: ContainerProps) {
    super();
    if (props.children) {
      props.children.forEach(child => this.addChild(child));
    }
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'row', padding = 0, margin = 0 } = this.props;

    let containerWidth = width || constraints.maxWidth - margin * 2;
    let containerHeight = height || constraints.maxHeight - margin * 2;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach(child => {
        const childSize = child.measure({
          minWidth: 0,
          maxWidth: direction === 'row' ? (containerWidth - padding * 2) / this.children.length : containerWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'column' ? (containerHeight - padding * 2) / this.children.length : containerHeight - padding * 2,
        });
        totalChildWidth = Math.max(totalChildWidth, childSize.width);
        totalChildHeight = Math.max(totalChildHeight, childSize.height);
      });

      if (!width && direction === 'row') {
        containerWidth = totalChildWidth * this.children.length + padding * 2;
      }
      if (!height && direction === 'column') {
        containerHeight = totalChildHeight * this.children.length + padding * 2;
      }
    }

    return { 
      width: Math.min(containerWidth, constraints.maxWidth), 
      height: Math.min(containerHeight, constraints.maxHeight) 
    };
  }

  place(x: number, y: number, width: number, height: number) {
    const { x: offsetX = 0, y: offsetY = 0, padding = 0, margin = 0, direction = 'row', align = 'start', justify = 'start' } = this.props;
    super.place(x + offsetX + margin, y + offsetY + margin, width, height);

    // 放置子元素
    if (this.children.length > 0) {
      const availableWidth = width - padding * 2;
      const availableHeight = height - padding * 2;
      const childCount = this.children.length;

      if (direction === 'row') {
        let childWidth = availableWidth / childCount;
        let startX = padding;

        // 处理justify
        if (justify === 'center') {
          startX = padding + (availableWidth - childWidth * childCount) / 2;
        } else if (justify === 'end') {
          startX = padding + availableWidth - childWidth * childCount;
        } else if (justify === 'space-between') {
          childWidth = (availableWidth - (childCount - 1) * 10) / childCount;
          startX = padding;
        }

        this.children.forEach((child, index) => {
          let childY = padding;

          // 处理align
          if (align === 'center') {
            childY = padding + (availableHeight - child.measure({ 
              minWidth: 0, 
              maxWidth: childWidth, 
              minHeight: 0, 
              maxHeight: availableHeight 
            }).height) / 2;
          } else if (align === 'end') {
            childY = padding + availableHeight - child.measure({ 
              minWidth: 0, 
              maxWidth: childWidth, 
              minHeight: 0, 
              maxHeight: availableHeight 
            }).height;
          }

          child.place(startX + index * (childWidth + (justify === 'space-between' ? 10 : 0)), childY, childWidth, availableHeight);
        });
      } else {
        let childHeight = availableHeight / childCount;
        let startY = padding;

        // 处理justify
        if (justify === 'center') {
          startY = padding + (availableHeight - childHeight * childCount) / 2;
        } else if (justify === 'end') {
          startY = padding + availableHeight - childHeight * childCount;
        } else if (justify === 'space-between') {
          childHeight = (availableHeight - (childCount - 1) * 10) / childCount;
          startY = padding;
        }

        this.children.forEach((child, index) => {
          let childX = padding;

          // 处理align
          if (align === 'center') {
            childX = padding + (availableWidth - child.measure({ 
              minWidth: 0, 
              maxWidth: availableWidth, 
              minHeight: 0, 
              maxHeight: childHeight 
            }).width) / 2;
          } else if (align === 'end') {
            childX = padding + availableWidth - child.measure({ 
              minWidth: 0, 
              maxWidth: availableWidth, 
              minHeight: 0, 
              maxHeight: childHeight 
            }).width;
          }

          child.place(childX, startY + index * (childHeight + (justify === 'space-between' ? 10 : 0)), availableWidth, childHeight);
        });
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // 布局组件不需要绘制自身，只需要绘制子元素，由渲染器负责
  }
}

export function ContainerComponent(props: ContainerProps) {
  return new Container(props);
}
