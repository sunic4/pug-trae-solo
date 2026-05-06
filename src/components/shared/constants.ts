import { Modifier } from '@/layout/modifier'
import type { ReadonlyModifier } from '@/layout/modifier'

const CHAR_WIDTH_RATIO = 0.6
const LINE_HEIGHT_RATIO = 1.4
const DEFAULT_FONT_SIZE = 14
const DEFAULT_MODIFIER: ReadonlyModifier = Modifier.create().freeze()

function charWidth(fontSize: number): number {
  return fontSize * CHAR_WIDTH_RATIO
}

function lineHeight(fontSize: number): number {
  return fontSize * LINE_HEIGHT_RATIO
}

function textPixelWidth(text: string, fontSize: number): number {
  return text.length * charWidth(fontSize)
}

export { LINE_HEIGHT_RATIO, DEFAULT_FONT_SIZE, DEFAULT_MODIFIER, charWidth, lineHeight, textPixelWidth }
