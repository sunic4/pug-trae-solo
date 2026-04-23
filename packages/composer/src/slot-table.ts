import { ComposeNode } from './node.js';

export class SlotTable {
  private slots: Map<number, ComposeNode> = new Map();
  private currentSlot: number = 0;

  getSlot(slot: number): ComposeNode | undefined {
    return this.slots.get(slot);
  }

  setSlot(slot: number, node: ComposeNode): void {
    this.slots.set(slot, node);
  }

  removeSlot(slot: number): void {
    this.slots.delete(slot);
  }

  getCurrentSlot(): number {
    return this.currentSlot;
  }

  incrementSlot(): number {
    return this.currentSlot++;
  }

  reset(): void {
    this.currentSlot = 0;
  }

  clear(): void {
    this.slots.clear();
    this.currentSlot = 0;
  }

  getSlots(): Map<number, ComposeNode> {
    return this.slots;
  }

  cleanup(): void {
    // 清理所有槽位，实际实现应该标记使用的节点并清理未使用的节点
    this.slots.clear();
  }
}
