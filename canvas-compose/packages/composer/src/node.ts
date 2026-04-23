export interface Size {
  width: number;
  height: number;
}

export interface Constraints {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

export class ComposeNode {
  readonly key: string;
  children: ComposeNode[] = [];
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  handlers: Record<string, (...args: any[]) => void> = {};
  private _dirty = false;
  private _layoutDirty = false;

  constructor(key: string) {
    this.key = key;
  }

  get dirty(): boolean {
    return this._dirty;
  }

  get layoutDirty(): boolean {
    return this._layoutDirty;
  }

  markDirty(): void {
    this._dirty = true;
  }

  markLayoutDirty(): void {
    this._layoutDirty = true;
    this.markDirty();
  }

  clearDirty(): void {
    this._dirty = false;
    this._layoutDirty = false;
  }

  addChild(child: ComposeNode): void {
    this.children.push(child);
    this.markLayoutDirty();
  }

  removeChild(child: ComposeNode): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      this.markLayoutDirty();
    }
  }

  containsPoint(x: number, y: number): boolean {
    return x >= this.x && x < this.x + this.width && y >= this.y && y < this.y + this.height;
  }

  // 布局相关方法，由子类实现
  measure(constraints: Constraints): Size {
    return { width: 0, height: 0 };
  }

  placeChildren(): void {
    // 由子类实现
  }

  // 绘制相关方法，由子类实现
  drawCommands(): any[] {
    return [];
  }
}
