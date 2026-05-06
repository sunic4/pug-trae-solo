import { SquareMeasurePolicy } from '@/components/shared/measure-policies'
import { Modifier, DEFAULT_MODIFIER } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, ReadonlyModifier } from '@/components/shared/imports'
import type { GestureCallback } from '@/input/gesture-recognizer'
import type { Color } from '@/renderer/types'
import { PrimaryColor, OnPrimaryColor } from '@/theme/colors'
import { clickable } from '@/input/gesture-modifier'

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
  const modWithClick = Modifier.extendFrom(modifier)
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
  }
}

export type { FabComponent }
export { FAB }
