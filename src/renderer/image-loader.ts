import type { Rect } from '@/renderer/types'

interface ImageResource {
  readonly source: CanvasImageSource
  readonly width: number
  readonly height: number
  readonly isLoaded: boolean
}

interface NinePatchConfig {
  readonly left: number
  readonly top: number
  readonly right: number
  readonly bottom: number
}

interface NinePatchRegion {
  readonly topLeft: Rect
  readonly topCenter: Rect
  readonly topRight: Rect
  readonly middleLeft: Rect
  readonly middleCenter: Rect
  readonly middleRight: Rect
  readonly bottomLeft: Rect
  readonly bottomCenter: Rect
  readonly bottomRight: Rect
}

const DEFAULT_MAX_CACHE_SIZE = 50


class ImageCache {
  private _cache: Map<string, ImageResource> = new Map()
  private _maxSize: number

  constructor(maxSize: number = DEFAULT_MAX_CACHE_SIZE) {
    this._maxSize = maxSize
  }

  get(src: string): ImageResource | null {
    const resource = this._cache.get(src)
    if (resource !== undefined) {
      this._cache.delete(src)
      this._cache.set(src, resource)
      return resource
    }
    return null
  }

  set(src: string, resource: ImageResource): void {
    if (this._cache.has(src)) {
      this._cache.delete(src)
    } else if (this._cache.size >= this._maxSize) {
      const firstKey = this._cache.keys().next().value
      if (firstKey !== undefined) {
        this._cache.delete(firstKey)
      }
    }
    this._cache.set(src, resource)
  }

  has(src: string): boolean {
    return this._cache.has(src)
  }

  evict(src: string): void {
    this._cache.delete(src)
  }

  clear(): void {
    this._cache.clear()
  }

  get size(): number {
    return this._cache.size
  }

  dispose(): void {
    this.clear()
  }
}

interface ImageLoader {
  load(src: string): Promise<ImageResource | null>
  get(src: string): ImageResource | null
  preload(srcs: string[]): Promise<void>
  evict(src: string): void
  clear(): void
  dispose(): void
}

class ImageLoaderImpl implements ImageLoader {
  private _cache: ImageCache
  private _loading: Map<string, Promise<ImageResource | null>> = new Map()
  private _disposed = false

  constructor(maxCacheSize: number = DEFAULT_MAX_CACHE_SIZE) {
    this._cache = new ImageCache(maxCacheSize)
  }

  async load(src: string): Promise<ImageResource | null> {
    if (this._disposed) return null

    const cached = this._cache.get(src)
    if (cached !== null) return cached

    const loading = this._loading.get(src)
    if (loading !== undefined) return loading

    const promise = this._loadImage(src)
    this._loading.set(src, promise)

    try {
      const resource = await promise
      if (resource !== null) {
        this._cache.set(src, resource)
      }
      return resource
    } finally {
      this._loading.delete(src)
    }
  }

  get(src: string): ImageResource | null {
    return this._cache.get(src)
  }

  async preload(srcs: string[]): Promise<void> {
    await Promise.all(srcs.map(src => this.load(src)))
  }

  evict(src: string): void {
    this._cache.evict(src)
  }

  clear(): void {
    this._cache.clear()
  }

  dispose(): void {
    this._disposed = true
    this._cache.dispose()
    this._loading.clear()
  }

  private _loadImage(src: string): Promise<ImageResource | null> {
    return new Promise((resolve) => {
      if (typeof Image === 'undefined') {
        resolve(null)
        return
      }
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        resolve({
          source: img,
          width: img.naturalWidth,
          height: img.naturalHeight,
          isLoaded: true,
        })
      }
      img.onerror = () => {
        resolve(null)
      }
      img.src = src
    })
  }
}


function computeNinePatchRegions(
  imageWidth: number,
  imageHeight: number,
  config: NinePatchConfig,
  _destWidth: number,
  _destHeight: number,
): NinePatchRegion {
  const l = config.left
  const t = config.top
  const r = config.right
  const b = config.bottom
  const srcMidW = imageWidth - l - r
  const srcMidH = imageHeight - t - b

  return {
    topLeft: { x: 0, y: 0, width: l, height: t },
    topCenter: { x: l, y: 0, width: srcMidW, height: t },
    topRight: { x: imageWidth - r, y: 0, width: r, height: t },
    middleLeft: { x: 0, y: t, width: l, height: srcMidH },
    middleCenter: { x: l, y: t, width: srcMidW, height: srcMidH },
    middleRight: { x: imageWidth - r, y: t, width: r, height: srcMidH },
    bottomLeft: { x: 0, y: imageHeight - b, width: l, height: b },
    bottomCenter: { x: l, y: imageHeight - b, width: srcMidW, height: b },
    bottomRight: { x: imageWidth - r, y: imageHeight - b, width: r, height: b },
  }
}


function computeNinePatchDestRegions(
  destWidth: number,
  destHeight: number,
  config: NinePatchConfig,
): NinePatchRegion {
  const l = config.left
  const t = config.top
  const r = config.right
  const b = config.bottom
  const midW = destWidth - l - r
  const midH = destHeight - t - b

  return {
    topLeft: { x: 0, y: 0, width: l, height: t },
    topCenter: { x: l, y: 0, width: midW, height: t },
    topRight: { x: destWidth - r, y: 0, width: r, height: t },
    middleLeft: { x: 0, y: t, width: l, height: midH },
    middleCenter: { x: l, y: t, width: midW, height: midH },
    middleRight: { x: destWidth - r, y: t, width: r, height: midH },
    bottomLeft: { x: 0, y: destHeight - b, width: l, height: b },
    bottomCenter: { x: l, y: destHeight - b, width: midW, height: b },
    bottomRight: { x: destWidth - r, y: destHeight - b, width: r, height: b },
  }
}


function createImageLoader(maxCacheSize?: number): ImageLoader {
  return new ImageLoaderImpl(maxCacheSize)
}

export type {
  ImageResource,
  NinePatchConfig,
  NinePatchRegion,
  ImageLoader,
}

export {
  ImageCache,
  DEFAULT_MAX_CACHE_SIZE,
  computeNinePatchRegions,
  computeNinePatchDestRegions,
  createImageLoader,
}
