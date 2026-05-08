import type { AnimationSpec, AnimationResult } from './animation-spec'
import { spring } from './animation-spec'

type DecaySpec = AnimationSpec<number> & {
  readonly friction: number
}

const DEFAULT_FRICTION = 0.015
const VELOCITY_THRESHOLD = 0.5

class DecaySpecImpl implements DecaySpec {
  readonly friction: number

  constructor(friction: number = DEFAULT_FRICTION) {
    this.friction = Math.max(0.001, friction)
  }

  getValueFromNanos(playTimeNanos: number, start: number, _end: number, startNanos: number): AnimationResult {
    const elapsedMs = (playTimeNanos - startNanos) / 1_000_000
    const friction = this.friction
    const initialVelocity = _end - start
    const displacement = initialVelocity / friction * (1 - Math.exp(-friction * elapsedMs))
    const value = start + displacement
    const currentVelocity = initialVelocity * Math.exp(-friction * elapsedMs)
    const done = Math.abs(currentVelocity) < VELOCITY_THRESHOLD
    return { value, done }
  }
}


function decay(options?: { friction?: number }): DecaySpec {
  return new DecaySpecImpl(options?.friction)
}

interface DraggableState {
  readonly offset: number
  readonly isAnimationRunning: boolean
  dragTo(delta: number): void
  fling(velocity: number, spec?: DecaySpec): Promise<void>
  settle(target: number, spec?: AnimationSpec<number>): Promise<void>
  snapTo(value: number): void
  stop(): void
}

class DraggableStateImpl implements DraggableState {
  private _offset: number
  private _isRunning = false
  private _animationFrameId: number | null = null
  private _resolveAnimation: (() => void) | null = null
  private _startNanos = 0
  private _startValue = 0
  private _targetValue = 0
  private _snapValue = 0
  private _currentSpec: AnimationSpec<number> | null = null
  private _onChange: ((offset: number) => void) | null

  constructor(initialOffset: number = 0, onChange?: (offset: number) => void) {
    this._offset = initialOffset
    this._onChange = onChange ?? null
  }

  get offset(): number {
    return this._offset
  }

  get isAnimationRunning(): boolean {
    return this._isRunning
  }

  dragTo(delta: number): void {
    if (!Number.isFinite(delta)) {
      throw new RangeError(`DraggableState.dragTo: delta must be a finite number, got ${delta}`)
    }
    this.stop()
    this._offset += delta
    if (this._onChange !== null) {
      this._onChange(this._offset)
    }
  }

  fling(velocity: number, spec?: DecaySpec): Promise<void> {
    if (!Number.isFinite(velocity)) {
      throw new RangeError(`DraggableState.fling: velocity must be a finite number, got ${velocity}`)
    }
    this.stop()
    const decaySpec = spec ?? decay()
    this._startValue = this._offset
    this._targetValue = this._offset + velocity
    this._snapValue = this._offset + velocity / decaySpec.friction
    this._currentSpec = decaySpec
    return this._startAnimation()
  }

  settle(target: number, spec?: AnimationSpec<number>): Promise<void> {
    if (!Number.isFinite(target)) {
      throw new RangeError(`DraggableState.settle: target must be a finite number, got ${target}`)
    }
    this.stop()
    if (Math.abs(this._offset - target) < 0.01) {
      this._offset = target
      if (this._onChange !== null) this._onChange(this._offset)
      return Promise.resolve()
    }
    this._startValue = this._offset
    this._targetValue = target
    this._snapValue = target
    this._currentSpec = spec ?? spring()
    return this._startAnimation()
  }

  snapTo(value: number): void {
    if (!Number.isFinite(value)) {
      throw new RangeError(`DraggableState.snapTo: value must be a finite number, got ${value}`)
    }
    this.stop()
    this._offset = value
    if (this._onChange !== null) this._onChange(this._offset)
  }

  stop(): void {
    if (this._animationFrameId !== null) {
      cancelAnimationFrame(this._animationFrameId)
      this._animationFrameId = null
    }
    this._isRunning = false
    if (this._resolveAnimation !== null) {
      this._resolveAnimation()
      this._resolveAnimation = null
    }
  }

  private _startAnimation(): Promise<void> {
    return new Promise<void>((resolve) => {
      this._resolveAnimation = resolve
      this._isRunning = true
      this._startNanos = performance.now() * 1_000_000
      this._tick()
    })
  }

  private _tick = (): void => {
    if (this._currentSpec === null) return

    const playTimeNanos = performance.now() * 1_000_000
    const result = this._currentSpec.getValueFromNanos(
      playTimeNanos,
      this._startValue,
      this._targetValue,
      this._startNanos,
    )

    if (result.done) {
      this._offset = this._snapValue
      this._isRunning = false
      this._animationFrameId = null
      if (this._onChange !== null) this._onChange(this._offset)
      if (this._resolveAnimation !== null) {
        this._resolveAnimation()
        this._resolveAnimation = null
      }
      return
    }

    this._offset = result.value
    if (this._onChange !== null) this._onChange(this._offset)

    this._animationFrameId = requestAnimationFrame(this._tick)
  }
}


function createDraggableState(initialOffset: number = 0, onChange?: (offset: number) => void): DraggableState {
  return new DraggableStateImpl(initialOffset, onChange)
}

interface AnchorConfig {
  readonly anchors: ReadonlyMap<number, string>
  readonly initialAnchor: number
}

interface AnchoredDraggable {
  readonly offset: number
  readonly currentAnchor: number
  readonly currentAnchorLabel: string
  dragTo(delta: number): void
  fling(velocity: number, decaySpec?: DecaySpec, springSpec?: AnimationSpec<number>): Promise<void>
  settle(springSpec?: AnimationSpec<number>): Promise<void>
  snapTo(anchor: number): void
  dispose(): void
}

class AnchoredDraggableImpl implements AnchoredDraggable {
  private _state: DraggableState
  private _anchors: ReadonlyMap<number, string>
  private _currentAnchor: number
  private _springSpec: AnimationSpec<number>
  private _disposed = false

  constructor(config: AnchorConfig, springSpec?: AnimationSpec<number>) {
    this._anchors = config.anchors
    this._currentAnchor = config.initialAnchor
    this._springSpec = springSpec ?? spring()
    this._state = createDraggableState(config.initialAnchor)
  }

  get offset(): number {
    return this._state.offset
  }

  get currentAnchor(): number {
    return this._currentAnchor
  }

  get currentAnchorLabel(): string {
    return this._anchors.get(this._currentAnchor) ?? ''
  }

  dragTo(delta: number): void {
    if (this._disposed) return
    this._state.dragTo(delta)
  }

  async fling(velocity: number, decaySpec?: DecaySpec, springSpec?: AnimationSpec<number>): Promise<void> {
    if (this._disposed) return
    await this._state.fling(velocity, decaySpec)
    if (!this._disposed) {
      await this.settle(springSpec)
    }
  }

  async settle(springSpec?: AnimationSpec<number>): Promise<void> {
    if (this._disposed) return
    const nearest = this._findNearestAnchor(this._state.offset)
    this._currentAnchor = nearest
    await this._state.settle(nearest, springSpec ?? this._springSpec)
  }

  snapTo(anchor: number): void {
    if (this._disposed) return
    if (!this._anchors.has(anchor)) return
    this._currentAnchor = anchor
    this._state.snapTo(anchor)
  }

  dispose(): void {
    this._disposed = true
    this._state.stop()
  }

  private _findNearestAnchor(offset: number): number {
    let nearest = 0
    let minDist = Infinity
    for (const anchor of this._anchors.keys()) {
      const dist = Math.abs(offset - anchor)
      if (dist < minDist) {
        minDist = dist
        nearest = anchor
      }
    }
    return nearest
  }
}


function createAnchoredDraggable(config: AnchorConfig, springSpec?: AnimationSpec<number>): AnchoredDraggable {
  return new AnchoredDraggableImpl(config, springSpec)
}

export type { DecaySpec, DraggableState, AnchorConfig, AnchoredDraggable }
export { decay, createDraggableState, createAnchoredDraggable, DEFAULT_FRICTION, VELOCITY_THRESHOLD }
