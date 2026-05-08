import { composable, useState } from 'pug-canvas-ui'
import type { CompositionContext, MutableState } from 'pug-canvas-ui'
import { Column, Row, Box, CircularProgressIndicator, LinearProgressIndicator, Snackbar, Dialog, Modifier } from 'pug-canvas-ui'
import { DEFAULT_MODIFIER } from 'pug-canvas-ui'
import { M, AppColors } from '../theme/app-theme'

interface FeedbackProps {
  showDialog: MutableState<boolean>
  showSnackbar: MutableState<boolean>
  snackbarMsg: MutableState<string>
}

interface ProgressItem {
  label: string
  color: { r: number; g: number; b: number; a: number }
  value: number
}

function FeedbackPage(ctx: CompositionContext, props: FeedbackProps): void {
  const progress = useState(ctx, 0.6)
  const indeterminate = useState(ctx, false)

  const progressItems: readonly ProgressItem[] = [
    { label: 'Primary', color: AppColors.primary, value: 0.75 },
    { label: 'Success', color: AppColors.success, value: 0.5 },
    { label: 'Warning', color: AppColors.warning, value: 0.35 },
    { label: 'Error', color: AppColors.error, value: 0.9 },
  ]

  M.stack(ctx, () => {
    M.title(ctx, '反馈与覆盖层', 24)
    M.caption(ctx, 'Progress / Dialog / Snackbar 组件展示')
    M.vSpacer(ctx, 20)

    M.card(ctx, () => {
      M.body(ctx, 'CircularProgressIndicator 圆形进度')
      M.vSpacer(ctx, 16)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        CircularProgressIndicator(ctx, DEFAULT_MODIFIER, progress.value, !indeterminate.value, AppColors.primary, 4)
        M.gap(ctx, 20)
        Row(ctx, Modifier.create().freeze(), 'spaceBetween', 'start', () => {
          M.caption(ctx, '确定进度')
          M.coloredBox(ctx, AppColors.primary, { width: 60, height: 24 }, 'center', () => {
            M.caption(ctx, `${(progress.value * 100).toFixed(0)}%`, 12, { color: AppColors.onPrimary })
          })
        })
      })
      M.vSpacer(ctx, 14)

      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.primaryButton(ctx, () => { progress.value = Math.max(0, progress.value - 0.1) }, '-10%')
        M.gap(ctx, 8)
        M.primaryButton(ctx, () => { progress.value = Math.min(1, progress.value + 0.1) }, '+10%')
        M.gap(ctx, 8)
        M.warningButton(ctx, () => { progress.value = 0 }, '0%')
        M.gap(ctx, 8)
        M.warningButton(ctx, () => { progress.value = 1 }, '100%')
      })
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.warningButton(ctx, () => { indeterminate.value = !indeterminate.value }, indeterminate.value ? '切换为确定模式' : '切换为不确定模式')
      })

      if (indeterminate.value) {
        M.vSpacer(ctx, 14)
        Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
          CircularProgressIndicator(ctx, DEFAULT_MODIFIER, 0, false, AppColors.primary, 4)
          M.gap(ctx, 16)
          Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
            M.caption(ctx, '不确定模式 (Indeterminate)')
            LinearProgressIndicator(ctx, Modifier.create().fillMaxWidth().freeze(), 0, false, AppColors.primary)
          })
        })
      }
    })
    M.vSpacer(ctx, 14)

    M.card(ctx, () => {
      M.body(ctx, '多色进度指示器')
      M.vSpacer(ctx, 14)
      Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
        for (let i = 0; i < progressItems.length; i++) {
          const item = progressItems[i]!
          Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
            Row(ctx, Modifier.create().freeze(), 'start', 'center', () => {
              CircularProgressIndicator(ctx, DEFAULT_MODIFIER, item.value, true, item.color, 3)
              M.gap(ctx, 8)
              M.body(ctx, item.label)
            })
            M.caption(ctx, `${(item.value * 100).toFixed(0)}%`)
          })
          M.vSpacer(ctx, 4)
          LinearProgressIndicator(ctx, Modifier.create().fillMaxWidth().freeze(), item.value, true, item.color)
          if (i < progressItems.length - 1) {
            M.vSpacer(ctx, 10)
          }
        }
      })
    })
    M.vSpacer(ctx, 14)

    M.card(ctx, () => {
      M.body(ctx, 'Dialog 对话框')
      M.vSpacer(ctx, 14)
      M.caption(ctx, '模态覆盖层，用于确认操作或展示重要信息。点击下方按钮打开示例 Dialog。')
      M.vSpacer(ctx, 14)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.primaryButton(ctx, () => { props.showDialog.value = true }, '打开 Dialog')
        M.gap(ctx, 8)
        M.errorButton(ctx, () => {
          props.showDialog.value = true
          props.snackbarMsg.value = '危险操作已触发!'
          props.showSnackbar.value = true
        }, '危险操作')
      })
    })
    M.vSpacer(ctx, 14)

    M.card(ctx, () => {
      M.body(ctx, 'Snackbar 轻提示')
      M.vSpacer(ctx, 14)
      M.caption(ctx, '非模态反馈，自动出现在屏幕底部，可设置操作按钮。')
      M.vSpacer(ctx, 14)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.successButton(ctx, () => {
          props.snackbarMsg.value = '操作成功完成!'
          props.showSnackbar.value = true
        }, '成功提示')
        M.gap(ctx, 8)
        M.warningButton(ctx, () => {
          props.snackbarMsg.value = '请注意: 此操作不可撤销'
          props.showSnackbar.value = true
        }, '警告提示')
        M.gap(ctx, 8)
        M.errorButton(ctx, () => {
          props.snackbarMsg.value = '发生错误，请稍后重试'
          props.showSnackbar.value = true
        }, '错误提示')
      })
    })

    if (props.showDialog.value) {
      Dialog(ctx, {
        title: '确认操作',
        onDismiss: () => { props.showDialog.value = false },
        content: () => {
          M.body(ctx, '这是一个 Dialog 对话框示例。')
          M.vSpacer(ctx, 8)
          M.caption(ctx, '用于展示覆盖层组件能力，支持标题、内容区域和自定义按钮组。')
        },
        buttons: [
          { label: '取消', onClick: () => { props.showDialog.value = false } },
          { label: '确认', onClick: () => {
            props.showDialog.value = false
            props.snackbarMsg.value = '对话框已确认!'
            props.showSnackbar.value = true
          }},
        ],
      })
    }

    if (props.showSnackbar.value) {
      Snackbar(
        ctx,
        props.snackbarMsg.value,
        '知道了',
        { onActionClick: () => { props.showSnackbar.value = false } },
      )
    }
  })
}

export const FeedbackPageComposable = composable<FeedbackProps>(FeedbackPage)
