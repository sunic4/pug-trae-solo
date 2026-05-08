import { composable, useState } from 'pug-canvas-ui'
import type { CompositionContext } from 'pug-canvas-ui'
import { Column, Row, Box, Modifier } from 'pug-canvas-ui'
import { M, AppColors } from '../theme/app-theme'

function ThemePage(ctx: CompositionContext, _props?: Record<string, never>): void {
  const currentTheme = useState(ctx, 'light')
  const primaryHue = useState(ctx, 210)
  const fontSize = useState(ctx, 14)

  const themes = [
    { name: 'light', label: '浅色', bg: { r: 255, g: 255, b: 255, a: 1 }, text: { r: 33, g: 33, b: 33, a: 1 } },
    { name: 'dark', label: '深色', bg: { r: 33, g: 33, b: 33, a: 1 }, text: { r: 255, g: 255, b: 255, a: 1 } },
    { name: 'sepia', label: '护眼', bg: { r: 245, g: 240, b: 230, a: 1 }, text: { r: 100, g: 80, b: 60, a: 1 } },
  ] as const

  const dynamicPrimary = { r: primaryHue.value, g: 121, b: 234, a: 1 }

  M.stack(ctx, () => {
    M.title(ctx, '主题系统', 22)
    M.caption(ctx, '动态主题切换 · 自定义配色')
    M.vSpacer(ctx, 16)

    M.card(ctx, () => {
      M.body(ctx, '主题预设')
      M.vSpacer(ctx, 10)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceEvenly', 'center', () => {
        for (let i = 0; i < themes.length; i++) {
          const theme = themes[i]!
          Box(
            ctx,
            Modifier.create()
              .layoutSize(80, 60)
              .background(theme.bg, 8)
              .shadow(currentTheme.value === theme.name ? 4 : 1)
              .freeze(),
            'center',
            () => {
              Box(
                ctx,
                Modifier.create().layoutSize(40, 8).background(theme.text, 4).freeze(),
                'center',
              )
            },
          )
          if (i < themes.length - 1) {
            M.gap(ctx, 8)
          }
        }
      })
      M.vSpacer(ctx, 8)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceEvenly', 'center', () => {
        for (let i = 0; i < themes.length; i++) {
          const theme = themes[i]!
          const isSelected = currentTheme.value === theme.name
          M.chip(
            ctx,
            theme.label,
            isSelected ? AppColors.primary : AppColors.caption,
            AppColors.onPrimary,
          )
          if (i < themes.length - 1) {
            M.gap(ctx, 8)
          }
        }
      })
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, '动态主色调')
      M.vSpacer(ctx, 10)
      M.caption(ctx, '拖动滑块调整色相')
      M.vSpacer(ctx, 8)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'center', () => {
        Box(
          ctx,
          Modifier.create()
            .layoutSize(50, 50)
            .background(dynamicPrimary, 8)
            .freeze(),
          'center',
        )
        M.gap(ctx, 12)
        Column(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'start', () => {
          M.caption(ctx, `Hue: ${primaryHue.value}°`)
          M.vSpacer(ctx, 4)
          Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'center', () => {
            for (let h = 0; h <= 300; h += 60) {
              Box(
                ctx,
                Modifier.create()
                  .layoutSize(20, 20)
                  .background({ r: h, g: 121, b: 234, a: 1 })
                  .freeze(),
                'center',
              )
            }
          })
          M.vSpacer(ctx, 4)
          M.caption(ctx, '0°        60°        120°        180°        240°        300°')
        })
      })
      M.vSpacer(ctx, 8)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.primaryButton(ctx, () => { primaryHue.value = Math.max(0, primaryHue.value - 30) }, '◀')
        M.gap(ctx, 8)
        M.primaryButton(ctx, () => { primaryHue.value = 210 }, '重置')
        M.gap(ctx, 8)
        M.primaryButton(ctx, () => { primaryHue.value = Math.min(360, primaryHue.value + 30) }, '▶')
      })
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, '字号调整')
      M.vSpacer(ctx, 10)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
        M.caption(ctx, 'Aa')
        M.body(ctx, '当前字号')
        Box(
          ctx,
          Modifier.create().background(AppColors.primary, 12).padding(12, 4).freeze(),
          'center',
          () => {
            M.body(ctx, `${fontSize.value}px`, 14, { color: AppColors.onPrimary })
          },
        )
        M.caption(ctx, 'Aa', 24)
      })
      M.vSpacer(ctx, 8)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.warningButton(ctx, () => { fontSize.value = Math.max(10, fontSize.value - 2) }, 'A-')
        M.gap(ctx, 8)
        M.errorButton(ctx, () => { fontSize.value = 14 }, '默认')
        M.gap(ctx, 8)
        M.successButton(ctx, () => { fontSize.value = Math.min(24, fontSize.value + 2) }, 'A+')
      })
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, '配色预览')
      M.vSpacer(ctx, 10)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceEvenly', 'center', () => {
        M.coloredBox(ctx, AppColors.primary, { width: 50, height: 50 }, 'center')
        M.coloredBox(ctx, AppColors.success, { width: 50, height: 50 }, 'center')
        M.coloredBox(ctx, AppColors.warning, { width: 50, height: 50 }, 'center')
        M.coloredBox(ctx, AppColors.error, { width: 50, height: 50 }, 'center')
      })
      M.vSpacer(ctx, 8)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceEvenly', 'center', () => {
        M.caption(ctx, 'Primary')
        M.caption(ctx, 'Success')
        M.caption(ctx, 'Warning')
        M.caption(ctx, 'Error')
      })
    })
    M.vSpacer(ctx, 16)

    M.section(ctx, () => {
      M.body(ctx, '主题系统说明')
      M.vSpacer(ctx, 8)
      M.caption(ctx, 'Pug Canvas UI 主题系统支持动态配色方案，可通过修改 AppColors 对象实现主题切换。')
    })
  })
}

export const ThemePageComposable = composable<Record<string, never>>(ThemePage)
