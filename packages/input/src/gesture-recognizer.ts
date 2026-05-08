import type { Point } from '@pug-canvas-ui/render'
import type { PointerEventData } from './pointer-event'
import type { GestureState, GestureEvent, GestureCallback, DragDirection } from '@pug-canvas-ui/types'

export type { GestureState, GestureEvent, GestureCallback, DragDirection }

interface GestureRecognizer {
  readonly state: GestureState
  readonly eager: boolean
  addPointerEvent(event: PointerEventData): void
  reset(): void
  dispose(): void
}

const TOUCH_SLOP = 18
const TAP_TIMEOUT = 300
const LONG_PRESS_DELAY = 500
const DOUBLE_TAP_TIMEOUT = 300

function computeDistance(a: Point, b: Point): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

function isValidGestureTransition(from: GestureState, to: GestureState): boolean {
  if (from === to) return true
  if (from === 'cancelled' || from === 'failed') return false
  switch (to) {
    case 'cancelled': return true
    case 'failed': return from === 'possible'
    case 'recognized': return from === 'possible'
    case 'began': return from === 'possible'
    case 'changed': return from === 'began' || from === 'changed'
    case 'ended': return from === 'began' || from === 'changed'
    default: return false
  }
}

interface GestureRecognizerState {
  readonly state: GestureState
  readonly disposed: boolean
  transitionState(nextState: GestureState): void
  markDisposed(): void
  resetState(): void
}

function createGestureRecognizerState(): GestureRecognizerState {
  let _state: GestureState = 'possible'
  let _disposed = false

  return {
    get state(): GestureState {
      return _state
    },
    get disposed(): boolean {
      return _disposed
    },
    transitionState(nextState: GestureState): void {
      if (isValidGestureTransition(_state, nextState)) {
        _state = nextState
      }
    },
    markDisposed(): void {
      _disposed = true
    },
    resetState(): void {
      _state = 'possible'
    },
  }
}

class TapGestureRecognizer implements GestureRecognizer {
  private _stateMachine: GestureRecognizerState
  private _downPosition: Point | null = null
  private _downTimestamp = 0
  private _pointerId = -1
  private _lastTapTimestamp = 0
  readonly eager = true

  onTap: GestureCallback | null = null
  onDoubleTap: GestureCallback | null = null
  readonly doubleTapTimeout: number = DOUBLE_TAP_TIMEOUT
  readonly touchSlop: number = TOUCH_SLOP

  constructor() {
    this._stateMachine = createGestureRecognizerState()
  }

  get state(): GestureState {
    return this._stateMachine.state
  }

  addPointerEvent(event: PointerEventData): void {
    if (this._stateMachine.disposed) return
    if (this._stateMachine.state === 'failed' || this._stateMachine.state === 'cancelled') return

    switch (event.type) {
      case 'down': {
        this._pointerId = event.pointerId
        this._downPosition = event.localPosition
        this._downTimestamp = event.timestamp
        this._stateMachine.transitionState('possible')
        break
      }
      case 'move': {
        if (event.pointerId !== this._pointerId || this._downPosition === null) return
        if (computeDistance(event.localPosition, this._downPosition) > this.touchSlop) {
          this._stateMachine.transitionState('failed')
        }
        break
      }
      case 'up': {
        if (event.pointerId !== this._pointerId || this._downPosition === null) return
        const elapsed = event.timestamp - this._downTimestamp
        if (elapsed > TAP_TIMEOUT) {
          this._stateMachine.transitionState('failed')
          return
        }
        if (computeDistance(event.localPosition, this._downPosition) > this.touchSlop) {
          this._stateMachine.transitionState('failed')
          return
        }
        this._stateMachine.transitionState('recognized')
        const isDoubleTap = (event.timestamp - this._lastTapTimestamp) < this.doubleTapTimeout
        this._lastTapTimestamp = event.timestamp
        const tapEvent: GestureEvent = {
          type: isDoubleTap ? 'doubleTap' : 'tap',
          state: 'recognized',
          position: event.position,
          localPosition: event.localPosition,
          pointerId: event.pointerId,
          timestamp: event.timestamp,
        }
        if (isDoubleTap && this.onDoubleTap !== null) {
          this.onDoubleTap(tapEvent)
        } else if (this.onTap !== null) {
          this.onTap(tapEvent)
        }
        break
      }
      case 'cancel': {
        this._stateMachine.transitionState('cancelled')
        break
      }
    }
  }

  reset(): void {
    this._stateMachine.resetState()
    this._downPosition = null
    this._downTimestamp = 0
    this._pointerId = -1
  }

  dispose(): void {
    this._stateMachine.markDisposed()
    this.onTap = null
    this.onDoubleTap = null
  }
}

class LongPressGestureRecognizer implements GestureRecognizer {
  private _stateMachine: GestureRecognizerState
  private _downPosition: Point | null = null
  private _downTimestamp = 0
  private _pointerId = -1
  private _timerId: ReturnType<typeof setTimeout> | null = null
  readonly eager = false

  onLongPress: GestureCallback | null = null
  readonly delay: number = LONG_PRESS_DELAY
  readonly touchSlop: number = TOUCH_SLOP

  constructor() {
    this._stateMachine = createGestureRecognizerState()
  }

  get state(): GestureState {
    return this._stateMachine.state
  }

  addPointerEvent(event: PointerEventData): void {
    if (this._stateMachine.disposed) return
    if (this._stateMachine.state === 'failed' || this._stateMachine.state === 'cancelled' || this._stateMachine.state === 'recognized') return

    switch (event.type) {
      case 'down': {
        this._pointerId = event.pointerId
        this._downPosition = event.localPosition
        this._downTimestamp = event.timestamp
        this._stateMachine.transitionState('possible')
        this._startTimer(event)
        break
      }
      case 'move': {
        if (event.pointerId !== this._pointerId || this._downPosition === null) return
        if (computeDistance(event.localPosition, this._downPosition) > this.touchSlop) {
          this._cancelTimer()
          this._stateMachine.transitionState('failed')
        }
        break
      }
      case 'up': {
        this._cancelTimer()
        if (this._stateMachine.state === 'possible') {
          this._stateMachine.transitionState('failed')
        }
        break
      }
      case 'cancel': {
        this._cancelTimer()
        this._stateMachine.transitionState('cancelled')
        break
      }
    }
  }

  reset(): void {
    this._cancelTimer()
    this._stateMachine.resetState()
    this._downPosition = null
    this._downTimestamp = 0
    this._pointerId = -1
  }

  dispose(): void {
    this._cancelTimer()
    this._stateMachine.markDisposed()
    this.onLongPress = null
  }

  private _startTimer(event: PointerEventData): void {
    this._cancelTimer()
    this._timerId = setTimeout(() => {
      if (this._stateMachine.state !== 'possible') return
      this._stateMachine.transitionState('recognized')
      if (this.onLongPress !== null) {
        this.onLongPress({
          type: 'longPress',
          state: 'recognized',
          position: event.position,
          localPosition: event.localPosition,
          pointerId: event.pointerId,
          timestamp: event.timestamp + this.delay,
        })
      }
    }, this.delay)
  }

  private _cancelTimer(): void {
    if (this._timerId !== null) {
      clearTimeout(this._timerId)
      this._timerId = null
    }
  }
}

class DragGestureRecognizer implements GestureRecognizer {
  private _stateMachine: GestureRecognizerState
  private _downPosition: Point | null = null
  private _lastPosition: Point | null = null
  private _pointerId = -1
  private _velocityTracker: VelocityTrackerImpl = new VelocityTrackerImpl()
  readonly eager = false
  readonly direction: DragDirection
  readonly touchSlop: number = TOUCH_SLOP

  onDragStart: GestureCallback | null = null
  onDrag: GestureCallback | null = null
  onDragEnd: GestureCallback | null = null

  constructor(direction: DragDirection = 'all') {
    this._stateMachine = createGestureRecognizerState()
    this.direction = direction
  }

  get state(): GestureState {
    return this._stateMachine.state
  }

  addPointerEvent(event: PointerEventData): void {
    if (this._stateMachine.disposed) return
    if (this._stateMachine.state === 'failed' || this._stateMachine.state === 'cancelled') return

    switch (event.type) {
      case 'down': {
        this._pointerId = event.pointerId
        this._downPosition = event.localPosition
        this._lastPosition = event.localPosition
        this._velocityTracker.reset()
        this._velocityTracker.addPosition(event.timestamp, event.localPosition)
        this._stateMachine.transitionState('possible')
        break
      }
      case 'move': {
        if (event.pointerId !== this._pointerId || this._downPosition === null) return
        const delta = this._computeDelta(this._downPosition, event.localPosition)
        if (this._stateMachine.state === 'possible') {
          if (this._exceedsTouchSlop(delta)) {
            this._stateMachine.transitionState('began')
            if (this.onDragStart !== null) {
              this.onDragStart({
                type: 'dragStart',
                state: 'began',
                position: event.position,
                localPosition: event.localPosition,
                pointerId: event.pointerId,
                timestamp: event.timestamp,
              })
            }
          } else {
            return
          }
        }
        this._velocityTracker.addPosition(event.timestamp, event.localPosition)
        this._stateMachine.transitionState('changed')
        const moveDelta = this._lastPosition !== null
          ? { x: event.localPosition.x - this._lastPosition.x, y: event.localPosition.y - this._lastPosition.y }
          : delta
        this._lastPosition = event.localPosition
        if (this.onDrag !== null) {
          this.onDrag({
            type: 'drag',
            state: 'changed',
            position: event.position,
            localPosition: event.localPosition,
            pointerId: event.pointerId,
            timestamp: event.timestamp,
            delta: moveDelta,
          })
        }
        break
      }
      case 'up': {
        if (event.pointerId !== this._pointerId) return
        if (this._stateMachine.state === 'began' || this._stateMachine.state === 'changed') {
          const velocity = this._velocityTracker.getVelocity()
          this._stateMachine.transitionState('ended')
          if (this.onDragEnd !== null) {
            this.onDragEnd({
              type: 'dragEnd',
              state: 'ended',
              position: event.position,
              localPosition: event.localPosition,
              pointerId: event.pointerId,
              timestamp: event.timestamp,
              velocity,
            })
          }
        } else if (this._stateMachine.state === 'possible') {
          this._stateMachine.transitionState('failed')
        }
        break
      }
      case 'cancel': {
        this._stateMachine.transitionState('cancelled')
        break
      }
    }
  }

  reset(): void {
    this._stateMachine.resetState()
    this._downPosition = null
    this._lastPosition = null
    this._pointerId = -1
    this._velocityTracker.reset()
  }

  dispose(): void {
    this._stateMachine.markDisposed()
    this.onDragStart = null
    this.onDrag = null
    this.onDragEnd = null
  }

  private _computeDelta(from: Point, to: Point): Point {
    return { x: to.x - from.x, y: to.y - from.y }
  }

  private _exceedsTouchSlop(delta: Point): boolean {
    switch (this.direction) {
      case 'horizontal': return Math.abs(delta.x) > this.touchSlop
      case 'vertical': return Math.abs(delta.y) > this.touchSlop
      default: return Math.sqrt(delta.x * delta.x + delta.y * delta.y) > this.touchSlop
    }
  }
}

interface VelocityTracker {
  addPosition(time: number, position: Point): void
  getVelocity(): Point
  reset(): void
}

class VelocityTrackerImpl implements VelocityTracker {
  private _positions: Array<{ time: number; position: Point }> = []
  private static readonly MAX_SAMPLES = 8

  addPosition(time: number, position: Point): void {
    this._positions.push({ time, position })
    if (this._positions.length > VelocityTrackerImpl.MAX_SAMPLES) {
      this._positions.shift()
    }
  }

  getVelocity(): Point {
    if (this._positions.length < 2) return { x: 0, y: 0 }
    const first = this._positions[0]!
    const last = this._positions[this._positions.length - 1]!
    const dt = last.time - first.time
    if (dt <= 0) return { x: 0, y: 0 }
    return {
      x: (last.position.x - first.position.x) / dt * 1000,
      y: (last.position.y - first.position.y) / dt * 1000,
    }
  }

  reset(): void {
    this._positions = []
  }
}

interface GestureArena {
  addRecognizer(recognizer: GestureRecognizer): void
  removeRecognizer(recognizer: GestureRecognizer): void
  handleEvent(event: PointerEventData): void
  dispose(): void
}

class GestureArenaImpl implements GestureArena {
  private _recognizers: GestureRecognizer[] = []
  private _winner: GestureRecognizer | null = null
  private _disposed = false

  addRecognizer(recognizer: GestureRecognizer): void {
    if (this._disposed) return
    if (this._recognizers.includes(recognizer)) return
    this._recognizers.push(recognizer)
  }

  removeRecognizer(recognizer: GestureRecognizer): void {
    if (this._disposed) return
    this._recognizers = this._recognizers.filter(r => r !== recognizer)
    if (this._winner === recognizer) {
      this._winner = null
    }
  }

  handleEvent(event: PointerEventData): void {
    if (this._disposed) return

    if (this._winner !== null) {
      this._winner.addPointerEvent(event)
      if (this._winner.state === 'ended' || this._winner.state === 'cancelled' || this._winner.state === 'failed') {
        this._winner = null
      }
      return
    }

    for (const r of this._recognizers) {
      r.addPointerEvent(event)
    }

    const eagerWinner = this._recognizers.find(r => r.eager && (r.state === 'recognized' || r.state === 'began'))
    const winner = eagerWinner ?? this._recognizers.find(r => r.state === 'recognized' || r.state === 'began')
    if (winner !== undefined) {
      this._winner = winner
      for (const r of this._recognizers) {
        if (r !== winner && r.state === 'possible') {
          r.addPointerEvent({ ...event, type: 'cancel' })
        }
      }
    }
  }

  dispose(): void {
    this._disposed = true
    for (const r of this._recognizers) {
      r.dispose()
    }
    this._recognizers = []
    this._winner = null
  }
}


function createTapRecognizer(): TapGestureRecognizer {
  return new TapGestureRecognizer()
}


function createLongPressRecognizer(): LongPressGestureRecognizer {
  return new LongPressGestureRecognizer()
}


function createDragRecognizer(direction: DragDirection = 'all'): DragGestureRecognizer {
  return new DragGestureRecognizer(direction)
}


function createVelocityTracker(): VelocityTracker {
  return new VelocityTrackerImpl()
}


function createGestureArena(): GestureArena {
  return new GestureArenaImpl()
}

export type {
  GestureRecognizer,
  GestureArena,
  VelocityTracker,
  GestureRecognizerState,
}

export {
  TapGestureRecognizer,
  LongPressGestureRecognizer,
  DragGestureRecognizer,
  TOUCH_SLOP,
  TAP_TIMEOUT,
  LONG_PRESS_DELAY,
  DOUBLE_TAP_TIMEOUT,
}

export {
  createTapRecognizer,
  createLongPressRecognizer,
  createDragRecognizer,
  createVelocityTracker,
  createGestureArena,
  createGestureRecognizerState,
  isValidGestureTransition,
  computeDistance,
}
