import type { AnimationSpec } from '@/animation/animation-spec'
import type { Snapshot, MutableState } from '@/core/types'
import { mutableStateOf } from '@/core/state'
import { tween } from '@/animation/animation-spec'


class Animatable {
  private _internalState: MutableState<number> | null
  private _rawValue: number
  private _targetValue: number
  private _isRunning = false
  private _animationFrameId: number | null = null
  private _startNanos = 0
  private _startValue: number
  private _resolveAnimation: (() => void) | null = null
  private _spec: AnimationSpec<number>
  private _onChange: ((value: number) => void) | null = null

  constructor(initialValue: number, spec: AnimationSpec<number> = tween(), snapshot?: Snapshot) {
    this._rawValue = initialValue
    this._targetValue = initialValue
    this._startValue = initialValue
    this._spec = spec
    if (snapshot !== undefined) {
      this._internalState = mutableStateOf(initialValue, snapshot)
    } else {
      this._internalState = null
    }
  }

  get value(): number {
    if (this._internalState !== null) {
      return this._internalState.value
    }
    return this._rawValue
  }

  get isRunning(): boolean {
    return this._isRunning
  }

  get targetValue(): number {
    return this._targetValue
  }

  setOnChange(callback: (value: number) => void): void {
    this._onChange = callback
  }

  animateTo(target: number, spec?: AnimationSpec<number>): Promise<void> {
    if (!Number.isFinite(target)) {
      throw new RangeError(`Animatable.animateTo: target must be a finite number, got ${target}`)
    }
    this.stop()
    if (this._readValue() === target) {
      return Promise.resolve()
    }
    this._targetValue = target
    this._startValue = this._readValue()
    this._spec = spec ?? this._spec

    return new Promise<void>((resolve) => {
      this._resolveAnimation = resolve
      this._isRunning = true
      this._startNanos = performance.now() * 1_000_000
      this._tick()
    })
  }

  snapTo(value: number): void {
    if (!Number.isFinite(value)) {
      throw new RangeError(`Animatable.snapTo: value must be a finite number, got ${value}`)
    }
    this.stop()
    this._writeValue(value)
    this._targetValue = value
    if (this._onChange !== null) {
      this._onChange(value)
    }
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

  private _readValue(): number {
    if (this._internalState !== null) {
      return this._internalState.value
    }
    return this._rawValue
  }

  private _writeValue(value: number): void {
    if (this._internalState !== null) {
      this._internalState.value = value
    } else {
      this._rawValue = value
    }
  }

  private _tick = (): void => {
    const playTimeNanos = performance.now() * 1_000_000
    const result = this._spec.getValueFromNanos(
      playTimeNanos,
      this._startValue,
      this._targetValue,
      this._startNanos,
    )

    if (result.done) {
      this._writeValue(this._targetValue)
      this._isRunning = false
      this._animationFrameId = null
      if (this._onChange !== null) {
        this._onChange(this._readValue())
      }
      if (this._resolveAnimation !== null) {
        this._resolveAnimation()
        this._resolveAnimation = null
      }
      return
    }

    this._writeValue(result.value)
    if (this._onChange !== null) {
      this._onChange(this._readValue())
    }

    this._animationFrameId = requestAnimationFrame(this._tick)
  }
}


function animateFloatAsState(
  initialValue: number,
  spec?: AnimationSpec<number>,
  snapshot?: Snapshot,
): Animatable {
  return new Animatable(initialValue, spec, snapshot)
}

export { Animatable, animateFloatAsState }
