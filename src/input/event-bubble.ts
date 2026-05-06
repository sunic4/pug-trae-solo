import type { HitTestableNode, HitTestResult } from '@/input/hit-test'
import type { PointerEventData, PointerInputHandler } from '@/input/pointer-event'

interface EventPropagation {
  readonly target: HitTestableNode
  readonly event: PointerEventData
  consumed: boolean
  intercepted: boolean
  stopPropagation(): void
  consume(): void
  intercept(): void
}

class EventPropagationImpl implements EventPropagation {
  private _consumed = false
  private _intercepted = false
  private _stopped = false
  readonly target: HitTestableNode
  readonly event: PointerEventData

  constructor(target: HitTestableNode, event: PointerEventData) {
    this.target = target
    this.event = event
  }

  get consumed(): boolean { return this._consumed }
  get intercepted(): boolean { return this._intercepted }

  stopPropagation(): void { this._stopped = true }
  consume(): void { this._consumed = true; this._stopped = true }
  intercept(): void { this._intercepted = true; this._stopped = true }

  get stopped(): boolean { return this._stopped }
}

type InterceptHandler = (propagation: EventPropagation) => boolean
type BubbleHandler = (propagation: EventPropagation) => void

interface EventBubbleDispatcher {
  dispatch(
    root: HitTestableNode,
    event: PointerEventData,
    hitResult: HitTestResult,
    handlerResolver: (node: HitTestableNode) => PointerInputHandler | null,
  ): void
  setInterceptHandler(handler: InterceptHandler | null): void
  setBubbleHandler(handler: BubbleHandler | null): void
}

function buildPathFromRoot(node: HitTestableNode): HitTestableNode[] {
  const path: HitTestableNode[] = []
  let current: HitTestableNode | null = node
  while (current !== null) {
    path.unshift(current)
    current = current.parent
  }
  return path
}

class EventBubbleDispatcherImpl implements EventBubbleDispatcher {
  private _interceptHandler: InterceptHandler | null = null
  private _bubbleHandler: BubbleHandler | null = null

  dispatch(
    root: HitTestableNode,
    event: PointerEventData,
    hitResult: HitTestResult,
    handlerResolver: (node: HitTestableNode) => PointerInputHandler | null,
  ): void {
    const propagation = new EventPropagationImpl(hitResult.node, event)
    const path = buildPathFromRoot(hitResult.node)

    for (let i = 0; i < path.length; i++) {
      if (propagation.stopped) break
      if (this._interceptHandler !== null) {
        const shouldIntercept = this._interceptHandler(propagation)
        if (shouldIntercept) {
          propagation.intercept()
          break
        }
      }
    }

    if (!propagation.intercepted) {
      const handler = handlerResolver(hitResult.node)
      if (handler !== null) {
        handler(event)
      }
    }

    for (let i = path.length - 1; i >= 0; i--) {
      if (propagation.stopped) break
      const node = path[i]!
      if (node === hitResult.node) continue

      if (this._bubbleHandler !== null) {
        this._bubbleHandler(propagation)
      }
      if (propagation.stopped) break

      const handler = handlerResolver(node)
      if (handler !== null) {
        handler(event)
      }
    }
  }

  setInterceptHandler(handler: InterceptHandler | null): void {
    this._interceptHandler = handler
  }

  setBubbleHandler(handler: BubbleHandler | null): void {
    this._bubbleHandler = handler
  }
}


function createEventBubbleDispatcher(): EventBubbleDispatcher {
  return new EventBubbleDispatcherImpl()
}

export type { EventPropagation, InterceptHandler, BubbleHandler, EventBubbleDispatcher }

export { createEventBubbleDispatcher }
