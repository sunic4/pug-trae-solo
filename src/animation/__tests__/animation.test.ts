import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { tween, spring, keyframes, linearEasing, easeInOutCubic } from '@/animation/animation-spec'
import type { TweenSpec, SpringSpec, Easing } from '@/animation/animation-spec'
import { Animatable } from '@/animation/animatable'

describe('TweenSpec', () => {
  describe('when creating a tween spec', () => {
    it('should have default duration of 300ms', () => {
      const spec = tween()
      expect(spec.durationMillis).toBe(300)
    })
  })

  describe('when computing value at start', () => {
    it('should return start value', () => {
      const spec = tween({ durationMillis: 1000 })
      const result = spec.getValueFromNanos(0, 0, 100, 0)
      expect(result.value).toBeCloseTo(0, 1)
      expect(result.done).toBe(false)
    })
  })

  describe('when computing value at end', () => {
    it('should return end value and done=true', () => {
      const spec = tween({ durationMillis: 1000 })
      const result = spec.getValueFromNanos(1000_000_000, 0, 100, 0)
      expect(result.value).toBe(100)
      expect(result.done).toBe(true)
    })
  })

  describe('when computing value at midpoint', () => {
    it('should return interpolated value', () => {
      const spec = tween({ durationMillis: 1000, easing: linearEasing })
      const result = spec.getValueFromNanos(500_000_000, 0, 100, 0)
      expect(result.value).toBeCloseTo(50, 0)
    })
  })

  describe('when duration is zero', () => {
    it('should immediately return end value', () => {
      const spec = tween({ durationMillis: 0 })
      const result = spec.getValueFromNanos(0, 0, 100, 0)
      expect(result.value).toBe(100)
      expect(result.done).toBe(true)
    })
  })
})

describe('SpringSpec', () => {
  describe('when computing value at start', () => {
    it('should return start value', () => {
      const spec = spring()
      const result = spec.getValueFromNanos(0, 0, 100, 0)
      expect(result.value).toBeCloseTo(0, 1)
    })
  })

  describe('when computing value after some time', () => {
    it('should move toward target', () => {
      const spec = spring({ stiffness: 1000 })
      const result = spec.getValueFromNanos(100_000_000, 0, 100, 0)
      expect(result.value).toBeGreaterThan(0)
      expect(result.value).toBeLessThanOrEqual(100)
    })
  })

  describe('when using critical damping', () => {
    it('should not overshoot', () => {
      const spec = spring({ dampingRatio: 1, stiffness: 1000 })
      const result = spec.getValueFromNanos(200_000_000, 0, 100, 0)
      expect(result.value).toBeLessThanOrEqual(100)
    })
  })
})

describe('KeyframesSpec', () => {
  describe('when computing value at keyframe positions', () => {
    it('should interpolate between keyframes', () => {
      const spec = keyframes({
        durationMillis: 1000,
        keyframes: [
          { at: 0, value: 0 },
          { at: 0.5, value: 50 },
          { at: 1, value: 100 },
        ],
      })
      const result = spec.getValueFromNanos(500_000_000, 0, 100, 0)
      expect(result.value).toBeCloseTo(50, 0)
    })
  })

  describe('when computing value at end', () => {
    it('should return end value and done=true', () => {
      const spec = keyframes({
        durationMillis: 1000,
        keyframes: [
          { at: 0, value: 0 },
          { at: 1, value: 100 },
        ],
      })
      const result = spec.getValueFromNanos(1000_000_000, 0, 100, 0)
      expect(result.value).toBe(100)
      expect(result.done).toBe(true)
    })
  })
})

describe('Easing functions', () => {
  describe('linearEasing', () => {
    it('should return the same fraction', () => {
      expect(linearEasing(0)).toBe(0)
      expect(linearEasing(0.5)).toBe(0.5)
      expect(linearEasing(1)).toBe(1)
    })
  })

  describe('easeInOutCubic', () => {
    it('should return 0 at start and 1 at end', () => {
      expect(easeInOutCubic(0)).toBe(0)
      expect(easeInOutCubic(1)).toBe(1)
    })
  })
})

describe('Animatable', () => {
  let rafCallbacks: Map<number, () => void>
  let rafIdCounter: number

  beforeEach(() => {
    rafCallbacks = new Map()
    rafIdCounter = 0
    vi.stubGlobal('requestAnimationFrame', (cb: () => void) => {
      const id = ++rafIdCounter
      rafCallbacks.set(id, cb)
      return id
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      rafCallbacks.delete(id)
    })
    vi.spyOn(performance, 'now').mockImplementation(() => Date.now())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function advanceAnimationFrames(count: number): void {
    for (let i = 0; i < count; i++) {
      const callbacks = [...rafCallbacks.values()]
      for (const cb of callbacks) {
        cb()
      }
    }
  }

  describe('when creating an Animatable', () => {
    it('should have initial value', () => {
      const anim = new Animatable(0)
      expect(anim.value).toBe(0)
      expect(anim.isRunning).toBe(false)
    })
  })

  describe('when calling snapTo', () => {
    it('should immediately set value', () => {
      const anim = new Animatable(0)
      anim.snapTo(50)
      expect(anim.value).toBe(50)
      expect(anim.isRunning).toBe(false)
    })
  })

  describe('when calling animateTo with same value', () => {
    it('should resolve immediately', async () => {
      const anim = new Animatable(50)
      await anim.animateTo(50)
      expect(anim.value).toBe(50)
    })
  })

  describe('when calling stop', () => {
    it('should stop the animation', () => {
      const anim = new Animatable(0)
      const spec = tween({ durationMillis: 1000 })
      anim.animateTo(100, spec)
      expect(anim.isRunning).toBe(true)
      anim.stop()
      expect(anim.isRunning).toBe(false)
    })
  })

  describe('when calling snapTo during animation', () => {
    it('should stop animation and set value', () => {
      const anim = new Animatable(0)
      const spec = tween({ durationMillis: 1000 })
      anim.animateTo(100, spec)
      anim.snapTo(75)
      expect(anim.value).toBe(75)
      expect(anim.isRunning).toBe(false)
    })
  })

  describe('when animation completes', () => {
    it('should set value to target and stop', async () => {
      const anim = new Animatable(0)
      const spec = tween({ durationMillis: 100 })
      const promise = anim.animateTo(100, spec)

      const startTime = Date.now()
      vi.spyOn(performance, 'now').mockImplementation(() => startTime + 200)
      advanceAnimationFrames(1)
      await promise

      expect(anim.value).toBe(100)
      expect(anim.isRunning).toBe(false)
    })
  })

  describe('when calling setOnChange', () => {
    it('should call callback on value change', () => {
      const anim = new Animatable(0)
      const changes: number[] = []
      anim.setOnChange((v) => changes.push(v))
      anim.snapTo(42)
      expect(changes).toEqual([42])
    })
  })
})
