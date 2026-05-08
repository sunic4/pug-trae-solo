import type { TextStyle, TextLine, TextLayoutResult, TextMeasurer, DrawContext } from './types'

const ELLIPSIS = '\u2026'

class CanvasTextMeasurer implements TextMeasurer {
  private _ctx: DrawContext | null = null

  constructor(ctx?: DrawContext) {
    if (ctx !== undefined) {
      this._ctx = ctx
    }
  }

  setContext(ctx: DrawContext): void {
    this._ctx = ctx
  }

  measure(text: string, style: TextStyle, maxWidth?: number): TextLayoutResult {
    if (text.length === 0) {
      return { lines: [], width: 0, height: 0, didOverflow: false }
    }

    const ctx = this._getCtx()
    const lineHeight = style.lineHeight ?? style.fontSize * 1.2
    const fontStr = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`
    ctx.font = fontStr

    const paragraphs = text.split('\n')
    const lines: TextLine[] = []
    let maxWidthUsed = 0
    let didOverflow = false
    const maxLines = style.maxLines ?? Infinity

    for (const paragraph of paragraphs) {
      if (lines.length >= maxLines) {
        didOverflow = true
        break
      }

      if (paragraph.length === 0) {
        lines.push({ text: '', x: 0, y: 0, width: 0 })
        continue
      }

      if (maxWidth === undefined || maxWidth <= 0) {
        const metrics = ctx.measureText(paragraph)
        const w = metrics.width
        if (w > maxWidthUsed) maxWidthUsed = w
        lines.push({ text: paragraph, x: 0, y: 0, width: w })
        continue
      }

      const wrappedLines = this._wrapText(ctx, paragraph, maxWidth)
      for (const line of wrappedLines) {
        if (lines.length >= maxLines) {
          didOverflow = true
          if (style.overflow === 'ellipsis' && lines.length > 0) {
            const lastLine = lines[lines.length - 1]!
            const ellipsisWidth = ctx.measureText(ELLIPSIS).width
            const truncated = this._truncateWithEllipsis(ctx, lastLine.text, maxWidth - ellipsisWidth)
            const truncatedWidth = ctx.measureText(truncated + ELLIPSIS).width
            lines[lines.length - 1] = {
              text: truncated + ELLIPSIS,
              x: 0,
              y: 0,
              width: truncatedWidth,
            }
            if (truncatedWidth > maxWidthUsed) maxWidthUsed = truncatedWidth
          }
          break
        }
        if (line.width > maxWidthUsed) maxWidthUsed = line.width
        lines.push(line)
      }

      if (didOverflow) break
    }

    const textAlign = style.textAlign ?? 'left'
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      let x = 0
      if (textAlign === 'center') {
        x = (maxWidth ?? maxWidthUsed - line.width) / 2
      } else if (textAlign === 'right') {
        x = (maxWidth ?? maxWidthUsed) - line.width
      }
      lines[i] = { text: line.text, x, y: i * lineHeight, width: line.width }
    }

    const totalHeight = lines.length * lineHeight
    const finalWidth = maxWidth !== undefined ? Math.min(maxWidthUsed, maxWidth) : maxWidthUsed

    return {
      lines: Object.freeze(lines),
      width: finalWidth,
      height: totalHeight,
      didOverflow,
    }
  }

  private _wrapText(ctx: DrawContext, text: string, maxWidth: number): TextLine[] {
    const words = text.split('')
    const lines: TextLine[] = []
    let currentLine = ''

    for (const char of words) {
      const testLine = currentLine + char
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine.length > 0) {
        const lineWidth = ctx.measureText(currentLine).width
        lines.push({ text: currentLine, x: 0, y: 0, width: lineWidth })
        currentLine = char
      } else {
        currentLine = testLine
      }
    }

    if (currentLine.length > 0) {
      const lineWidth = ctx.measureText(currentLine).width
      lines.push({ text: currentLine, x: 0, y: 0, width: lineWidth })
    }

    return lines
  }

  private _truncateWithEllipsis(ctx: DrawContext, text: string, availableWidth: number): string {
    if (ctx.measureText(text).width <= availableWidth) return text
    let truncated = text
    while (truncated.length > 0 && ctx.measureText(truncated).width > availableWidth) {
      truncated = truncated.slice(0, -1)
    }
    return truncated
  }

  private _getCtx(): DrawContext {
    if (this._ctx !== null) return this._ctx
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx === null) {
      throw new Error('Failed to create canvas context for text measurement')
    }
    this._ctx = ctx
    return ctx
  }
}


function createTextMeasurer(ctx?: DrawContext): TextMeasurer {
  return new CanvasTextMeasurer(ctx)
}


function defaultTextStyle(overrides?: Partial<TextStyle>): TextStyle {
  return {
    fontFamily: 'sans-serif',
    fontSize: 14,
    fontWeight: 'normal',
    color: { r: 0, g: 0, b: 0, a: 1 },
    ...overrides,
  }
}

export { CanvasTextMeasurer, createTextMeasurer, defaultTextStyle, ELLIPSIS }
