import { ComposeNode } from '@pug/composer';
import { hitTest } from './hit-test.js';

export class EventDispatcher {
  private rootNode: ComposeNode;
  private lastHovered: ComposeNode | null = null;

  constructor(rootNode: ComposeNode) {
    this.rootNode = rootNode;
  }

  dispatch(type: string, x: number, y: number): void {
    const target = hitTest(this.rootNode, x, y);

    // hover 追踪
    if (type === 'mousemove') {
      if (this.lastHovered !== target) {
        if (this.lastHovered && this.lastHovered.handlers['mouseleave']) {
          this.lastHovered.handlers['mouseleave'](x, y);
        }
        if (target && target.handlers['mouseenter']) {
          target.handlers['mouseenter'](x, y);
        }
        this.lastHovered = target;
      }
    }

    if (target && target.handlers[type]) {
      target.handlers[type](x, y);
    }
  }

  attachToCanvas(canvas: HTMLCanvasElement): () => void {
    const getPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onClick = (e: MouseEvent) => {
      const { x, y } = getPos(e);
      this.dispatch('click', x, y);
    };
    const onMouseMove = (e: MouseEvent) => {
      const { x, y } = getPos(e);
      this.dispatch('mousemove', x, y);
    };
    const onWheel = (e: WheelEvent) => {
      const { x, y } = getPos(e);
      this.dispatch('wheel', x, y);
    };

    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('wheel', onWheel);

    return () => {
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('wheel', onWheel);
    };
  }

  dispose(): void {
    this.lastHovered = null;
  }
}
