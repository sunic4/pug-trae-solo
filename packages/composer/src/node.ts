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
  props: any = {};
  private _dirty = false;
  private _layoutDirty = false;
  parent: ComposeNode | null = null;

  constructor(key: string = Math.random().toString(36).substr(2, 9)) {
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
    // 向上标记父节点为布局脏
    if (this.parent) {
      this.parent.markLayoutDirty();
    }
  }

  clearDirty(): void {
    this._dirty = false;
    this._layoutDirty = false;
  }

  addChild(child: ComposeNode): void {
    child.parent = this;
    this.children.push(child);
    this.markLayoutDirty();
  }

  removeChild(child: ComposeNode): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      child.parent = null;
      this.children.splice(index, 1);
      this.markLayoutDirty();
    }
  }

  containsPoint(x: number, y: number): boolean {
    return x >= this.x && x < this.x + this.width && y >= this.y && y < this.y + this.height;
  }

  // 布局相关方法，由子类实现
  measure(_constraints: Constraints): Size {
    return { width: 0, height: 0 };
  }

  place(x: number, y: number, width: number, height: number): void {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.placeChildren();
  }

  placeChildren(): void {
    // 由子类实现
  }

  // 绘制相关方法，由子类实现
  drawCommands(): any[] {
    return [];
  }

  draw(_ctx: CanvasRenderingContext2D): void {
    // 由子类实现
  }

  // 递归获取所有脏节点
  getDirtyNodes(): ComposeNode[] {
    const dirtyNodes: ComposeNode[] = [];
    if (this.dirty) {
      dirtyNodes.push(this);
    }
    for (const child of this.children) {
      dirtyNodes.push(...child.getDirtyNodes());
    }
    return dirtyNodes;
  }

  // 递归清理所有节点的脏状态
  clearAllDirty(): void {
    this.clearDirty();
    for (const child of this.children) {
      child.clearAllDirty();
    }
  }
}
