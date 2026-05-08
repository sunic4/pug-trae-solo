import type { CompositionContext, TextStyle } from 'pug-canvas-ui'
import { M } from './app-theme'

interface LayoutHelpers {
  heading: (text: string, size?: number, styleOverride?: Partial<TextStyle>) => void
  body: (text: string, size?: number, styleOverride?: Partial<TextStyle>) => void
  caption: (text: string, size?: number, styleOverride?: Partial<TextStyle>) => void
  spacer: (height?: number) => void
  gap: (width?: number) => void
  card: (childrenFn?: () => void, options?: { elevation?: number; padding?: number }) => void
  section: (childrenFn?: () => void) => void
  primaryButton: (onClick: () => void, label: string) => void
  successButton: (onClick: () => void, label: string) => void
  warningButton: (onClick: () => void, label: string) => void
  errorButton: (onClick: () => void, label: string) => void
}

function createLayoutHelpers(ctx: CompositionContext): LayoutHelpers {
  return {
    heading: (text, size, styleOverride) => M.heading(ctx, text, size, styleOverride),
    body: (text, size, styleOverride) => M.body(ctx, text, size, styleOverride),
    caption: (text, size, styleOverride) => M.caption(ctx, text, size, styleOverride),
    spacer: (height) => M.spacer(ctx, height),
    gap: (width) => M.gap(ctx, width),
    card: (childrenFn, options) => M.card(ctx, childrenFn, options),
    section: (childrenFn) => M.section(ctx, childrenFn),
    primaryButton: (onClick, label) => M.primaryButton(ctx, onClick, label),
    successButton: (onClick, label) => M.successButton(ctx, onClick, label),
    warningButton: (onClick, label) => M.warningButton(ctx, onClick, label),
    errorButton: (onClick, label) => M.errorButton(ctx, onClick, label),
  }
}

export { createLayoutHelpers }
export type { LayoutHelpers }
