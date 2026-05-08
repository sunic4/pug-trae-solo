import { composable, useState } from 'pug-canvas-ui'
import type { CompositionContext, MutableState } from 'pug-canvas-ui'
import { Row, Box, Slider, Checkbox, TextField, FAB, Snackbar, Modifier } from 'pug-canvas-ui'
import { DEFAULT_MODIFIER } from 'pug-canvas-ui'
import { M, AppColors } from '../theme/app-theme'

interface InteractionProps {
  showSnackbar: MutableState<boolean>
  snackbarMessage: MutableState<string>
}

function InteractionPage(ctx: CompositionContext, props: InteractionProps): void {
  const sliderValue = useState(ctx, 0.5)
  const sliderValue2 = useState(ctx, 0.3)
  const checked = useState(ctx, false)
  const checked2 = useState(ctx, true)
  const checked3 = useState(ctx, false)
  const clickCount = useState(ctx, 0)
  const textInput = useState(ctx, '')

  M.stack(ctx, () => {
    M.title(ctx, '交互组件', 24)
    M.caption(ctx, 'Slider / Checkbox / Button / TextField / FAB / Snackbar')
    M.vSpacer(ctx, 20)

    M.card(ctx, () => {
      M.body(ctx, 'Slider 滑块')
      M.vSpacer(ctx, 14)
      Slider(ctx, sliderValue.value, (v) => { sliderValue.value = v })
      M.vSpacer(ctx, 8)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
        M.caption(ctx, '0%')
        Box(
          ctx,
          Modifier.create()
            .background(AppColors.primary, 10)
            .padding(8, 3)
            .freeze(),
          'center',
          () => {
            M.caption(ctx, `${(sliderValue.value * 100).toFixed(0)}%`, 12, { color: AppColors.onPrimary })
          },
        )
        M.caption(ctx, '100%')
      })
      M.vSpacer(ctx, 14)
      Slider(ctx, sliderValue2.value, (v) => { sliderValue2.value = v })
      M.vSpacer(ctx, 6)
      M.caption(ctx, `滑块 B: ${(sliderValue2.value * 100).toFixed(0)}%`)
    })
    M.vSpacer(ctx, 14)

    M.card(ctx, () => {
      M.body(ctx, 'Checkbox 复选框')
      M.vSpacer(ctx, 14)

      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'center', () => {
        Checkbox(ctx, checked.value, (v) => { checked.value = v })
        M.gap(ctx, 10)
        Row(ctx, Modifier.create().freeze(), 'start', 'start', () => {
          M.body(ctx, `选项 A ${checked.value ? '✓' : ''}`)
          M.caption(ctx, '默认未选中，点击切换')
        })
      })
      M.vSpacer(ctx, 10)

      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'center', () => {
        Checkbox(ctx, checked2.value, (v) => { checked2.value = v }, DEFAULT_MODIFIER, AppColors.success)
        M.gap(ctx, 10)
        Row(ctx, Modifier.create().freeze(), 'start', 'start', () => {
          M.body(ctx, `选项 B ${checked2.value ? '✓' : ''}`)
          M.caption(ctx, '绿色主题，默认选中')
        })
      })
      M.vSpacer(ctx, 10)

      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'center', () => {
        Checkbox(ctx, checked3.value, (v) => { checked3.value = v }, DEFAULT_MODIFIER, AppColors.warning)
        M.gap(ctx, 10)
        Row(ctx, Modifier.create().freeze(), 'start', 'start', () => {
          M.body(ctx, `选项 C ${checked3.value ? '✓' : ''}`)
          M.caption(ctx, '橙色主题')
        })
      })

      M.vSpacer(ctx, 10)
      const totalChecked = [checked.value, checked2.value, checked3.value].filter(Boolean).length
      M.caption(ctx, `已选: ${totalChecked} / 3`)
    })
    M.vSpacer(ctx, 14)

    M.card(ctx, () => {
      M.body(ctx, 'Button 按钮与计数器')
      M.vSpacer(ctx, 14)

      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.primaryButton(ctx, () => { clickCount.value -= 1 }, '-1')
        M.gap(ctx, 12)
        Box(
          ctx,
          Modifier.create()
            .background(AppColors.sectionBg, 8)
            .layoutSize(56, 36)
            .freeze(),
          'center',
          () => {
            M.body(ctx, `${clickCount.value}`, 18, { color: AppColors.onBackground })
          },
        )
        M.gap(ctx, 12)
        M.primaryButton(ctx, () => { clickCount.value += 1 }, '+1')
      })
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.primaryButton(ctx, () => { clickCount.value = 0 }, '重置计数')
        M.gap(ctx, 8)
        M.successButton(ctx, () => {
          props.snackbarMessage.value = `当前计数值: ${clickCount.value}`
          props.showSnackbar.value = true
        }, '发送 Snackbar')
      })
    })
    M.vSpacer(ctx, 14)

    M.card(ctx, () => {
      M.body(ctx, 'TextField 文本输入')
      M.vSpacer(ctx, 14)
      TextField(ctx, textInput.value, (v) => { textInput.value = v }, Modifier.create().fillMaxWidth().freeze(), '请输入内容...')
      M.vSpacer(ctx, 10)
      if (textInput.value.length > 0) {
        Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
          M.caption(ctx, `输入内容: "${textInput.value}"`)
          M.caption(ctx, `${textInput.value.length} 字符`)
        })
      } else {
        M.caption(ctx, '上方输入框等待输入...')
      }
      M.vSpacer(ctx, 10)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.warningButton(ctx, () => { textInput.value = '' }, '清空文本')
      })
    })
    M.vSpacer(ctx, 14)

    M.card(ctx, () => {
      M.body(ctx, 'FAB 浮动操作按钮')
      M.vSpacer(ctx, 14)
      Row(ctx, Modifier.create().freeze(), 'spaceEvenly', 'center', () => {
        FAB(ctx, () => { clickCount.value += 1 }, () => {
          M.body(ctx, '+', 18, { color: AppColors.onPrimary })
        }, { backgroundColor: AppColors.primary, size: 48 })
        M.gap(ctx, 4)
        FAB(ctx, () => {
          props.snackbarMessage.value = 'FAB 被点击!'
          props.showSnackbar.value = true
        }, () => {
          M.body(ctx, '✎', 16, { color: AppColors.onPrimary })
        }, { backgroundColor: AppColors.success, size: 48 })
        M.gap(ctx, 4)
        FAB(ctx, () => { clickCount.value = 0 }, () => {
          M.body(ctx, '↺', 16, { color: AppColors.onPrimary })
        }, { backgroundColor: AppColors.warning, size: 48 })
      })
      M.vSpacer(ctx, 10)
      M.caption(ctx, 'FAB 点击可改变计数器或触发 Snackbar')
    })
    M.vSpacer(ctx, 20)

    if (props.showSnackbar.value) {
      Snackbar(
        ctx,
        props.snackbarMessage.value,
        '关闭',
        { onActionClick: () => { props.showSnackbar.value = false } },
      )
    }
  })
}

export const InteractionPageComposable = composable<InteractionProps>(InteractionPage)
