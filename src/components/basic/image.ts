import type { NinePatchConfig } from '@/renderer/image-loader'
import { ConstrainedMeasurePolicy, DEFAULT_MODIFIER } from '@/components/shared/imports'
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
  const measurePolicy = ConstrainedMeasurePolicy(width, height)
  return {
    kind: 'image',
    modifier,
    src,
    width,
    height,
    ninePatch,
    measurePolicy,
  }
}

export type { ImageComponent }
export { Image }
