import { describe, it, expect, vi } from 'vitest'
import { Button } from '@/components/interaction/button'
import { Slider, sliderValueFromPosition } from '@/components/interaction/slider'
import { TextField } from '@/components/interaction/text-field'
import { Checkbox } from '@/components/interaction/checkbox'
import { Text } from '@/components/basic/text'
import { Modifier } from '@/layout/modifier'
import { clickable } from '@/input/gesture-modifier'
import type { ClickableElement } from '@/input/gesture-modifier'
import type { GestureEvent } from '@/input/gesture-recognizer'
import { assertClickableElement, hasModifierElement } from '@/test-utils'
import { createSnapshot } from '@/core/snapshot'
import { createRecomposer } from '@/core/recomposer'
import { CompositionContextImpl } from '@/core/composition-context'

function createTestCtx() {
  return new CompositionContextImpl(createSnapshot(), createRecomposer())
}

describe('Button', () => {
  it('should emit a surface group with text child', () => {
    const onClick = vi.fn()
    const ctx = createTestCtx()
    Button(ctx, onClick, () => { Text(ctx, 'Click Me') })
    expect(ctx.emittedNodes.size).toBeGreaterThanOrEqual(1)
  })

  it('should have clickable modifier on the surface node', () => {
    const onClick = vi.fn()
    const ctx = createTestCtx()
    Button(ctx, onClick, () => { Text(ctx, 'Test') })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const inputMods = rootNode.modifier.filterByKind('input')
    expect(inputMods.size).toBe(1)
  })

  it('should have default color in data', () => {
    const onClick = vi.fn()
    const ctx = createTestCtx()
    Button(ctx, onClick, () => { Text(ctx, 'Test') })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = rootNode.data as { color?: { r: number; g: number; b: number; a: number } }
    expect(data.color).toBeDefined()
  })

  it('should have a measure policy', () => {
    const onClick = vi.fn()
    const ctx = createTestCtx()
    Button(ctx, onClick, () => { Text(ctx, 'Test') })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.measurePolicy).toBeDefined()
    expect(typeof rootNode.measurePolicy.measure).toBe('function')
  })

  it('should accept empty children', () => {
    const onClick = vi.fn()
    const ctx = createTestCtx()
    Button(ctx, onClick)
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.childrenIds.length).toBe(0)
  })
})

describe('Slider', () => {
  it('should emit a leaf node with value data', () => {
    const onValueChange = vi.fn()
    const ctx = createTestCtx()
    Slider(ctx, 0.5, onValueChange)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { value: number }
    expect(data.value).toBe(0.5)
  })

  it('should have default value range in data', () => {
    const onValueChange = vi.fn()
    const ctx = createTestCtx()
    Slider(ctx, 0.5, onValueChange)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { valueRange: [number, number] }
    expect(data.valueRange).toEqual([0, 1])
  })

  it('should accept custom value range', () => {
    const onValueChange = vi.fn()
    const ctx = createTestCtx()
    Slider(ctx, 50, onValueChange, [0, 100])
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { valueRange: [number, number] }
    expect(data.valueRange).toEqual([0, 100])
  })

  it('should have a measure policy', () => {
    const onValueChange = vi.fn()
    const ctx = createTestCtx()
    Slider(ctx, 0.5, onValueChange)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.measurePolicy).toBeDefined()
    expect(typeof node.measurePolicy.measure).toBe('function')
  })
})

describe('sliderValueFromPosition', () => {
  it('should map position to value', () => {
    expect(sliderValueFromPosition(100, 200, [0, 1])).toBeCloseTo(0.5)
  })

  it('should clamp to range start', () => {
    expect(sliderValueFromPosition(-10, 200, [0, 1])).toBe(0)
  })

  it('should clamp to range end', () => {
    expect(sliderValueFromPosition(300, 200, [0, 1])).toBe(1)
  })

  it('should work with custom range', () => {
    expect(sliderValueFromPosition(50, 100, [0, 100])).toBeCloseTo(50)
  })
})

describe('TextField', () => {
  it('should emit a leaf node with value data', () => {
    const onValueChange = vi.fn()
    const ctx = createTestCtx()
    TextField(ctx, 'hello', onValueChange)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { value: string; kind: string }
    expect(data.value).toBe('hello')
  })

  it('should have default singleLine mode in data', () => {
    const onValueChange = vi.fn()
    const ctx = createTestCtx()
    TextField(ctx, '', onValueChange)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { singleLine: boolean }
    expect(data.singleLine).toBe(true)
  })

  it('should accept placeholder in data', () => {
    const onValueChange = vi.fn()
    const ctx = createTestCtx()
    TextField(ctx, '', onValueChange, Modifier.create().freeze(), 'Enter text')
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { placeholder: string }
    expect(data.placeholder).toBe('Enter text')
  })

  it('should accept multiline mode', () => {
    const onValueChange = vi.fn()
    const ctx = createTestCtx()
    TextField(ctx, '', onValueChange, Modifier.create().freeze(), '', false)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { singleLine: boolean }
    expect(data.singleLine).toBe(false)
  })

  it('should have background in modifier', () => {
    const onValueChange = vi.fn()
    const ctx = createTestCtx()
    TextField(ctx, '', onValueChange)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(hasModifierElement(node.modifier, 'draw', 'background')).toBe(true)
  })

  it('should have a measure policy', () => {
    const onValueChange = vi.fn()
    const ctx = createTestCtx()
    TextField(ctx, '', onValueChange)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.measurePolicy).toBeDefined()
    expect(typeof node.measurePolicy.measure).toBe('function')
  })

  it('should measure single line text field', () => {
    const onValueChange = vi.fn()
    const ctx = createTestCtx()
    TextField(ctx, 'test', onValueChange)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = node.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 400, minHeight: 0, maxHeight: 600,
    })
    expect(result.width).toBeGreaterThan(0)
    expect(result.height).toBeGreaterThan(0)
  })
})

describe('Checkbox', () => {
  it('should emit a leaf node with checked state', () => {
    const onCheckedChange = vi.fn()
    const ctx = createTestCtx()
    Checkbox(ctx, true, onCheckedChange)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { checked: boolean }
    expect(data.checked).toBe(true)
  })

  it('should have clickable modifier', () => {
    const onCheckedChange = vi.fn()
    const ctx = createTestCtx()
    Checkbox(ctx, false, onCheckedChange)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const inputMods = node.modifier.filterByKind('input')
    expect(inputMods.size).toBe(1)
  })

  it('should toggle checked state on click', () => {
    const onCheckedChange = vi.fn()
    const ctx = createTestCtx()
    Checkbox(ctx, false, onCheckedChange)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const inputMods = node.modifier.filterByKind('input')
    const clickableEl = inputMods.get(0)
    if (clickableEl && 'onClick' in clickableEl) {
      assertClickableElement(clickableEl)
      const gestureEvent: GestureEvent = {
        type: 'tap',
        state: 'recognized',
        position: { x: 0, y: 0 },
        localPosition: { x: 0, y: 0 },
        pointerId: 0,
        timestamp: 0,
      }
      clickableEl.onClick(gestureEvent)
      expect(onCheckedChange).toHaveBeenCalledWith(true)
    }
  })

  it('should have background in modifier based on checked state', () => {
    const onCheckedChange = vi.fn()
    const ctx = createTestCtx()
    Checkbox(ctx, true, onCheckedChange)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(hasModifierElement(node.modifier, 'draw', 'background')).toBe(true)
  })

  it('should have a measure policy', () => {
    const onCheckedChange = vi.fn()
    const ctx = createTestCtx()
    Checkbox(ctx, false, onCheckedChange)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.measurePolicy).toBeDefined()
    expect(typeof node.measurePolicy.measure).toBe('function')
  })

  it('should measure with default size', () => {
    const onCheckedChange = vi.fn()
    const ctx = createTestCtx()
    Checkbox(ctx, false, onCheckedChange)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = node.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 100, minHeight: 0, maxHeight: 100,
    })
    expect(result.width).toBe(24)
    expect(result.height).toBe(24)
  })
})
