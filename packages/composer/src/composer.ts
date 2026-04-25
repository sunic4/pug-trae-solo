import { ComposeNode } from './node';
import { SlotTable } from './slot-table';
import { setCurrentContext } from '@pug/reactivity';

export type ComposableFunction = (...args: any[]) => ComposeNode;

export class Composer {
  private rootNode: ComposeNode | null = null;
  private slotTable = new SlotTable();
  private dirtyNodes = new Set<ComposeNode>();

  startCompose(fn: ComposableFunction): ComposeNode {
    // 设置当前上下文
    setCurrentContext(this);
    
    // 重置槽位表
    this.slotTable.reset();
    
    try {
      const node = fn();
      this.rootNode = node;
      return node;
    } catch (error) {
      console.error('Error during composition:', error);
      throw error;
    } finally {
      setCurrentContext(null);
    }
  }

  endCompose(): void {
    // 清理不再使用的节点
    this.cleanupUnusedNodes();
  }

  private cleanupUnusedNodes(): void {
    // 清理槽位表中不再使用的节点
    this.slotTable.cleanup();
  }

  markDirty(node: ComposeNode): void {
    this.dirtyNodes.add(node);
  }

  recompose(): void {
    // 处理脏节点
    this.dirtyNodes.forEach(node => {
      // 清除脏状态
      node.clearDirty();
      // 触发节点的重新测量和放置
      if (node.parent) {
        // 标记节点为布局脏，让渲染器处理布局更新
        node.markLayoutDirty();
      }
    });
    this.dirtyNodes.clear();
  }

  getSlotTable(): SlotTable {
    return this.slotTable;
  }

  getRootNode(): ComposeNode | null {
    return this.rootNode;
  }
}

// 全局 composer 实例
let globalComposer: Composer | null = null;

export function setComposer(composer: Composer): void {
  globalComposer = composer;
}

export function getComposer(): Composer | null {
  return globalComposer;
}
