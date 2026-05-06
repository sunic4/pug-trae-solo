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



describe('Button', () => {
  it('should create a button with text child', () => {
    const onClick = vi.fn()
    const button = Button(onClick, [Text('Click Me')])
    expect(button.kind).toBe('button')
    expect(button.children.length).toBe(1)
    expect(button.children[0]!.kind).toBe('text')
  })

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

  it('should have a measure policy', () => {
    const onClick = vi.fn()
    const button = Button(onClick, [Text('Test')])
    expect(button.measurePolicy).toBeDefined()
    expect(typeof button.measurePolicy.measure).toBe('function')
  })

  it('should accept empty children', () => {
    const onClick = vi.fn()
    const button = Button(onClick)
    expect(button.children.length).toBe(0)
  })
})

describe('Slider', () => {
  it('should create a slider with value', () => {
    const onValueChange = vi.fn()
    const slider = Slider(0.5, onValueChange)
    expect(slider.kind).toBe('slider')
    expect(slider.value).toBe(0.5)
  })

  it('should have default value range', () => {
    const onValueChange = vi.fn()
    const slider = Slider(0.5, onValueChange)
    expect(slider.valueRange).toEqual([0, 1])
  })

  it('should accept custom value range', () => {
    const onValueChange = vi.fn()
    const slider = Slider(50, onValueChange, [0, 100])
    expect(slider.valueRange).toEqual([0, 100])
  })

  it('should have a measure policy', () => {
    const onValueChange = vi.fn()
    const slider = Slider(0.5, onValueChange)
    expect(slider.measurePolicy).toBeDefined()
    expect(typeof slider.measurePolicy.measure).toBe('function')
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
  it('should create a text field with value', () => {
    const onValueChange = vi.fn()
    const tf = TextField('hello', onValueChange)
    expect(tf.kind).toBe('text-field')
    expect(tf.value).toBe('hello')
  })

  it('should have default singleLine mode', () => {
    const onValueChange = vi.fn()
    const tf = TextField('', onValueChange)
    expect(tf.singleLine).toBe(true)
  })

  it('should accept placeholder', () => {
    const onValueChange = vi.fn()
    const tf = TextField('', onValueChange, Modifier.create().freeze(), 'Enter text')
    expect(tf.placeholder).toBe('Enter text')
  })

  it('should accept multiline mode', () => {
    const onValueChange = vi.fn()
    const tf = TextField('', onValueChange, Modifier.create().freeze(), '', false)
    expect(tf.singleLine).toBe(false)
  })

  it('should have background in modifier', () => {
    const onValueChange = vi.fn()
    const tf = TextField('', onValueChange)
    expect(hasModifierElement(tf.modifier, 'draw', 'background')).toBe(true)
  })

  it('should have a measure policy', () => {
    const onValueChange = vi.fn()
    const tf = TextField('', onValueChange)
    expect(tf.measurePolicy).toBeDefined()
    expect(typeof tf.measurePolicy.measure).toBe('function')
  })

  it('should measure single line text field', () => {
    const onValueChange = vi.fn()
    const tf = TextField('test', onValueChange)
    const result = tf.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 400, minHeight: 0, maxHeight: 600,
    })
    expect(result.width).toBeGreaterThan(0)
    expect(result.height).toBeGreaterThan(0)
  })
})

describe('Checkbox', () => {
  it('should create a checkbox with checked state', () => {
    const onCheckedChange = vi.fn()
    const cb = Checkbox(true, onCheckedChange)
    expect(cb.kind).toBe('checkbox')
    expect(cb.checked).toBe(true)
  })

  it('should have clickable modifier', () => {
    const onCheckedChange = vi.fn()
    const cb = Checkbox(false, onCheckedChange)
    const inputMods = cb.modifier.filterByKind('input')
    expect(inputMods.size).toBe(1)
  })

  it('should toggle checked state on click', () => {
    const onCheckedChange = vi.fn()
    const cb = Checkbox(false, onCheckedChange)
    const inputMods = cb.modifier.filterByKind('input')
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
    const cb = Checkbox(true, onCheckedChange)
    expect(hasModifierElement(cb.modifier, 'draw', 'background')).toBe(true)
  })

  it('should have a measure policy', () => {
    const onCheckedChange = vi.fn()
    const cb = Checkbox(false, onCheckedChange)
    expect(cb.measurePolicy).toBeDefined()
    expect(typeof cb.measurePolicy.measure).toBe('function')
  })

  it('should measure with default size', () => {
    const onCheckedChange = vi.fn()
    const cb = Checkbox(false, onCheckedChange)
    const result = cb.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 100, minHeight: 0, maxHeight: 100,
    })
    expect(result.width).toBe(24)
    expect(result.height).toBe(24)
  })
})
