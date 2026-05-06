interface FPSStats {
  readonly fps: number
  readonly frameTimeMs: number
  readonly droppedFrames: number
  readonly totalFrames: number
}

interface FPSMonitor {
  readonly stats: FPSStats
  readonly isRunning: boolean
  start(): void
  stop(): void
  reset(): void
}

const TARGET_FRAME_TIME_MS = 16.67
const MAX_SAMPLES = 120

class FPSMonitorImpl implements FPSMonitor {
  private _frameTimes: number[] = []
  private _totalFrames = 0
  private _droppedFrames = 0
  private _running = false
  private _lastTimestamp = 0
  private _rafId: number | null = null
  private _onUpdate: ((stats: FPSStats) => void) | null

  constructor(onUpdate?: (stats: FPSStats) => void) {
    this._onUpdate = onUpdate ?? null
  }

  get stats(): FPSStats {
    if (this._frameTimes.length === 0) {
      return { fps: 0, frameTimeMs: 0, droppedFrames: this._droppedFrames, totalFrames: this._totalFrames }
    }
    const avgFrameTime = this._frameTimes.reduce((a, b) => a + b, 0) / this._frameTimes.length
    const fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0
    return {
      fps: Math.round(fps * 100) / 100,
      frameTimeMs: Math.round(avgFrameTime * 100) / 100,
      droppedFrames: this._droppedFrames,
      totalFrames: this._totalFrames,
    }
  }

  get isRunning(): boolean {
    return this._running
  }

  start(): void {
    if (this._running) return
    this._running = true
    this._lastTimestamp = performance.now()
    this._rafId = requestAnimationFrame(this._tick)
  }

  stop(): void {
    this._running = false
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId)
      this._rafId = null
    }
  }

  reset(): void {
    this._frameTimes = []
    this._totalFrames = 0
    this._droppedFrames = 0
    this._lastTimestamp = performance.now()
  }

  private _tick = (): void => {
    if (!this._running) return
    const now = performance.now()
    const delta = now - this._lastTimestamp
    this._lastTimestamp = now

    this._totalFrames++
    this._frameTimes.push(delta)
    if (this._frameTimes.length > MAX_SAMPLES) {
      this._frameTimes.shift()
    }
    if (delta > TARGET_FRAME_TIME_MS * 2) {
      this._droppedFrames++
    }

    if (this._onUpdate !== null) {
      this._onUpdate(this.stats)
    }

    this._rafId = requestAnimationFrame(this._tick)
  }
}


function createFPSMonitor(onUpdate?: (stats: FPSStats) => void): FPSMonitor {
  return new FPSMonitorImpl(onUpdate)
}

interface RecompositionInfo {
  readonly scopeId: string
  readonly count: number
  readonly totalMs: number
  readonly avgMs: number
}

interface RecompositionCounter {
  record(scopeId: string, durationMs: number): void
  getStats(): RecompositionInfo[]
  reset(): void
}

const MAX_SCOPE_RECORDS = 500

class RecompositionCounterImpl implements RecompositionCounter {
  private _records = new Map<string, { count: number; totalMs: number }>()

  record(scopeId: string, durationMs: number): void {
    const existing = this._records.get(scopeId)
    if (existing !== undefined) {
      existing.count++
      existing.totalMs += durationMs
    } else {
      if (this._records.size >= MAX_SCOPE_RECORDS) {
        const oldestKey = this._records.keys().next().value
        if (oldestKey !== undefined) this._records.delete(oldestKey)
      }
      this._records.set(scopeId, { count: 1, totalMs: durationMs })
    }
  }

  getStats(): RecompositionInfo[] {
    const result: RecompositionInfo[] = []
    for (const [scopeId, data] of this._records) {
      result.push({
        scopeId,
        count: data.count,
        totalMs: Math.round(data.totalMs * 100) / 100,
        avgMs: Math.round((data.totalMs / data.count) * 100) / 100,
      })
    }
    return result.sort((a, b) => b.count - a.count)
  }

  reset(): void {
    this._records.clear()
  }
}


function createRecompositionCounter(): RecompositionCounter {
  return new RecompositionCounterImpl()
}

interface LayoutNodeInfo {
  readonly id: number
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
  readonly depth: number
}

interface InspectableNode {
  readonly id: number
  readonly position: { x: number; y: number }
  readonly measureResult: { width: number; height: number } | null
  readonly children: InspectableNode[]
}

interface LayoutInspector {
  inspect(root: InspectableNode): LayoutNodeInfo[]
}

class LayoutInspectorImpl implements LayoutInspector {
  inspect(root: InspectableNode): LayoutNodeInfo[] {
    const result: LayoutNodeInfo[] = []
    this._traverse(root, 0, result)
    return result
  }

  private _traverse(node: InspectableNode, depth: number, result: LayoutNodeInfo[]): void {
    const w = node.measureResult?.width ?? 0
    const h = node.measureResult?.height ?? 0
    result.push({
      id: node.id,
      x: node.position.x,
      y: node.position.y,
      width: w,
      height: h,
      depth,
    })
    for (const child of node.children) {
      this._traverse(child, depth + 1, result)
    }
  }
}


function createLayoutInspector(): LayoutInspector {
  return new LayoutInspectorImpl()
}

export type {
  FPSStats,
  FPSMonitor,
  RecompositionInfo,
  RecompositionCounter,
  LayoutNodeInfo,
  LayoutInspector,
  InspectableNode,
}
export { createFPSMonitor, createRecompositionCounter, createLayoutInspector, TARGET_FRAME_TIME_MS }
