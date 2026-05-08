import { describe, it, expect } from 'vitest'
import { Column } from '../layout/column'
import { Surface } from '../layout/surface'
import { Spacer } from '../basic/spacer'
import { Row } from '../layout/row'
import { Box } from '../basic/box'
import { Text } from '../basic/text'
import { Modifier } from '@pug-canvas-ui/layout'
import {
  hasModifierElement,
  assertTextNodeData,
  assertSurfaceNodeData,
  assertColumnRowNodeData,
  assertBoxNodeData,
  assertSpacerNodeData,
} from '../test-utils'
import { createSnapshot } from '@pug-canvas-ui/core'
import { createRecomposer } from '@pug-canvas-ui/core'
import { CompositionContextImpl } from '@pug-canvas-ui/core'

function createTestCtx() {
  return new CompositionContextImpl(createSnapshot(), createRecomposer())
}

describe('Column', () => {
  it('should emit a group node with arrangement and alignment data', () => {
    const ctx = createTestCtx()
    Column(ctx, Modifier.create().freeze(), 'center', 'center')
    expect(ctx.emittedNodes.size).toBe(1)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.data).toEqual({ arrangement: 'center', alignment: 'center' })
  })

  it('should emit a column with spacedBy arrangement', () => {
    const ctx = createTestCtx()
    Column(ctx, Modifier.create().freeze(), { spacedBy: 8 }, 'start')
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.data).toEqual({ arrangement: { spacedBy: 8 }, alignment: 'start' })
  })

  it('should emit a column with children', () => {
    const ctx = createTestCtx()
    Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
      Text(ctx, 'A')
      Text(ctx, 'B')
    })
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.childrenIds.length).toBe(2)

    const child0 = ctx.emittedNodes.get(node.childrenIds[0]!)!
    assertTextNodeData(child0.data)
    expect(child0.data.text).toBe('A')

    const child1 = ctx.emittedNodes.get(node.childrenIds[1]!)!
    assertTextNodeData(child1.data)
    expect(child1.data.text).toBe('B')
  })

  it('should have a measure policy', () => {
    const ctx = createTestCtx()
    Column(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.measurePolicy).toBeDefined()
    expect(typeof node.measurePolicy.measure).toBe('function')
    expect(typeof node.measurePolicy.measureWithWeights).toBe('function')
  })

  it('should measure empty column', () => {
    const ctx = createTestCtx()
    Column(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = node.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 300, minHeight: 0, maxHeight: 600,
    })
    expect(result.width).toBe(0)
    expect(result.height).toBe(0)
  })

  it('should measure column with constraints', () => {
    const ctx = createTestCtx()
    Column(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = node.measurePolicy.measure([], {
      minWidth: 100, maxWidth: 300, minHeight: 200, maxHeight: 600,
    })
    expect(result.width).toBe(100)
    expect(result.height).toBe(200)
  })
})

describe('Row', () => {
  it('should emit a row with default params', () => {
    const ctx = createTestCtx()
    Row(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.data).toEqual({ arrangement: 'start', alignment: 'start' })
    expect(node.childrenIds).toEqual([])
  })

  it('should emit a row with custom arrangement and alignment', () => {
    const ctx = createTestCtx()
    Row(ctx, Modifier.create().freeze(), 'spaceBetween', 'center')
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.data).toEqual({ arrangement: 'spaceBetween', alignment: 'center' })
  })

  it('should emit a row with spaceEvenly arrangement', () => {
    const ctx = createTestCtx()
    Row(ctx, Modifier.create().freeze(), 'spaceEvenly', 'end')
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.data).toEqual({ arrangement: 'spaceEvenly', alignment: 'end' })
  })

  it('should emit a row with children', () => {
    const ctx = createTestCtx()
    Row(ctx, Modifier.create().freeze(), 'start', 'center', () => {
      Text(ctx, 'Left')
      Text(ctx, 'Right')
    })
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.childrenIds.length).toBe(2)
  })

  it('should have a measure policy', () => {
    const ctx = createTestCtx()
    Row(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.measurePolicy).toBeDefined()
    expect(typeof node.measurePolicy.measure).toBe('function')
    expect(typeof node.measurePolicy.measureWithWeights).toBe('function')
  })

  it('should measure empty row', () => {
    const ctx = createTestCtx()
    Row(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = node.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 300, minHeight: 0, maxHeight: 600,
    })
    expect(result.width).toBe(0)
    expect(result.height).toBe(0)
  })

  it('should measure row with constraints', () => {
    const ctx = createTestCtx()
    Row(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = node.measurePolicy.measure([], {
      minWidth: 100, maxWidth: 300, minHeight: 50, maxHeight: 600,
    })
    expect(result.width).toBe(100)
    expect(result.height).toBe(50)
  })
})

describe('Surface', () => {
  it('should emit a surface group with default params', () => {
    const ctx = createTestCtx()
    Surface(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    assertSurfaceNodeData(node.data)
    expect(node.data.color).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(node.data.elevation).toBe(0)
    expect(node.data.borderRadius).toBe(0)
    expect(node.data.alignment).toBe('center')
    expect(node.childrenIds).toEqual([])
  })

  it('should emit a surface with custom color', () => {
    const ctx = createTestCtx()
    const color = { r: 33, g: 150, b: 243, a: 1 }
    Surface(ctx, () => {}, { modifier: Modifier.create().freeze(), color })
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    assertSurfaceNodeData(node.data)
    expect(node.data.color).toEqual(color)
  })

  it('should emit a surface with elevation', () => {
    const ctx = createTestCtx()
    Surface(ctx, () => {}, { modifier: Modifier.create().freeze(), elevation: 4 })
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    assertSurfaceNodeData(node.data)
    expect(node.data.elevation).toBe(4)
  })

  it('should emit a surface with borderRadius', () => {
    const ctx = createTestCtx()
    Surface(ctx, () => {}, { modifier: Modifier.create().freeze(), borderRadius: 12 })
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    assertSurfaceNodeData(node.data)
    expect(node.data.borderRadius).toBe(12)
  })

  it('should emit a surface with children', () => {
    const ctx = createTestCtx()
    Surface(ctx, () => { Text(ctx, 'Hello') }, { modifier: Modifier.create().freeze(), alignment: 'center' })
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.childrenIds.length).toBe(1)
    const child = ctx.emittedNodes.get(node.childrenIds[0]!)!
    assertTextNodeData(child.data)
    expect(child.data.text).toBe('Hello')
  })

  it('should have a measure policy', () => {
    const ctx = createTestCtx()
    Surface(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.measurePolicy).toBeDefined()
    expect(typeof node.measurePolicy.measure).toBe('function')
  })

  it('should include background in modifier', () => {
    const ctx = createTestCtx()
    const color = { r: 100, g: 100, b: 100, a: 1 }
    Surface(ctx, () => {}, { modifier: Modifier.create().freeze(), color, borderRadius: 8 })
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(hasModifierElement(node.modifier, 'draw', 'background')).toBe(true)
    expect(hasModifierElement(node.modifier, 'draw', 'clip')).toBe(true)
  })

  it('should include shadow element when elevation > 0', () => {
    const ctx = createTestCtx()
    Surface(ctx, () => {}, { modifier: Modifier.create().freeze(), elevation: 4 })
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(hasModifierElement(node.modifier, 'draw', 'shadow')).toBe(true)
  })

  it('should not include shadow element when elevation is 0', () => {
    const ctx = createTestCtx()
    Surface(ctx, () => {}, { modifier: Modifier.create().freeze() })
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(hasModifierElement(node.modifier, 'draw', 'shadow')).toBe(false)
  })
})

describe('Layout component composition', () => {
  it('should compose Column with Text and Spacer children', () => {
    const ctx = createTestCtx()
    Column(ctx, Modifier.create().padding(16).freeze(), 'start', 'start', () => {
      Text(ctx, 'Title')
      Spacer(ctx, 0, 8)
      Text(ctx, 'Content')
    })
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    assertColumnRowNodeData(node.data)
    expect(node.data.arrangement).toBe('start')
    expect(node.data.alignment).toBe('start')
    expect(node.childrenIds.length).toBe(3)
  })

  it('should compose Row with Text children', () => {
    const ctx = createTestCtx()
    Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
      Text(ctx, 'Left')
      Text(ctx, 'Right')
    })
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.childrenIds.length).toBe(2)
  })

  it('should compose Surface with Column child', () => {
    const ctx = createTestCtx()
    Surface(ctx, () => {
      Column(ctx, Modifier.create().padding(16).freeze(), 'start', 'start', () => {
        Text(ctx, 'Card Title')
        Text(ctx, 'Card Content')
      })
    }, { modifier: Modifier.create().freeze(), color: { r: 255, g: 255, b: 255, a: 1 }, elevation: 2, borderRadius: 8, alignment: 'center' })
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.childrenIds.length).toBe(1)
    const colChild = ctx.emittedNodes.get(node.childrenIds[0]!)!
    assertColumnRowNodeData(colChild.data)
    expect(colChild.data.arrangement).toBe('start')
  })

  it('should compose nested Column and Row', () => {
    const ctx = createTestCtx()
    Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
      Row(ctx, Modifier.create().freeze(), 'spaceBetween', 'center', () => {
        Text(ctx, 'Name')
        Text(ctx, 'Value')
      })
      Spacer(ctx, 0, 16)
      Box(ctx, Modifier.create().freeze(), 'center', () => {
        Text(ctx, 'Detail')
      })
    })
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.childrenIds.length).toBe(3)

    const child0 = ctx.emittedNodes.get(node.childrenIds[0]!)!
    assertColumnRowNodeData(child0.data)
    expect(child0.data.arrangement).toBe('spaceBetween')

    const child1 = ctx.emittedNodes.get(node.childrenIds[1]!)!
    assertSpacerNodeData(child1.data)
    expect(child1.data.width).toBe(0)
    expect(child1.data.height).toBe(16)

    const child2 = ctx.emittedNodes.get(node.childrenIds[2]!)!
    assertBoxNodeData(child2.data)
    expect(child2.data.alignment).toBe('center')
  })
})
