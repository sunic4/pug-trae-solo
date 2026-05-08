import type { AnimationSpec } from './animation-spec'
import { spring } from './animation-spec'
import type { AnimationResult } from './animation-spec'
import { AnimationFrameLoop } from './animation-frame-loop'

const DEFAULT_FRICTION = 0.02
const VELOCITY_THRESHOLD = 10

interface DecaySpec extends AnimationSpec<number> {
  readonly friction: number
}

function decay(options?: { friction?: number }): DecaySpec {
  const friction = Math.max(0.001, options?.friction ?? DEFAULT_FRICTION)
  return {
    friction,
    getValueFromNanos(
      playTimeNanos: number,
      start: number,
      startVelocity: number,
      startNanos: number,
    ): AnimationResult {
      const elapsedMs = (playTimeNanos - startNanos) / 1_000_000
      if (Math.abs(startVelocity) < VELOCITY_THRESHOLD) {
        return { value: start, done: true }
      }
      const displacement = startVelocity / friction * (1 - Math.exp(-friction * elapsedMs))
      const currentVelocity = startVelocity * Math.exp(-friction * elapsedMs)
      if (Math.abs(currentVelocity) < VELOCITY_THRESHOLD) {
        return { value: start + displacement, done: true }
      }
      return { value: start + displacement, done: false }
    },
  }
}

interface DraggableState {
  readonly offset: number
  readonly isDragging: boolean
  readonly isAnimationRunning: boolean
  dragTo(delta: number): void
  animateToWithVelocity(target: number, velocity: number, spec?: AnimationSpec<number>): Promise<void>
  snapTo(value: number): void
  stop(): void
  settle(target: number, spec?: AnimationSpec<number>): Promise<void>
  fling(velocity: number, decaySpec?: DecaySpec): Promise<void>
}

class DraggableStateImpl implements DraggableState {
  private _offset = 0
  private _isDragging = false
  private _loop: AnimationFrameLoop = new AnimationFrameLoop()
  private _startNanos = 0
  private _startValue = 0
  private _endValue = 0
  private _spec: AnimationSpec<number>
  private _onChange: ((offset: number) => void) | null = null

  constructor(initialOffset: number = 0, onChange?: (offset: number) => void) {
    this._offset = initialOffset
    this._spec = spring({ dampingRatio: 1, stiffness: 10000 })
    if (onChange !== undefined) {
      this._onChange = onChange
    }
  }

  get offset(): number {
    return this._offset
  }

  get isDragging(): boolean {
    return this._isDragging
  }

  get isAnimationRunning(): boolean {
    return this._loop.isRunning
  }

  setOnChange(callback: (offset: number) => void): void {
    this._onChange = callback
  }

  dragTo(delta: number): void {
    this._loop.stop()
    this._isDragging = true
    this._offset += delta
    if (this._onChange !== null) {
      this._onChange(this._offset)
    }
  }

  animateToWithVelocity(target: number, _velocity: number, spec?: AnimationSpec<number>): Promise<void> {
    this._isDragging = false
    this._loop.stop()
    if (this._offset === target) {
      return Promise.resolve()
    }
    this._endValue = target
    this._startValue = this._offset
    this._spec = spec ?? this._spec

    this._startNanos = performance.now() * 1_000_000
    return this._loop.start(() => this._tick())
  }

  snapTo(value: number): void {
    this._loop.stop()
    this._isDragging = false
    this._offset = value
    if (this._onChange !== null) {
      this._onChange(this._offset)
    }
  }

  stop(): void {
    this._loop.stop()
    this._isDragging = false
  }

  settle(target: number, spec?: AnimationSpec<number>): Promise<void> {
    return this.animateToWithVelocity(target, 0, spec)
  }

  fling(velocity: number, decaySpec?: DecaySpec): Promise<void> {
    const spec = decaySpec ?? decay()
    this._isDragging = false
    this._loop.stop()
    this._startValue = this._offset
    this._endValue = velocity
    this._spec = spec

    this._startNanos = performance.now() * 1_000_000
    return this._loop.start(() => this._tick())
  }

  private _tick(): boolean {
    const playTimeNanos = performance.now() * 1_000_000
    const result = this._spec.getValueFromNanos(
      playTimeNanos,
      this._startValue,
      this._endValue,
      this._startNanos,
    )

    if (result.done) {
      this._offset = result.value
      if (this._onChange !== null) {
        this._onChange(this._offset)
      }
      return true
    }

    this._offset = result.value
    if (this._onChange !== null) {
      this._onChange(this._offset)
    }

    return false
  }
}

function createDraggableState(initialOffset: number = 0, onChange?: (offset: number) => void): DraggableStateImpl {
  return new DraggableStateImpl(initialOffset, onChange)
}

interface AnchorConfig {
  anchors: Map<number, string>
  initialAnchor: number
}

class AnchoredDraggable {
  private _state: DraggableStateImpl
  private _anchors: Map<number, string>
  private _currentAnchor: number
  private _disposed = false

  constructor(config: AnchorConfig, spec: AnimationSpec<number>) {
    this._anchors = config.anchors
    this._currentAnchor = config.initialAnchor
    this._state = new DraggableStateImpl(config.initialAnchor)

    void spec
  }

  get offset(): number {
    return this._state.offset
  }

  get isDragging(): boolean {
    return this._state.isDragging
  }

  get currentAnchor(): number {
    return this._currentAnchor
  }

  get currentAnchorLabel(): string {
    return this._anchors.get(this._currentAnchor) ?? ''
  }

  dragTo(value: number): void {
    if (this._disposed) return
    this._state.dragTo(value)
  }

  settle(): Promise<void> {
    if (this._disposed) return Promise.resolve()
    const nearest = this._findNearestAnchor()
    this._currentAnchor = nearest
    return this._state.settle(nearest)
  }

  snapTo(anchor: number): void {
    if (this._disposed) return
    if (!this._anchors.has(anchor)) return
    this._currentAnchor = anchor
    this._state.snapTo(anchor)
  }

  stop(): void {
    this._state.stop()
  }

  dispose(): void {
    this._disposed = true
    this._state.stop()
  }

  private _findNearestAnchor(): number {
    let best = this._currentAnchor
    let bestDist = Infinity
    for (const anchor of this._anchors.keys()) {
      const dist = Math.abs(anchor - this._state.offset)
      if (dist < bestDist) {
        bestDist = dist
        best = anchor
      }
    }
    return best
  }
}

function createAnchoredDraggable(config: AnchorConfig, spec: AnimationSpec<number>): AnchoredDraggable {
  return new AnchoredDraggable(config, spec)
}

function defaultDecaySpec(): DecaySpec {
  return decay()
}

interface AnchoredDraggableConfig {
  anchors: readonly { position: number; label: string }[]
  initialValue: string
  spec: AnimationSpec<number>
  confirmVelocityChange: (velocity: number) => boolean
}

export type { DecaySpec, DraggableState, AnchorConfig, AnchoredDraggableConfig }
export {
  DraggableStateImpl,
  AnchoredDraggable,
  defaultDecaySpec,
  decay,
  createDraggableState,
  createAnchoredDraggable,
  DEFAULT_FRICTION,
  VELOCITY_THRESHOLD,
}
