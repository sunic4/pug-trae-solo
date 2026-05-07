import { describe, it, expect } from 'vitest'
import { Box } from '@/components/basic/box'
import { Image } from '@/components/basic/image'
import { Text } from '@/components/basic/text'
import type { TextStyle } from '@/renderer/types'
import { Spacer } from '@/components/basic/spacer'
import { Modifier } from '@/layout/modifier'
import { createSnapshot } from '@/core/snapshot'
import { createRecomposer } from '@/core/recomposer'
import { CompositionContextImpl } from '@/core/composition-context'

function createTestCtx() {
  return new CompositionContextImpl(createSnapshot(), createRecomposer())
}

describe('Box', () => {
  it('should emit a group node with alignment data', () => {
    const ctx = createTestCtx()
    Box(ctx, Modifier.create().freeze(), 'start')
    expect(ctx.emittedNodes.size).toBe(1)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.data).toEqual({ alignment: 'start' })
    expect(node.layoutChildren).not.toBeNull()
  })

  it('should emit children inside the box group', () => {
    const ctx = createTestCtx()
    Box(ctx, Modifier.create().freeze(), 'center', () => {
      Text(ctx, 'hello')
    })
    expect(ctx.emittedNodes.size).toBe(2)
    const boxNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(boxNode.childrenIds.length).toBe(1)
    const textNodeId = boxNode.childrenIds[0]!
    const textNode = ctx.emittedNodes.get(textNodeId)!
    expect((textNode.data as { text: string }).text).toBe('hello')
  })

  it('should have a measure policy', () => {
    const ctx = createTestCtx()
    Box(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.measurePolicy).toBeDefined()
    expect(typeof node.measurePolicy.measure).toBe('function')
  })
})

describe('Text', () => {
  it('should emit a leaf node with text data', () => {
    const ctx = createTestCtx()
    Text(ctx, 'Hello World')
    expect(ctx.emittedNodes.size).toBe(1)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { text: string; style: TextStyle }
    expect(data.text).toBe('Hello World')
    expect(data.style).toBeDefined()
  })

  it('should have default style', () => {
    const ctx = createTestCtx()
    Text(ctx, 'test')
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { style: TextStyle }
    expect(data.style).toBeDefined()
  })

  it('should accept custom style', () => {
    const ctx = createTestCtx()
    const style = { fontFamily: 'sans-serif', fontSize: 20, fontWeight: 'normal', color: { r: 255, g: 0, b: 0, a: 1 } } satisfies TextStyle
    Text(ctx, 'test', Modifier.create().freeze(), style)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { style: TextStyle }
    expect(data.style.fontSize).toBe(20)
  })

  it('should have a measure policy', () => {
    const ctx = createTestCtx()
    Text(ctx, 'test')
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.measurePolicy).toBeDefined()
    expect(typeof node.measurePolicy.measure).toBe('function')
  })
})

describe('Image', () => {
  it('should emit a leaf node with image data', () => {
    const ctx = createTestCtx()
    Image(ctx, 'test.png', 100, 100)
    expect(ctx.emittedNodes.size).toBe(1)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { src: string; width: number; height: number }
    expect(data.src).toBe('test.png')
    expect(data.width).toBe(100)
    expect(data.height).toBe(100)
  })

  it('should emit image with nine patch config', () => {
    const ctx = createTestCtx()
    const ninePatch = { left: 10, top: 10, right: 10, bottom: 10 }
    Image(ctx, 'test.png', 100, 100, Modifier.create().freeze(), ninePatch)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { ninePatch: typeof ninePatch }
    expect(data.ninePatch).toEqual(ninePatch)
  })

  it('should have null nine patch by default', () => {
    const ctx = createTestCtx()
    Image(ctx, 'test.png', 100, 100)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { ninePatch: unknown }
    expect(data.ninePatch).toBeNull()
  })

  it('should have a measure policy', () => {
    const ctx = createTestCtx()
    Image(ctx, 'test.png', 100, 100)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.measurePolicy).toBeDefined()
  })
})

describe('Spacer', () => {
  it('should emit a leaf node with default size', () => {
    const ctx = createTestCtx()
    Spacer(ctx)
    expect(ctx.emittedNodes.size).toBe(1)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { width: number; height: number }
    expect(data.width).toBe(0)
    expect(data.height).toBe(0)
  })

  it('should emit a leaf node with custom size', () => {
    const ctx = createTestCtx()
    Spacer(ctx, 50, 20)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { width: number; height: number }
    expect(data.width).toBe(50)
    expect(data.height).toBe(20)
  })

  it('should have a measure policy', () => {
    const ctx = createTestCtx()
    Spacer(ctx, 50, 20)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.measurePolicy).toBeDefined()
  })
})

describe('Component composition', () => {
  it('should compose Box with Text and Spacer children', () => {
    const ctx = createTestCtx()
    Box(ctx, Modifier.create().padding(16).freeze(), 'start', () => {
      Text(ctx, 'Title')
      Spacer(ctx, 0, 8)
      Text(ctx, 'Content')
    })
    expect(ctx.emittedNodes.size).toBe(4)
    const boxNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(boxNode.childrenIds.length).toBe(3)
    const child0 = ctx.emittedNodes.get(boxNode.childrenIds[0]!)!.data as { text?: string; width?: number; height?: number }
    const child1 = ctx.emittedNodes.get(boxNode.childrenIds[1]!)!.data as { text?: string; width?: number; height?: number }
    const child2 = ctx.emittedNodes.get(boxNode.childrenIds[2]!)!.data as { text?: string; width?: number; height?: number }
    expect(child0.text).toBe('Title')
    expect(child1.width).toBe(0)
    expect(child1.height).toBe(8)
    expect(child2.text).toBe('Content')
  })

  it('should compose Box with Image child', () => {
    const ctx = createTestCtx()
    Box(ctx, Modifier.create().fillMaxWidth().freeze(), 'center', () => {
      Image(ctx, 'hero.png', 300, 200)
    })
    const boxNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(boxNode.childrenIds.length).toBe(1)
    const imgData = ctx.emittedNodes.get(boxNode.childrenIds[0]!)!.data as { src: string }
    expect(imgData.src).toBe('hero.png')
  })
})
