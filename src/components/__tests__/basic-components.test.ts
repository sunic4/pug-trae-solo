import { describe, it, expect } from 'vitest'
import { Box } from '@/components/basic/box'
import { Image } from '@/components/basic/image'
import { Text } from '@/components/basic/text'
import type { TextStyle } from '@/renderer/types'
import { Spacer } from '@/components/basic/spacer'
import { Modifier } from '@/layout/modifier'

describe('Box', () => {
  it('should create a box with custom alignment', () => {
    const box = Box(Modifier.create().freeze(), 'start')
    expect(box.alignment).toBe('start')
  })

  it('should create a box with children', () => {
    const child = Text('hello')
    const box = Box(Modifier.create().freeze(), 'center', [child])
    expect(box.children.length).toBe(1)
    expect(box.children[0]!.kind).toBe('text')
  })

  it('should have a measure policy', () => {
    const box = Box()
    expect(box.measurePolicy).toBeDefined()
    expect(typeof box.measurePolicy.measure).toBe('function')
  })
})

describe('Text', () => {
  it('should create a text component', () => {
    const text = Text('Hello World')
    expect(text.kind).toBe('text')
    expect(text.text).toBe('Hello World')
  })

  it('should have default style', () => {
    const text = Text('test')
    expect(text.style).toBeDefined()
  })

  it('should accept custom style', () => {
    const style = { fontFamily: 'sans-serif', fontSize: 20, fontWeight: 'normal', color: { r: 255, g: 0, b: 0, a: 1 } } satisfies TextStyle
    const text = Text('test', Modifier.create().freeze(), style)
    expect(text.style.fontSize).toBe(20)
  })

  it('should have a measure policy', () => {
    const text = Text('test')
    expect(text.measurePolicy).toBeDefined()
    expect(typeof text.measurePolicy.measure).toBe('function')
  })
})

describe('Image', () => {
  it('should create an image component', () => {
    const img = Image('test.png', 100, 100)
    expect(img.kind).toBe('image')
    expect(img.src).toBe('test.png')
    expect(img.width).toBe(100)
    expect(img.height).toBe(100)
  })

  it('should create an image with nine patch config', () => {
    const ninePatch = { left: 10, top: 10, right: 10, bottom: 10 }
    const img = Image('test.png', 100, 100, Modifier.create().freeze(), ninePatch)
    expect(img.ninePatch).toEqual(ninePatch)
  })

  it('should have null nine patch by default', () => {
    const img = Image('test.png', 100, 100)
    expect(img.ninePatch).toBeNull()
  })

  it('should have a measure policy', () => {
    const img = Image('test.png', 100, 100)
    expect(img.measurePolicy).toBeDefined()
  })
})

describe('Spacer', () => {
  it('should create a spacer with default size', () => {
    const spacer = Spacer()
    expect(spacer.kind).toBe('spacer')
    expect(spacer.width).toBe(0)
    expect(spacer.height).toBe(0)
  })

  it('should create a spacer with custom size', () => {
    const spacer = Spacer(50, 20)
    expect(spacer.width).toBe(50)
    expect(spacer.height).toBe(20)
  })

  it('should have a measure policy', () => {
    const spacer = Spacer(50, 20)
    expect(spacer.measurePolicy).toBeDefined()
  })
})

describe('Component composition', () => {
  it('should compose Box with Text and Spacer', () => {
    const layout = Box(
      Modifier.create().padding(16).freeze(),
      'start',
      [
        Text('Title'),
        Spacer(0, 8),
        Text('Content'),
      ],
    )
    expect(layout.kind).toBe('box')
    expect(layout.children.length).toBe(3)
    expect(layout.children[0]!.kind).toBe('text')
    expect(layout.children[1]!.kind).toBe('spacer')
    expect(layout.children[2]!.kind).toBe('text')
  })

  it('should compose Box with Image', () => {
    const layout = Box(
      Modifier.create().fillMaxWidth().freeze(),
      'center',
      [Image('hero.png', 300, 200)],
    )
    expect(layout.children.length).toBe(1)
    expect(layout.children[0]!.kind).toBe('image')
  })
})
