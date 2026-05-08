const CHAR_WIDTH_RATIO = 0.6
const LINE_HEIGHT_RATIO = 1.4
const DEFAULT_FONT_SIZE = 14

let _fallbackCanvas: HTMLCanvasElement | null = null
let _fallbackCtx: CanvasRenderingContext2D | null = null

function charWidth(fontSize: number): number {
  return fontSize * CHAR_WIDTH_RATIO
}

function lineHeight(fontSize: number): number {
  return fontSize * LINE_HEIGHT_RATIO
}

function measureTextWidth(text: string, fontSize: number, fontFamily: string = 'sans-serif', fontWeight: string = 'normal'): number {
  if (typeof document !== 'undefined') {
    if (_fallbackCtx === null) {
      _fallbackCanvas = document.createElement('canvas')
      const ctx = _fallbackCanvas.getContext('2d')
      if (ctx !== null) {
        _fallbackCtx = ctx
      }
    }
    if (_fallbackCtx !== null) {
      _fallbackCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
      return _fallbackCtx.measureText(text).width
    }
  }
  return text.length * charWidth(fontSize)
}

function textPixelWidth(text: string, fontSize: number): number {
  return measureTextWidth(text, fontSize)
}

export { LINE_HEIGHT_RATIO, DEFAULT_FONT_SIZE, charWidth, lineHeight, textPixelWidth, measureTextWidth }
