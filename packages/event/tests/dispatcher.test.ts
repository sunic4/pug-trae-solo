import { describe, it, expect, vi } from 'vitest';
import { EventDispatcher } from '../src/dispatcher.js';
import { ComposeNode, Constraints, Size } from '../../composer/src/node.js';

class TestNode extends ComposeNode {
  constructor(key: string, w: number, h: number) {
    super(key);
    this.width = w;
    this.height = h;
  }
  measure(_c: Constraints): Size { return { width: this.width, height: this.height }; }
}

describe('EventDispatcher', () => {
  it('should dispatch click to hit node', () => {
    const root = new TestNode('root', 200, 200);
    root.x = 0; root.y = 0;
    const child = new TestNode('child', 50, 50);
    child.x = 10; child.y = 10;
    root.addChild(child);

    const handler = vi.fn();
    child.handlers['click'] = handler;

    const dispatcher = new EventDispatcher(root);
    dispatcher.dispatch('click', 30, 30);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should not dispatch when no node hit', () => {
    const root = new TestNode('root', 100, 100);
    root.x = 0; root.y = 0;
    const handler = vi.fn();
    root.handlers['click'] = handler;

    const dispatcher = new EventDispatcher(root);
    dispatcher.dispatch('click', 200, 200);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should dispatch mousemove for hover tracking', () => {
    const root = new TestNode('root', 200, 200);
    root.x = 0; root.y = 0;
    const handler = vi.fn();
    root.handlers['mousemove'] = handler;

    const dispatcher = new EventDispatcher(root);
    dispatcher.dispatch('mousemove', 100, 100);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should track hover enter and leave', () => {
    const root = new TestNode('root', 200, 200);
    root.x = 0; root.y = 0;
    const child = new TestNode('child', 50, 50);
    child.x = 10; child.y = 10;
    root.addChild(child);

    const enterHandler = vi.fn();
    const leaveHandler = vi.fn();
    child.handlers['mouseenter'] = enterHandler;
    child.handlers['mouseleave'] = leaveHandler;

    const dispatcher = new EventDispatcher(root);

    // Enter child
    dispatcher.dispatch('mousemove', 30, 30);
    expect(enterHandler).toHaveBeenCalledTimes(1);
    expect(leaveHandler).not.toHaveBeenCalled();

    // Leave child
    dispatcher.dispatch('mousemove', 150, 150);
    expect(leaveHandler).toHaveBeenCalledTimes(1);
  });
});
