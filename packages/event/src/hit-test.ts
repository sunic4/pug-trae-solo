import { ComposeNode } from '@pug/composer';

export function hitTest(root: ComposeNode, x: number, y: number): ComposeNode | null {
  if (!root.containsPoint(x, y)) return null;

  // 反向遍历子节点（后绘制的在上面）
  for (let i = root.children.length - 1; i >= 0; i--) {
    const child = root.children[i];
    const found = hitTest(child, x, y);
    if (found) return found;
  }

  return root;
}
