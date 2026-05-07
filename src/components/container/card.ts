import { Surface, type SurfaceOptions } from '@/components/layout/surface'
import type { CompositionContext } from '@/core/composition-context'

function Card(
  ctx: CompositionContext,
  childrenFn?: () => void,
  options: SurfaceOptions = {},
): void {
  const cardOptions: SurfaceOptions = {
    ...options,
    elevation: options.elevation ?? 1,
    borderRadius: options.borderRadius ?? 8,
  }
  Surface(ctx, childrenFn, cardOptions)
}

export { Card }
