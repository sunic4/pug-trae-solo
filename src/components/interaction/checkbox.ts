import { ConstrainedMeasurePolicy, Modifier, DEFAULT_MODIFIER } from '@/components/shared/imports'
import type { ComponentBase, ReadonlyModifier } from '@/components/shared/imports'
import type { Color } from '@/renderer/types'
import { PrimaryColor } from '@/theme/colors'
import type { GestureCallback } from '@/input/gesture-recognizer'
import { clickable } from '@/input/gesture-modifier'

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
  const modWithClick = Modifier.extendFrom(modifier)
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
  }
}

export type { CheckboxComponent }
export { Checkbox }
