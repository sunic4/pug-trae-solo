import { describe, it, expect } from 'vitest'
import { Column } from '@/components/layout/column'
import { Surface } from '@/components/layout/surface'
import { Spacer } from '@/components/basic/spacer'
import { Row } from '@/components/layout/row'
import { Box } from '@/components/basic/box'
import { Text } from '@/components/basic/text'
import { Modifier } from '@/layout/modifier'
import { Card } from '@/components/container/card'
import { hasModifierElement } from '@/test-utils'

describe('Column', () => {
  it('should create a column with custom arrangement and alignment', () => {
    const col = Column(Modifier.create().freeze(), 'center', 'center')
    expect(col.arrangement).toBe('center')
    expect(col.alignment).toBe('center')
  })

  it('should create a column with spacedBy arrangement', () => {
    const col = Column(Modifier.create().freeze(), { spacedBy: 8 }, 'start')
    expect(col.arrangement).toEqual({ spacedBy: 8 })
  })

  it('should create a column with children', () => {
    const col = Column(
      Modifier.create().freeze(),
      'start',
      'start',
      [Text('A'), Text('B')],
    )
    expect(col.children.length).toBe(2)
    expect(col.children[0]!.kind).toBe('text')
    expect(col.children[1]!.kind).toBe('text')
  })

  it('should have a measure policy', () => {
    const col = Column()
    expect(col.measurePolicy).toBeDefined()
    expect(typeof col.measurePolicy.measure).toBe('function')
    expect(typeof col.measurePolicy.measureWithWeights).toBe('function')
  })

  it('should measure empty column', () => {
    const col = Column()
    const result = col.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 300, minHeight: 0, maxHeight: 600,
    })
    expect(result.width).toBe(0)
    expect(result.height).toBe(0)
  })

  it('should measure column with constraints', () => {
    const col = Column()
    const result = col.measurePolicy.measure([], {
      minWidth: 100, maxWidth: 300, minHeight: 200, maxHeight: 600,
    })
    expect(result.width).toBe(100)
    expect(result.height).toBe(200)
  })
})

describe('Row', () => {
  it('should create a row with default params', () => {
    const row = Row()
    expect(row.kind).toBe('row')
    expect(row.arrangement).toBe('start')
    expect(row.alignment).toBe('start')
    expect(row.children).toEqual([])
  })

  it('should create a row with custom arrangement and alignment', () => {
    const row = Row(Modifier.create().freeze(), 'spaceBetween', 'center')
    expect(row.arrangement).toBe('spaceBetween')
    expect(row.alignment).toBe('center')
  })

  it('should create a row with spaceEvenly arrangement', () => {
    const row = Row(Modifier.create().freeze(), 'spaceEvenly', 'end')
    expect(row.arrangement).toBe('spaceEvenly')
    expect(row.alignment).toBe('end')
  })

  it('should create a row with children', () => {
    const row = Row(
      Modifier.create().freeze(),
      'start',
      'center',
      [Text('Left'), Text('Right')],
    )
    expect(row.children.length).toBe(2)
  })

  it('should have a measure policy', () => {
    const row = Row()
    expect(row.measurePolicy).toBeDefined()
    expect(typeof row.measurePolicy.measure).toBe('function')
    expect(typeof row.measurePolicy.measureWithWeights).toBe('function')
  })

  it('should measure empty row', () => {
    const row = Row()
    const result = row.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 300, minHeight: 0, maxHeight: 600,
    })
    expect(result.width).toBe(0)
    expect(result.height).toBe(0)
  })

  it('should measure row with constraints', () => {
    const row = Row()
    const result = row.measurePolicy.measure([], {
      minWidth: 100, maxWidth: 300, minHeight: 50, maxHeight: 600,
    })
    expect(result.width).toBe(100)
    expect(result.height).toBe(50)
  })
})

describe('Surface', () => {
  it('should create a surface with default params', () => {
    const surface = Surface()
    expect(surface.kind).toBe('surface')
    expect(surface.color).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(surface.elevation).toBe(0)
    expect(surface.borderRadius).toBe(0)
    expect(surface.children).toEqual([])
  })

  it('should create a surface with custom color', () => {
    const color = { r: 33, g: 150, b: 243, a: 1 }
    const surface = Surface(Modifier.create().freeze(), color)
    expect(surface.color).toEqual(color)
  })

  it('should create a surface with elevation', () => {
    const surface = Surface(Modifier.create().freeze(), undefined, 4)
    expect(surface.elevation).toBe(4)
  })

  it('should create a surface with borderRadius', () => {
    const surface = Surface(Modifier.create().freeze(), undefined, 0, 12)
    expect(surface.borderRadius).toBe(12)
  })

  it('should create a surface with children', () => {
    const surface = Surface(
      Modifier.create().freeze(),
      undefined,
      0,
      0,
      'center',
      [Text('Hello')],
    )
    expect(surface.children.length).toBe(1)
    expect(surface.children[0]!.kind).toBe('text')
  })

  it('should have a measure policy', () => {
    const surface = Surface()
    expect(surface.measurePolicy).toBeDefined()
    expect(typeof surface.measurePolicy.measure).toBe('function')
  })

  it('should include background in modifier', () => {
    const color = { r: 100, g: 100, b: 100, a: 1 }
    const surface = Surface(Modifier.create().freeze(), color, 0, 8)
    expect(hasModifierElement(surface.modifier, 'draw', 'background')).toBe(true)
    expect(hasModifierElement(surface.modifier, 'draw', 'clip')).toBe(true)
  })

  it('should include shadow element when elevation > 0', () => {
    const surface = Surface(Modifier.create().freeze(), undefined, 4, 0)
    expect(hasModifierElement(surface.modifier, 'draw', 'shadow')).toBe(true)
  })

  it('should not include shadow element when elevation is 0', () => {
    const surface = Surface(Modifier.create().freeze(), undefined, 0, 0)
    expect(hasModifierElement(surface.modifier, 'draw', 'shadow')).toBe(false)
  })
})

describe('Layout component composition', () => {
  it('should compose Column with Text and Spacer', () => {
    const layout = Column(
      Modifier.create().padding(16).freeze(),
      'start',
      'start',
      [
        Text('Title'),
        Spacer(0, 8),
        Text('Content'),
      ],
    )
    expect(layout.kind).toBe('column')
    expect(layout.children.length).toBe(3)
  })

  it('should compose Row with Text', () => {
    const layout = Row(
      Modifier.create().fillMaxWidth().freeze(),
      'spaceBetween',
      'center',
      [Text('Left'), Text('Right')],
    )
    expect(layout.kind).toBe('row')
    expect(layout.children.length).toBe(2)
  })

  it('should compose Surface with Column', () => {
    const layout = Surface(
      Modifier.create().freeze(),
      { r: 255, g: 255, b: 255, a: 1 },
      2,
      8,
      'center',
      [
        Column(
          Modifier.create().padding(16).freeze(),
          'start',
          'start',
          [Text('Card Title'), Text('Card Content')],
        ),
      ],
    )
    expect(layout.kind).toBe('surface')
    expect(layout.children.length).toBe(1)
    expect(layout.children[0]!.kind).toBe('column')
  })

  it('should compose nested Column and Row', () => {
    const layout = Column(
      Modifier.create().freeze(),
      'start',
      'start',
      [
        Row(
          Modifier.create().freeze(),
          'spaceBetween',
          'center',
          [Text('Name'), Text('Value')],
        ),
        Spacer(0, 16),
        Box(Modifier.create().freeze(), 'center', [Text('Detail')]),
      ],
    )
    expect(layout.children.length).toBe(3)
    expect(layout.children[0]!.kind).toBe('row')
    expect(layout.children[1]!.kind).toBe('spacer')
    expect(layout.children[2]!.kind).toBe('box')
  })
})
