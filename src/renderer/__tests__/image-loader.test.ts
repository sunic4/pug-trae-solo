// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { ImageCache, computeNinePatchRegions, computeNinePatchDestRegions, createImageLoader } from '@/renderer/image-loader'
import { createDrawScope } from '@/renderer/draw-scope'
import type { NinePatchConfig } from '@/renderer/image-loader'
import { createMockCtx, createMockImageSource } from '@/test-utils'
import type { ImageLoader } from '@/renderer/image-loader'
import type { DrawScope } from '@/renderer/types'

describe('ImageCache', () => {
  it('should store and retrieve images', () => {
    const cache = new ImageCache(10)
    const resource = { source: createMockImageSource(), width: 100, height: 100, isLoaded: true }
    cache.set('test.png', resource)
    expect(cache.get('test.png')).toBe(resource)
  })

  it('should return null for missing keys', () => {
    const cache = new ImageCache(10)
    expect(cache.get('missing.png')).toBeNull()
  })

  it('should evict oldest entry when cache is full (LRU)', () => {
    const cache = new ImageCache(2)
    const r1 = { source: createMockImageSource(), width: 1, height: 1, isLoaded: true }
    const r2 = { source: createMockImageSource(), width: 2, height: 2, isLoaded: true }
    const r3 = { source: createMockImageSource(), width: 3, height: 3, isLoaded: true }

    cache.set('1', r1)
    cache.set('2', r2)
    cache.set('3', r3)

    expect(cache.get('1')).toBeNull()
    expect(cache.get('2')).toBe(r2)
    expect(cache.get('3')).toBe(r3)
  })

  it('should promote entry on access (LRU)', () => {
    const cache = new ImageCache(2)
    const r1 = { source: createMockImageSource(), width: 1, height: 1, isLoaded: true }
    const r2 = { source: createMockImageSource(), width: 2, height: 2, isLoaded: true }
    const r3 = { source: createMockImageSource(), width: 3, height: 3, isLoaded: true }

    cache.set('1', r1)
    cache.set('2', r2)
    cache.get('1')
    cache.set('3', r3)

    expect(cache.get('1')).toBe(r1)
    expect(cache.get('2')).toBeNull()
  })

  it('should evict specific key', () => {
    const cache = new ImageCache(10)
    const r = { source: createMockImageSource(), width: 1, height: 1, isLoaded: true }
    cache.set('test', r)
    cache.evict('test')
    expect(cache.get('test')).toBeNull()
  })

  it('should clear all entries', () => {
    const cache = new ImageCache(10)
    cache.set('1', { source: createMockImageSource(), width: 1, height: 1, isLoaded: true })
    cache.set('2', { source: createMockImageSource(), width: 2, height: 2, isLoaded: true })
    cache.clear()
    expect(cache.size).toBe(0)
  })
})

describe('computeNinePatchRegions', () => {
  it('should compute source regions correctly', () => {
    const config: NinePatchConfig = { left: 10, top: 10, right: 10, bottom: 10 }
    const regions = computeNinePatchRegions(100, 100, config, 200, 200)

    expect(regions.topLeft).toEqual({ x: 0, y: 0, width: 10, height: 10 })
    expect(regions.topCenter).toEqual({ x: 10, y: 0, width: 80, height: 10 })
    expect(regions.topRight).toEqual({ x: 90, y: 0, width: 10, height: 10 })
    expect(regions.middleCenter).toEqual({ x: 10, y: 10, width: 80, height: 80 })
    expect(regions.bottomRight).toEqual({ x: 90, y: 90, width: 10, height: 10 })
  })

  it('should handle zero insets', () => {
    const config: NinePatchConfig = { left: 0, top: 0, right: 0, bottom: 0 }
    const regions = computeNinePatchRegions(100, 100, config, 200, 200)

    expect(regions.topLeft).toEqual({ x: 0, y: 0, width: 0, height: 0 })
    expect(regions.middleCenter).toEqual({ x: 0, y: 0, width: 100, height: 100 })
  })
})

describe('computeNinePatchDestRegions', () => {
  it('should compute destination regions correctly', () => {
    const config: NinePatchConfig = { left: 10, top: 10, right: 10, bottom: 10 }
    const regions = computeNinePatchDestRegions(200, 200, config)

    expect(regions.topLeft).toEqual({ x: 0, y: 0, width: 10, height: 10 })
    expect(regions.topCenter).toEqual({ x: 10, y: 0, width: 180, height: 10 })
    expect(regions.middleCenter).toEqual({ x: 10, y: 10, width: 180, height: 180 })
    expect(regions.bottomRight).toEqual({ x: 190, y: 190, width: 10, height: 10 })
  })
})

describe('ImageLoader', () => {
  it('should create an image loader instance', () => {
    const loader = createImageLoader()
    expect(loader).toBeDefined()
    loader.dispose()
  })

  it('should return null for uncached images', () => {
    const loader = createImageLoader()
    expect(loader.get('missing.png')).toBeNull()
    loader.dispose()
  })

  it('should evict and clear cache', () => {
    const loader = createImageLoader()
    loader.evict('test.png')
    loader.clear()
    loader.dispose()
  })

  it('should not load after dispose', async () => {
    const loader = createImageLoader()
    loader.dispose()
    const result = await loader.load('test.png')
    expect(result).toBeNull()
  })
})

describe('DrawScope image methods', () => {
  it('should create drawImage command', () => {
    const ctx = createMockCtx()
    const scope = createDrawScope(ctx)
    const source = createMockImageSource()
    scope.drawImage(source, { x: 0, y: 0, width: 100, height: 100 })
    const commands = scope.getCommands()
    expect(commands.length).toBe(1)
    expect(commands[0]!.type).toBe('drawImage')
  })

  it('should create drawImage command with source rect', () => {
    const ctx = createMockCtx()
    const scope = createDrawScope(ctx)
    const source = createMockImageSource()
    scope.drawImage(source, { x: 0, y: 0, width: 100, height: 100 }, { x: 10, y: 10, width: 50, height: 50 })
    const commands = scope.getCommands()
    expect(commands.length).toBe(1)
    expect(commands[0]!.type).toBe('drawImage')
  })

  it('should create drawNinePatch command', () => {
    const ctx = createMockCtx()
    const scope = createDrawScope(ctx)
    const source = createMockImageSource()
    const config: NinePatchConfig = { left: 10, top: 10, right: 10, bottom: 10 }
    scope.drawNinePatch(source, 100, 100, { x: 0, y: 0, width: 200, height: 200 }, config)
    const commands = scope.getCommands()
    expect(commands.length).toBe(1)
    expect(commands[0]!.type).toBe('drawNinePatch')
  })
})
