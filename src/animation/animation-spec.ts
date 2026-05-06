type Easing = (fraction: number) => number

interface AnimationResult {
  value: number
  done: boolean
}

interface AnimationSpec<T> {
  getValueFromNanos(playTimeNanos: number, start: T, end: T, startNanos: number): AnimationResult
}

type TweenSpec<T> = AnimationSpec<T> & {
  durationMillis: number
  easing: Easing
}

type SpringSpec<T> = AnimationSpec<T> & {
  dampingRatio: number
  stiffness: number
}

interface KeyframeConfig {
  at: number
  value: number
  easing?: Easing
}

interface KeyframesSpecConfig {
  durationMillis: number
  keyframes: KeyframeConfig[]
}


function easeInOutCubic(fraction: number): number {
  return fraction < 0.5
    ? 4 * fraction * fraction * fraction
    : 1 - Math.pow(-2 * fraction + 2, 3) / 2
}


function easeInQuad(fraction: number): number {
  return fraction * fraction
}


function easeOutQuad(fraction: number): number {
  return 1 - (1 - fraction) * (1 - fraction)
}


function linearEasing(fraction: number): number {
  return fraction
}

class TweenSpecImpl implements TweenSpec<number> {
  readonly durationMillis: number
  readonly easing: Easing

  constructor(durationMillis: number = 300, easing: Easing = easeInOutCubic) {
    this.durationMillis = durationMillis
    this.easing = easing
  }

  getValueFromNanos(playTimeNanos: number, start: number, end: number, startNanos: number): AnimationResult {
    const durationNanos = this.durationMillis * 1_000_000
    const elapsed = playTimeNanos - startNanos
    if (elapsed >= durationNanos) {
      return { value: end, done: true }
    }
    const fraction = this.easing(Math.min(elapsed / durationNanos, 1))
    return { value: start + (end - start) * fraction, done: false }
  }
}

class SpringSpecImpl implements SpringSpec<number> {
  readonly dampingRatio: number
  readonly stiffness: number

  constructor(dampingRatio: number = 0.65, stiffness: number = 400) {
    this.dampingRatio = dampingRatio
    this.stiffness = stiffness
  }

  getValueFromNanos(playTimeNanos: number, start: number, end: number, startNanos: number): AnimationResult {
    const elapsedMs = (playTimeNanos - startNanos) / 1_000_000
    const delta = end - start
    const mass = 1
    const damping = 2 * this.dampingRatio * Math.sqrt(this.stiffness * mass)
    const omega = Math.sqrt(this.stiffness / mass)

    if (this.dampingRatio < 1) {
      const omegaD = omega * Math.sqrt(1 - this.dampingRatio * this.dampingRatio)
      const envelope = Math.exp(-damping * elapsedMs / (2 * mass))
      const value = end - delta * envelope * (
        Math.cos(omegaD * elapsedMs) +
        (damping / (2 * mass * omegaD)) * Math.sin(omegaD * elapsedMs)
      )
      const isSettled = envelope < 0.001
      return { value: isSettled ? end : value, done: isSettled }
    }

    const envelope = Math.exp(-omega * elapsedMs)
    const value = end - delta * envelope * (1 + omega * elapsedMs)
    const isSettled = envelope < 0.001
    return { value: isSettled ? end : value, done: isSettled }
  }
}

class KeyframesSpecImpl implements AnimationSpec<number> {
  private readonly _durationMillis: number
  private readonly _keyframes: KeyframeConfig[]

  constructor(config: KeyframesSpecConfig) {
    this._durationMillis = config.durationMillis
    this._keyframes = [...config.keyframes].sort((a, b) => a.at - b.at)
  }

  getValueFromNanos(playTimeNanos: number, start: number, end: number, startNanos: number): AnimationResult {
    const durationNanos = this._durationMillis * 1_000_000
    const elapsed = playTimeNanos - startNanos
    if (elapsed >= durationNanos) {
      return { value: end, done: true }
    }
    const fraction = Math.min(elapsed / durationNanos, 1)

    let prevFrame: { at: number; value: number; easing: Easing } = { at: 0, value: start, easing: linearEasing }
    let nextFrame: { at: number; value: number; easing: Easing } = { at: 1, value: end, easing: linearEasing }

    for (let i = 0; i < this._keyframes.length; i++) {
      const kf = this._keyframes[i]!
      if (kf.at <= fraction) {
        prevFrame = { at: kf.at, value: kf.value, easing: kf.easing ?? linearEasing }
      }
      if (kf.at > fraction && nextFrame.at > kf.at) {
        nextFrame = { at: kf.at, value: kf.value, easing: kf.easing ?? linearEasing }
      }
    }

    const segmentFraction = (fraction - prevFrame.at) / (nextFrame.at - prevFrame.at)
    const easedFraction = (prevFrame.easing ?? linearEasing)(segmentFraction)
    const value = prevFrame.value + (nextFrame.value - prevFrame.value) * easedFraction
    return { value, done: false }
  }
}


function tween(options?: { durationMillis?: number; easing?: Easing }): TweenSpec<number> {
  return new TweenSpecImpl(options?.durationMillis, options?.easing)
}


function spring(options?: { dampingRatio?: number; stiffness?: number }): SpringSpec<number> {
  return new SpringSpecImpl(options?.dampingRatio, options?.stiffness)
}


function keyframes(config: KeyframesSpecConfig): AnimationSpec<number> {
  return new KeyframesSpecImpl(config)
}

export type {
  Easing,
  AnimationResult,
  AnimationSpec,
  TweenSpec,
  SpringSpec,
  KeyframeConfig,
  KeyframesSpecConfig,
}

export {
  easeInOutCubic,
  easeInQuad,
  easeOutQuad,
  linearEasing,
  TweenSpecImpl,
  SpringSpecImpl,
  KeyframesSpecImpl,
  tween,
  spring,
  keyframes,
}
