import { composable } from '@/core/composable'
import { remember } from '@/core/remember'
import type { CompositionContext } from '@/core/composition-context'
import type { MutableState } from '@/core/types'
import { mutableStateOf } from '@/core/state'
import { Column } from '@/components/layout/column'
import { Row } from '@/components/layout/row'
import { Box } from '@/components/basic/box'
import { Button } from '@/components/interaction/button'
import { CircularProgressIndicator } from '@/components/feedback/circular-progress'
import { LinearProgressIndicator } from '@/components/feedback/linear-progress'
import { Snackbar } from '@/components/feedback/snackbar'
import { Dialog } from '@/components/overlay/dialog'
import { Modifier, DEFAULT_MODIFIER } from '@/layout/modifier'
import { M, AppColors } from '../theme/app-theme'

interface FeedbackProps {
  showDialog: MutableState<boolean>
  showSnackbar: MutableState<boolean>
  snackbarMsg: MutableState<string>
}

function FeedbackPage(ctx: CompositionContext, props: FeedbackProps): void {
  const progress = remember(ctx, () => mutableStateOf(0.6, ctx.snapshot))
  const indeterminate = remember(ctx, () => mutableStateOf(false, ctx.snapshot))

  Column(
    ctx,
    Modifier.create().padding(16).fillMaxSize().freeze(),
    'start',
    'start',
    () => {
      M.heading(ctx, '反馈与覆盖层', 24)
      M.body(ctx, 'Progress / Dialog / Snackbar 组件展示', 13)
      M.spacer(ctx, 20)

      M.card(ctx, () => {
        M.body(ctx, 'CircularProgressIndicator 圆形进度', 16)
        M.spacer(ctx, 16)
        Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
          CircularProgressIndicator(
            ctx,
            DEFAULT_MODIFIER,
            progress.value,
            !indeterminate.value,
            AppColors.primary,
            4,
          )
          M.gap(ctx, 20)
          Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
            Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
              M.caption(ctx, '确定进度')
              Box(
                ctx,
                Modifier.create()
                  .background(AppColors.primary, 10)
                  .padding(8, 2)
                  .freeze(),
                'center',
                () => {
                  M.caption(ctx, `${(progress.value * 100).toFixed(0)}%`, 12, { color: AppColors.onPrimary })
                },
              )
            })
            M.spacer(ctx, 10)
            LinearProgressIndicator(
              ctx,
              Modifier.create().fillMaxWidth().freeze(),
              progress.value,
              !indeterminate.value,
              AppColors.primary,
            )
          })
        })
        M.spacer(ctx, 14)

        Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
          Button(ctx, () => { progress.value = Math.max(0, progress.value - 0.1) }, '-10%')
          M.gap(ctx, 8)
          Button(ctx, () => { progress.value = Math.min(1, progress.value + 0.1) }, '+10%')
          M.gap(ctx, 8)
          Button(ctx, () => { progress.value = 0 }, '0%')
          M.gap(ctx, 8)
          Button(ctx, () => { progress.value = 1 }, '100%')
        })
        M.spacer(ctx, 12)
        Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
          M.warningButton(ctx, () => { indeterminate.value = !indeterminate.value }, indeterminate.value ? '切换为确定模式' : '切换为不确定模式')
        })

        if (indeterminate.value) {
          M.spacer(ctx, 14)
          Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
            CircularProgressIndicator(ctx, DEFAULT_MODIFIER, 0, false, AppColors.primary, 4)
            M.gap(ctx, 16)
            Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
              M.caption(ctx, '不确定模式 (Indeterminate)')
              LinearProgressIndicator(ctx, Modifier.create().fillMaxWidth().freeze(), 0, false, AppColors.primary)
            })
          })
        }
      }, { elevation: 2, padding: 16 })
      M.spacer(ctx, 14)

      M.card(ctx, () => {
        M.body(ctx, '多色进度指示器', 16)
        M.spacer(ctx, 14)
        Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
          const progressItems = [
            { label: 'Primary', color: AppColors.primary, value: 0.75 },
            { label: 'Success', color: AppColors.success, value: 0.5 },
            { label: 'Warning', color: AppColors.warning, value: 0.35 },
            { label: 'Error', color: AppColors.error, value: 0.9 },
          ]
          for (const item of progressItems) {
            Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
              Row(ctx, Modifier.create().freeze(), 'start', 'center', () => {
                CircularProgressIndicator(ctx, DEFAULT_MODIFIER, item.value, true, item.color, 3)
                M.gap(ctx, 8)
                M.body(ctx, item.label, 13)
              })
              M.caption(ctx, `${(item.value * 100).toFixed(0)}%`)
            })
            M.spacer(ctx, 4)
            LinearProgressIndicator(ctx, Modifier.create().fillMaxWidth().freeze(), item.value, true, item.color)
            if (item !== progressItems[progressItems.length - 1]) {
              M.spacer(ctx, 10)
            }
          }
        })
      }, { elevation: 2, padding: 16 })
      M.spacer(ctx, 14)

      M.card(ctx, () => {
        M.body(ctx, 'Dialog 对话框', 16)
        M.spacer(ctx, 14)
        M.body(ctx, '模态覆盖层，用于确认操作或展示重要信息。点击下方按钮打开示例 Dialog。', 13)
        M.spacer(ctx, 14)
        Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
          M.primaryButton(ctx, () => { props.showDialog.value = true }, '打开 Dialog')
          M.gap(ctx, 8)
          M.errorButton(ctx, () => {
            props.showDialog.value = true
            props.snackbarMsg.value = '危险操作已触发!'
            props.showSnackbar.value = true
          }, '危险操作')
        })
      }, { elevation: 2, padding: 16 })
      M.spacer(ctx, 14)

      M.card(ctx, () => {
        M.body(ctx, 'Snackbar 轻提示', 16)
        M.spacer(ctx, 14)
        M.body(ctx, '非模态反馈，自动出现在屏幕底部，可设置操作按钮。', 13)
        M.spacer(ctx, 14)
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
      }, { elevation: 2, padding: 16 })

      if (props.showDialog.value) {
        Dialog(ctx, {
          title: '确认操作',
          onDismiss: () => { props.showDialog.value = false },
          content: () => {
            M.body(ctx, '这是一个 Dialog 对话框示例。', 14)
            M.spacer(ctx, 8)
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
    }
  )
}

export const FeedbackPageComposable = composable<FeedbackProps>(FeedbackPage)
