import { BoxAlignmentMeasurePolicy } from '@/components/shared/measure-policies'
import { Modifier, createShadow, DEFAULT_MODIFIER } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, Color, ReadonlyModifier } from '@/components/shared/imports'
import type { Alignment } from '@/layout/types'

type SurfaceComponent = {
  readonly kind: 'surface'
  readonly color: Color
  readonly elevation: number
  readonly borderRadius: number
  readonly alignment: Alignment
  readonly children: ComponentNode[]
} & ComponentBase

function Surface(
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  color: Color = { r: 255, g: 255, b: 255, a: 1 },
  elevation: number = 0,
  borderRadius: number = 0,
  alignment: Alignment = 'center',
  children: ComponentNode[] = [],
): SurfaceComponent {
  const builder = Modifier.extendFrom(modifier)
    .background(color, borderRadius)
  if (borderRadius > 0) {
    builder.clip(borderRadius)
  }
  if (elevation > 0) {
    builder.then(createShadow(elevation))
  }
  const surfaceModifier = builder.freeze()
  const measurePolicy = BoxAlignmentMeasurePolicy(alignment)
  return {
    kind: 'surface',
    modifier: surfaceModifier,
    color,
    elevation,
    borderRadius,
    alignment,
    children,
    measurePolicy,
  }
}

export type { SurfaceComponent }
export { Surface }
