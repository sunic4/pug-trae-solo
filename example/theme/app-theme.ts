import type { Color, TextStyle } from '@/renderer/types'
import type { CompositionContext } from '@/core/composition-context'
import { defaultTextStyle } from '@/renderer/text-style'
import { DEFAULT_MODIFIER } from '@/components/shared/constants'
import { Text } from '@/components/basic/text'
import { Spacer } from '@/components/basic/spacer'
import { Surface } from '@/components/layout/surface'
import { Button } from '@/components/interaction/button'
import { FAB } from '@/components/interaction/fab'
import { CircularProgressIndicator } from '@/components/feedback/circular-progress'
import { LinearProgressIndicator } from '@/components/feedback/linear-progress'
import { Modifier } from '@/layout/modifier'
import { PrimaryColor, BackgroundColor, SurfaceColor } from '@/theme/colors'

export const AppColors = {
  primary: PrimaryColor,
  background: BackgroundColor,
  surface: SurfaceColor,
  onPrimary: { r: 255, g: 255, b: 255, a: 1 } satisfies Color,
  onBackground: { r: 33, g: 33, b: 33, a: 1 } satisfies Color,
  onSurface: { r: 33, g: 33, b: 33, a: 1 } satisfies Color,
  error: { r: 244, g: 67, b: 54, a: 1 } satisfies Color,
  success: { r: 76, g: 175, b: 80, a: 1 } satisfies Color,
  warning: { r: 255, g: 152, b: 0, a: 1 } satisfies Color,
  divider: { r: 224, g: 224, b: 224, a: 1 } satisfies Color,
  cardBg: { r: 255, g: 255, b: 255, a: 1 } satisfies Color,
  sectionBg: { r: 250, g: 250, b: 250, a: 1 } satisfies Color,
} as const

export function headingStyle(size: number = 24): TextStyle {
  return {
    ...defaultTextStyle(),
    fontSize: size,
    fontWeight: 'bold',
    color: AppColors.onBackground,
  }
}

export function bodyStyle(size: number = 14): TextStyle {
  return {
    ...defaultTextStyle(),
    fontSize: size,
    color: AppColors.onSurface,
  }
}

export function captionStyle(size: number = 12): TextStyle {
  return {
    ...defaultTextStyle(),
    fontSize: size,
    color: { r: 117, g: 117, b: 117, a: 1 },
  }
}

export const M = {
  heading(ctx: CompositionContext, text: string, size: number = 24, styleOverride?: Partial<TextStyle>): void {
    Text(ctx, text, DEFAULT_MODIFIER, styleOverride ? { ...headingStyle(size), ...styleOverride } : headingStyle(size))
  },

  body(ctx: CompositionContext, text: string, size: number = 14, styleOverride?: Partial<TextStyle>): void {
    Text(ctx, text, DEFAULT_MODIFIER, styleOverride ? { ...bodyStyle(size), ...styleOverride } : bodyStyle(size))
  },

  caption(ctx: CompositionContext, text: string, size: number = 12, styleOverride?: Partial<TextStyle>): void {
    Text(ctx, text, DEFAULT_MODIFIER, styleOverride ? { ...captionStyle(size), ...styleOverride } : captionStyle(size))
  },

  spacer(ctx: CompositionContext, height: number = 8): void {
    Spacer(ctx, 0, height)
  },

  gap(ctx: CompositionContext, width: number = 8): void {
    Spacer(ctx, width, 0)
  },

  card(ctx: CompositionContext, childrenFn?: () => void, options?: { elevation?: number; padding?: number }): void {
    const p = options?.padding ?? 16
    const e = options?.elevation ?? 2
    Surface(ctx, childrenFn, {
      modifier: Modifier.create().fillMaxWidth().padding(p).freeze(),
      color: AppColors.cardBg,
      elevation: e,
      borderRadius: 12,
      alignment: 'start',
    })
  },

  section(ctx: CompositionContext, childrenFn?: () => void): void {
    Surface(ctx, childrenFn, {
      modifier: Modifier.create().fillMaxWidth().padding(16).freeze(),
      color: AppColors.sectionBg,
      elevation: 0,
      borderRadius: 12,
      alignment: 'start',
    })
  },

  primaryButton(ctx: CompositionContext, onClick: () => void, label: string): void {
    Button(ctx, onClick, label, { backgroundColor: AppColors.primary })
  },

  successButton(ctx: CompositionContext, onClick: () => void, label: string): void {
    Button(ctx, onClick, label, { backgroundColor: AppColors.success })
  },

  warningButton(ctx: CompositionContext, onClick: () => void, label: string): void {
    Button(ctx, onClick, label, { backgroundColor: AppColors.warning })
  },

  errorButton(ctx: CompositionContext, onClick: () => void, label: string): void {
    Button(ctx, onClick, label, { backgroundColor: AppColors.error })
  },

  fab(ctx: CompositionContext, onClick: () => void, label: string = '+'): void {
    FAB(ctx, onClick, () => {
      Text(ctx, label, DEFAULT_MODIFIER, { ...defaultTextStyle(), fontSize: 20, fontWeight: 'bold', color: AppColors.onPrimary })
    }, { backgroundColor: AppColors.primary, contentColor: AppColors.onPrimary })
  },

  circularProgress(ctx: CompositionContext, progress: number, determinate: boolean = true, strokeWidth: number = 4): void {
    CircularProgressIndicator(
      ctx,
      Modifier.create().freeze(),
      progress,
      determinate,
      AppColors.primary,
      strokeWidth,
    )
  },

  linearProgress(ctx: CompositionContext, progress: number, determinate: boolean = true): void {
    LinearProgressIndicator(
      ctx,
      Modifier.create().fillMaxWidth().freeze(),
      progress,
      determinate,
      AppColors.primary,
    )
  },
}
