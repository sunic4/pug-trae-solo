import type { CompositionContext, Color } from 'pug-canvas-ui'
import { Row, Column, Box, Modifier } from 'pug-canvas-ui'
import { M } from './app-theme'

interface PageHeaderOptions {
  title: string
  subtitle?: string
  titleSize?: number
  subtitleSize?: number
}

function createPageHeader(ctx: CompositionContext, options: PageHeaderOptions): void {
  const { title, subtitle, titleSize = 22, subtitleSize = 13 } = options
  M.title(ctx, title, titleSize)
  if (subtitle) {
    M.vSpacer(ctx, 4)
    M.caption(ctx, subtitle, subtitleSize)
  }
}

interface DemoCardOptions {
  title: string
  subtitle?: string
  elevation?: number
  padding?: number
  color?: Color
}

function createDemoCard(ctx: CompositionContext, options: DemoCardOptions, childrenFn: () => void): void {
  const { title, subtitle, elevation = 2, padding = 16, color } = options
  M.card(ctx, () => {
    M.body(ctx, title)
    if (subtitle) {
      M.vSpacer(ctx, 8)
      M.caption(ctx, subtitle)
    }
    M.vSpacer(ctx, 12)
    childrenFn()
  }, { elevation, padding, color })
}

type ButtonVariant = 'primary' | 'success' | 'warning' | 'error' | 'text'

interface ButtonConfig {
  label: string
  onClick: () => void
  variant?: ButtonVariant
}

function createButtonGroup(
  ctx: CompositionContext,
  buttons: readonly ButtonConfig[],
  gapSize = 8,
): void {
  Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i]!
      switch (btn.variant) {
        case 'success':
          M.successButton(ctx, btn.onClick, btn.label)
          break
        case 'warning':
          M.warningButton(ctx, btn.onClick, btn.label)
          break
        case 'error':
          M.errorButton(ctx, btn.onClick, btn.label)
          break
        case 'text':
          M.textButton(ctx, btn.onClick, btn.label)
          break
        default:
          M.primaryButton(ctx, btn.onClick, btn.label)
      }
      if (i < buttons.length - 1) {
        M.gap(ctx, gapSize)
      }
    }
  })
}

interface CounterOptions {
  label: string
  value: number
  onIncrement: () => void
  onDecrement: () => void
  valueBoxColor?: Color
}

function createCounter(ctx: CompositionContext, options: CounterOptions): void {
  const { label, value, onIncrement, onDecrement, valueBoxColor } = options
  const defaultBg = { r: 245, g: 245, b: 245, a: 1 }
  Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'center', 'center', () => {
    M.caption(ctx, label)
    M.gap(ctx, 12)
    M.primaryButton(ctx, onDecrement, '-')
    M.gap(ctx, 8)
    Box(
      ctx,
      Modifier.create()
        .background(valueBoxColor ?? defaultBg)
        .padding(16, 6)
        .freeze(),
      'center',
      () => {
        M.body(ctx, `${value}`)
      },
    )
    M.gap(ctx, 8)
    M.successButton(ctx, onIncrement, '+')
  })
}

interface StateIndicatorOptions {
  label: string
  value: string | number | boolean
  bgColor?: Color
}

function createStateIndicator(ctx: CompositionContext, options: StateIndicatorOptions): void {
  const { label, value, bgColor } = options
  const defaultBg = { r: 33, g: 150, b: 243, a: 1 }
  Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
    M.caption(ctx, label)
    Box(
      ctx,
      Modifier.create()
        .background(bgColor ?? defaultBg)
        .padding(12, 4)
        .freeze(),
      'center',
      () => {
        const textColor = { r: 255, g: 255, b: 255, a: 1 }
        const displayValue = typeof value === 'boolean' ? (value ? '是' : '否') : String(value)
        M.body(ctx, displayValue, 14, { color: textColor })
      },
    )
  })
}

interface StatRowOptions {
  label: string
  value: string | number
  highlight?: boolean
  highlightColor?: Color
}

function createStatRow(ctx: CompositionContext, options: StatRowOptions): void {
  const { label, value, highlight = false, highlightColor } = options
  const defaultHighlight = { r: 33, g: 150, b: 243, a: 1 }
  Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
    M.caption(ctx, label)
    if (highlight) {
      M.body(ctx, String(value), 16, { color: highlightColor ?? defaultHighlight })
    } else {
      M.body(ctx, String(value))
    }
  })
}

interface ColorSwatchOptions {
  color: Color
  size?: number
  label?: string
}

function createColorSwatch(ctx: CompositionContext, options: ColorSwatchOptions): void {
  const { color, size = 50, label } = options
  Column(ctx, Modifier.create().freeze(), 'center', 'center', () => {
    M.coloredBox(ctx, color, { width: size, height: size }, 'center')
    if (label) {
      M.vSpacer(ctx, 4)
      M.caption(ctx, label, 10)
    }
  })
}

export const PageHelper = {
  header: createPageHeader,
  card: createDemoCard,
  buttons: createButtonGroup,
  counter: createCounter,
  stateIndicator: createStateIndicator,
  statRow: createStatRow,
  colorSwatch: createColorSwatch,
}
export type { PageHeaderOptions, DemoCardOptions, ButtonConfig, CounterOptions, StateIndicatorOptions, StatRowOptions, ColorSwatchOptions }
