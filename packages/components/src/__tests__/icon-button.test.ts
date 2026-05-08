import { describe, it, expect, vi } from 'vitest'
import { Button } from '../interaction/button'
import { FAB } from '../interaction/fab'
import { Text } from '../basic/text'
import { Modifier } from '@pug-canvas-ui/layout'
import { hasModifierElement } from '../test-utils'
import { createSnapshot } from '@pug-canvas-ui/core'
import { createRecomposer } from '@pug-canvas-ui/core'
import { CompositionContextImpl } from '@pug-canvas-ui/core'

function createTestCtx() {
  return new CompositionContextImpl(createSnapshot(), createRecomposer())
}

describe('Button', () => {
  it('should have clickable modifier on the surface node', () => {
    const onClick = vi.fn()
    const ctx = createTestCtx()
    Button(ctx, onClick, () => { Text(ctx, 'Test') })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const inputMods = rootNode.modifier.filterByKind('input')
    expect(inputMods.size).toBe(1)
  })

  it('should have default colors in data', () => {
    const onClick = vi.fn()
    const ctx = createTestCtx()
    Button(ctx, onClick, () => { Text(ctx, 'Test') })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = rootNode.data as { color?: { r: number; g: number; b: number; a: number } }
    expect(data.color).toBeDefined()
  })

  it('should accept custom colors', () => {
    const onClick = vi.fn()
    const ctx = createTestCtx()
    const customBg = { r: 255, g: 0, b: 0, a: 1 }
    const customContent = { r: 255, g: 255, b: 255, a: 1 }
    Button(ctx, onClick, () => { Text(ctx, 'Test') }, { modifier: Modifier.create().freeze(), backgroundColor: customBg, contentColor: customContent })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = rootNode.data as { color?: typeof customBg }
    expect(data.color).toEqual(customBg)
  })

  it('should support empty children', () => {
    const onClick = vi.fn()
    const ctx = createTestCtx()
    Button(ctx, onClick)
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.childrenIds.length).toBe(0)
  })

  it('should support multiple children', () => {
    const onClick = vi.fn()
    const ctx = createTestCtx()
    Button(ctx, onClick, () => { Text(ctx, 'Icon'); Text(ctx, 'Label') })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.childrenIds.length).toBe(2)
  })

  it('should have background in modifier', () => {
    const onClick = vi.fn()
    const ctx = createTestCtx()
    Button(ctx, onClick, () => { Text(ctx, 'Test') })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(hasModifierElement(rootNode.modifier, 'draw', 'background')).toBe(true)
  })

  it('should have a measure policy', () => {
    const onClick = vi.fn()
    const ctx = createTestCtx()
    Button(ctx, onClick, () => { Text(ctx, 'Test') })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.measurePolicy).toBeDefined()
    expect(typeof rootNode.measurePolicy.measure).toBe('function')
  })
})

describe('FAB (content-slot)', () => {
  it('emits a surface group with children', () => {
    const onClick = vi.fn()
    const ctx = createTestCtx()
    FAB(ctx, onClick, () => { Text(ctx, '+') })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.childrenIds.length).toBe(1)
    const childData = ctx.emittedNodes.get(rootNode.childrenIds[0]!)!.data as { text: string }
    expect(childData.text).toBe('+')
    const inputMods = rootNode.modifier.filterByKind('input')
    expect(inputMods.size).toBe(1)
  })

  it('has default size of 56 via modifier', () => {
    const ctx = createTestCtx()
    FAB(ctx, vi.fn(), () => { Text(ctx, '+') })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const sizeEl = rootNode.modifier.findSizeElement()
    expect(sizeEl).not.toBeNull()
    expect(sizeEl!.width).toBe(56)
    expect(sizeEl!.height).toBe(56)
  })

  it('has default primary blue background in data', () => {
    const ctx = createTestCtx()
    FAB(ctx, vi.fn(), () => { Text(ctx, '+') })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = rootNode.data as { color?: { r: number; g: number; b: number; a: number } }
    expect(data.color).toEqual({ r: 33, g: 150, b: 243, a: 1 })
  })

  it('has default elevation of 6 in data', () => {
    const ctx = createTestCtx()
    FAB(ctx, vi.fn(), () => { Text(ctx, '+') })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = rootNode.data as { elevation?: number }
    expect(data.elevation).toBe(6)
  })

  it('accepts custom elevation via options', () => {
    const ctx = createTestCtx()
    FAB(ctx, vi.fn(), () => { Text(ctx, '+') }, { elevation: 12 })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = rootNode.data as { elevation?: number }
    expect(data.elevation).toBe(12)
  })

  it('accepts custom size via options', () => {
    const ctx = createTestCtx()
    FAB(ctx, vi.fn(), () => { Text(ctx, '+') }, { size: 80 })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const sizeEl = rootNode.modifier.findSizeElement()
    expect(sizeEl).not.toBeNull()
    expect(sizeEl!.width).toBe(80)
    expect(sizeEl!.height).toBe(80)
  })

  it('has borderRadius equal to half size for circle shape in data', () => {
    const ctx = createTestCtx()
    FAB(ctx, vi.fn(), () => { Text(ctx, '+') })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = rootNode.data as { borderRadius?: number }
    expect(data.borderRadius).toBe(28)
  })

  it('should have a measure policy', () => {
    const ctx = createTestCtx()
    FAB(ctx, vi.fn(), () => { Text(ctx, '+') })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.measurePolicy).toBeDefined()
    expect(typeof rootNode.measurePolicy.measure).toBe('function')
  })

  it('supports empty children', () => {
    const ctx = createTestCtx()
    FAB(ctx, vi.fn())
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.childrenIds.length).toBe(0)
  })

  it('supports multiple children', () => {
    const ctx = createTestCtx()
    FAB(ctx, vi.fn(), () => { Text(ctx, '+'); Text(ctx, 'Add') })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.childrenIds.length).toBe(2)
  })
})
