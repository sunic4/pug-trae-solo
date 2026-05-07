import type { NinePatchConfig } from '@/renderer/image-loader'
import { ConstrainedMeasurePolicy, DEFAULT_MODIFIER, NOOP_DRAW_POLICY, leafGetChildren, leafLayoutChildren, normalizeModifier } from '@/components/shared/imports'
import type { ComponentBase, ReadonlyModifier } from '@/components/shared/imports'

type ImageComponent = {
  readonly kind: 'image'
  readonly src: string
  readonly width: number
  readonly height: number
  readonly ninePatch: NinePatchConfig | null
} & ComponentBase

function Image(
  src: string,
  width: number,
  height: number,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  ninePatch: NinePatchConfig | null = null,
): ImageComponent {
  const mod = normalizeModifier(modifier)
  const measurePolicy = ConstrainedMeasurePolicy(width, height)
  return {
    kind: 'image',
    modifier: mod,
    src,
    width,
    height,
    ninePatch,
    measurePolicy,
    drawPolicy: NOOP_DRAW_POLICY,
    layoutChildren: leafLayoutChildren,
    getChildren: leafGetChildren,
  }
}

export type { ImageComponent }
export { Image }
