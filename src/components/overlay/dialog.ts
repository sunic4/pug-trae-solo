import { Surface } from '@/components/layout/surface'
import { Text } from '@/components/basic/text'
import { Column } from '@/components/layout/column'
import { Row } from '@/components/layout/row'
import { Spacer } from '@/components/basic/spacer'
import { Modifier, DEFAULT_MODIFIER, normalizeModifier, defaultTextStyle } from '@/components/shared/imports'
import { clickable } from '@/input/gesture-modifier'
import type { Color, ReadonlyModifier } from '@/components/shared/imports'
import type { CompositionContext } from '@/core/composition-context'

interface DialogButton {
  readonly label: string
  readonly onClick: () => void
}

type DialogOptions = {
  readonly content?: () => void
  readonly buttons?: DialogButton[]
  readonly modifier?: ReadonlyModifier
  readonly backgroundColor?: Color
}

function Dialog(
  ctx: CompositionContext,
  options: DialogOptions & { readonly title: string; readonly onDismiss: () => void },
): void {
  const {
    title,
    content,
    buttons = [],
    modifier = DEFAULT_MODIFIER,
    backgroundColor = { r: 255, g: 255, b: 255, a: 1 },
  } = options
  const normalizedMod = normalizeModifier(modifier)

  Surface(
    ctx,
    () => {
      Surface(
        ctx,
        () => {
          Text(ctx, title, DEFAULT_MODIFIER, { ...defaultTextStyle(), fontSize: 16, fontWeight: 'bold', color: { r: 33, g: 33, b: 33, a: 1 } })
          if (content) content()
          if (buttons.length > 0) {
            Spacer(ctx, 0, 16)
            Row(ctx, DEFAULT_MODIFIER, 'end', 'center', () => {
              for (const btn of buttons) {
                Surface(
                  ctx,
                  () => {
                    Text(ctx, btn.label, DEFAULT_MODIFIER, { ...defaultTextStyle(), fontSize: 14, color: { r: 33, g: 150, b: 243, a: 1 } })
                  },
                  {
                    modifier: Modifier.create()
                      .then(clickable(btn.onClick))
                      .padding(8, 16)
                      .freeze(),
                    color: { r: 0, g: 0, b: 0, a: 0 },
                    elevation: 0,
                    borderRadius: 4,
                    alignment: 'center',
                  },
                )
              }
            })
          }
        },
        {
          modifier: Modifier.create()
            .setWidth(280)
            .freeze(),
          color: backgroundColor,
          elevation: 0,
          borderRadius: 12,
          alignment: 'start',
        },
      )
    },
    {
      modifier: Modifier.extendFrom(normalizedMod)
        .background({ r: 0, g: 0, b: 0, a: 0.5 })
        .freeze(),
      color: { r: 0, g: 0, b: 0, a: 0.5 },
      elevation: 0,
      borderRadius: 0,
      alignment: 'center',
    },
  )
}

export type { DialogButton, DialogOptions }
export { Dialog }
