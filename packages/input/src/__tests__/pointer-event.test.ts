// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { toPointerEventType, createPointerEventData } from '../pointer-event'
import type { HitTestableNode } from '../hit-test'
import { hitTest, isPointInNode } from '../hit-test'
import { createPointerEventDispatcher } from '../pointer-dispatcher'
import { createMockPointerEvent, createMockCanvasRect } from './mocks'

describe('toPointerEventType', () => {
  it('should map pointermove to move', () => {
    expect(toPointerEventType('pointermove')).toBe('move')
  })

  it('should map pointerup to up', () => {
    expect(toPointerEventType('pointerup')).toBe('up')
  })

  it('should map pointercancel to cancel', () => {
    expect(toPointerEventType('pointercancel')).toBe('cancel')
  })

  it('should throw for unknown event type', () => {
    expect(() => toPointerEventType('unknown')).toThrow('Unsupported pointer event type: unknown')
  })
})

describe('createPointerEventData', () => {
  it('should convert native event to PointerEventData', () => {
    const nativeEvent = createMockPointerEvent({
      pointerId: 1,
      type: 'pointerdown',
      clientX: 100,
      clientY: 200,
      pressure: 0.5,
      tiltX: 10,
      tiltY: 20,
      buttons: 1,
      isPrimary: true,
    })

    const canvasRect = createMockCanvasRect({ left: 10, top: 20, width: 400, height: 800 })
    const data = createPointerEventData(nativeEvent, canvasRect, { x: 0, y: 0 })

    expect(data.pointerId).toBe(1)
    expect(data.type).toBe('down')
    expect(data.pressure).toBe(0.5)
    expect(data.tiltX).toBe(10)
    expect(data.tiltY).toBe(20)
    expect(data.buttons).toBe(1)
    expect(data.isPrimary).toBe(true)
  })

  it('should apply DPR scaling to position', () => {
    const nativeEvent = createMockPointerEvent({
      type: 'pointermove',
      clientX: 110,
      clientY: 120,
    })

    const canvasRect = createMockCanvasRect({ left: 10, top: 20, width: 400, height: 800 })
    const data = createPointerEventData(nativeEvent, canvasRect, { x: 0, y: 0 })

    const dpr = 1
    expect(data.position.x).toBe((110 - 10) * dpr)
    expect(data.position.y).toBe((120 - 20) * dpr)
  })

  it('should use provided localPosition', () => {
    const nativeEvent = createMockPointerEvent({ type: 'pointerup' })

    const canvasRect = createMockCanvasRect({ left: 0, top: 0, width: 400, height: 800 })
    const local = { x: 5, y: 10 }
    const data = createPointerEventData(nativeEvent, canvasRect, local)
    expect(data.localPosition).toEqual(local)
  })
})

function makeNode(
  id: number,
  x: number,
  y: number,
  w: number,
  h: number,
  children: HitTestableNode[] = [],
  parent: HitTestableNode | null = null,
): HitTestableNode {
  return {
    id,
    position: { x, y },
    measureResult: { width: w, height: h, alignmentLines: new Map() },
    children,
    parent,
  }
}

describe('isPointInNode', () => {
  it('should return true for point inside node bounds', () => {
    const node = makeNode(1, 10, 20, 100, 50)
    expect(isPointInNode(node, 50, 40)).toBe(true)
  })

  it('should return true for point on edge', () => {
    const node = makeNode(1, 10, 20, 100, 50)
    expect(isPointInNode(node, 10, 20)).toBe(true)
    expect(isPointInNode(node, 110, 70)).toBe(true)
  })

  it('should return false for point outside node bounds', () => {
    const node = makeNode(1, 10, 20, 100, 50)
    expect(isPointInNode(node, 5, 15)).toBe(false)
    expect(isPointInNode(node, 120, 80)).toBe(false)
  })

  it('should return false for node without measureResult', () => {
    const node: HitTestableNode = {
      id: 1,
      position: { x: 0, y: 0 },
      measureResult: null,
      children: [],
      parent: null,
    }
    expect(isPointInNode(node, 0, 0)).toBe(false)
  })
})

describe('hitTest', () => {
  it('should return null for empty tree (no root match)', () => {
    const root = makeNode(1, 0, 0, 100, 100)
    expect(hitTest(root, 200, 200)).toBeNull()
  })

  it('should return root when point hits root only', () => {
    const root = makeNode(1, 0, 0, 200, 200)
    const result = hitTest(root, 50, 50)
    expect(result).not.toBeNull()
    expect(result!.node.id).toBe(1)
    expect(result!.localPosition).toEqual({ x: 50, y: 50 })
  })

  it('should return deepest child when point hits nested node', () => {
    const child = makeNode(2, 50, 50, 80, 80)
    const root = makeNode(1, 0, 0, 200, 200, [child])
    child.parent = root

    const result = hitTest(root, 80, 80)
    expect(result).not.toBeNull()
    expect(result!.node.id).toBe(2)
    expect(result!.localPosition).toEqual({ x: 30, y: 30 })
  })

  it('should return last child when children overlap (z-order)', () => {
    const childA = makeNode(2, 10, 10, 100, 100)
    const childB = makeNode(3, 10, 10, 100, 100)
    const root = makeNode(1, 0, 0, 200, 200, [childA, childB])
    childA.parent = root
    childB.parent = root

    const result = hitTest(root, 50, 50)
    expect(result).not.toBeNull()
    expect(result!.node.id).toBe(3)
  })

  it('should skip children without measureResult', () => {
    const child: HitTestableNode = {
      id: 2,
      position: { x: 50, y: 50 },
      measureResult: null,
      children: [],
      parent: null,
    }
    const root = makeNode(1, 0, 0, 200, 200, [child])
    child.parent = root

    const result = hitTest(root, 80, 80)
    expect(result).not.toBeNull()
    expect(result!.node.id).toBe(1)
  })
})

describe('PointerEventDispatcher', () => {
  it('should create a dispatcher instance', () => {
    const dispatcher = createPointerEventDispatcher()
    expect(dispatcher).toBeDefined()
    dispatcher.dispose()
  })

  it('should throw when attaching after dispose', () => {
    const dispatcher = createPointerEventDispatcher()
    dispatcher.dispose()
    expect(() => dispatcher.attach(document.createElement('canvas'))).toThrow('Dispatcher has been disposed')
  })

  it('should detach cleanly', () => {
    const dispatcher = createPointerEventDispatcher()
    dispatcher.detach()
    dispatcher.dispose()
  })

  it('should accept root node and resolver', () => {
    const dispatcher = createPointerEventDispatcher()
    const root = makeNode(1, 0, 0, 100, 100)
    dispatcher.setRootNode(root)
    dispatcher.setHandlerResolver(() => null)
    dispatcher.dispose()
  })
})
