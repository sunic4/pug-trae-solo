import { ComposeNode } from './node';
import { SlotTable } from './slot-table';
import { setCurrentContext } from '@pug/reactivity';

export type ComposableFunction = (...args: any[]) => ComposeNode;

export class Composer {
  private rootNode: ComposeNode | null = null;
  private slotTable = new SlotTable();
  private dirtyNodes = new Set<ComposeNode>();

  constructor() {
    // 初始化逻辑
    this.rootNode = null;
    this.slotTable = new SlotTable();
    this.dirtyNodes = new Set<ComposeNode>();
  }

  startCompose(fn: ComposableFunction): ComposeNode {
    // 类型检查
    if (!fn || typeof fn !== 'function') {
      throw new Error('Invalid composable function');
    }
    
    // 设置当前上下文
    setCurrentContext(this);
    
    // 重置槽位表
    this.slotTable.reset();
    
    try {
      const node = fn();
      // 确保返回值是 ComposeNode
      if (!node || !(node instanceof ComposeNode)) {
        throw new Error('Composable function must return a ComposeNode');
      }
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
    try {
      // 清理槽位表中不再使用的节点
      this.slotTable.cleanup();
      
      // 清理脏节点集合
      this.dirtyNodes.clear();
      
      // 清理根节点引用（如果需要）
      // 注意：这里不清理 rootNode，因为它可能仍然被使用
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  markDirty(node: ComposeNode): void {
    this.dirtyNodes.add(node);
  }

  recompose(): void {
    // 处理脏节点
    const validNodes = Array.from(this.dirtyNodes).filter(node => {
      return node && node instanceof ComposeNode;
    });
    
    validNodes.forEach(node => {
      try {
        // 清除脏状态
        node.clearDirty();
        // 触发节点的重新测量和放置
        if (node.parent) {
          // 标记节点为布局脏，让渲染器处理布局更新
          node.markLayoutDirty();
        }
      } catch (error) {
        console.error('Error processing dirty node:', error);
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

  // 获取脏节点集合
  getDirtyNodes(): Set<ComposeNode> {
    return new Set(this.dirtyNodes);
  }

  // 清空脏节点集合
  clearDirtyNodes(): void {
    this.dirtyNodes.clear();
  }

  // 检查是否有脏节点
  hasDirtyNodes(): boolean {
    return this.dirtyNodes.size > 0;
  }

  // 清理所有资源
  dispose(): void {
    try {
      // 清理槽位表
      this.slotTable.cleanup();
      
      // 清空脏节点集合
      this.dirtyNodes.clear();
      
      // 清理根节点引用
      this.rootNode = null;
    } catch (error) {
      console.error('Error during dispose:', error);
    }
  }
}

// 全局 composer 实例
let globalComposer: Composer | null = null;

export function setComposer(composer: Composer): void {
  // 类型检查
  if (composer && composer instanceof Composer) {
    globalComposer = composer;
  }
}

export function getComposer(): Composer | null {
  return globalComposer;
}

// 清理全局 composer 实例
export function clearComposer(): void {
  globalComposer = null;
}
