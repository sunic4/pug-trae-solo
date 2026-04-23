export interface GestureEvent {
  type: string;
  x: number;
  y: number;
  timestamp: number;
}

export interface TapGestureResult {
  type: 'tap';
  x: number;
  y: number;
  tapCount: number;
}

export interface LongPressGestureResult {
  type: 'longPress';
  x: number;
  y: number;
}

export interface DragGestureResult {
  type: 'drag';
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  velocityX: number;
  velocityY: number;
}

export type GestureResult = TapGestureResult | LongPressGestureResult | DragGestureResult;

export class GestureDetector {
  private touchStartX = 0;
  private touchStartY = 0;
  private tapCount = 0;
  private tapTimeout: number | null = null;
  private longPressTimeout: number | null = null;
  private isDragging = false;
  private lastDragX = 0;
  private lastDragY = 0;
  private lastDragTime = 0;

  onTouchStart(x: number, y: number, timestamp: number): void {
    this.touchStartX = x;
    this.touchStartY = y;
    this.lastDragX = x;
    this.lastDragY = y;
    this.lastDragTime = timestamp;

    // 启动长按检测
    this.longPressTimeout = window.setTimeout(() => {
      this.onLongPress(x, y);
    }, 500);
  }

  onTouchMove(x: number, y: number, timestamp: number): void {
    // 计算移动距离
    const deltaX = x - this.touchStartX;
    const deltaY = y - this.touchStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // 如果移动距离超过阈值，取消长按检测并开始拖拽
    if (distance > 10 && !this.isDragging) {
      if (this.longPressTimeout) {
        clearTimeout(this.longPressTimeout);
        this.longPressTimeout = null;
      }
      this.isDragging = true;
    }

    // 处理拖拽
    if (this.isDragging) {
      const dragDeltaX = x - this.lastDragX;
      const dragDeltaY = y - this.lastDragY;
      const dragTimeDelta = timestamp - this.lastDragTime;
      const velocityX = dragTimeDelta > 0 ? dragDeltaX / dragTimeDelta : 0;
      const velocityY = dragTimeDelta > 0 ? dragDeltaY / dragTimeDelta : 0;

      this.onDrag(x, y, dragDeltaX, dragDeltaY, velocityX, velocityY);

      this.lastDragX = x;
      this.lastDragY = y;
      this.lastDragTime = timestamp;
    }
  }

  onTouchEnd(x: number, y: number, _timestamp: number): void {
    // 取消长按检测
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }

    // 处理点击
    if (!this.isDragging) {
      this.tapCount++;

      // 检查是否是双击
      if (this.tapTimeout) {
        clearTimeout(this.tapTimeout);
        this.tapTimeout = null;
        this.onTap(x, y, this.tapCount);
      } else {
        // 启动点击超时检测
        this.tapTimeout = window.setTimeout(() => {
          this.onTap(x, y, this.tapCount);
          this.tapCount = 0;
          this.tapTimeout = null;
        }, 300);
      }
    }

    // 重置状态
    this.isDragging = false;
  }

  private onTap(x: number, y: number, tapCount: number): void {
    // 触发点击事件
    const event: TapGestureResult = {
      type: 'tap',
      x,
      y,
      tapCount
    };
    this.onGesture(event);
  }

  private onLongPress(x: number, y: number): void {
    // 触发长按事件
    const event: LongPressGestureResult = {
      type: 'longPress',
      x,
      y
    };
    this.onGesture(event);
  }

  private onDrag(x: number, y: number, deltaX: number, deltaY: number, velocityX: number, velocityY: number): void {
    // 触发拖拽事件
    const event: DragGestureResult = {
      type: 'drag',
      x,
      y,
      deltaX,
      deltaY,
      velocityX,
      velocityY
    };
    this.onGesture(event);
  }

  protected onGesture(_gesture: GestureResult): void {
    // 子类实现
  }

  dispose(): void {
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
    }
    if (this.tapTimeout) {
      clearTimeout(this.tapTimeout);
    }
  }
}
