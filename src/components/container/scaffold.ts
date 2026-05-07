
import { Modifier, DEFAULT_MODIFIER, createMeasurePolicy, createMeasureResult, NOOP_DRAW_POLICY, normalizeModifier } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, Color, MeasurePolicy, Measurable, Constraints, MeasureResult, ReadonlyModifier } from '@/components/shared/imports'
import type { ChildLayout, MeasuredSizeMap } from '@/components/basic/types'
import type { Rect } from '@/renderer/types'

type ScaffoldComponent = {
  readonly kind: 'scaffold'
  readonly topBar: ComponentNode | null
  readonly content: ComponentNode[]
  readonly bottomBar: ComponentNode | null
  readonly snackbarHost: ComponentNode | null
  readonly backgroundColor: Color
} & ComponentBase

function scaffoldMeasurePolicy(
  hasTopBar: boolean,
  contentCount: number,
  hasBottomBar: boolean,
  hasSnackbar: boolean
): MeasurePolicy {
  return createMeasurePolicy({
    measure(measurables: Measurable[], constraints: Constraints): MeasureResult {
      const topBarHeight = hasTopBar ? 56 : 0
      const bottomBarHeight = hasBottomBar ? 56 : 0
      const snackbarHeight = hasSnackbar ? 48 : 0
      const contentHeight = Math.max(0, constraints.maxHeight - topBarHeight - bottomBarHeight)

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

      for (let i = 0; i < contentCount && idx < measurables.length; i++) {
        const contentItem = measurables[idx]!
        contentItem.measure({
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
  const normalizedMod = normalizeModifier(modifier)
  const scaffoldModifier = Modifier.extendFrom(normalizedMod)
    .background(backgroundColor)
    .fillMaxSize()
    .freeze()
  const measurePolicy = scaffoldMeasurePolicy(
    topBar !== null,
    content.length,
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
    drawPolicy: NOOP_DRAW_POLICY,
    layoutChildren(contentArea: Rect, measuredSizes: MeasuredSizeMap): ChildLayout[] {
      const layouts: ChildLayout[] = []
      const topBarHeight = this.topBar ? 56 : 0
      const bottomBarHeight = this.bottomBar ? 56 : 0
      const snackbarHeight = this.snackbarHost ? 48 : 0
      const contentHeight = Math.max(0, contentArea.height - topBarHeight - bottomBarHeight)
      let yOffset = 0
      if (this.topBar) {
        layouts.push({
          node: this.topBar,
          x: contentArea.x,
          y: contentArea.y + yOffset,
          width: contentArea.width,
          height: topBarHeight,
        })
        yOffset += topBarHeight
      }
      for (const child of this.content) {
        layouts.push({
          node: child,
          x: contentArea.x,
          y: contentArea.y + yOffset,
          width: contentArea.width,
          height: contentHeight,
        })
      }
      yOffset += contentHeight
      if (this.bottomBar) {
        layouts.push({
          node: this.bottomBar,
          x: contentArea.x,
          y: contentArea.y + yOffset,
          width: contentArea.width,
          height: bottomBarHeight,
        })
      }
      if (this.snackbarHost) {
        layouts.push({
          node: this.snackbarHost,
          x: contentArea.x,
          y: contentArea.y + contentArea.height - snackbarHeight - bottomBarHeight,
          width: contentArea.width,
          height: snackbarHeight,
        })
      }
      return layouts
    },
    getChildren(): ComponentNode[] {
      return [
        ...(this.topBar ? [this.topBar] : []),
        ...this.content,
        ...(this.bottomBar ? [this.bottomBar] : []),
        ...(this.snackbarHost ? [this.snackbarHost] : []),
      ]
    },
  }
}

export type { ScaffoldComponent }
export { Scaffold }
