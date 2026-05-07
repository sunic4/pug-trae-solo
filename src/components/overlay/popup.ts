import { BoxAlignmentMeasurePolicy, DEFAULT_MODIFIER, NOOP_DRAW_POLICY, normalizeModifier } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, ReadonlyModifier } from '@/components/shared/imports'
import type { Alignment } from '@/layout/types'
import type { Rect } from '@/renderer/types'
import type { ChildLayout, MeasuredSizeMap } from '@/components/basic/types'
import { layoutBoxChildren } from '@/components/shared/layout-helpers'

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
  const mod = normalizeModifier(modifier)
  const measurePolicy = BoxAlignmentMeasurePolicy(alignment)
  return {
    kind: 'popup',
    modifier: mod,
    content,
    alignment,
    offset,
    onDismissRequest,
    measurePolicy,
    drawPolicy: NOOP_DRAW_POLICY,
    getChildren(): ComponentNode[] {
      return this.content
    },
    layoutChildren(contentArea: Rect, measuredSizes: MeasuredSizeMap): ChildLayout[] {
      return layoutBoxChildren(this.content, contentArea, measuredSizes, this.alignment)
    },
  }
}

export type { PopupComponent }
export { Popup }
