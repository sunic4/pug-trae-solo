import type { Color, Rect, Point } from '@pug-canvas-ui/render'
import { easeInOutCubic } from './animation-spec'

type AnimationVector = number[]

interface TwoWayConverter<T, V extends AnimationVector> {
  convertToVector(value: T): V
  convertFromVector(vector: number[]): T
}

const ColorConverter: TwoWayConverter<Color, [number, number, number, number]> = {
  convertToVector(value: Color): [number, number, number, number] {
    return [value.r, value.g, value.b, value.a]
  },
  convertFromVector(vector: number[]): Color {
    return {
      r: Math.round(Math.max(0, Math.min(255, vector[0]!))),
      g: Math.round(Math.max(0, Math.min(255, vector[1]!))),
      b: Math.round(Math.max(0, Math.min(255, vector[2]!))),
      a: Math.max(0, Math.min(1, vector[3]!)),
    }
  },
}

const RectConverter: TwoWayConverter<Rect, [number, number, number, number]> = {
  convertToVector(value: Rect): [number, number, number, number] {
    return [value.x, value.y, value.width, value.height]
  },
  convertFromVector(vector: number[]): Rect {
    return { x: vector[0]!, y: vector[1]!, width: vector[2]!, height: vector[3]! }
  },
}

const PointConverter: TwoWayConverter<Point, [number, number]> = {
  convertToVector(value: Point): [number, number] {
    return [value.x, value.y]
  },
  convertFromVector(vector: number[]): Point {
    return { x: vector[0]!, y: vector[1]! }
  },
}

function vectorEquals<T, V extends AnimationVector>(
  a: T,
  b: T,
  converter: TwoWayConverter<T, V>,
): boolean {
  const va = converter.convertToVector(a)
  const vb = converter.convertToVector(b)
  if (va.length !== vb.length) return false
  for (let i = 0; i < va.length; i++) {
    if (va[i] !== vb[i]) return false
  }
  return true
}

class AnimatableVector<T, V extends AnimationVector> {
  private _value: T
  private _targetValue: T
  private _converter: TwoWayConverter<T, V>
  private _animationFrameId: number | null = null
  private _isRunning = false
  private _onChange: ((value: T) => void) | null = null
  private _resolveAnimation: (() => void) | null = null

  constructor(initialValue: T, converter: TwoWayConverter<T, V>) {
    this._value = initialValue
    this._targetValue = initialValue
    this._converter = converter
  }

  get value(): T {
    return this._value
  }

  get targetValue(): T {
    return this._targetValue
  }

  get isRunning(): boolean {
    return this._isRunning
  }

  setOnChange(callback: (value: T) => void): void {
    this._onChange = callback
  }

  animateTo(target: T, durationMillis: number = 300): Promise<void> {
    if (!Number.isFinite(durationMillis) || durationMillis < 0) {
      throw new RangeError(
        `AnimatableVector.animateTo: durationMillis must be a non-negative finite number, got ${durationMillis}`,
      )
    }
    this.stop()
    this._targetValue = target
    if (vectorEquals(this._value, target, this._converter)) {
      return Promise.resolve()
    }
    const startVector = this._converter.convertToVector(this._value)
    const endVector = this._converter.convertToVector(target)
    const startNanos = performance.now() * 1_000_000
    const durationNanos = durationMillis * 1_000_000

    return new Promise<void>((resolve) => {
      this._resolveAnimation = resolve
      this._isRunning = true

      const tick = (): void => {
        const elapsed = performance.now() * 1_000_000 - startNanos
        const fraction = Math.min(elapsed / durationNanos, 1)

        if (fraction >= 1) {
          this._value = target
          this._isRunning = false
          this._animationFrameId = null
          if (this._onChange !== null) {
            this._onChange(this._value)
          }
          if (this._resolveAnimation !== null) {
            this._resolveAnimation()
            this._resolveAnimation = null
          }
          return
        }

        const eased = easeInOutCubic(fraction)
        const currentVector = startVector.map((s, i) => {
          const e = endVector[i]!
          return s + (e - s) * eased
        })

        this._value = this._converter.convertFromVector(currentVector)
        if (this._onChange !== null) {
          this._onChange(this._value)
        }

        this._animationFrameId = requestAnimationFrame(tick)
      }

      this._animationFrameId = requestAnimationFrame(tick)
    })
  }

  snapTo(value: T): void {
    this.stop()
    this._value = value
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
}

function animateColorAsState(initialValue: Color): AnimatableVector<Color, [number, number, number, number]> {
  return new AnimatableVector(initialValue, ColorConverter)
}

function animateRectAsState(initialValue: Rect): AnimatableVector<Rect, [number, number, number, number]> {
  return new AnimatableVector(initialValue, RectConverter)
}

function animatePointAsState(initialValue: Point): AnimatableVector<Point, [number, number]> {
  return new AnimatableVector(initialValue, PointConverter)
}

export type {
  AnimationVector,
  TwoWayConverter,
}

export {
  ColorConverter,
  RectConverter,
  PointConverter,
  AnimatableVector,
  animateColorAsState,
  animateRectAsState,
  animatePointAsState,
}
