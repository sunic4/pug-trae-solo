import { ConstrainedMeasurePolicy, Modifier, DEFAULT_MODIFIER, leafGetChildren, leafLayoutChildren, normalizeModifier } from '@/components/shared/imports'
import type { ComponentBase, ReadonlyModifier } from '@/components/shared/imports'
import type { Color, DrawScope, Rect } from '@/renderer/types'
import { PrimaryColor } from '@/theme/colors'
import type { GestureCallback } from '@/input/gesture-recognizer'
import { clickable } from '@/input/gesture-modifier'
import type { DrawPolicy, ChildLayout, MeasuredSizeMap, ComponentNode } from '@/components/basic/types'

function checkboxDrawPolicy(checked: boolean, checkmarkColor: Color): DrawPolicy {
  return (scope: DrawScope, bounds: Rect): void => {
    if (checked) {
      const size = Math.min(bounds.width, bounds.height)
      const ox = bounds.x + (bounds.width - size) / 2
      const oy = bounds.y + (bounds.height - size) / 2
      scope.drawLine(
        { x: ox + size * 0.2, y: oy + size * 0.5 },
        { x: ox + size * 0.4, y: oy + size * 0.7 },
        checkmarkColor,
        2.5,
      )
      scope.drawLine(
        { x: ox + size * 0.4, y: oy + size * 0.7 },
        { x: ox + size * 0.75, y: oy + size * 0.3 },
        checkmarkColor,
        2.5,
      )
    }
  }
}

type CheckboxComponent = {
  readonly kind: 'checkbox'
  readonly checked: boolean
  readonly onCheckedChange: (checked: boolean) => void
  readonly checkedColor: Color
  readonly uncheckedColor: Color
  readonly checkmarkColor: Color
} & ComponentBase

function Checkbox(
  checked: boolean,
  onCheckedChange: (checked: boolean) => void,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  checkedColor: Color = PrimaryColor,
  uncheckedColor: Color = { r: 189, g: 189, b: 189, a: 1 },
  checkmarkColor: Color = { r: 255, g: 255, b: 255, a: 1 },
): CheckboxComponent {
  const onClick: GestureCallback = () => {
    onCheckedChange(!checked)
  }
  const normalizedMod = normalizeModifier(modifier)
  const modWithClick = Modifier.extendFrom(normalizedMod)
    .then(clickable(onClick))
    .background(checked ? checkedColor : uncheckedColor, 4)
    .freeze()
  const measurePolicy = ConstrainedMeasurePolicy(24, 24)
  return {
    kind: 'checkbox',
    modifier: modWithClick,
    checked,
    onCheckedChange,
    checkedColor,
    uncheckedColor,
    checkmarkColor,
    measurePolicy,
    drawPolicy: checkboxDrawPolicy(checked, checkmarkColor),
    layoutChildren: leafLayoutChildren,
    getChildren: leafGetChildren,
  }
}

export type { CheckboxComponent }
export { Checkbox }
