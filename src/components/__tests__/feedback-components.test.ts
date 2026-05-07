import { describe, it, expect, vi } from 'vitest'
import { CircularProgressIndicator } from '@/components/feedback/circular-progress'
import { Snackbar } from '@/components/feedback/index'
import { Modifier } from '@/layout/modifier'
import { LinearProgressIndicator } from '@/components/feedback/linear-progress'
import { hasModifierElement } from '@/test-utils'

describe('CircularProgressIndicator', () => {
  it('should create with default params', () => {
    const cp = CircularProgressIndicator()
    expect(cp.kind).toBe('circular-progress-indicator')
    expect(cp.progress).toBe(0)
    expect(cp.determinate).toBe(false)
  })

  it('should create with determinate progress', () => {
    const cp = CircularProgressIndicator(Modifier.create().freeze(), 0.6, true)
    expect(cp.progress).toBe(0.6)
    expect(cp.determinate).toBe(true)
  })

  it('should accept custom color and strokeWidth', () => {
    const color = { r: 255, g: 0, b: 0, a: 1 }
    const cp = CircularProgressIndicator(Modifier.create().freeze(), 0, false, color, 6)
    expect(cp.color).toEqual(color)
    expect(cp.strokeWidth).toBe(6)
  })

  it('should have a measure policy', () => {
    const cp = CircularProgressIndicator()
    expect(cp.measurePolicy).toBeDefined()
    expect(typeof cp.measurePolicy.measure).toBe('function')
  })

  it('should measure with default size', () => {
    const cp = CircularProgressIndicator()
    const result = cp.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 100, minHeight: 0, maxHeight: 100,
    })
    expect(result.width).toBe(36)
    expect(result.height).toBe(36)
  })

  it('should respect min constraints', () => {
    const cp = CircularProgressIndicator()
    const result = cp.measurePolicy.measure([], {
      minWidth: 48, maxWidth: 100, minHeight: 48, maxHeight: 100,
    })
    expect(result.width).toBe(48)
    expect(result.height).toBe(48)
  })
})

describe('LinearProgressIndicator', () => {
  it('should create with default params', () => {
    const lp = LinearProgressIndicator()
    expect(lp.kind).toBe('linear-progress-indicator')
    expect(lp.progress).toBe(0)
    expect(lp.determinate).toBe(false)
  })

  it('should create with determinate progress', () => {
    const lp = LinearProgressIndicator(Modifier.create().freeze(), 0.75, true)
    expect(lp.progress).toBe(0.75)
    expect(lp.determinate).toBe(true)
  })

  it('should accept custom colors', () => {
    const color = { r: 76, g: 175, b: 80, a: 1 }
    const trackColor = { r: 200, g: 200, b: 200, a: 1 }
    const lp = LinearProgressIndicator(Modifier.create().freeze(), 0, false, color, trackColor, 6)
    expect(lp.color).toEqual(color)
    expect(lp.trackColor).toEqual(trackColor)
    expect(lp.height).toBe(6)
  })

  it('should have background in modifier', () => {
    const lp = LinearProgressIndicator()
    expect(hasModifierElement(lp.modifier, 'draw', 'background')).toBe(true)
  })

  it('should have a measure policy', () => {
    const lp = LinearProgressIndicator()
    expect(lp.measurePolicy).toBeDefined()
    expect(typeof lp.measurePolicy.measure).toBe('function')
  })

  it('should measure with default size', () => {
    const lp = LinearProgressIndicator()
    const result = lp.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 400, minHeight: 0, maxHeight: 100,
    })
    expect(result.width).toBe(200)
    expect(result.height).toBe(4)
  })
})

describe('Snackbar', () => {
  it('should create with message', () => {
    const sb = Snackbar('Hello World')
    expect(sb.kind).toBe('snackbar')
    expect(sb.message).toBe('Hello World')
  })

  it('should have default short duration', () => {
    const sb = Snackbar('Test')
    expect(sb.duration).toBe('short')
  })

  it('should accept action and onActionClick', () => {
    const onAction = vi.fn()
    const sb = Snackbar('Undo?', 'Undo', { modifier: Modifier.create().freeze(), onActionClick: onAction })
    expect(sb.action).toBe('Undo')
    expect(sb.onActionClick).toBe(onAction)
  })

  it('should accept long duration', () => {
    const sb = Snackbar('Test', null, { modifier: Modifier.create().freeze(), duration: 'long' })
    expect(sb.duration).toBe('long')
  })

  it('should accept indefinite duration', () => {
    const sb = Snackbar('Test', null, { modifier: Modifier.create().freeze(), duration: 'indefinite' })
    expect(sb.duration).toBe('indefinite')
  })

  it('should have background in modifier', () => {
    const sb = Snackbar('Test')
    expect(hasModifierElement(sb.modifier, 'draw', 'background')).toBe(true)
  })

  it('should have clickable modifier when action provided', () => {
    const onAction = vi.fn()
    const sb = Snackbar('Test', 'Action', { modifier: Modifier.create().freeze(), onActionClick: onAction })
    const inputMods = sb.modifier.filterByKind('input')
    expect(inputMods.size).toBe(1)
  })

  it('should not have clickable modifier when no action', () => {
    const sb = Snackbar('Test')
    const inputMods = sb.modifier.filterByKind('input')
    expect(inputMods.size).toBe(0)
  })

  it('should have a measure policy', () => {
    const sb = Snackbar('Test')
    expect(sb.measurePolicy).toBeDefined()
    expect(typeof sb.measurePolicy.measure).toBe('function')
  })

  it('should measure with message width', () => {
    const sb = Snackbar('Hello World')
    const result = sb.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 400, minHeight: 0, maxHeight: 100,
    })
    expect(result.width).toBeGreaterThan(0)
    expect(result.height).toBeGreaterThan(0)
  })
})
