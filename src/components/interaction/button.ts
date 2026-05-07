import { BoxAlignmentMeasurePolicy, Modifier, DEFAULT_MODIFIER, NOOP_DRAW_POLICY, OnPrimaryColor, PrimaryColor, defaultTextStyle, normalizeModifier } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, ReadonlyModifier, Color } from '@/components/shared/imports'
import type { ChildLayout, MeasuredSizeMap } from '@/components/basic/types'
import type { GestureCallback } from '@/input/gesture-recognizer'
import type { Rect } from '@/renderer/types'
import { clickable } from '@/input/gesture-modifier'
import { layoutBoxChildren } from '@/components/shared/layout-helpers'
import { Text } from '@/components/basic/text'

type ButtonComponent = {
  readonly kind: 'button'
  readonly onClick: GestureCallback
  readonly children: readonly ComponentNode[]
  readonly backgroundColor: Color
  readonly contentColor: Color
} & ComponentBase

type ButtonOptions = {
  readonly modifier?: ReadonlyModifier
  readonly backgroundColor?: Color
  readonly contentColor?: Color
}

function resolveChildren(content: string | readonly ComponentNode[]): readonly ComponentNode[] {
  if (typeof content === 'string') {
    return [Text(content, DEFAULT_MODIFIER, { ...defaultTextStyle(), color: OnPrimaryColor })]
  }
  return [...content]
}

function Button(
  onClick: GestureCallback,
  content: string | readonly ComponentNode[] = [],
  options: ButtonOptions = {},
): ButtonComponent {
  const {
    modifier = DEFAULT_MODIFIER,
    backgroundColor = PrimaryColor,
    contentColor = OnPrimaryColor,
  } = options
  const children = resolveChildren(content)
  const normalizedModifier = normalizeModifier(modifier)
  const modWithClick = Modifier.extendFrom(normalizedModifier)
    .then(clickable(onClick))
    .padding(16, 8)
    .background(backgroundColor, 8)
    .freeze()
  const measurePolicy = BoxAlignmentMeasurePolicy('center')
  return {
    kind: 'button',
    modifier: modWithClick,
    onClick,
    children,
    backgroundColor,
    contentColor,
    measurePolicy,
    drawPolicy: NOOP_DRAW_POLICY,
    layoutChildren(contentArea: Rect, measuredSizes: MeasuredSizeMap): ChildLayout[] {
      return layoutBoxChildren(this.children, contentArea, measuredSizes, 'center')
    },
    getChildren(): ComponentNode[] {
      return [...this.children]
    },
  }
}

export type { ButtonComponent, ButtonOptions }
export { Button }
