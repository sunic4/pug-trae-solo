import { ComposeNode } from '@pug/composer';

export function hitTest(root: ComposeNode, x: number, y: number): ComposeNode | null {
  // 调试信息
  function debugTest(node: ComposeNode, depth: number = 0, absoluteX: number = 0, absoluteY: number = 0): ComposeNode | null {
    const indent = '  '.repeat(depth);
    
    // 计算节点的绝对坐标
    const nodeAbsoluteX = absoluteX + node.x;
    const nodeAbsoluteY = absoluteY + node.y;
    
    console.log(`${indent}[HITTEST] Checking ${node.constructor.name} at (${nodeAbsoluteX}, ${nodeAbsoluteY}) size (${node.width}, ${node.height})`);
    
    // 检查是否在范围内
    const inBounds = x >= nodeAbsoluteX && x < nodeAbsoluteX + node.width && 
                    y >= nodeAbsoluteY && y < nodeAbsoluteY + node.height;
    
    console.log(`${indent}[HITTEST] Point (${x}, ${y}) in bounds: ${inBounds}`);
    
    if (!inBounds) {
      console.log(`${indent}[HITTEST] Missed ${node.constructor.name}`);
      return null;
    }

    // 反向遍历子节点（后绘制的在上面）
    for (let i = node.children.length - 1; i >= 0; i--) {
      const child = node.children[i];
      const found = debugTest(child, depth + 1, nodeAbsoluteX, nodeAbsoluteY);
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
