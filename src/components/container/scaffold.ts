import { Modifier, DEFAULT_MODIFIER, createMeasurePolicy, createMeasureResult } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, Color, MeasurePolicy, Measurable, Constraints, MeasureResult, ReadonlyModifier } from '@/components/shared/imports'

type ScaffoldComponent = {
  readonly kind: 'scaffold'
  readonly topBar: ComponentNode | null
  readonly content: ComponentNode[]
  readonly bottomBar: ComponentNode | null
  readonly snackbarHost: ComponentNode | null
  readonly backgroundColor: Color
} & ComponentBase

function scaffoldMeasurePolicy(hasTopBar: boolean, hasBottomBar: boolean, hasSnackbar: boolean): MeasurePolicy {
  return createMeasurePolicy({
    measure(measurables: Measurable[], constraints: Constraints): MeasureResult {
      const topBarHeight = hasTopBar ? 56 : 0
      const bottomBarHeight = hasBottomBar ? 56 : 0
      const snackbarHeight = hasSnackbar ? 48 : 0
      const contentHeight = Math.max(0, constraints.maxHeight - topBarHeight - bottomBarHeight - snackbarHeight)

      let idx = 0
      if (hasTopBar && idx < measurables.length) {
        const topBar = measurables[idx]!
        topBar.measure({
          minWidth: constraints.minWidth,
          maxWidth: constraints.maxWidth,
          minHeight: 0,
          maxHeight: topBarHeight,
        })
        idx++
      }

      if (idx < measurables.length) {
        const content = measurables[idx]!
        content.measure({
          minWidth: constraints.minWidth,
          maxWidth: constraints.maxWidth,
          minHeight: 0,
          maxHeight: contentHeight,
        })
        idx++
      }

      if (hasBottomBar && idx < measurables.length) {
        const bottomBar = measurables[idx]!
        bottomBar.measure({
          minWidth: constraints.minWidth,
          maxWidth: constraints.maxWidth,
          minHeight: 0,
          maxHeight: bottomBarHeight,
        })
        idx++
      }

      if (hasSnackbar && idx < measurables.length) {
        const snackbar = measurables[idx]!
        snackbar.measure({
          minWidth: constraints.minWidth,
          maxWidth: constraints.maxWidth,
          minHeight: 0,
          maxHeight: snackbarHeight,
        })
      }

      return createMeasureResult(constraints.maxWidth, constraints.maxHeight)
    },
    minIntrinsicWidth(measurables: Measurable[]): number {
      let maxWidth = 0
      for (const m of measurables) {
        const placeable = m.measure({ minWidth: 0, maxWidth: Infinity, minHeight: 0, maxHeight: Infinity })
        if (placeable.measureResult.width > maxWidth) maxWidth = placeable.measureResult.width
      }
      return maxWidth
    },
    minIntrinsicHeight(measurables: Measurable[]): number {
      let totalHeight = 0
      for (const m of measurables) {
        const placeable = m.measure({ minWidth: 0, maxWidth: Infinity, minHeight: 0, maxHeight: Infinity })
        totalHeight += placeable.measureResult.height
      }
      return totalHeight
    },
  })
}

function Scaffold(
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  topBar: ComponentNode | null = null,
  content: ComponentNode[] = [],
  bottomBar: ComponentNode | null = null,
  snackbarHost: ComponentNode | null = null,
  backgroundColor: Color = { r: 255, g: 255, b: 255, a: 1 },
): ScaffoldComponent {
  const scaffoldModifier = Modifier.extendFrom(modifier)
    .background(backgroundColor)
    .fillMaxSize()
    .freeze()
  const measurePolicy = scaffoldMeasurePolicy(
    topBar !== null,
    bottomBar !== null,
    snackbarHost !== null,
  )
  return {
    kind: 'scaffold',
    modifier: scaffoldModifier,
    topBar,
    content,
    bottomBar,
    snackbarHost,
    backgroundColor,
    measurePolicy,
  }
}

export type { ScaffoldComponent }
export { Scaffold }
