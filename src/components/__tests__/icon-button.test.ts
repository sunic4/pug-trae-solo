import { describe, it, expect, vi } from 'vitest'
import { Button } from '@/components/interaction/button'
import { FAB } from '@/components/interaction/fab'
import { Text } from '@/components/basic/text'
import { Modifier } from '@/layout/modifier'
import { clickable } from '@/input/gesture-modifier'
import { hasModifierElement } from '@/test-utils'

describe('Button', () => {
  it('should have clickable modifier', () => {
    const onClick = vi.fn()
    const button = Button(onClick, [Text('Test')])
    const inputMods = button.modifier.filterByKind('input')
    expect(inputMods.size).toBe(1)
  })

  it('should have default colors', () => {
    const onClick = vi.fn()
    const button = Button(onClick, [Text('Test')])
    expect(button.backgroundColor).toBeDefined()
    expect(button.contentColor).toBeDefined()
  })

  it('should accept custom colors', () => {
    const onClick = vi.fn()
    const customBg = { r: 255, g: 0, b: 0, a: 1 }
    const customContent = { r: 255, g: 255, b: 255, a: 1 }
    const button = Button(onClick, [Text('Test')], { modifier: Modifier.create().freeze(), backgroundColor: customBg, contentColor: customContent })
    expect(button.backgroundColor).toEqual(customBg)
    expect(button.contentColor).toEqual(customContent)
  })

  it('should support empty children', () => {
    const onClick = vi.fn()
    const button = Button(onClick)
    expect(button.children.length).toBe(0)
  })

  it('should support multiple children', () => {
    const onClick = vi.fn()
    const button = Button(onClick, [Text('Icon'), Text('Label')])
    expect(button.children.length).toBe(2)
  })

  it('should have background in modifier', () => {
    const onClick = vi.fn()
    const button = Button(onClick, [Text('Test')])
    expect(hasModifierElement(button.modifier, 'draw', 'background')).toBe(true)
  })

  it('should have a measure policy', () => {
    const onClick = vi.fn()
    const button = Button(onClick, [Text('Test')])
    expect(button.measurePolicy).toBeDefined()
    expect(typeof button.measurePolicy.measure).toBe('function')
  })
})

describe('FAB (content-slot)', () => {
  it('returns a fab component with children', () => {
    const onClick = vi.fn()
    const component = FAB(onClick, [Text('+')])
    expect(component.kind).toBe('fab')
    expect(component.children.length).toBe(1)
    expect(component.children[0]!.kind).toBe('text')
    expect(component.onClick).toBe(onClick)
  })

  it('has default size of 56', () => {
    const component = FAB(vi.fn(), [Text('+')])
    expect(component.size).toBe(56)
  })

  it('has default primary blue background', () => {
    const component = FAB(vi.fn(), [Text('+')])
    expect(component.backgroundColor).toEqual({ r: 33, g: 150, b: 243, a: 1 })
    expect(component.contentColor).toEqual({ r: 255, g: 255, b: 255, a: 1 })
  })

  it('has default elevation of 6', () => {
    const component = FAB(vi.fn(), [Text('+')])
    expect(component.elevation).toBe(6)
  })

  it('accepts custom elevation', () => {
    const component = FAB(vi.fn(), [Text('+')], Modifier.create().freeze(), undefined!, undefined!, undefined!, 12)
    expect(component.elevation).toBe(12)
  })

  it('measurePolicy returns correct size', () => {
    const component = FAB(vi.fn(), [Text('+')])
    const result = component.measurePolicy.measure([], { minWidth: 0, maxWidth: 2000, minHeight: 0, maxHeight: 2000 })
    expect(result.width).toBe(56)
    expect(result.height).toBe(56)
  })

  it('measurePolicy respects constraints', () => {
    const component = FAB(vi.fn(), [Text('+')], Modifier.create().freeze(), undefined!, undefined!, 80)
    const result = component.measurePolicy.measure([], { minWidth: 40, maxWidth: 64, minHeight: 40, maxHeight: 64 })
    expect(result.width).toBe(64)
    expect(result.height).toBe(64)
  })

  it('minIntrinsicWidth returns size', () => {
    const component = FAB(vi.fn(), [Text('+')])
    expect(component.measurePolicy.minIntrinsicWidth([], 0)).toBe(56)
  })

  it('minIntrinsicHeight returns size', () => {
    const component = FAB(vi.fn(), [Text('+')])
    expect(component.measurePolicy.minIntrinsicHeight([], 0)).toBe(56)
  })

  it('supports empty children', () => {
    const component = FAB(vi.fn())
    expect(component.children.length).toBe(0)
  })

  it('supports multiple children', () => {
    const component = FAB(vi.fn(), [Text('+'), Text('Add')])
    expect(component.children.length).toBe(2)
  })
})
