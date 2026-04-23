import { describe, it, expect } from 'vitest';
import { SlotTable } from '../src/slot-table.js';
import { ComposeNode } from '../src/node.js';

describe('SlotTable', () => {
  it('should manage slots', () => {
    const slotTable = new SlotTable();
    const node1 = new ComposeNode('node1');
    const node2 = new ComposeNode('node2');

    slotTable.setSlot(0, node1);
    expect(slotTable.getSlot(0)).toBe(node1);

    slotTable.setSlot(1, node2);
    expect(slotTable.getSlot(1)).toBe(node2);

    slotTable.removeSlot(0);
    expect(slotTable.getSlot(0)).toBeUndefined();
  });

  it('should track current slot', () => {
    const slotTable = new SlotTable();
    expect(slotTable.getCurrentSlot()).toBe(0);

    const slot1 = slotTable.incrementSlot();
    expect(slot1).toBe(0);
    expect(slotTable.getCurrentSlot()).toBe(1);

    const slot2 = slotTable.incrementSlot();
    expect(slot2).toBe(1);
    expect(slotTable.getCurrentSlot()).toBe(2);
  });

  it('should reset slot counter', () => {
    const slotTable = new SlotTable();
    slotTable.incrementSlot();
    slotTable.incrementSlot();
    expect(slotTable.getCurrentSlot()).toBe(2);

    slotTable.reset();
    expect(slotTable.getCurrentSlot()).toBe(0);
  });

  it('should clear all slots', () => {
    const slotTable = new SlotTable();
    const node = new ComposeNode('node');
    slotTable.setSlot(0, node);
    slotTable.incrementSlot();

    slotTable.clear();
    expect(slotTable.getCurrentSlot()).toBe(0);
    expect(slotTable.getSlot(0)).toBeUndefined();
  });
});
