import { describe, it, expect } from 'vitest';
import { hitTest } from '../src/hit-test.js';
import { ComposeNode, Constraints, Size } from '../../composer/src/node.js';

class TestNode extends ComposeNode {
  constructor(key: string, w: number, h: number) {
    super(key);
    this.width = w;
    this.height = h;
  }
  measure(_c: Constraints): Size { return { width: this.width, height: this.height }; }
}

describe('hitTest', () => {
  it('should find leaf node at point', () => {
    const parent = new TestNode('parent', 200, 200);
    parent.x = 0; parent.y = 0;
    const child = new TestNode('child', 50, 50);
    child.x = 10; child.y = 10;
    parent.addChild(child);

    const result = hitTest(parent, 30, 30);
    expect(result).toBe(child);
  });

  it('should return parent when no child matches', () => {
    const parent = new TestNode('parent', 200, 200);
    parent.x = 0; parent.y = 0;
    const child = new TestNode('child', 50, 50);
    child.x = 10; child.y = 10;
    parent.addChild(child);

    const result = hitTest(parent, 150, 150);
    expect(result).toBe(parent);
  });

  it('should return null when point is outside tree', () => {
    const node = new TestNode('node', 100, 100);
    node.x = 0; node.y = 0;
    expect(hitTest(node, 200, 200)).toBeNull();
  });

  it('should prefer deeper (later-drawn) child', () => {
    const parent = new TestNode('parent', 200, 200);
    parent.x = 0; parent.y = 0;
    const c1 = new TestNode('c1', 100, 100);
    c1.x = 0; c1.y = 0;
    const c2 = new TestNode('c2', 100, 100);
    c2.x = 0; c2.y = 0;
    parent.addChild(c1);
    parent.addChild(c2);

    const result = hitTest(parent, 50, 50);
    expect(result).toBe(c2); // c2 is drawn later, on top
  });
});
