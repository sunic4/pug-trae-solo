import type { Point } from '@pug-canvas-ui/render'
import type { MeasureResult } from '@pug-canvas-ui/layout'

interface HitTestResult {
  readonly node: HitTestableNode
  readonly localPosition: Point
}

interface HitTestableNode {
  readonly id: number
  readonly position: { x: number; y: number }
  readonly measureResult: MeasureResult | null
  readonly children: HitTestableNode[]
  parent: HitTestableNode | null
}


function isPointInNode(node: HitTestableNode, x: number, y: number): boolean {
  if (node.measureResult === null) return false
  const nx = node.position.x
  const ny = node.position.y
  const nw = node.measureResult.width
  const nh = node.measureResult.height
  return x >= nx && x <= nx + nw && y >= ny && y <= ny + nh
}


function hitTest(root: HitTestableNode, x: number, y: number): HitTestResult | null {
  const result = _hitTestRecursive(root, x, y)
  if (result === null) return null
  return {
    node: result,
    localPosition: {
      x: x - result.position.x,
      y: y - result.position.y,
    },
  }
}

function _hitTestRecursive(node: HitTestableNode, x: number, y: number): HitTestableNode | null {
  if (!isPointInNode(node, x, y)) return null

  for (let i = node.children.length - 1; i >= 0; i--) {
    const child = node.children[i]!
    const hit = _hitTestRecursive(child, x, y)
    if (hit !== null) return hit
  }

  return node
}

export type { HitTestResult, HitTestableNode }
export { hitTest, isPointInNode }
