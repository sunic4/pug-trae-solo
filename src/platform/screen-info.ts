import type { Density } from '@/platform/density'
import { createDensity } from '@/platform/density'
import type { SafeArea } from '@/platform/safe-area'
import { detectSafeArea } from '@/platform/safe-area'

type ScreenOrientation = 'portrait' | 'landscape'

interface ScreenInfo {
  readonly width: number
  readonly height: number
  readonly orientation: ScreenOrientation
  readonly density: Density
  readonly safeArea: SafeArea
}

interface PlatformAdapter {
  readonly screenInfo: ScreenInfo
  observe(callback: (info: ScreenInfo) => void): () => void
  dispose(): void
}

interface PlatformAdapterOptions {
  readonly eventTarget?: EventTarget
  readonly getWindowSize?: () => { width: number; height: number }
}


function inferOrientation(width: number, height: number): ScreenOrientation {
  return height >= width ? 'portrait' : 'landscape'
}


function detectScreenInfo(density?: Density): ScreenInfo {
  const d = density ?? createDensity()
  const w = typeof window !== 'undefined' ? window.innerWidth || 0 : 0
  const h = typeof window !== 'undefined' ? window.innerHeight || 0 : 0
  return {
    width: w,
    height: h,
    orientation: inferOrientation(w, h),
    density: d,
    safeArea: detectSafeArea(),
  }
}


function createPlatformAdapter(_canvas?: HTMLCanvasElement, options?: PlatformAdapterOptions): PlatformAdapter {
  const eventTarget = options?.eventTarget ?? (typeof window !== 'undefined' ? window : null)
  const getWindowSize = options?.getWindowSize ?? (() => ({
    width: typeof window !== 'undefined' ? window.innerWidth || 0 : 0,
    height: typeof window !== 'undefined' ? window.innerHeight || 0 : 0,
  }))

  const initialSize = getWindowSize()
  let currentInfo: ScreenInfo = {
    width: initialSize.width,
    height: initialSize.height,
    orientation: inferOrientation(initialSize.width, initialSize.height),
    density: createDensity(),
    safeArea: detectSafeArea(),
  }
  const listeners = new Set<(info: ScreenInfo) => void>()
  let disposed = false
  let resizeHandler: (() => void) | null = null

  function notifyAll(): void {
    const size = getWindowSize()
    const info: ScreenInfo = {
      width: size.width,
      height: size.height,
      orientation: inferOrientation(size.width, size.height),
      density: currentInfo.density,
      safeArea: detectSafeArea(),
    }
    currentInfo = info
    for (const cb of listeners) {
      try { cb(info) } catch {}
    }
  }

  if (eventTarget !== null) {
    resizeHandler = () => { if (!disposed) notifyAll() }
    eventTarget.addEventListener('resize', resizeHandler)
  }

  return {
    get screenInfo(): ScreenInfo { return currentInfo },
    observe(callback: (info: ScreenInfo) => void): () => void {
      if (disposed) return () => {}
      listeners.add(callback)
      return () => { listeners.delete(callback) }
    },
    dispose(): void {
      if (disposed) return
      disposed = true
      listeners.clear()
      if (resizeHandler && eventTarget !== null) {
        eventTarget.removeEventListener('resize', resizeHandler)
      }
    },
  }
}

export type { ScreenOrientation, ScreenInfo, PlatformAdapter, PlatformAdapterOptions }
export { detectScreenInfo, createPlatformAdapter, inferOrientation }
