import { composable } from '@/core/composable'
import { remember } from '@/core/remember'
import type { ComposerContext, ComposableNode, MutableState } from '@/core/types'
import { mutableStateOf } from '@/core/state'
import { Column } from '@/components/layout/column'
import { Row } from '@/components/layout/row'
import { Button } from '@/components/interaction/button'
import { CircularProgressIndicator } from '@/components/feedback/circular-progress'
import { LinearProgressIndicator } from '@/components/feedback/linear-progress'
import { Snackbar } from '@/components/feedback/snackbar'
import { Dialog } from '@/components/overlay/dialog'
import { M, AppColors } from '../theme/app-theme'
import type { ComponentNode } from '@/components/basic/types'

interface FeedbackProps {
  showDialog: MutableState<boolean>
  showSnackbar: MutableState<boolean>
  snackbarMsg: MutableState<string>
}

function FeedbackPage(props: FeedbackProps, ctx: ComposerContext): ComposableNode | null {
  const progress = remember(ctx, () => mutableStateOf(0.6, ctx.snapshot))
  const indeterminate = remember(ctx, () => mutableStateOf(false, ctx.snapshot))

  const dialogNode: ComponentNode = Dialog({
    title: '确认操作',
    onDismiss: () => { props.showDialog.value = false },
    content: [M.caption('这是一个 Dialog 对话框示例，用于展示覆盖层组件能力。')],
    buttons: [
      { label: '取消', onClick: () => { props.showDialog.value = false } },
      { label: '确认', onClick: () => { props.showDialog.value = false } },
    ],
  })

  const snackbarNode: ComponentNode = Snackbar(
    props.snackbarMsg.value,
    '知道了',
    { onActionClick: () => { props.showSnackbar.value = false } },
  )

  const children: ComponentNode[] = [
    M.heading('反馈与覆盖层', 24),
    M.spacer(20),

    M.card([
      M.body('Progress 进度指示器', 16),
      M.spacer(16),
      Row(M.mod(), 'center', 'center', [
        CircularProgressIndicator(M.mod(), progress.value, !indeterminate.value, AppColors.primary, 4),
        M.gap(24),
        Column(M.mod(), 'start', 'start', [
          M.caption(`进度: ${(progress.value * 100).toFixed(0)}%`),
          LinearProgressIndicator(M.mod().fillMaxWidth(), progress.value, !indeterminate.value, AppColors.primary),
        ]),
      ]),
      M.spacer(12),
      Row(M.mod(), 'center', 'center', [
        Button(() => { progress.value = Math.max(0, progress.value - 0.1) }, '-10%'),
        M.gap(8),
        Button(() => { progress.value = Math.min(1, progress.value + 0.1) }, '+10%'),
        M.gap(8),
        M.warningButton(() => { indeterminate.value = !indeterminate.value }, indeterminate.value ? '确定' : '不确定'),
      ]),
    ]),
    M.spacer(16),

    M.card([
      M.body('Dialog 对话框', 16),
      M.spacer(12),
      M.primaryButton(() => { props.showDialog.value = true }, '打开 Dialog'),
    ]),
    M.spacer(16),

    M.card([
      M.body('Snackbar 轻提示', 16),
      M.spacer(12),
      M.successButton(() => {
        props.snackbarMsg.value = '操作成功完成!'
        props.showSnackbar.value = true
      }, '显示 Snackbar'),
    ]),
  ]

  if (props.showDialog.value) {
    children.push(dialogNode)
  }
  if (props.showSnackbar.value) {
    children.push(snackbarNode)
  }

  return Column(M.mod().padding(16).fillMaxSize(), 'start', 'start', children)
}

export const FeedbackPageComposable = composable<FeedbackProps>(FeedbackPage)
