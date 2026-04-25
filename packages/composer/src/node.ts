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

export interface EventHandler {
  (event: any, ...args: any[]): void;
}

export interface ComposeNodeProps {
  [key: string]: any;
}

import { DrawAPI } from '@pug/renderer';
import { AppContext } from '@pug/core';

export class ComposeNode<P extends ComposeNodeProps = ComposeNodeProps> {
  readonly key: string;
  children: ComposeNode[] = [];
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  handlers: Record<string, EventHandler> = {};
  props: P = {} as P;
  private _dirty = false;
  private _layoutDirty = false;
  parent: ComposeNode | null = null;
  appContext: AppContext | null = null;

  constructor(key: string = Math.random().toString(36).substr(2, 9), props?: P, appContext?: AppContext) {
    this.key = key;
    if (props) {
      this.props = props;
    }
    this.appContext = appContext || null;
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
    if (this._layoutDirty) return; // 避免重复标记
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
    if (!child) return; // 类型保护
    child.parent = this;
    // 传递 appContext 给子节点
    if (!child.appContext && this.appContext) {
      child.appContext = this.appContext;
    }
    this.children.push(child);
    this.markLayoutDirty();
  }

  removeChild(child: ComposeNode): void {
    if (!child) return; // 类型保护
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

  draw(_drawApi: DrawAPI): void {
    // 由子类实现
  }

  // 递归获取所有脏节点
  getDirtyNodes(): ComposeNode[] {
    const dirtyNodes: ComposeNode[] = [];
    if (this.dirty) {
      dirtyNodes.push(this);
    }
    for (const child of this.children) {
      if (child) {
        dirtyNodes.push(...child.getDirtyNodes());
      }
    }
    return dirtyNodes;
  }

  // 递归清理所有节点的脏状态
  clearAllDirty(): void {
    this.clearDirty();
    for (const child of this.children) {
      if (child) {
        child.clearAllDirty();
      }
    }
  }
}
