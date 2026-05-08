import { Column, Row, Box, Surface, Spacer, Modifier, Text, Button, defaultTextStyle, DEFAULT_MODIFIER } from 'pug-canvas-ui'
import type { Color, TextStyle, CompositionContext } from 'pug-canvas-ui'
import { AppColors } from './tabs'

export { AppColors }

type TextVariant = 'heading' | 'title' | 'body' | 'caption' | 'label'
type FontWeight = 'normal' | 'bold'

interface TextConfig {
  size: number
  color: Color
  weight: FontWeight
}

const TEXT_CONFIGS: Record<TextVariant, TextConfig> = {
  heading: { size: 24, color: AppColors.onBackground, weight: 'bold' },
  title: { size: 18, color: AppColors.onBackground, weight: 'bold' },
  body: { size: 14, color: AppColors.onSurface, weight: 'normal' },
  caption: { size: 12, color: AppColors.caption, weight: 'normal' },
  label: { size: 12, color: AppColors.caption, weight: 'bold' },
}

const BUTTON_COLORS: Record<string, Color> = {
  primary: AppColors.primary,
  success: AppColors.success,
  warning: AppColors.warning,
  error: AppColors.error,
}

function makeTextStyle(size: number, color: Color, weight: FontWeight = 'normal'): TextStyle {
  return { ...defaultTextStyle(), fontSize: size, fontWeight: weight, color }
}

function createText(
  ctx: CompositionContext,
  text: string,
  size: number,
  color: Color,
  weight: FontWeight,
): void {
  Text(ctx, text, DEFAULT_MODIFIER, makeTextStyle(size, color, weight))
}

function createButton(
  ctx: CompositionContext,
  onClick: () => void,
  labelText: string,
  bgColor: Color,
): void {
  Button(ctx, onClick, labelText, { backgroundColor: bgColor })
}

function createColoredBox(
  ctx: CompositionContext,
  color: Color,
  width: number,
  height: number,
  alignment: 'start' | 'center' | 'end' = 'center',
  contentFn?: () => void,
): void {
  Box(ctx, Modifier.create().background(color).layoutSize(width, height).freeze(), alignment, contentFn)
}

function createChip(
  ctx: CompositionContext,
  text: string,
  bgColor: Color,
  textColor: Color = AppColors.onPrimary,
): void {
  Box(
    ctx,
    Modifier.create().background(bgColor, 12).padding(12, 6).freeze(),
    'center',
    () => { Text(ctx, text, DEFAULT_MODIFIER, makeTextStyle(11, textColor)) },
  )
}

function createProgressBar(
  ctx: CompositionContext,
  value: number,
  barColor: Color = AppColors.primary,
  trackColor: Color = AppColors.divider,
  barHeight = 8,
): void {
  Box(
    ctx,
    Modifier.create().fillMaxWidth().setHeight(barHeight).background(trackColor, barHeight / 2).freeze(),
    'start',
    () => {
      Box(
        ctx,
        Modifier.create()
          .layoutSize(Math.floor(280 * Math.min(1, Math.max(0, value))), barHeight)
          .background(barColor, barHeight / 2)
          .freeze(),
        'start',
      )
    },
  )
}

function createAvatar(
  ctx: CompositionContext,
  text: string,
  bgColor: Color = AppColors.primary,
  size = 40,
): void {
  Surface(ctx, () => {
    Text(ctx, text, DEFAULT_MODIFIER, { ...defaultTextStyle(), fontSize: size * 0.4, color: AppColors.onPrimary })
  }, {
    modifier: Modifier.create().layoutSize(size, size).freeze(),
    color: bgColor,
    elevation: 0,
    borderRadius: size / 2,
    alignment: 'center',
  })
}

function createListTile(
  ctx: CompositionContext,
  title: string,
  subtitle: string | undefined,
  leading: (() => void) | undefined,
  trailing: (() => void) | undefined,
): void {
  Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'center', () => {
    if (leading) {
      leading()
      Spacer(ctx, 16, 0)
    }
    Column(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'start', () => {
      Text(ctx, title, DEFAULT_MODIFIER, makeTextStyle(14, AppColors.onSurface))
      if (subtitle) {
        Text(ctx, subtitle, DEFAULT_MODIFIER, makeTextStyle(12, AppColors.caption))
      }
    })
    if (trailing) {
      Box(ctx, Modifier.create().freeze(), 'center', trailing)
    }
  })
}

interface CardOptions {
  elevation?: number
  padding?: number
  color?: Color
  borderRadius?: number
}

interface SectionOptions {
  padding?: number
}

const M = {
  text(
    ctx: CompositionContext,
    text: string,
    variant: TextVariant = 'body',
    size?: number,
    override?: Partial<TextStyle>,
  ): void {
    const config = TEXT_CONFIGS[variant]
    Text(ctx, text, DEFAULT_MODIFIER, { ...makeTextStyle(size ?? config.size, config.color, config.weight), ...override })
  },

  heading(ctx: CompositionContext, text: string, size = 24, override?: Partial<TextStyle>): void {
    M.text(ctx, text, 'heading', size, override)
  },
  title(ctx: CompositionContext, text: string, size = 18, override?: Partial<TextStyle>): void {
    M.text(ctx, text, 'title', size, override)
  },
  body(ctx: CompositionContext, text: string, size = 14, override?: Partial<TextStyle>): void {
    M.text(ctx, text, 'body', size, override)
  },
  caption(ctx: CompositionContext, text: string, size = 12, override?: Partial<TextStyle>): void {
    M.text(ctx, text, 'caption', size, override)
  },
  label(ctx: CompositionContext, text: string, size = 12, override?: Partial<TextStyle>): void {
    M.text(ctx, text, 'label', size, override)
  },

  spacer(ctx: CompositionContext, width = 0, height = 8): void {
    Spacer(ctx, width, height)
  },
  vSpacer(ctx: CompositionContext, height = 8): void {
    Spacer(ctx, 0, height)
  },
  hSpacer(ctx: CompositionContext, width = 8): void {
    Spacer(ctx, width, 0)
  },
  gap(ctx: CompositionContext, size = 8): void {
    Spacer(ctx, size, 0)
  },

  card(ctx: CompositionContext, childrenFn: (() => void) | undefined, opts: CardOptions = {}): void {
    const { elevation = 2, padding = 16, color = AppColors.cardBg, borderRadius = 12 } = opts
    Surface(ctx, childrenFn, {
      modifier: Modifier.create().fillMaxWidth().padding(padding).freeze(),
      color, elevation, borderRadius, alignment: 'start',
    })
  },
  section(ctx: CompositionContext, childrenFn: (() => void) | undefined, opts: SectionOptions = {}): void {
    const { padding = 16 } = opts
    Surface(ctx, childrenFn, {
      modifier: Modifier.create().fillMaxWidth().padding(padding).freeze(),
      color: AppColors.sectionBg, elevation: 0, borderRadius: 12, alignment: 'start',
    })
  },
  stack(ctx: CompositionContext, childrenFn: () => void): void {
    Column(ctx, Modifier.create().padding(16).fillMaxSize().freeze(), 'start', 'start', childrenFn)
  },

  coloredBox(
    ctx: CompositionContext,
    color: Color,
    size: { width: number; height: number },
    alignment: 'start' | 'center' | 'end' = 'center',
    contentFn?: () => void,
  ): void {
    createColoredBox(ctx, color, size.width, size.height, alignment, contentFn)
  },

  badge(ctx: CompositionContext, text: string, bgColor: Color, textColor = AppColors.onPrimary): void {
    Box(
      ctx,
      Modifier.create().background(bgColor, 10).padding(8, 2).freeze(),
      'center',
      () => { Text(ctx, text, DEFAULT_MODIFIER, makeTextStyle(10, textColor)) },
    )
  },
  chip(ctx: CompositionContext, text: string, bgColor: Color, textColor = AppColors.onPrimary): void {
    createChip(ctx, text, bgColor, textColor)
  },

  divider(ctx: CompositionContext, color: Color = AppColors.divider, height = 1): void {
    Box(ctx, Modifier.create().fillMaxWidth().setHeight(height).background(color).freeze(), 'start')
  },

  avatar(ctx: CompositionContext, text: string, bgColor = AppColors.primary, size = 40): void {
    createAvatar(ctx, text, bgColor, size)
  },

  progressBar(ctx: CompositionContext, value: number, barColor = AppColors.primary): void {
    createProgressBar(ctx, value, barColor)
  },

  listTile(
    ctx: CompositionContext,
    title: string,
    subtitle: string | undefined,
    leading: (() => void) | undefined,
    trailing: (() => void) | undefined,
  ): void {
    createListTile(ctx, title, subtitle, leading, trailing)
  },

  statusBadge(ctx: CompositionContext, text: string, status: 'success' | 'warning' | 'error' | 'info'): void {
    const statusColors: Record<string, Color> = {
      success: AppColors.success, warning: AppColors.warning, error: AppColors.error, info: AppColors.primary,
    }
    createChip(ctx, text, statusColors[status] ?? AppColors.primary, AppColors.onPrimary)
  },

  button(
    ctx: CompositionContext,
    onClick: () => void,
    labelText: string,
    variant: 'primary' | 'success' | 'warning' | 'error' = 'primary',
  ): void {
    const bgColor = BUTTON_COLORS[variant] ?? AppColors.primary
    createButton(ctx, onClick, labelText, bgColor)
  },
  primaryButton(ctx: CompositionContext, onClick: () => void, labelText: string): void {
    M.button(ctx, onClick, labelText, 'primary')
  },
  successButton(ctx: CompositionContext, onClick: () => void, labelText: string): void {
    M.button(ctx, onClick, labelText, 'success')
  },
  warningButton(ctx: CompositionContext, onClick: () => void, labelText: string): void {
    M.button(ctx, onClick, labelText, 'warning')
  },
  errorButton(ctx: CompositionContext, onClick: () => void, labelText: string): void {
    M.button(ctx, onClick, labelText, 'error')
  },
  outlinedButton(ctx: CompositionContext, onClick: () => void, labelText: string): void {
    createButton(ctx, onClick, labelText, { r: 0, g: 0, b: 0, a: 0 })
  },
  textButton(ctx: CompositionContext, onClick: () => void, labelText: string): void {
    createButton(ctx, onClick, labelText, { r: 0, g: 0, b: 0, a: 0 })
  },
}

export { M }
export type { TextVariant, CardOptions, SectionOptions }
