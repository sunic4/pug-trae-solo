import { LinearMeasurePolicy, Modifier, createShadow, DEFAULT_MODIFIER, NOOP_DRAW_POLICY, normalizeModifier } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, Color, ReadonlyModifier } from '@/components/shared/imports'
import type { ChildLayout, MeasuredSizeMap } from '@/components/basic/types'
import type { Rect } from '@/renderer/types'
import type { Alignment, Arrangement } from '@/layout/types'
import { layoutColumnChildren } from '@/components/shared/layout-helpers'

type SurfaceOptions = {
  readonly modifier?: ReadonlyModifier
  readonly color?: Color
  readonly elevation?: number
  readonly borderRadius?: number
  readonly alignment?: Alignment
}

type SurfaceComponent = {
  readonly kind: 'surface'
  readonly color: Color
  readonly elevation: number
  readonly borderRadius: number
  readonly alignment: Alignment
  readonly children: ComponentNode[]
} & ComponentBase

function Surface(
  children: ComponentNode[] = [],
  options: SurfaceOptions = {},
): SurfaceComponent {
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
  return {
    kind: 'surface',
    modifier: surfaceModifier,
    color,
    elevation,
    borderRadius,
    alignment,
    children,
    measurePolicy,
    drawPolicy: NOOP_DRAW_POLICY,
    layoutChildren(contentArea: Rect, measuredSizes: MeasuredSizeMap): ChildLayout[] {
      return layoutColumnChildren(this.children, contentArea, measuredSizes, arrangement)
    },
    getChildren(): ComponentNode[] {
      return this.children
    },
  }
}

export type { SurfaceComponent, SurfaceOptions }
export { Surface }
