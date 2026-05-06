import type { Rect, DirtyRegion } from '@/renderer/types'

const DIRTY_PADDING = 2

class DirtyRegionImpl implements DirtyRegion {
  private _rects: Rect[] = []

  get rects(): ReadonlyArray<Rect> {
    return this._rects
  }

  add(rect: Rect): void {
    if (rect.width <= 0 || rect.height <= 0) return
    this._rects.push({
      x: rect.x - DIRTY_PADDING,
      y: rect.y - DIRTY_PADDING,
      width: rect.width + DIRTY_PADDING * 2,
      height: rect.height + DIRTY_PADDING * 2,
    })
  }

  merge(): Rect {
    if (this._rects.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }
    return mergeRects(this._rects)
  }

  clear(): void {
    this._rects = []
  }

  isEmpty(): boolean {
    return this._rects.length === 0
  }
}


function mergeRects(rects: ReadonlyArray<Rect>): Rect {
  if (rects.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const r of rects) {
    if (r.x < minX) minX = r.x
    if (r.y < minY) minY = r.y
    const right = r.x + r.width
    const bottom = r.y + r.height
    if (right > maxX) maxX = right
    if (bottom > maxY) maxY = bottom
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}


function createDirtyRegion(): DirtyRegion {
  return new DirtyRegionImpl()
}

export { DirtyRegionImpl, createDirtyRegion, mergeRects }
