import { describe, it, expect } from 'vitest';
import { ComposeNode, Constraints, Size } from '../src/node.js';

describe('ComposeNode', () => {
  it('should initialize with key', () => {
    const node = new ComposeNode('test');
    expect(node.key).toBe('test');
  });

  it('should manage children', () => {
    const parent = new ComposeNode('parent');
    const child1 = new ComposeNode('child1');
    const child2 = new ComposeNode('child2');

    parent.addChild(child1);
    expect(parent.children).toHaveLength(1);
    expect(parent.children[0]).toBe(child1);

    parent.addChild(child2);
    expect(parent.children).toHaveLength(2);

    parent.removeChild(child1);
    expect(parent.children).toHaveLength(1);
    expect(parent.children[0]).toBe(child2);
  });

  it('should track dirty state', () => {
    const node = new ComposeNode('test');
    expect(node.dirty).toBe(false);
    expect(node.layoutDirty).toBe(false);

    node.markDirty();
    expect(node.dirty).toBe(true);
    expect(node.layoutDirty).toBe(false);

    node.markLayoutDirty();
    expect(node.dirty).toBe(true);
    expect(node.layoutDirty).toBe(true);

    node.clearDirty();
    expect(node.dirty).toBe(false);
    expect(node.layoutDirty).toBe(false);
  });

  it('should check point containment', () => {
    const node = new ComposeNode('test');
    node.x = 10;
    node.y = 10;
    node.width = 50;
    node.height = 50;

    expect(node.containsPoint(15, 15)).toBe(true);
    expect(node.containsPoint(70, 15)).toBe(false);
    expect(node.containsPoint(15, 70)).toBe(false);
  });

  it('should return default size for measure', () => {
    const node = new ComposeNode('test');
    const constraints: Constraints = { minWidth: 0, maxWidth: 100, minHeight: 0, maxHeight: 100 };
    const size = node.measure(constraints);
    expect(size).toEqual({ width: 0, height: 0 });
  });

  it('should return empty draw commands', () => {
    const node = new ComposeNode('test');
    const commands = node.drawCommands();
    expect(commands).toEqual([]);
  });
});
