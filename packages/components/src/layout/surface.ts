import { LinearMeasurePolicy, Modifier, createShadow, DEFAULT_MODIFIER, NOOP_DRAW_POLICY, normalizeModifier } from '../shared/imports'
import type { Color, ReadonlyModifier } from '../shared/imports'
import type { ChildLayout, MeasuredSizeMap } from '@pug-canvas-ui/render'
import type { Rect } from '@pug-canvas-ui/render'
import type { Alignment, Arrangement } from '@pug-canvas-ui/layout'
import { layoutColumnChildren } from '../shared/layout-helpers'
import type { CompositionContext } from '@pug-canvas-ui/core'

type SurfaceOptions = {
  readonly modifier?: ReadonlyModifier
  readonly color?: Color
  readonly elevation?: number
  readonly borderRadius?: number
  readonly alignment?: Alignment
}

function Surface(
  ctx: CompositionContext,
  childrenFn?: () => void,
  options: SurfaceOptions = {},
): void {
  const {
    modifier = DEFAULT_MODIFIER,
    color = { r: 255, g: 255, b: 255, a: 1 },
    elevation = 0,
    borderRadius = 0,
    alignment = 'center',
  } = options
  const normalizedModifier = normalizeModifier(modifier)
  const builder = Modifier.extendFrom(normalizedModifier)
    .background(color, borderRadius)
  if (borderRadius > 0) {
    builder.clip(borderRadius)
  }
  if (elevation > 0) {
    builder.then(createShadow(elevation))
  }
  const surfaceModifier = builder.freeze()
  const arrangement: Arrangement = 'start'
  const measurePolicy = new LinearMeasurePolicy('vertical', arrangement, alignment)
  ctx.emitNode(
    { color, elevation, borderRadius, alignment },
    surfaceModifier,
    measurePolicy,
    NOOP_DRAW_POLICY,
    (contentArea: Rect, measuredSizes: MeasuredSizeMap, selfChildrenIds: readonly number[]): ChildLayout[] => {
      return layoutColumnChildren(selfChildrenIds, contentArea, measuredSizes, arrangement)
    },
  )
  if (childrenFn) {
    childrenFn()
  }
  ctx.endGroup()
}

export type { SurfaceOptions }
export { Surface }
