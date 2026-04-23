import { ComposeNode } from './node.js';
import { SlotTable } from './slot-table.js';
import { setCurrentContext } from '../../reactivity/src/context.js';

export type ComposableFunction = () => ComposeNode;

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
    } finally {
      setCurrentContext(null);
    }
  }

  endCompose(): void {
    // 清理不再使用的节点
    this.cleanupUnusedNodes();
  }

  private cleanupUnusedNodes(): void {
    // 这里简化实现，实际应该遍历槽位表，清理不再使用的节点
  }

  markDirty(node: ComposeNode): void {
    this.dirtyNodes.add(node);
  }

  recompose(): void {
    // 处理脏节点
    this.dirtyNodes.forEach(node => {
      node.clearDirty();
      // 这里可以添加重组逻辑
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
