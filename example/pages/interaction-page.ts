import { composable } from '@/core/composable'
import { remember } from '@/core/remember'
import type { ComposerContext, ComposableNode, MutableState } from '@/core/types'
import { mutableStateOf } from '@/core/state'
import { Column } from '@/components/layout/column'
import { Row } from '@/components/layout/row'
import { Button } from '@/components/interaction/button'
import { Slider } from '@/components/interaction/slider'
import { Checkbox } from '@/components/interaction/checkbox'
import { Snackbar } from '@/components/feedback/snackbar'
import { M } from '../theme/app-theme'
import type { ComponentNode } from '@/components/basic/types'

interface InteractionProps {
  showSnackbar: MutableState<boolean>
  snackbarMessage: MutableState<string>
}

function InteractionPage(props: InteractionProps, ctx: ComposerContext): ComposableNode | null {
  const sliderValue = remember(ctx, () => mutableStateOf(0.5, ctx.snapshot))
  const checked = remember(ctx, () => mutableStateOf(false, ctx.snapshot))
  const checked2 = remember(ctx, () => mutableStateOf(true, ctx.snapshot))
  const clickCount = remember(ctx, () => mutableStateOf(0, ctx.snapshot))

  const snackbarNode: ComponentNode = Snackbar(
    props.snackbarMessage.value,
    '关闭',
    { onActionClick: () => { props.showSnackbar.value = false } },
  )

  const children: ComponentNode[] = [
    M.heading('交互组件', 24),
    M.spacer(20),

    M.card([
      M.body('Slider 滑块', 16),
      M.spacer(12),
      Slider(sliderValue.value, (v) => { sliderValue.value = v }),
      M.spacer(8),
      M.caption(`当前值: ${(sliderValue.value * 100).toFixed(0)}%`),
    ]),
    M.spacer(16),

    M.card([
      M.body('Checkbox 复选框', 16),
      M.spacer(12),
      Row(M.mod(), 'center', 'center', [
        Checkbox(checked.value, (v) => { checked.value = v }),
        M.gap(8),
        M.body(`选项 A ${checked.value ? '✓' : ''}`),
      ]),
      M.spacer(8),
      Row(M.mod(), 'center', 'center', [
        Checkbox(checked2.value, (v) => { checked2.value = v }),
        M.gap(8),
        M.body(`选项 B ${checked2.value ? '✓' : ''}`),
      ]),
    ]),
    M.spacer(16),

    M.card([
      M.body('Button 按钮', 16),
      M.spacer(12),
      Row(M.mod(), 'center', 'center', [
        Button(() => { clickCount.value += 1 }, `点击 ${clickCount.value}`),
      ]),
      M.spacer(8),
      M.successButton(() => {
        props.snackbarMessage.value = 'Snackbar 触发!'
        props.showSnackbar.value = true
      }, '显示 Snackbar'),
    ]),
    M.spacer(16),

    M.caption('FAB 浮动操作按钮 (右下角)'),
  ]

  if (props.showSnackbar.value) {
    children.push(snackbarNode)
  }

  return Column(M.mod().padding(16).fillMaxSize(), 'start', 'start', children)
}

export const InteractionPageComposable = composable<InteractionProps>(InteractionPage)
