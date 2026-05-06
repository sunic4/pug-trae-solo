import { describe, it, expect } from 'vitest'
import {
  ColorConverter,
  RectConverter,
  PointConverter,
  AnimatableVector,
  animateColorAsState,
  animateRectAsState,
  animatePointAsState,
} from '@/animation/vector-converter'

import type { TwoWayConverter } from '@/animation/vector-converter'
import type { Color, Rect, Point } from '@/renderer/types'

describe('ColorConverter', () => {
  it('converts Color to vector', () => {
    const color = { r: 255, g: 128, b: 64, a: 0.5 }
    const vector = ColorConverter.convertToVector(color)
    expect(vector).toEqual([255, 128, 64, 0.5])
  })

  it('converts vector to Color', () => {
    const vector: [number, number, number, number] = [100, 150, 200, 0.8]
    const color = ColorConverter.convertFromVector(vector)
    expect(color).toEqual({ r: 100, g: 150, b: 200, a: 0.8 })
  })

  it('clamps color values to valid range', () => {
    const vector: [number, number, number, number] = [300, -10, 128, 1.5]
    const color = ColorConverter.convertFromVector(vector)
    expect(color.r).toBe(255)
    expect(color.g).toBe(0)
    expect(color.a).toBe(1)
  })

  it('round-trip preserves identity', () => {
    const color = { r: 50, g: 100, b: 150, a: 0.7 }
    const vector = ColorConverter.convertToVector(color)
    const result = ColorConverter.convertFromVector(vector)
    expect(result).toEqual(color)
  })
})

describe('RectConverter', () => {
  it('converts Rect to vector', () => {
    const rect = { x: 10, y: 20, width: 100, height: 200 }
    const vector = RectConverter.convertToVector(rect)
    expect(vector).toEqual([10, 20, 100, 200])
  })

  it('converts vector to Rect', () => {
    const vector: [number, number, number, number] = [5, 15, 50, 75]
    const rect = RectConverter.convertFromVector(vector)
    expect(rect).toEqual({ x: 5, y: 15, width: 50, height: 75 })
  })

  it('round-trip preserves identity', () => {
    const rect = { x: 0, y: 0, width: 300, height: 400 }
    const vector = RectConverter.convertToVector(rect)
    const result = RectConverter.convertFromVector(vector)
    expect(result).toEqual(rect)
  })
})

describe('PointConverter', () => {
  it('converts Point to vector', () => {
    const point = { x: 30, y: 40 }
    const vector = PointConverter.convertToVector(point)
    expect(vector).toEqual([30, 40])
  })

  it('converts vector to Point', () => {
    const vector: [number, number] = [60, 80]
    const point = PointConverter.convertFromVector(vector)
    expect(point).toEqual({ x: 60, y: 80 })
  })

  it('round-trip preserves identity', () => {
    const point = { x: 111, y: 222 }
    const vector = PointConverter.convertToVector(point)
    const result = PointConverter.convertFromVector(vector)
    expect(result).toEqual(point)
  })
})

describe('AnimatableVector', () => {
  it('initializes with given value', () => {
    const animatable = new AnimatableVector(
      { r: 0, g: 0, b: 0, a: 1 },
      ColorConverter,
    )
    expect(animatable.value).toEqual({ r: 0, g: 0, b: 0, a: 1 })
    expect(animatable.isRunning).toBe(false)
  })

  it('snapTo changes value immediately', () => {
    const animatable = new AnimatableVector(
      { r: 0, g: 0, b: 0, a: 1 },
      ColorConverter,
    )
    animatable.snapTo({ r: 255, g: 255, b: 255, a: 0.5 })
    expect(animatable.value).toEqual({ r: 255, g: 255, b: 255, a: 0.5 })
  })

  it('snapTo triggers onChange callback', () => {
    const animatable = new AnimatableVector(
      { r: 0, g: 0, b: 0, a: 1 },
      ColorConverter,
    )
    let called = false
    animatable.setOnChange(() => { called = true })
    animatable.snapTo({ r: 128, g: 128, b: 128, a: 1 })
    expect(called).toBe(true)
  })

  it('stop halts animation', () => {
    const animatable = new AnimatableVector(
      { x: 0, y: 0 },
      PointConverter,
    )
    animatable.stop()
    expect(animatable.isRunning).toBe(false)
  })
})

describe('animateColorAsState', () => {
  it('returns AnimatableVector with ColorConverter', () => {
    const anim = animateColorAsState({ r: 0, g: 0, b: 0, a: 1 })
    expect(anim).toBeInstanceOf(AnimatableVector)
    expect(anim.value).toEqual({ r: 0, g: 0, b: 0, a: 1 })
  })
})

describe('animateRectAsState', () => {
  it('returns AnimatableVector with RectConverter', () => {
    const anim = animateRectAsState({ x: 0, y: 0, width: 100, height: 100 })
    expect(anim).toBeInstanceOf(AnimatableVector)
    expect(anim.value).toEqual({ x: 0, y: 0, width: 100, height: 100 })
  })
})

describe('animatePointAsState', () => {
  it('returns AnimatableVector with PointConverter', () => {
    const anim = animatePointAsState({ x: 10, y: 20 })
    expect(anim).toBeInstanceOf(AnimatableVector)
    expect(anim.value).toEqual({ x: 10, y: 20 })
  })
})
