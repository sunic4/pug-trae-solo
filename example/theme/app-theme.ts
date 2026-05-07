import type { Color, TextStyle } from '@/renderer/types'
import { defaultTextStyle } from '@/renderer/text-style'
import { DEFAULT_MODIFIER } from '@/components/shared/constants'
import type { ComponentNode } from '@/components/basic/types'
import { Text } from '@/components/basic/text'
import { Spacer } from '@/components/basic/spacer'
import { Surface } from '@/components/layout/surface'
import { Button } from '@/components/interaction/button'
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
  mod: Modifier.create,

  heading(text: string, size: number = 24, styleOverride?: Partial<TextStyle>): ComponentNode {
    return Text(text, DEFAULT_MODIFIER, styleOverride ? { ...headingStyle(size), ...styleOverride } : headingStyle(size))
  },

  body(text: string, size: number = 14, styleOverride?: Partial<TextStyle>): ComponentNode {
    return Text(text, DEFAULT_MODIFIER, styleOverride ? { ...bodyStyle(size), ...styleOverride } : bodyStyle(size))
  },

  caption(text: string, size: number = 12, styleOverride?: Partial<TextStyle>): ComponentNode {
    return Text(text, DEFAULT_MODIFIER, styleOverride ? { ...captionStyle(size), ...styleOverride } : captionStyle(size))
  },

  spacer(height: number = 8): ComponentNode {
    return Spacer(0, height)
  },

  gap(width: number = 8): ComponentNode {
    return Spacer(width, 0)
  },

  card(children: ComponentNode[], options?: { elevation?: number; padding?: number }): ComponentNode {
    const p = options?.padding ?? 16
    const e = options?.elevation ?? 2
    return Surface(children, {
      modifier: Modifier.create().fillMaxWidth().padding(p).freeze(),
      color: AppColors.cardBg,
      elevation: e,
      borderRadius: 12,
      alignment: 'start',
    })
  },

  section(children: ComponentNode[]): ComponentNode {
    return Surface(children, {
      modifier: Modifier.create().fillMaxWidth().padding(16).freeze(),
      color: AppColors.sectionBg,
      elevation: 0,
      borderRadius: 12,
      alignment: 'start',
    })
  },

  primaryButton(onClick: () => void, label: string): ComponentNode {
    return Button(onClick, label, { backgroundColor: AppColors.primary })
  },

  successButton(onClick: () => void, label: string): ComponentNode {
    return Button(onClick, label, { backgroundColor: AppColors.success })
  },

  warningButton(onClick: () => void, label: string): ComponentNode {
    return Button(onClick, label, { backgroundColor: AppColors.warning })
  },
}
