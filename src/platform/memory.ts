interface ObjectPool<T> {
  acquire(): T
  release(obj: T): void
  readonly size: number
  readonly available: number
  clear(): void
}

const DEFAULT_MAX_POOL_SIZE = 64

class ObjectPoolImpl<T> implements ObjectPool<T> {
  private _available: T[] = []
  private _inUse = 0
  private readonly _factory: () => T
  private readonly _reset: (obj: T) => void
  private readonly _maxSize: number

  constructor(factory: () => T, reset: (obj: T) => void, maxSize: number = DEFAULT_MAX_POOL_SIZE) {
    this._factory = factory
    this._reset = reset
    this._maxSize = maxSize
  }

  acquire(): T {
    if (this._available.length > 0) {
      const obj = this._available.pop()!
      this._inUse++
      return obj
    }
    this._inUse++
    return this._factory()
  }

  release(obj: T): void {
    if (this._available.length >= this._maxSize) return
    this._reset(obj)
    this._available.push(obj)
    this._inUse = Math.max(0, this._inUse - 1)
  }

  get size(): number {
    return this._available.length + this._inUse
  }

  get available(): number {
    return this._available.length
  }

  clear(): void {
    this._available = []
    this._inUse = 0
  }
}


function createObjectPool<T>(factory: () => T, reset: (obj: T) => void, maxSize?: number): ObjectPool<T> {
  return new ObjectPoolImpl(factory, reset, maxSize)
}

interface OffscreenCanvasEntry {
  readonly canvas: OffscreenCanvas | HTMLCanvasElement
  readonly width: number
  readonly height: number
  lastUsed: number
}

interface OffscreenCanvasManager {
  acquire(key: string, width: number, height: number): OffscreenCanvasEntry
  release(key: string): void
  evict(key: string): void
  readonly size: number
  clear(): void
  dispose(): void
}

const DEFAULT_MAX_CANVAS_CACHE = 16

interface OffscreenCanvasManagerOptions {
  readonly maxSize?: number
  readonly canvasFactory?: (width: number, height: number) => OffscreenCanvas | HTMLCanvasElement
}

class OffscreenCanvasManagerImpl implements OffscreenCanvasManager {
  private _cache = new Map<string, OffscreenCanvasEntry>()
  private readonly _maxSize: number
  private readonly _canvasFactory: ((width: number, height: number) => OffscreenCanvas | HTMLCanvasElement) | null
  private _disposed = false

  constructor(options?: OffscreenCanvasManagerOptions) {
    this._maxSize = options?.maxSize ?? DEFAULT_MAX_CANVAS_CACHE
    this._canvasFactory = options?.canvasFactory ?? null
  }

  acquire(key: string, width: number, height: number): OffscreenCanvasEntry {
    const existing = this._cache.get(key)
    if (existing !== undefined) {
      if (existing.width === width && existing.height === height) {
        existing.lastUsed = performance.now()
        return existing
      }
      this._cache.delete(key)
    }

    this._evictIfNeeded()

    let canvas: OffscreenCanvas | HTMLCanvasElement
    if (this._canvasFactory !== null) {
      canvas = this._canvasFactory(width, height)
    } else if (typeof OffscreenCanvas !== 'undefined') {
      canvas = new OffscreenCanvas(width, height)
    } else if (typeof document !== 'undefined') {
      const el = document.createElement('canvas')
      el.width = width
      el.height = height
      canvas = el
    } else {
      throw new Error('No canvas implementation available')
    }

    const entry: OffscreenCanvasEntry = {
      canvas,
      width,
      height,
      lastUsed: performance.now(),
    }
    this._cache.set(key, entry)
    return entry
  }

  release(key: string): void {
    const entry = this._cache.get(key)
    if (entry !== undefined) {
      entry.lastUsed = performance.now()
    }
  }

  evict(key: string): void {
    this._cache.delete(key)
  }

  get size(): number {
    return this._cache.size
  }

  clear(): void {
    this._cache.clear()
  }

  dispose(): void {
    this._disposed = true
    this._cache.clear()
  }

  private _evictIfNeeded(): void {
    if (this._cache.size < this._maxSize) return
    let oldestKey: string | null = null
    let oldestTime = Infinity
    for (const [key, entry] of this._cache) {
      if (entry.lastUsed < oldestTime) {
        oldestTime = entry.lastUsed
        oldestKey = key
      }
    }
    if (oldestKey !== null) {
      this._cache.delete(oldestKey)
    }
  }
}


function createOffscreenCanvasManager(options?: OffscreenCanvasManagerOptions): OffscreenCanvasManager {
  return new OffscreenCanvasManagerImpl(options)
}

interface MemoryStats {
  readonly poolSize: number
  readonly canvasCount: number
  readonly estimatedBytes: number
}

interface GCAdvisor {
  readonly stats: MemoryStats
  suggest(): string[]
  registerPool(name: string, pool: { size: number; available: number }): void
  unregisterPool(name: string): void
  registerCanvasManager(manager: { size: number }): void
  unregisterCanvasManager(): void
}

class GCAdvisorImpl implements GCAdvisor {
  private _pools = new Map<string, { size: number; available: number }>()
  private _canvasManager: { size: number } | null = null

  get stats(): MemoryStats {
    let totalPoolSize = 0
    for (const pool of this._pools.values()) {
      totalPoolSize += pool.size
    }
    const canvasCount = this._canvasManager?.size ?? 0
    const estimatedBytes = canvasCount * 256 * 256 * 4
    return {
      poolSize: totalPoolSize,
      canvasCount,
      estimatedBytes,
    }
  }

  suggest(): string[] {
    const suggestions: string[] = []
    for (const [name, pool] of this._pools) {
      const idleRatio = pool.size > 0 ? pool.available / pool.size : 0
      if (idleRatio > 0.8) {
        suggestions.push(`Pool "${name}" has ${Math.round(idleRatio * 100)}% idle objects, consider reducing size`)
      }
    }
    if (this._canvasManager !== null && this._canvasManager.size > 8) {
      suggestions.push(`${this._canvasManager.size} offscreen canvases cached, consider reducing max cache size`)
    }
    if (suggestions.length === 0) {
      suggestions.push('Memory usage looks optimal')
    }
    return suggestions
  }

  registerPool(name: string, pool: { size: number; available: number }): void {
    this._pools.set(name, pool)
  }

  unregisterPool(name: string): void {
    this._pools.delete(name)
  }

  registerCanvasManager(manager: { size: number }): void {
    this._canvasManager = manager
  }

  unregisterCanvasManager(): void {
    this._canvasManager = null
  }
}


function createGCAdvisor(): GCAdvisor {
  return new GCAdvisorImpl()
}

export type {
  ObjectPool,
  OffscreenCanvasEntry,
  OffscreenCanvasManager,
  OffscreenCanvasManagerOptions,
  MemoryStats,
  GCAdvisor,
}
export {
  createObjectPool,
  createOffscreenCanvasManager,
  createGCAdvisor,
  DEFAULT_MAX_POOL_SIZE,
  DEFAULT_MAX_CANVAS_CACHE,
}
