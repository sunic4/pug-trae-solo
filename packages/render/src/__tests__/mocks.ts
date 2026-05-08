import { vi } from 'vitest'
import type { DrawContext } from '@pug-canvas-ui/render'

function createMockTextMetrics(width: number = 10): TextMetrics {
  return {
    width,
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: 0,
    actualBoundingBoxAscent: 0,
    actualBoundingBoxDescent: 0,
    fontBoundingBoxAscent: 0,
    fontBoundingBoxDescent: 0,
    emHeightAscent: 0,
    emHeightDescent: 0,
    alphabeticBaseline: 0,
    hangingBaseline: 0,
    ideographicBaseline: 0,
  }
}

function createMockCtx(): DrawContext {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    font: '',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowColor: '',
    fillRect: vi.fn<(x: number, y: number, width: number, height: number) => void>(),
    strokeRect: vi.fn<(x: number, y: number, width: number, height: number) => void>(),
    clearRect: vi.fn<(x: number, y: number, width: number, height: number) => void>(),
    beginPath: vi.fn<() => void>(),
    arc: vi.fn<(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean) => void>(),
    fill: vi.fn<(fillRule?: CanvasFillRule) => void>(),
    stroke: vi.fn<() => void>(),
    moveTo: vi.fn<(x: number, y: number) => void>(),
    lineTo: vi.fn<(x: number, y: number) => void>(),
    quadraticCurveTo: vi.fn<(cpx: number, cpy: number, x: number, y: number) => void>(),
    bezierCurveTo: vi.fn<(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) => void>(),
    arcTo: vi.fn<(x1: number, y1: number, x2: number, y2: number, radius: number) => void>(),
    closePath: vi.fn<() => void>(),
    rect: vi.fn<(x: number, y: number, width: number, height: number) => void>(),
    clip: vi.fn<(fillRule?: CanvasFillRule) => void>(),
    save: vi.fn<() => void>(),
    restore: vi.fn<() => void>(),
    roundRect: vi.fn<(x: number, y: number, width: number, height: number, radii?: number | DOMPointInit | Iterable<number | DOMPointInit>) => void>(),
    drawImage: vi.fn(),
    fillText: vi.fn<(text: string, x: number, y: number, maxWidth?: number) => void>(),
    strokeText: vi.fn<(text: string, x: number, y: number, maxWidth?: number) => void>(),
    measureText: vi.fn<(text: string) => TextMetrics>().mockReturnValue(createMockTextMetrics()),
    translate: vi.fn<(x: number, y: number) => void>(),
    scale: vi.fn<(x: number, y: number) => void>(),
    ellipse: vi.fn<(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean) => void>(),
    setLineDash: vi.fn<(segments: number[]) => void>(),
  }
}

function createMockCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 600
  return canvas
}

function createMockImageSource(): CanvasImageSource {
  const img = document.createElement('img')
  img.width = 100
  img.height = 100
  return img
}

export { createMockCtx, createMockCanvas, createMockTextMetrics, createMockImageSource }
