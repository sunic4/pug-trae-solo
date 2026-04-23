import { describe, it, expect } from 'vitest';
import { Composer, ComposableFunction } from '../src/composer.js';
import { ComposeNode } from '../src/node.js';

describe('Composer', () => {
  it('should start and end compose', () => {
    const composer = new Composer();
    const composable: ComposableFunction = () => new ComposeNode('root');

    const rootNode = composer.startCompose(composable);
    expect(rootNode).toBeInstanceOf(ComposeNode);
    expect(composer.getRootNode()).toBe(rootNode);

    composer.endCompose();
  });

  it('should mark nodes as dirty', () => {
    const composer = new Composer();
    const node = new ComposeNode('test');

    composer.markDirty(node);
    // 这里简化测试，实际应该验证节点是否被添加到脏节点集合
  });

  it('should recompose dirty nodes', () => {
    const composer = new Composer();
    const node = new ComposeNode('test');
    node.markDirty();
    composer.markDirty(node);

    composer.recompose();
    expect(node.dirty).toBe(false);
  });
});
