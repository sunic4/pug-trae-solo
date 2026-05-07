import { SquareMeasurePolicy, Modifier, DEFAULT_MODIFIER, NOOP_DRAW_POLICY, normalizeModifier } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, ReadonlyModifier } from '@/components/shared/imports'
import type { ChildLayout, MeasuredSizeMap } from '@/components/basic/types'
import type { GestureCallback } from '@/input/gesture-recognizer'
import type { Color, Rect } from '@/renderer/types'
import { PrimaryColor, OnPrimaryColor } from '@/theme/colors'
import { clickable } from '@/input/gesture-modifier'
import { layoutBoxChildren } from '@/components/shared/layout-helpers'

type FabComponent = {
  readonly kind: 'fab'
  readonly onClick: GestureCallback
  readonly children: ComponentNode[]
  readonly backgroundColor: Color
  readonly contentColor: Color
  readonly size: number
  readonly elevation: number
} & ComponentBase

function FAB(
  onClick: GestureCallback,
  children: ComponentNode[] = [],
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  backgroundColor: Color = PrimaryColor,
  contentColor: Color = OnPrimaryColor,
  size: number = 56,
  elevation: number = 6,
): FabComponent {
  const normalizedMod = normalizeModifier(modifier)
  const modWithClick = Modifier.extendFrom(normalizedMod)
    .then(clickable(onClick))
    .background(backgroundColor)
    .freeze()
  const measurePolicy = SquareMeasurePolicy(size)
  return {
    kind: 'fab',
    modifier: modWithClick,
    onClick,
    children,
    backgroundColor,
    contentColor,
    size,
    elevation,
    measurePolicy,
    drawPolicy: NOOP_DRAW_POLICY,
    layoutChildren(contentArea: Rect, measuredSizes: MeasuredSizeMap): ChildLayout[] {
      return layoutBoxChildren(this.children, contentArea, measuredSizes, 'center')
    },
    getChildren(): ComponentNode[] {
      return this.children
    },
  }
}

export type { FabComponent }
export { FAB }
