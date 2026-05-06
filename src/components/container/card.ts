import type { SurfaceComponent } from '@/components/layout/surface'
import { DEFAULT_MODIFIER } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, Color, ReadonlyModifier } from '@/components/shared/imports'
import type { Alignment } from '@/layout/types'
import { Surface } from '@/components/layout/surface'

type CardComponent = Omit<SurfaceComponent, 'kind'> & { readonly kind: 'card' }

function Card(
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  color: Color = { r: 255, g: 255, b: 255, a: 1 },
  elevation: number = 1,
  borderRadius: number = 8,
  alignment: Alignment = 'start',
  children: ComponentNode[] = [],
): CardComponent {
  const surface = Surface(modifier, color, elevation, borderRadius, alignment, children)
  return { ...surface, kind: 'card' }
}

export type { CardComponent }
export { Card }
