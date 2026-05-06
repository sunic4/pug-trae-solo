import { Modifier, createShadow, DEFAULT_MODIFIER, textPixelWidth, createMeasurePolicy, constrainWidth, createMeasureResult } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, Color, MeasurePolicy, Measurable, Constraints, MeasureResult, ReadonlyModifier } from '@/components/shared/imports'

type TopAppBarComponent = {
  readonly kind: 'top-app-bar'
  readonly title: string
  readonly navigationIcon: ComponentNode | null
  readonly actions: ComponentNode[]
  readonly backgroundColor: Color
  readonly contentColor: Color
  readonly elevation: number
} & ComponentBase

function topAppBarMeasurePolicy(title: string, hasNavIcon: boolean, actionCount: number): MeasurePolicy {
  const navWidth = hasNavIcon ? 48 : 0
  const actionWidth = actionCount * 48
  const titleWidth = textPixelWidth(title, 18)
  const hPadding = 32
  const totalWidth = navWidth + titleWidth + actionWidth + hPadding
  return createMeasurePolicy({
    measure(_measurables: Measurable[], constraints: Constraints): MeasureResult {
      const height = 56
      const width = constrainWidth(constraints, totalWidth)
      return createMeasureResult(width, height)
    },
    minIntrinsicWidth(): number {
      return totalWidth
    },
    minIntrinsicHeight(): number {
      return 56
    },
  })
}

function TopAppBar(
  title: string,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  navigationIcon: ComponentNode | null = null,
  actions: ComponentNode[] = [],
  backgroundColor: Color = { r: 255, g: 255, b: 255, a: 1 },
  contentColor: Color = { r: 33, g: 33, b: 33, a: 1 },
  elevation: number = 0,
): TopAppBarComponent {
  const builder = Modifier.extendFrom(modifier)
    .background(backgroundColor)
  if (elevation > 0) {
    builder.then(createShadow(elevation))
  }
  const appBarModifier = builder.freeze()
  const measurePolicy = topAppBarMeasurePolicy(title, navigationIcon !== null, actions.length)
  return {
    kind: 'top-app-bar',
    modifier: appBarModifier,
    title,
    navigationIcon,
    actions,
    backgroundColor,
    contentColor,
    elevation,
    measurePolicy,
  }
}

export type { TopAppBarComponent }
export { TopAppBar }
