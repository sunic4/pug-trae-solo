import { BoxAlignmentMeasurePolicy } from '@/components/shared/measure-policies'
import { Modifier, DEFAULT_MODIFIER } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, ReadonlyModifier } from '@/components/shared/imports'
import type { GestureCallback } from '@/input/gesture-recognizer'
import type { Color } from '@/renderer/types'
import { PrimaryColor, OnPrimaryColor } from '@/theme/colors'
import { clickable } from '@/input/gesture-modifier'

type ButtonComponent = {
  readonly kind: 'button'
  readonly onClick: GestureCallback
  readonly children: readonly ComponentNode[]
  readonly backgroundColor: Color
  readonly contentColor: Color
} & ComponentBase

function Button(
  onClick: GestureCallback,
  children: readonly ComponentNode[] = [],
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  backgroundColor: Color = PrimaryColor,
  contentColor: Color = OnPrimaryColor,
): ButtonComponent {
  const modWithClick = Modifier.extendFrom(modifier)
    .then(clickable(onClick))
    .background(backgroundColor)
    .freeze()
  const measurePolicy = BoxAlignmentMeasurePolicy('center')
  return {
    kind: 'button',
    modifier: modWithClick,
    onClick,
    children: [...children],
    backgroundColor,
    contentColor,
    measurePolicy,
  }
}

export type { ButtonComponent }
export { Button }
