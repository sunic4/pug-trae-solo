import { describe, it, expect } from 'vitest'
import { Surface } from '@/components/layout/surface'
import { TopAppBar } from '@/components/container/top-app-bar'
import { BottomNavigation } from '@/components/container/bottom-navigation'
import { Box } from '@/components/basic/box'
import { Modifier } from '@/layout/modifier'
import { Text } from '@/components/basic/text'
import { Scaffold } from '@/components/container/scaffold'
import { TabRow } from '@/components/container/tab-row'
import { hasModifierElement } from '@/test-utils'
import { createSnapshot } from '@/core/snapshot'
import { createRecomposer } from '@/core/recomposer'
import { CompositionContextImpl } from '@/core/composition-context'

function createTestCtx() {
  return new CompositionContextImpl(createSnapshot(), createRecomposer())
}

describe('Surface (replaces Card)', () => {
  it('should emit a surface group with default params', () => {
    const ctx = createTestCtx()
    Surface(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { color: { r: number; g: number; b: number; a: number }; elevation: number; borderRadius: number; alignment: string }
    expect(data.color).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(data.elevation).toBe(0)
    expect(data.borderRadius).toBe(0)
    expect(data.alignment).toBe('center')
    expect(node.childrenIds).toEqual([])
  })

  it('should emit a surface with custom color and elevation', () => {
    const ctx = createTestCtx()
    const color = { r: 200, g: 200, b: 200, a: 1 }
    Surface(ctx, () => { Text(ctx, 'Title'); Text(ctx, 'Body') }, { modifier: Modifier.create().freeze(), color, elevation: 4, borderRadius: 16, alignment: 'start' })
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { color: typeof color; elevation: number; borderRadius: number }
    expect(data.color).toEqual(color)
    expect(data.elevation).toBe(4)
    expect(data.borderRadius).toBe(16)
  })

  it('should emit a surface with children', () => {
    const ctx = createTestCtx()
    Surface(ctx, () => { Text(ctx, 'Title'); Text(ctx, 'Body') }, { modifier: Modifier.create().freeze(), elevation: 1, borderRadius: 8, alignment: 'center' })
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.childrenIds.length).toBe(2)
  })

  it('should have a measure policy', () => {
    const ctx = createTestCtx()
    Surface(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.measurePolicy).toBeDefined()
    expect(typeof node.measurePolicy.measure).toBe('function')
    expect(typeof (node.measurePolicy as unknown as { measureWithWeights?: () => unknown }).measureWithWeights).toBe('function')
  })

  it('should include background and clip in modifier', () => {
    const ctx = createTestCtx()
    Surface(ctx, () => {}, { modifier: Modifier.create().freeze(), elevation: 1, borderRadius: 8 })
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(hasModifierElement(node.modifier, 'draw', 'background')).toBe(true)
    expect(hasModifierElement(node.modifier, 'draw', 'clip')).toBe(true)
  })

  it('should include shadow element when elevation > 0', () => {
    const ctx = createTestCtx()
    Surface(ctx, () => {}, { modifier: Modifier.create().freeze(), elevation: 4, borderRadius: 8 })
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(hasModifierElement(node.modifier, 'draw', 'shadow')).toBe(true)
  })

  it('should not include shadow element when elevation is 0', () => {
    const ctx = createTestCtx()
    Surface(ctx, () => {}, { modifier: Modifier.create().freeze(), elevation: 0, borderRadius: 8 })
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(hasModifierElement(node.modifier, 'draw', 'shadow')).toBe(false)
  })
})

describe('Scaffold', () => {
  it('should emit a scaffold surface group with default params', () => {
    const ctx = createTestCtx()
    Scaffold(ctx, null, () => {}, null)
    expect(ctx.emittedNodes.size).toBeGreaterThanOrEqual(1)
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.modifier).toBeDefined()
    expect(rootNode.measurePolicy).toBeDefined()
  })

  it('should accept topBar as first argument', () => {
    const ctx = createTestCtx()
    Scaffold(ctx, () => { TopAppBar(ctx, 'My App') }, () => { Text(ctx, 'Body') }, null)
    expect(ctx.emittedNodes.size).toBeGreaterThanOrEqual(1)
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.childrenIds.length).toBeGreaterThan(0)
  })

  it('should accept bottomBar as third argument', () => {
    const ctx = createTestCtx()
    Scaffold(ctx, null, () => { Text(ctx, 'Content') }, () => {
      BottomNavigation(ctx, [{ label: 'Home', selected: true, onSelect: () => {} }])
    })
    expect(ctx.emittedNodes.size).toBeGreaterThanOrEqual(1)
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.childrenIds.length).toBeGreaterThan(0)
  })

  it('should accept body as second argument', () => {
    const ctx = createTestCtx()
    Scaffold(ctx, null, () => { Text(ctx, 'Content A'); Text(ctx, 'Content B') }, null)
    expect(ctx.emittedNodes.size).toBeGreaterThanOrEqual(1)
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.childrenIds.length).toBeGreaterThan(0)
  })

  it('should have a measure policy', () => {
    const ctx = createTestCtx()
    Scaffold(ctx, null, () => {}, null)
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.measurePolicy).toBeDefined()
    expect(typeof rootNode.measurePolicy.measure).toBe('function')
  })

  it('should measure scaffold with all slots', () => {
    const ctx = createTestCtx()
    Scaffold(
      ctx,
      () => { TopAppBar(ctx, 'Top') },
      () => { Text(ctx, 'Body') },
      () => {
        BottomNavigation(ctx, [
          { label: 'Home', selected: true, onSelect: () => {} },
        ])
      },
    )
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = rootNode.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 360, minHeight: 0, maxHeight: 640,
    })
    expect(result.width).toBeGreaterThanOrEqual(0)
    expect(result.height).toBeGreaterThanOrEqual(0)
  })

  it('should accept backgroundColor via options', () => {
    const bgColor = { r: 240, g: 240, b: 240, a: 1 }
    const ctx = createTestCtx()
    Scaffold(ctx, null, () => { Text(ctx, 'Body') }, null, { backgroundColor: bgColor })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = rootNode.data as { color?: typeof bgColor }
    expect(data.color).toEqual(bgColor)
  })
})

describe('TopAppBar', () => {
  it('should emit a top app bar surface group with title', () => {
    const ctx = createTestCtx()
    TopAppBar(ctx, 'Title')
    expect(ctx.emittedNodes.size).toBeGreaterThanOrEqual(1)
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.modifier).toBeDefined()
    expect(rootNode.measurePolicy).toBeDefined()
  })

  it('should accept navigation icon via options', () => {
    const ctx = createTestCtx()
    TopAppBar(ctx, 'Title', Modifier.create().freeze(), { navigationIcon: () => { Box(ctx, Modifier.create().freeze(), 'center', () => { Text(ctx, '←') }) } })
    expect(ctx.emittedNodes.size).toBeGreaterThanOrEqual(1)
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.childrenIds.length).toBeGreaterThan(0)
  })

  it('should accept actions via options', () => {
    const ctx = createTestCtx()
    TopAppBar(ctx, 'Title', Modifier.create().freeze(), { actions: () => { Box(ctx, Modifier.create().freeze(), 'center', () => { Text(ctx, 'A1') }) } })
    expect(ctx.emittedNodes.size).toBeGreaterThanOrEqual(1)
  })

  it('should have a measure policy', () => {
    const ctx = createTestCtx()
    TopAppBar(ctx, 'Title')
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.measurePolicy).toBeDefined()
    expect(typeof rootNode.measurePolicy.measure).toBe('function')
  })

  it('should measure top app bar', () => {
    const ctx = createTestCtx()
    TopAppBar(ctx, 'Hello')
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = rootNode.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 360, minHeight: 0, maxHeight: 56,
    })
    expect(result.height).toBeGreaterThanOrEqual(0)
    expect(result.width).toBeGreaterThanOrEqual(0)
  })

  it('should accept custom backgroundColor via options', () => {
    const bgColor = { r: 33, g: 150, b: 243, a: 1 }
    const ctx = createTestCtx()
    TopAppBar(ctx, 'Title', Modifier.create().freeze(), { backgroundColor: bgColor })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = rootNode.data as { color?: typeof bgColor }
    expect(data.color).toEqual(bgColor)
  })
})

describe('TabRow', () => {
  it('should emit a tab row surface group with tabs', () => {
    const tabs = [
      { label: 'Tab 1', selected: true, onSelect: () => {} },
      { label: 'Tab 2', selected: false, onSelect: () => {} },
    ]
    const ctx = createTestCtx()
    TabRow(ctx, tabs)
    expect(ctx.emittedNodes.size).toBeGreaterThanOrEqual(1)
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.modifier).toBeDefined()
    expect(rootNode.measurePolicy).toBeDefined()
  })

  it('should accept selectedIndex as second argument', () => {
    const tabs = [
      { label: 'A', selected: false, onSelect: () => {} },
      { label: 'B', selected: true, onSelect: () => {} },
    ]
    const ctx = createTestCtx()
    TabRow(ctx, tabs, 1)
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.childrenIds.length).toBeGreaterThan(0)
  })

  it('should have a measure policy', () => {
    const ctx = createTestCtx()
    TabRow(ctx, [{ label: 'Tab', selected: true, onSelect: () => {} }])
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.measurePolicy).toBeDefined()
    expect(typeof rootNode.measurePolicy.measure).toBe('function')
  })

  it('should measure tab row', () => {
    const tabs = [
      { label: 'Tab 1', selected: true, onSelect: () => {} },
      { label: 'Tab 2', selected: false, onSelect: () => {} },
    ]
    const ctx = createTestCtx()
    TabRow(ctx, tabs)
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = rootNode.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 360, minHeight: 0, maxHeight: 48,
    })
    expect(result.height).toBeGreaterThanOrEqual(0)
    expect(result.width).toBeGreaterThanOrEqual(0)
  })
})

describe('BottomNavigation', () => {
  it('should emit a bottom navigation surface group with items', () => {
    const items = [
      { label: 'Home', selected: true, onSelect: () => {} },
      { label: 'Search', selected: false, onSelect: () => {} },
    ]
    const ctx = createTestCtx()
    BottomNavigation(ctx, items)
    expect(ctx.emittedNodes.size).toBeGreaterThanOrEqual(1)
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.modifier).toBeDefined()
    expect(rootNode.measurePolicy).toBeDefined()
  })

  it('should accept selectedIndex as second argument', () => {
    const items = [
      { label: 'Home', selected: false, onSelect: () => {} },
      { label: 'Search', selected: true, onSelect: () => {} },
    ]
    const ctx = createTestCtx()
    BottomNavigation(ctx, items, 1)
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.childrenIds.length).toBeGreaterThan(0)
  })

  it('should have a measure policy', () => {
    const ctx = createTestCtx()
    BottomNavigation(ctx, [])
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.measurePolicy).toBeDefined()
    expect(typeof rootNode.measurePolicy.measure).toBe('function')
  })

  it('should measure bottom navigation', () => {
    const items = [
      { label: 'Home', selected: true, onSelect: () => {} },
      { label: 'Search', selected: false, onSelect: () => {} },
    ]
    const ctx = createTestCtx()
    BottomNavigation(ctx, items)
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = rootNode.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 360, minHeight: 0, maxHeight: 56,
    })
    expect(result.height).toBeGreaterThanOrEqual(0)
    expect(result.width).toBeGreaterThanOrEqual(0)
  })

  it('should include shadow in modifier', () => {
    const items = [{ label: 'Home', selected: true, onSelect: () => {} }]
    const ctx = createTestCtx()
    BottomNavigation(ctx, items)
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(hasModifierElement(rootNode.modifier, 'draw', 'shadow')).toBe(true)
  })
})

describe('Container component composition', () => {
  it('should compose Scaffold with TopAppBar and BottomNavigation', () => {
    const ctx = createTestCtx()
    Scaffold(
      ctx,
      () => { TopAppBar(ctx, 'My App', Modifier.create().freeze()) },
      () => { Text(ctx, 'Body') },
      () => {
        BottomNavigation(ctx, [
          { label: 'Home', selected: true, onSelect: () => {} },
          { label: 'Settings', selected: false, onSelect: () => {} },
        ])
      },
    )
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.childrenIds.length).toBeGreaterThan(0)
  })

  it('should compose Surface with content', () => {
    const ctx = createTestCtx()
    Surface(ctx, () => { Text(ctx, 'Card Title'); Text(ctx, 'Card Body') }, {
      modifier: Modifier.create().padding(16).freeze(),
      color: { r: 255, g: 255, b: 255, a: 1 },
      elevation: 2,
      borderRadius: 12,
      alignment: 'start',
    })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.childrenIds.length).toBe(2)
  })
})
