import type { HitTestableNode } from './hit-test'
import type { PointerInputHandler } from './pointer-event'
import { createPointerEventData, resolveCanvasPosition } from './pointer-event'
import { hitTest } from './hit-test'

type PointerHandlerResolver = (node: HitTestableNode) => PointerInputHandler | null

interface PointerEventDispatcher {
  attach(canvas: HTMLCanvasElement): void
  detach(): void
  setRootNode(root: HitTestableNode | null): void
  setHandlerResolver(resolver: PointerHandlerResolver): void
  dispose(): void
}

class PointerEventDispatcherImpl implements PointerEventDispatcher {
  private _canvas: HTMLCanvasElement | null = null
  private _root: HitTestableNode | null = null
  private _resolver: PointerHandlerResolver | null = null
  private _disposed = false
  private _boundHandlers: {
    pointerdown: (e: PointerEvent) => void
    pointermove: (e: PointerEvent) => void
    pointerup: (e: PointerEvent) => void
    pointercancel: (e: PointerEvent) => void
  } | null = null

  attach(canvas: HTMLCanvasElement): void {
    if (this._disposed) throw new Error('Dispatcher has been disposed')
    if (this._canvas !== null) this.detach()

    this._canvas = canvas

    const onDown = (e: PointerEvent) => this._dispatch(e)
    const onMove = (e: PointerEvent) => this._dispatch(e)
    const onUp = (e: PointerEvent) => this._dispatch(e)
    const onCancel = (e: PointerEvent) => this._dispatch(e)

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onCancel)

    this._boundHandlers = {
      pointerdown: onDown,
      pointermove: onMove,
      pointerup: onUp,
      pointercancel: onCancel,
    }
  }

  detach(): void {
    if (this._boundHandlers !== null && this._canvas !== null) {
      this._canvas.removeEventListener('pointerdown', this._boundHandlers.pointerdown)
      this._canvas.removeEventListener('pointermove', this._boundHandlers.pointermove)
      this._canvas.removeEventListener('pointerup', this._boundHandlers.pointerup)
      this._canvas.removeEventListener('pointercancel', this._boundHandlers.pointercancel)
      this._boundHandlers = null
    }
    this._canvas = null
  }

  setRootNode(root: HitTestableNode | null): void {
    if (this._disposed) throw new Error('Dispatcher has been disposed')
    this._root = root
  }

  setHandlerResolver(resolver: PointerHandlerResolver): void {
    if (this._disposed) throw new Error('Dispatcher has been disposed')
    this._resolver = resolver
  }

  dispose(): void {
    this.detach()
    this._root = null
    this._resolver = null
    this._disposed = true
  }

  private _dispatch(nativeEvent: PointerEvent): void {
    if (this._root === null || this._canvas === null) return

    const canvasRect = this._canvas.getBoundingClientRect()
    const position = resolveCanvasPosition(nativeEvent.clientX, nativeEvent.clientY, canvasRect)

    const hitResult = hitTest(this._root, position.x, position.y)
    if (hitResult === null) return

    if (this._resolver === null) return

    const eventData = createPointerEventData(nativeEvent, canvasRect, hitResult.localPosition, position)

    let current: HitTestableNode | null = hitResult.node
    while (current !== null) {
      const handler = this._resolver(current)
      if (handler !== null) {
        handler(eventData)
      }
      current = current.parent
    }
  }
}


function createPointerEventDispatcher(): PointerEventDispatcher {
  return new PointerEventDispatcherImpl()
}

export type { PointerHandlerResolver, PointerEventDispatcher }
export { createPointerEventDispatcher }
