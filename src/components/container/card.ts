import type { SurfaceComponent, SurfaceOptions } from '@/components/layout/surface'
import { Surface } from '@/components/layout/surface'
import type { ComponentNode } from '@/components/basic/types'

type CardComponent = Omit<SurfaceComponent, 'kind'> & { readonly kind: 'card' }

function Card(
  children: ComponentNode[] = [],
  options: SurfaceOptions = {},
): CardComponent {
  const surface = Surface(children, { ...options, elevation: options.elevation ?? 1, borderRadius: options.borderRadius ?? 8 })
  return { ...surface, kind: 'card' }
}

export type { CardComponent }
export { Card }
