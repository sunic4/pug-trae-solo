import { describe, it, expect } from 'vitest'
import { Box } from '../layout/box'
import { Image } from '../basic/image'
import { Text } from '../basic/text'
import type { TextStyle } from '@pug-canvas-ui/render'
import { Spacer } from '../basic/spacer'
import { Modifier } from '@pug-canvas-ui/layout'
import { createSnapshot } from '@pug-canvas-ui/core'
import { createRecomposer } from '@pug-canvas-ui/core'
import { CompositionContextImpl } from '@pug-canvas-ui/core'
import {
  assertTextNodeData,
  assertImageNodeData,
  assertSpacerNodeData,
  assertBoxNodeData,
  type TextNodeData,
  type ImageNodeData,
  type SpacerNodeData,
} from '../test-utils'

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
    assertTextNodeData(textNode.data)
    expect(textNode.data.text).toBe('hello')
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
    assertTextNodeData(node.data)
    expect(node.data.text).toBe('Hello World')
    expect(node.data.style).toBeDefined()
  })

  it('should have default style', () => {
    const ctx = createTestCtx()
    Text(ctx, 'test')
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    assertTextNodeData(node.data)
    expect(node.data.style).toBeDefined()
  })

  it('should accept custom style', () => {
    const ctx = createTestCtx()
    const style = { fontFamily: 'sans-serif', fontSize: 20, fontWeight: 'normal', color: { r: 255, g: 0, b: 0, a: 1 } } satisfies TextStyle
    Text(ctx, 'test', Modifier.create().freeze(), style)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    assertTextNodeData(node.data)
    expect(node.data.style?.fontSize).toBe(20)
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
    assertImageNodeData(node.data)
    expect(node.data.src).toBe('test.png')
    expect(node.data.width).toBe(100)
    expect(node.data.height).toBe(100)
  })

  it('should emit image with nine patch config', () => {
    const ctx = createTestCtx()
    const ninePatch = { left: 10, top: 10, right: 10, bottom: 10 }
    Image(ctx, 'test.png', 100, 100, Modifier.create().freeze(), ninePatch)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    assertImageNodeData(node.data)
    expect(node.data.ninePatch).toEqual(ninePatch)
  })

  it('should have null nine patch by default', () => {
    const ctx = createTestCtx()
    Image(ctx, 'test.png', 100, 100)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    assertImageNodeData(node.data)
    expect(node.data.ninePatch).toBeNull()
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
    assertSpacerNodeData(node.data)
    expect(node.data.width).toBe(0)
    expect(node.data.height).toBe(0)
  })

  it('should emit a leaf node with custom size', () => {
    const ctx = createTestCtx()
    Spacer(ctx, 50, 20)
    expect(ctx.emittedNodes.size).toBe(1)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    assertSpacerNodeData(node.data)
    expect(node.data.width).toBe(50)
    expect(node.data.height).toBe(20)
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

    const child0 = ctx.emittedNodes.get(boxNode.childrenIds[0]!)!
    assertTextNodeData(child0.data)
    expect(child0.data.text).toBe('Title')

    const child1 = ctx.emittedNodes.get(boxNode.childrenIds[1]!)!
    assertSpacerNodeData(child1.data)
    expect(child1.data.width).toBe(0)
    expect(child1.data.height).toBe(8)

    const child2 = ctx.emittedNodes.get(boxNode.childrenIds[2]!)!
    assertTextNodeData(child2.data)
    expect(child2.data.text).toBe('Content')
  })

  it('should compose Box with Image child', () => {
    const ctx = createTestCtx()
    Box(ctx, Modifier.create().fillMaxWidth().freeze(), 'center', () => {
      Image(ctx, 'hero.png', 300, 200)
    })
    const boxNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(boxNode.childrenIds.length).toBe(1)
    const imgChild = ctx.emittedNodes.get(boxNode.childrenIds[0]!)!
    assertImageNodeData(imgChild.data)
    expect(imgChild.data.src).toBe('hero.png')
  })
})
