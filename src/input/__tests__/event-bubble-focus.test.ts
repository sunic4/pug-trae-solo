import { describe, it, expect, vi } from 'vitest'
import { createEventBubbleDispatcher } from '@/input/event-bubble'
import { createFocusManager, createFocusRequester } from '@/input/focus-manager'
import type { HitTestableNode, HitTestResult } from '@/input/hit-test'
import type { PointerEventData, PointerInputHandler } from '@/input/pointer-event'
import type { EventBubbleDispatcher } from '@/input/event-bubble'
import type { FocusManager, FocusRequester } from '@/input/focus-manager'

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

function makePointerEvent(opts: Partial<PointerEventData> = {}): PointerEventData {
  return {
    pointerId: 0,
    type: 'down',
    position: { x: 0, y: 0 },
    localPosition: { x: 0, y: 0 },
    pressure: 0.5,
    tiltX: 0,
    tiltY: 0,
    timestamp: Date.now(),
    buttons: 1,
    isPrimary: true,
    ...opts,
  }
}

describe('EventBubbleDispatcher', () => {
  it('should dispatch event to target node handler', () => {
    const dispatcher = createEventBubbleDispatcher()
    const handler = vi.fn()
    const child = makeNode(2, 50, 50, 80, 80)
    const root = makeNode(1, 0, 0, 200, 200, [child])
    child.parent = root

    const hitResult: HitTestResult = { node: child, localPosition: { x: 10, y: 10 } }
    const event = makePointerEvent()
    const resolver = (node: HitTestableNode) => node.id === 2 ? handler : null

    dispatcher.dispatch(root, event, hitResult, resolver)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should bubble event to parent handlers', () => {
    const dispatcher = createEventBubbleDispatcher()
    const parentHandler = vi.fn()
    const childHandler = vi.fn()
    const child = makeNode(2, 50, 50, 80, 80)
    const root = makeNode(1, 0, 0, 200, 200, [child])
    child.parent = root

    const hitResult: HitTestResult = { node: child, localPosition: { x: 10, y: 10 } }
    const event = makePointerEvent()
    const resolver = (node: HitTestableNode): PointerInputHandler | null => {
      if (node.id === 1) return parentHandler
      if (node.id === 2) return childHandler
      return null
    }

    dispatcher.dispatch(root, event, hitResult, resolver)
    expect(childHandler).toHaveBeenCalledTimes(1)
    expect(parentHandler).toHaveBeenCalledTimes(1)
  })

  it('should stop bubbling when propagation is consumed', () => {
    const dispatcher = createEventBubbleDispatcher()
    const parentHandler = vi.fn()
    const childHandler = vi.fn()
    const child = makeNode(2, 50, 50, 80, 80)
    const root = makeNode(1, 0, 0, 200, 200, [child])
    child.parent = root

    const hitResult: HitTestResult = { node: child, localPosition: { x: 10, y: 10 } }
    const event = makePointerEvent()

    dispatcher.setBubbleHandler((propagation) => {
      if (propagation.target.id === 2) {
        propagation.consume()
      }
    })

    const resolver = (node: HitTestableNode): PointerInputHandler | null => {
      if (node.id === 1) return parentHandler
      if (node.id === 2) return childHandler
      return null
    }

    dispatcher.dispatch(root, event, hitResult, resolver)
    expect(childHandler).toHaveBeenCalledTimes(1)
    expect(parentHandler).not.toHaveBeenCalled()
  })

  it('should intercept event in capture phase', () => {
    const dispatcher = createEventBubbleDispatcher()
    const childHandler = vi.fn()
    const child = makeNode(2, 50, 50, 80, 80)
    const root = makeNode(1, 0, 0, 200, 200, [child])
    child.parent = root

    const hitResult: HitTestResult = { node: child, localPosition: { x: 10, y: 10 } }
    const event = makePointerEvent()

    dispatcher.setInterceptHandler(() => true)

    const resolver = (node: HitTestableNode): PointerInputHandler | null => {
      if (node.id === 2) return childHandler
      return null
    }

    dispatcher.dispatch(root, event, hitResult, resolver)
    expect(childHandler).not.toHaveBeenCalled()
  })

  it('should handle no handler for target gracefully', () => {
    const dispatcher = createEventBubbleDispatcher()
    const child = makeNode(2, 50, 50, 80, 80)
    const root = makeNode(1, 0, 0, 200, 200, [child])
    child.parent = root

    const hitResult: HitTestResult = { node: child, localPosition: { x: 10, y: 10 } }
    const event = makePointerEvent()
    const resolver = () => null

    expect(() => dispatcher.dispatch(root, event, hitResult, resolver)).not.toThrow()
  })
})

describe('FocusManager', () => {
  it('should request and track focus', () => {
    const manager = createFocusManager()
    const requester = createFocusRequester(manager)
    manager.addRequester(requester)

    expect(manager.requestFocus(requester)).toBe(true)
    expect(manager.currentFocus).toBe(requester)
    manager.dispose()
  })

  it('should free focus', () => {
    const manager = createFocusManager()
    const requester = createFocusRequester(manager)
    manager.addRequester(requester)
    manager.requestFocus(requester)

    manager.freeFocus()
    expect(manager.currentFocus).toBeNull()
    manager.dispose()
  })

  it('should not focus unregistered requester', () => {
    const manager = createFocusManager()
    const requester = createFocusRequester()

    expect(manager.requestFocus(requester)).toBe(false)
    expect(manager.currentFocus).toBeNull()
    manager.dispose()
  })

  it('should move focus to next', () => {
    const manager = createFocusManager()
    const r1 = createFocusRequester(manager)
    const r2 = createFocusRequester(manager)
    const r3 = createFocusRequester(manager)
    manager.addRequester(r1)
    manager.addRequester(r2)
    manager.addRequester(r3)

    manager.requestFocus(r1)
    expect(manager.moveFocus('next')).toBe(true)
    expect(manager.currentFocus).toBe(r2)
    expect(manager.moveFocus('next')).toBe(true)
    expect(manager.currentFocus).toBe(r3)
    expect(manager.moveFocus('next')).toBe(true)
    expect(manager.currentFocus).toBe(r1)
    manager.dispose()
  })

  it('should move focus to previous', () => {
    const manager = createFocusManager()
    const r1 = createFocusRequester(manager)
    const r2 = createFocusRequester(manager)
    manager.addRequester(r1)
    manager.addRequester(r2)

    manager.requestFocus(r1)
    expect(manager.moveFocus('previous')).toBe(true)
    expect(manager.currentFocus).toBe(r2)
    manager.dispose()
  })

  it('should remove requester and clear focus if focused', () => {
    const manager = createFocusManager()
    const requester = createFocusRequester(manager)
    manager.addRequester(requester)
    manager.requestFocus(requester)

    manager.removeRequester(requester)
    expect(manager.currentFocus).toBeNull()
    manager.dispose()
  })

  it('should not operate after dispose', () => {
    const manager = createFocusManager()
    const requester = createFocusRequester(manager)
    manager.addRequester(requester)
    manager.dispose()

    expect(manager.requestFocus(requester)).toBe(false)
    expect(manager.currentFocus).toBeNull()
  })

  it('should move focus with no current focus', () => {
    const manager = createFocusManager()
    const r1 = createFocusRequester(manager)
    const r2 = createFocusRequester(manager)
    manager.addRequester(r1)
    manager.addRequester(r2)

    expect(manager.moveFocus('next')).toBe(true)
    expect(manager.currentFocus).toBe(r1)
    manager.dispose()
  })

  it('should not move focus with empty requesters', () => {
    const manager = createFocusManager()
    expect(manager.moveFocus('next')).toBe(false)
    manager.dispose()
  })
})

describe('FocusRequester', () => {
  it('should request focus through manager', () => {
    const manager = createFocusManager()
    const requester = createFocusRequester(manager)
    manager.addRequester(requester)

    requester.requestFocus()
    expect(manager.currentFocus).toBe(requester)
    manager.dispose()
  })

  it('should free focus through manager', () => {
    const manager = createFocusManager()
    const requester = createFocusRequester(manager)
    manager.addRequester(requester)
    requester.requestFocus()

    requester.freeFocus()
    expect(manager.currentFocus).toBeNull()
    manager.dispose()
  })

  it('should have unique ids', () => {
    const manager = createFocusManager()
    const r1 = createFocusRequester()
    const r2 = createFocusRequester()
    manager.addRequester(r1)
    manager.addRequester(r2)
    expect(r1.id).not.toBe(r2.id)
  })
})
