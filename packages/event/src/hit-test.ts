import { ComposeNode } from '@pug/composer';

export function hitTest(root: ComposeNode, x: number, y: number): ComposeNode | null {
  function testNode(node: ComposeNode): ComposeNode | null {
    if (!node.containsPoint(x, y)) {
      return null;
    }

    // 反向遍历子节点（后绘制的在上面）
    for (let i = node.children.length - 1; i >= 0; i--) {
      const child = node.children[i];
      const found = testNode(child);
      if (found) {
        return found;
      }
    }

    return node;
  }

  return testNode(root);
}
