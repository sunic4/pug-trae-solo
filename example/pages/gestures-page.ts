import { composable, useState } from 'pug-canvas-ui'
import type { CompositionContext } from 'pug-canvas-ui'
import { Column, Row, Box, Modifier } from 'pug-canvas-ui'
import { M, AppColors } from '../theme/app-theme'

function GesturesPage(ctx: CompositionContext, _props?: Record<string, never>): void {
  const tapCount = useState(ctx, 0)
  const longPressCount = useState(ctx, 0)
  const dragX = useState(ctx, 0)
  const dragY = useState(ctx, 0)
  const scaleValue = useState(ctx, 1)
  const lastGesture = useState(ctx, '暂无手势')

  M.stack(ctx, () => {
    M.title(ctx, '手势系统', 22)
    M.caption(ctx, 'Tap / LongPress / Drag / Pinch 手势演示')
    M.vSpacer(ctx, 16)

    M.card(ctx, () => {
      M.body(ctx, '点击计数器')
      M.vSpacer(ctx, 10)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
        M.caption(ctx, 'Tap 次数')
        Box(
          ctx,
          Modifier.create().background(AppColors.primary, 12).padding(12, 6).freeze(),
          'center',
          () => {
            M.body(ctx, `${tapCount.value}`, 20, { color: AppColors.onPrimary })
          },
        )
      })
      M.vSpacer(ctx, 8)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.primaryButton(ctx, () => { tapCount.value += 1 }, 'Tap +1')
        M.gap(ctx, 8)
        M.errorButton(ctx, () => { tapCount.value = 0 }, '重置')
      })
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, '拖拽测试')
      M.vSpacer(ctx, 10)
      M.caption(ctx, '使用方向键或按钮控制方块位置')
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'center', 'center', () => {
        Box(
          ctx,
          Modifier.create()
            .layoutSize(50, 50)
            .background(AppColors.success)
            .offset(dragX.value, dragY.value)
            .freeze(),
          'center',
          () => {},
        )
      })
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceEvenly', 'center', () => {
        M.primaryButton(ctx, () => { dragX.value -= 10 }, '←')
        M.warningButton(ctx, () => { dragX.value += 10 }, '→')
      })
      M.vSpacer(ctx, 8)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceEvenly', 'center', () => {
        M.primaryButton(ctx, () => { dragY.value -= 10 }, '↑')
        M.errorButton(ctx, () => { dragY.value += 10 }, '↓')
      })
      M.vSpacer(ctx, 8)
      M.caption(ctx, `位置: (${dragX.value}, ${dragY.value})`)
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, '缩放测试')
      M.vSpacer(ctx, 10)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'center', 'center', () => {
        Box(
          ctx,
          Modifier.create()
            .layoutSize(Math.floor(60 * scaleValue.value), Math.floor(60 * scaleValue.value))
            .background(AppColors.warning, 8)
            .freeze(),
          'center',
          () => {},
        )
      })
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.primaryButton(ctx, () => { scaleValue.value = Math.min(2, scaleValue.value + 0.1) }, '放大')
        M.gap(ctx, 8)
        M.errorButton(ctx, () => { scaleValue.value = Math.max(0.3, scaleValue.value - 0.1) }, '缩小')
        M.gap(ctx, 8)
        M.warningButton(ctx, () => { scaleValue.value = 1 }, '重置')
      })
      M.vSpacer(ctx, 8)
      M.caption(ctx, `缩放值: ${scaleValue.value.toFixed(1)}x`)
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, '手势历史')
      M.vSpacer(ctx, 10)
      M.caption(ctx, '最近一次手势操作')
      M.vSpacer(ctx, 8)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'center', 'center', () => {
        Box(
          ctx,
          Modifier.create().background(AppColors.sectionBg).padding(16, 8).freeze(),
          'center',
          () => {
            M.body(ctx, lastGesture.value, 14, { color: AppColors.primary })
          },
        )
      })
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().freeze(), 'spaceEvenly', 'center', () => {
        M.successButton(ctx, () => { lastGesture.value = 'Tap' }, 'Tap')
        M.warningButton(ctx, () => { lastGesture.value = 'LongPress' }, 'LongPress')
        M.errorButton(ctx, () => { lastGesture.value = 'Drag' }, 'Drag')
      })
    })
    M.vSpacer(ctx, 16)

    M.section(ctx, () => {
      M.body(ctx, '手势系统说明')
      M.vSpacer(ctx, 8)
      M.caption(ctx, 'Pug Canvas UI 手势系统支持 Tap、LongPress、Drag、Pinch 等手势识别。通过 GestureRecognizer 实现多手势仲裁。')
    })
  })
}

export const GesturesPageComposable = composable<Record<string, never>>(GesturesPage)
