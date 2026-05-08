import { Column } from '../layout/column'
import { LinearMeasurePolicy, Modifier, DEFAULT_MODIFIER, NOOP_DRAW_POLICY, normalizeModifier } from '../shared/imports'
import type { Color, ReadonlyModifier } from '../shared/imports'
import type { ChildLayout, MeasuredSizeMap } from '@pug-canvas-ui/render'
import type { Rect } from '@pug-canvas-ui/render'
import type { CompositionContext } from '@pug-canvas-ui/core'
import { layoutColumnChildren } from '../shared/layout-helpers'

type ScaffoldOptions = {
  readonly modifier?: ReadonlyModifier
  readonly backgroundColor?: Color
}

function Scaffold(
  ctx: CompositionContext,
  topBarFn?: (() => void) | null,
  bodyFn?: () => void,
  bottomBarFn?: (() => void) | null,
  options?: ScaffoldOptions,
): void {
  const { modifier = DEFAULT_MODIFIER, backgroundColor = { r: 255, g: 255, b: 255, a: 1 } } = options ?? {}
  const normalizedMod = normalizeModifier(modifier)

  const scaffoldModifier = Modifier.extendFrom(normalizedMod)
    .background(backgroundColor, 0)
    .fillMaxSize()
    .freeze()

  const measurePolicy = new LinearMeasurePolicy('vertical', 'start', 'start')

  ctx.emitNode(
    { color: backgroundColor },
    scaffoldModifier,
    measurePolicy,
    NOOP_DRAW_POLICY,
    (contentArea: Rect, measuredSizes: MeasuredSizeMap, selfChildrenIds: readonly number[]): ChildLayout[] => {
      return layoutColumnChildren(selfChildrenIds, contentArea, measuredSizes, 'start')
    },
  )

  Column(ctx, DEFAULT_MODIFIER, 'start', 'start', () => {
    if (topBarFn) topBarFn()
    if (bodyFn) bodyFn()
    if (bottomBarFn) bottomBarFn()
  })

  ctx.endGroup()
}

export type { ScaffoldOptions }
export { Scaffold }
