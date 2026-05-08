import { composable, useState } from 'pug-canvas-ui'
import type { CompositionContext } from 'pug-canvas-ui'
import { Column, Row, Box, Modifier } from 'pug-canvas-ui'
import { M, AppColors } from '../theme/app-theme'

interface AnimationPageProps {
  readonly onShowSnackbar?: (message: string) => void
}

function AnimationPage(ctx: CompositionContext, _props?: AnimationPageProps): void {
  const animValue = useState(ctx, 0)
  const scaleValue = useState(ctx, 1)
  const opacityValue = useState(ctx, 1)

  M.stack(ctx, () => {
    M.title(ctx, '动画系统')
    M.caption(ctx, '属性驱动的动画效果展示')
    M.vSpacer(ctx, 16)

    M.card(ctx, () => {
      M.body(ctx, '进度条动画')
      M.vSpacer(ctx, 12)
      Box(
        ctx,
        Modifier.create()
          .fillMaxWidth()
          .setHeight(40)
          .background(AppColors.primary, 12)
          .freeze(),
        'center',
        () => {
          Box(
            ctx,
            Modifier.create()
              .layoutSize(Math.floor(animValue.value * 280), 24)
              .background(AppColors.primary, 6)
              .freeze(),
            'start',
            () => {},
          )
        },
      )
      M.vSpacer(ctx, 8)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
        M.caption(ctx, `${(animValue.value * 100).toFixed(0)}%`)
        Box(
          ctx,
          Modifier.create()
            .background(AppColors.sectionBg)
            .padding(8, 4)
            .freeze(),
          'center',
          () => {
            M.label(ctx, '进度动画')
          },
        )
      })
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.primaryButton(ctx, () => { animValue.value = Math.max(0, animValue.value - 0.1) }, '-10%')
        M.gap(ctx, 8)
        M.warningButton(ctx, () => { animValue.value = Math.min(1, animValue.value + 0.1) }, '+10%')
        M.gap(ctx, 8)
        M.errorButton(ctx, () => { animValue.value = 0 }, '重置')
      })
    })

    M.vSpacer(ctx, 16)

    M.card(ctx, () => {
      M.body(ctx, '缩放动画')
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'center', 'center', () => {
        Box(
          ctx,
          Modifier.create()
            .layoutSize(80, 80)
            .background(AppColors.success, 8)
            .freeze(),
          'center',
          () => {
            Box(
              ctx,
              Modifier.create()
                .layoutSize(Math.floor(scaleValue.value * 40), Math.floor(scaleValue.value * 40))
                .background(AppColors.onPrimary, 4)
                .freeze(),
              'center',
              () => {},
            )
          },
        )
        M.gap(ctx, 24)
        Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
          M.primaryButton(ctx, () => { scaleValue.value = Math.min(1, scaleValue.value + 0.1) }, '+')
          M.gap(ctx, 8)
          M.errorButton(ctx, () => { scaleValue.value = Math.max(0.1, scaleValue.value - 0.1) }, '-')
        })
        M.vSpacer(ctx, 8)
        M.caption(ctx, `缩放值: ${scaleValue.value.toFixed(1)}`)
      })
    })

    M.vSpacer(ctx, 16)

    M.card(ctx, () => {
      M.body(ctx, '透明度动画')
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'center', 'center', () => {
        Box(
          ctx,
          Modifier.create()
            .layoutSize(80, 80)
            .background(AppColors.primary, 8)
            .freeze(),
          'center',
          () => {
            Box(
              ctx,
              Modifier.create()
                .layoutSize(60, 60)
                .background(AppColors.onPrimary, 6)
                .freeze(),
              'center',
              () => {},
            )
          },
        )
        M.gap(ctx, 24)
        Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
          M.primaryButton(ctx, () => { opacityValue.value = 1 }, '不透明')
          M.vSpacer(ctx, 8)
          M.warningButton(ctx, () => { opacityValue.value = 0.5 }, '半透明')
          M.vSpacer(ctx, 8)
          M.errorButton(ctx, () => { opacityValue.value = 0.2 }, '透明')
        })
      })
      M.vSpacer(ctx, 8)
      M.caption(ctx, `透明度: ${(opacityValue.value * 100).toFixed(0)}%`)
    })

    M.vSpacer(ctx, 16)

    M.card(ctx, () => {
      M.body(ctx, '颜色渐变')
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
        M.coloredBox(ctx, AppColors.primary, { width: 60, height: 60 }, 'center')
        M.coloredBox(ctx, AppColors.success, { width: 60, height: 60 }, 'center')
        M.coloredBox(ctx, AppColors.warning, { width: 60, height: 60 }, 'center')
        M.coloredBox(ctx, AppColors.error, { width: 60, height: 60 }, 'center')
      })
      M.vSpacer(ctx, 8)
      M.caption(ctx, '多种主题色展示')
    })

    M.vSpacer(ctx, 16)

    M.card(ctx, () => {
      M.body(ctx, '阴影层级')
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'center', 'center', () => {
        Column(ctx, Modifier.create().freeze(), 'center', 'center', () => {
          M.coloredBox(ctx, AppColors.primary, { width: 50, height: 50 }, 'center')
          M.caption(ctx, 'e=0')
        })
        M.gap(ctx, 16)
        Column(ctx, Modifier.create().freeze(), 'center', 'center', () => {
          Box(
            ctx,
            Modifier.create()
              .layoutSize(50, 50)
              .background(AppColors.primary)
              .shadow(2)
              .freeze(),
            'center',
            () => {},
          )
          M.caption(ctx, 'e=2')
        })
        M.gap(ctx, 16)
        Column(ctx, Modifier.create().freeze(), 'center', 'center', () => {
          Box(
            ctx,
            Modifier.create()
              .layoutSize(50, 50)
              .background(AppColors.primary)
              .shadow(4)
              .freeze(),
            'center',
            () => {},
          )
          M.caption(ctx, 'e=4')
        })
        M.gap(ctx, 16)
        Column(ctx, Modifier.create().freeze(), 'center', 'center', () => {
          Box(
            ctx,
            Modifier.create()
              .layoutSize(50, 50)
              .background(AppColors.primary)
              .shadow(8)
              .freeze(),
            'center',
            () => {},
          )
          M.caption(ctx, 'e=8')
        })
      })
    })

    M.vSpacer(ctx, 16)

    M.section(ctx, () => {
      M.body(ctx, '动画说明')
      M.vSpacer(ctx, 8)
      M.caption(ctx, 'Pug Canvas UI 使用属性驱动的动画系统，支持 Tween、Spring 等动画曲线。所有动画通过状态值驱动，实现流畅的 UI 过渡效果。')
    })
  })
}

export const AnimationPageComposable = composable<AnimationPageProps>(AnimationPage)
