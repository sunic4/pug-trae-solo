import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTextMeasurer, defaultTextStyle } from '@/renderer/text-style'
import { createDrawMultilineText } from '@/renderer/draw-command'
import { createDrawScope } from '@/renderer/draw-scope'
import type { TextStyle, TextLayoutResult, DrawContext } from '@/renderer/types'
import { createMockCtx, createMockTextMetrics } from '@/test-utils'
import type { TextMeasurer, DrawScope } from '@/renderer/types'

function createMockCtxWithMeasure() {
  const ctx = createMockCtx()
  ctx.measureText = vi.fn((text: string) => {
    return createMockTextMetrics(text.length * 7)
  })
  return ctx
}

describe('TextMeasurer', () => {
  let ctx: DrawContext

  beforeEach(() => {
    ctx = createMockCtxWithMeasure()
  })

  describe('when measuring empty text', () => {
    it('should return zero dimensions', () => {
      const measurer = createTextMeasurer(ctx)
      const style = defaultTextStyle()
      const result = measurer.measure('', style)
      expect(result.lines).toHaveLength(0)
      expect(result.width).toBe(0)
      expect(result.height).toBe(0)
      expect(result.didOverflow).toBe(false)
    })
  })

  describe('when measuring single line text', () => {
    it('should return one line', () => {
      const measurer = createTextMeasurer(ctx)
      const style = defaultTextStyle()
      const result = measurer.measure('Hello', style)
      expect(result.lines).toHaveLength(1)
      expect(result.lines[0]?.text).toBe('Hello')
      expect(result.width).toBeGreaterThan(0)
      expect(result.height).toBeGreaterThan(0)
    })
  })

  describe('when measuring multi-paragraph text', () => {
    it('should split by newline', () => {
      const measurer = createTextMeasurer(ctx)
      const style = defaultTextStyle()
      const result = measurer.measure('Hello\nWorld', style)
      expect(result.lines).toHaveLength(2)
      expect(result.lines[0]?.text).toBe('Hello')
      expect(result.lines[1]?.text).toBe('World')
    })
  })

  describe('when measuring with maxWidth', () => {
    it('should wrap text that exceeds width', () => {
      const measurer = createTextMeasurer(ctx)
      const style = defaultTextStyle()
      const result = measurer.measure('Hello World', style, 35)
      expect(result.lines.length).toBeGreaterThan(1)
    })
  })

  describe('when measuring with maxLines', () => {
    it('should limit number of lines', () => {
      const measurer = createTextMeasurer(ctx)
      const style = defaultTextStyle({ maxLines: 1 })
      const result = measurer.measure('Hello\nWorld', style)
      expect(result.lines).toHaveLength(1)
      expect(result.didOverflow).toBe(true)
    })
  })

  describe('when measuring with textAlign center', () => {
    it('should center lines', () => {
      const measurer = createTextMeasurer(ctx)
      const style = defaultTextStyle({ textAlign: 'center' })
      const result = measurer.measure('Hi', style, 100)
      expect(result.lines[0]?.x).toBeGreaterThan(0)
    })
  })

  describe('when measuring with textAlign right', () => {
    it('should right-align lines', () => {
      const measurer = createTextMeasurer(ctx)
      const style = defaultTextStyle({ textAlign: 'right' })
      const result = measurer.measure('Hi', style, 100)
      expect(result.lines[0]?.x).toBeGreaterThan(0)
    })
  })

  describe('when measuring with ellipsis overflow', () => {
    it('should add ellipsis to last line', () => {
      const measurer = createTextMeasurer(ctx)
      const style = defaultTextStyle({ maxLines: 1, overflow: 'ellipsis' })
      const result = measurer.measure('Hello World This Is Long', style, 50)
      if (result.lines.length > 0) {
        expect(result.lines[0]?.text).toContain('\u2026')
      }
    })
  })
})

describe('defaultTextStyle', () => {
  describe('when called without overrides', () => {
    it('should return default values', () => {
      const style = defaultTextStyle()
      expect(style.fontFamily).toBe('sans-serif')
      expect(style.fontSize).toBe(14)
      expect(style.fontWeight).toBe('normal')
    })
  })

  describe('when called with overrides', () => {
    it('should override specified values', () => {
      const style = defaultTextStyle({ fontSize: 20, fontWeight: 'bold' })
      expect(style.fontSize).toBe(20)
      expect(style.fontWeight).toBe('bold')
      expect(style.fontFamily).toBe('sans-serif')
    })
  })
})

describe('createDrawMultilineText', () => {
  it('should create a fillText command with layout', () => {
    const layout: TextLayoutResult = {
      lines: [
        { text: 'Hello', x: 0, y: 0, width: 35 },
        { text: 'World', x: 0, y: 17, width: 35 },
      ],
      width: 35,
      height: 34,
      didOverflow: false,
    }
    const style: TextStyle = defaultTextStyle()
    const ctx = createMockCtx()
    const cmd = createDrawMultilineText(ctx, layout, { x: 10, y: 20 }, style)
    expect(cmd.type).toBe('fillMultilineText')
    expect(cmd.bounds.width).toBe(35)
    expect(cmd.bounds.height).toBe(34)

    cmd.execute()
    expect(ctx.fillText).toHaveBeenCalledTimes(2)
  })
})

describe('DrawScope drawMultilineText', () => {
  it('should add a drawMultilineText command', () => {
    const ctx = createMockCtx()
    const scope = createDrawScope(ctx)
    const layout: TextLayoutResult = {
      lines: [{ text: 'Hi', x: 0, y: 0, width: 14 }],
      width: 14,
      height: 17,
      didOverflow: false,
    }
    const style = defaultTextStyle()
    scope.drawMultilineText(layout, { x: 0, y: 0 }, style)
    const commands = scope.getCommands()
    expect(commands).toHaveLength(1)
    expect(commands[0]?.type).toBe('fillMultilineText')
  })
})
