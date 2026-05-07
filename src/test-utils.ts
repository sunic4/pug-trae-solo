import { vi } from 'vitest'
import type { DrawContext } from '@/renderer/types'
import type { ModifierElement, PaddingElement, FillMaxSizeElement, BackgroundElement, ReadonlyModifier, ClickableElement } from '@/layout/modifier'
import type { NativePointerEvent, CanvasRect } from '@/input/pointer-event'

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

function createMockPointerEvent(overrides: Partial<NativePointerEvent> = {}): NativePointerEvent {
  return {
    pointerId: 0,
    type: 'pointerdown',
    clientX: 0,
    clientY: 0,
    pressure: 0,
    tiltX: 0,
    tiltY: 0,
    timeStamp: 0,
    buttons: 0,
    isPrimary: false,
    ...overrides,
  }
}

function createMockCanvasRect(overrides: Partial<CanvasRect> = {}): CanvasRect {
  return {
    left: 0,
    top: 0,
    width: 800,
    height: 600,
    ...overrides,
  }
}

function createMockImageSource(): CanvasImageSource {
  const img = document.createElement('img')
  img.width = 100
  img.height = 100
  return img
}

function assertPaddingElement(el: ModifierElement): asserts el is PaddingElement {
  if (el.kind !== 'layout' || el.name !== 'padding') {
    throw new Error(`Expected PaddingElement, got ${el.kind}/${el.name}`)
  }
}

function assertFillMaxSizeElement(el: ModifierElement): asserts el is FillMaxSizeElement {
  if (el.kind !== 'layout' || el.name !== 'fillMaxSize') {
    throw new Error(`Expected FillMaxSizeElement, got ${el.kind}/${el.name}`)
  }
}

function assertBackgroundElement(el: ModifierElement): asserts el is BackgroundElement {
  if (el.kind !== 'draw' || el.name !== 'background') {
    throw new Error(`Expected BackgroundElement, got ${el.kind}/${el.name}`)
  }
}

function assertClickableElement(el: ModifierElement): asserts el is ClickableElement {
  if (el.kind !== 'input' || el.name !== 'clickable') {
    throw new Error(`Expected ClickableElement, got ${el.kind}/${el.name}`)
  }
}

function hasModifierElement(modifier: ReadonlyModifier, kind: ModifierElement['kind'], name: string): boolean {
  const elements = modifier.filterByKind(kind)
  for (let i = 0; i < elements.size; i++) {
    if (elements.get(i).name === name) return true
  }
  return false
}

export {
  createMockCtx,
  createMockCanvas,
  createMockTextMetrics,
  createMockPointerEvent,
  createMockCanvasRect,
  createMockImageSource,
  assertPaddingElement,
  assertFillMaxSizeElement,
  assertBackgroundElement,
  assertClickableElement,
  hasModifierElement,
}
