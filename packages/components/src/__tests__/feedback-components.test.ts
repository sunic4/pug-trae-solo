import { describe, it, expect, vi } from 'vitest'
import { CircularProgressIndicator } from '../feedback/circular-progress'
import { Snackbar } from '../feedback/snackbar'
import { Modifier } from '@pug-canvas-ui/layout'
import { LinearProgressIndicator } from '../feedback/linear-progress'
import {
  hasModifierElement,
  assertCircularProgressNodeData,
  assertLinearProgressNodeData,
} from '../test-utils'
import { createSnapshot } from '@pug-canvas-ui/core'
import { createRecomposer } from '@pug-canvas-ui/core'
import { CompositionContextImpl } from '@pug-canvas-ui/core'

function createTestCtx() {
  return new CompositionContextImpl(createSnapshot(), createRecomposer())
}

describe('CircularProgressIndicator', () => {
  it('should emit a leaf node with default params', () => {
    const ctx = createTestCtx()
    CircularProgressIndicator(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    assertCircularProgressNodeData(node.data)
    expect(node.data.progress).toBe(0)
    expect(node.data.determinate).toBe(false)
  })

  it('should emit with determinate progress', () => {
    const ctx = createTestCtx()
    CircularProgressIndicator(ctx, Modifier.create().freeze(), 0.6, true)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    assertCircularProgressNodeData(node.data)
    expect(node.data.progress).toBe(0.6)
    expect(node.data.determinate).toBe(true)
  })

  it('should accept custom color and strokeWidth in data', () => {
    const ctx = createTestCtx()
    const color = { r: 255, g: 0, b: 0, a: 1 }
    CircularProgressIndicator(ctx, Modifier.create().freeze(), 0, false, color, 6)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    assertCircularProgressNodeData(node.data)
    expect(node.data.color).toEqual(color)
    expect(node.data.strokeWidth).toBe(6)
  })

  it('should have a measure policy', () => {
    const ctx = createTestCtx()
    CircularProgressIndicator(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.measurePolicy).toBeDefined()
    expect(typeof node.measurePolicy.measure).toBe('function')
  })

  it('should measure with default size', () => {
    const ctx = createTestCtx()
    CircularProgressIndicator(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = node.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 100, minHeight: 0, maxHeight: 100,
    })
    expect(result.width).toBe(36)
    expect(result.height).toBe(36)
  })

  it('should respect min constraints', () => {
    const ctx = createTestCtx()
    CircularProgressIndicator(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = node.measurePolicy.measure([], {
      minWidth: 48, maxWidth: 100, minHeight: 48, maxHeight: 100,
    })
    expect(result.width).toBe(48)
    expect(result.height).toBe(48)
  })
})

describe('LinearProgressIndicator', () => {
  it('should emit a leaf node with default params', () => {
    const ctx = createTestCtx()
    LinearProgressIndicator(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    assertLinearProgressNodeData(node.data)
    expect(node.data.progress).toBe(0)
    expect(node.data.determinate).toBe(false)
  })

  it('should emit with determinate progress', () => {
    const ctx = createTestCtx()
    LinearProgressIndicator(ctx, Modifier.create().freeze(), 0.75, true)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    assertLinearProgressNodeData(node.data)
    expect(node.data.progress).toBe(0.75)
    expect(node.data.determinate).toBe(true)
  })

  it('should accept custom colors in data', () => {
    const ctx = createTestCtx()
    const color = { r: 76, g: 175, b: 80, a: 1 }
    const trackColor = { r: 200, g: 200, b: 200, a: 1 }
    LinearProgressIndicator(ctx, Modifier.create().freeze(), 0, false, color, trackColor, 6)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    assertLinearProgressNodeData(node.data)
    expect(node.data.color).toEqual(color)
    expect(node.data.trackColor).toEqual(trackColor)
    expect(node.data.height).toBe(6)
  })

  it('should have background in modifier', () => {
    const ctx = createTestCtx()
    LinearProgressIndicator(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(hasModifierElement(node.modifier, 'draw', 'background')).toBe(true)
  })

  it('should have a measure policy', () => {
    const ctx = createTestCtx()
    LinearProgressIndicator(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.measurePolicy).toBeDefined()
    expect(typeof node.measurePolicy.measure).toBe('function')
  })

  it('should measure with default size', () => {
    const ctx = createTestCtx()
    LinearProgressIndicator(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = node.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 400, minHeight: 0, maxHeight: 100,
    })
    expect(result.width).toBe(200)
    expect(result.height).toBe(4)
  })
})

describe('Snackbar', () => {
  it('should emit a surface group with message content', () => {
    const ctx = createTestCtx()
    Snackbar(ctx, 'Hello World')
    expect(ctx.emittedNodes.size).toBeGreaterThanOrEqual(1)
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.modifier).toBeDefined()
    expect(rootNode.measurePolicy).toBeDefined()
  })

  it('should emit snackbar children for default params', () => {
    const ctx = createTestCtx()
    Snackbar(ctx, 'Test')
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.childrenIds.length).toBeGreaterThan(0)
  })

  it('should accept action and onActionClick', () => {
    const onAction = vi.fn()
    const ctx = createTestCtx()
    Snackbar(ctx, 'Undo?', 'Undo', { modifier: Modifier.create().freeze(), onActionClick: onAction })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.childrenIds.length).toBeGreaterThan(0)
  })

  it('should accept long duration option', () => {
    const ctx = createTestCtx()
    Snackbar(ctx, 'Test', null, { modifier: Modifier.create().freeze(), duration: 'long' })
    expect(ctx.emittedNodes.size).toBeGreaterThanOrEqual(1)
  })

  it('should accept indefinite duration option', () => {
    const ctx = createTestCtx()
    Snackbar(ctx, 'Test', null, { modifier: Modifier.create().freeze(), duration: 'indefinite' })
    expect(ctx.emittedNodes.size).toBeGreaterThanOrEqual(1)
  })

  it('should have background in modifier', () => {
    const ctx = createTestCtx()
    Snackbar(ctx, 'Test')
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(hasModifierElement(rootNode.modifier, 'draw', 'background')).toBe(true)
  })

  it('should have clickable modifier when action provided', () => {
    const onAction = vi.fn()
    const ctx = createTestCtx()
    Snackbar(ctx, 'Test', 'Action', { modifier: Modifier.create().freeze(), onActionClick: onAction })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const inputMods = rootNode.modifier.filterByKind('input')
    expect(inputMods.size).toBe(1)
  })

  it('should not have clickable modifier when no action', () => {
    const ctx = createTestCtx()
    Snackbar(ctx, 'Test')
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const inputMods = rootNode.modifier.filterByKind('input')
    expect(inputMods.size).toBe(0)
  })

  it('should have a measure policy', () => {
    const ctx = createTestCtx()
    Snackbar(ctx, 'Test')
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.measurePolicy).toBeDefined()
    expect(typeof rootNode.measurePolicy.measure).toBe('function')
  })

  it('should measure with message width', () => {
    const ctx = createTestCtx()
    Snackbar(ctx, 'Hello World')
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = rootNode.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 400, minHeight: 0, maxHeight: 100,
    })
    expect(result.width).toBeGreaterThanOrEqual(0)
    expect(result.height).toBeGreaterThanOrEqual(0)
  })
})
