import { ComposeNode } from '@pug/composer';

export function hitTest(root: ComposeNode, x: number, y: number): ComposeNode | null {
  // 调试信息
  function debugTest(node: ComposeNode, depth: number = 0): ComposeNode | null {
    const indent = '  '.repeat(depth);
    
    console.log(`${indent}[HITTEST] Checking ${node.constructor.name} at (${node.x}, ${node.y}) size (${node.width}, ${node.height})`);
    
    if (!node.containsPoint(x, y)) {
      console.log(`${indent}[HITTEST] Missed ${node.constructor.name}`);
      return null;
    }

    console.log(`${indent}[HITTEST] In bounds for ${node.constructor.name}`);

    // 反向遍历子节点（后绘制的在上面）
    for (let i = node.children.length - 1; i >= 0; i--) {
      const child = node.children[i];
      const found = debugTest(child, depth + 1);
      if (found) {
        console.log(`${indent}[HITTEST] Found target in child: ${found.constructor.name}`);
        return found;
      }
    }

    console.log(`${indent}[HITTEST] Hit ${node.constructor.name}`);
    return node;
  }

  console.log('[HITTEST] Starting hit test at (', x, ',', y, ')');
  const result = debugTest(root);
  console.log('[HITTEST] Final result:', result ? result.constructor.name : 'null');
  return result;
}
