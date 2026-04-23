import { ComposeNode } from '@pug/composer';
import { DrawAPI } from '@pug/renderer';

export interface SpacerProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}

export class Spacer extends ComposeNode {
  constructor(public props: SpacerProps) {
    super();
    this.markLayoutDirty();
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width = 0, height = 0 } = this.props;

    return { 
      width: Math.min(width, constraints.maxWidth), 
      height: Math.min(height, constraints.maxHeight) 
    };
  }

  place(x: number, y: number, width: number, height: number) {
    const { x: offsetX = 0, y: offsetY = 0 } = this.props;
    super.place(x + offsetX, y + offsetY, width, height);
  }

  draw(_drawApi: DrawAPI) {
    // Spacer 组件不需要绘制任何内容
  }
}

export function SpacerComponent(props: SpacerProps) {
  return new Spacer(props);
}
