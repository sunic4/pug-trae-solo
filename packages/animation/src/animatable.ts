import type { AnimationSpec } from './animation-spec'
import type { Snapshot, MutableState } from '@pug-canvas-ui/core'
import { mutableStateOf } from '@pug-canvas-ui/core'
import { tween } from './animation-spec'
import { AnimationFrameLoop } from './animation-frame-loop'

class Animatable {
  private _internalState: MutableState<number> | null
  private _rawValue: number
  private _targetValue: number
  private _loop: AnimationFrameLoop = new AnimationFrameLoop()
  private _startNanos = 0
  private _startValue: number
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
    return this._loop.isRunning
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
    this._loop.stop()
    if (this._readValue() === target) {
      return Promise.resolve()
    }
    this._targetValue = target
    this._startValue = this._readValue()
    this._spec = spec ?? this._spec

    this._startNanos = performance.now() * 1_000_000
    return this._loop.start(() => this._tick())
  }

  snapTo(value: number): void {
    if (!Number.isFinite(value)) {
      throw new RangeError(`Animatable.snapTo: value must be a finite number, got ${value}`)
    }
    this._loop.stop()
    this._writeValue(value)
    this._targetValue = value
    if (this._onChange !== null) {
      this._onChange(value)
    }
  }

  stop(): void {
    this._loop.stop()
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

  private _tick(): boolean {
    const playTimeNanos = performance.now() * 1_000_000
    const result = this._spec.getValueFromNanos(
      playTimeNanos,
      this._startValue,
      this._targetValue,
      this._startNanos,
    )

    if (result.done) {
      this._writeValue(this._targetValue)
      if (this._onChange !== null) {
        this._onChange(this._readValue())
      }
      return true
    }

    this._writeValue(result.value)
    if (this._onChange !== null) {
      this._onChange(this._readValue())
    }

    return false
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
