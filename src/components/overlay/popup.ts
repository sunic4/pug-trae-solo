import { BoxAlignmentMeasurePolicy, DEFAULT_MODIFIER } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, ReadonlyModifier } from '@/components/shared/imports'
import type { Alignment } from '@/layout/types'

type PopupComponent = {
  readonly kind: 'popup'
  readonly content: ComponentNode[]
  readonly alignment: Alignment
  readonly offset: { readonly x: number; readonly y: number }
  readonly onDismissRequest: (() => void) | null
} & ComponentBase

function Popup(
  content: ComponentNode[] = [],
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  alignment: Alignment = 'center',
  offset: { x: number; y: number } = { x: 0, y: 0 },
  onDismissRequest: (() => void) | null = null,
): PopupComponent {
  const measurePolicy = BoxAlignmentMeasurePolicy(alignment)
  return {
    kind: 'popup',
    modifier,
    content,
    alignment,
    offset,
    onDismissRequest,
    measurePolicy,
  }
}

export type { PopupComponent }
export { Popup }
