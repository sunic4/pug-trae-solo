export type { Density } from '@/platform/density'
export { createDensity, dp, sp, MDPI_DPI } from '@/platform/density'

export type { SafeArea } from '@/platform/safe-area'
export { detectSafeArea, ZERO_SAFE_AREA } from '@/platform/safe-area'

export type { ScreenOrientation, ScreenInfo, PlatformAdapter, PlatformAdapterOptions } from '@/platform/screen-info'
export { detectScreenInfo, createPlatformAdapter, inferOrientation } from '@/platform/screen-info'

export type {
  FPSStats,
  FPSMonitor,
  RecompositionInfo,
  RecompositionCounter,
  LayoutNodeInfo,
  LayoutInspector,
  InspectableNode,
} from '@/platform/perf-monitor'
export { createFPSMonitor, createRecompositionCounter, createLayoutInspector, TARGET_FRAME_TIME_MS } from '@/platform/perf-monitor'

export type {
  ObjectPool,
  OffscreenCanvasEntry,
  OffscreenCanvasManager,
  OffscreenCanvasManagerOptions,
  MemoryStats,
  GCAdvisor,
} from '@/platform/memory'
export {
  createObjectPool,
  createOffscreenCanvasManager,
  createGCAdvisor,
  DEFAULT_MAX_POOL_SIZE,
  DEFAULT_MAX_CANVAS_CACHE,
} from '@/platform/memory'

export type {
  SemanticsRole,
  SemanticsProperties,
  SemanticsNode,
  SemanticsTree,
  AccessibilityManager,
} from '@/platform/accessibility'
export { createSemanticsNode, createSemanticsTree, createAccessibilityManager } from '@/platform/accessibility'
