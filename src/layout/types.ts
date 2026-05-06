import type { ModifierElement, PaddingElement, SizeElement, WidthElement, HeightElement, FillMaxSizeElement, FillMaxWidthElement, FillMaxHeightElement, BackgroundElement, ClipElement, OffsetElement, AbsoluteOffsetElement, ReadonlyModifier } from '@/layout/modifier'
import type { ClickableElement, LongPressableElement, DraggableElement, TransformableElement, ScrollableElement, PointerInputElement, KeyboardInputElement } from '@/input/gesture-modifier'
interface Constraints {
  readonly minWidth: number
  readonly maxWidth: number
  readonly minHeight: number
  readonly maxHeight: number
}

interface MeasureResult {
  readonly width: number
  readonly height: number
  readonly alignmentLines: Map<string, number>
}

interface Placeable {
  readonly measureResult: MeasureResult
  position: { x: number; y: number }
  place(x: number, y: number): void
}

interface Measurable {
  measure(constraints: Constraints): Placeable
}

type Arrangement =
  | 'start'
  | 'center'
  | 'end'
  | 'spaceEvenly'
  | 'spaceBetween'
  | { spacedBy: number }

type Alignment =
  | 'start'
  | 'center'
  | 'end'

interface MeasureContext {
  readonly density: number
}

interface MeasurePolicy {
  measure(measurables: Measurable[], constraints: Constraints, context?: MeasureContext): MeasureResult
  measureWithWeights(
    measurables: Measurable[],
    weights: Array<WeightConfig | null>,
    constraints: Constraints,
    context?: MeasureContext,
  ): MeasureResult
  minIntrinsicWidth(measurables: Measurable[], height: number): number
  minIntrinsicHeight(measurables: Measurable[], width: number): number
}

interface WeightConfig {
  weight: number
  fill: boolean
}

interface LayoutNode {
  readonly id: number
  parent: LayoutNode | null
  children: LayoutNode[]
  measurable: Measurable | null
  measureResult: MeasureResult | null
  position: { x: number; y: number }
  weight: WeightConfig | null
  measure(constraints: Constraints): void
  addChild(child: LayoutNode): void
  removeChild(child: LayoutNode): void
}

export type {
  Constraints,
  MeasureResult,
  MeasureContext,
  Placeable,
  Measurable,
  Arrangement,
  Alignment,
  MeasurePolicy,
  WeightConfig,
  LayoutNode,
}

export type {
  ModifierElement,
  PaddingElement,
  SizeElement,
  WidthElement,
  HeightElement,
  FillMaxSizeElement,
  FillMaxWidthElement,
  FillMaxHeightElement,
  BackgroundElement,
  ClipElement,
  OffsetElement,
  AbsoluteOffsetElement,
  ReadonlyModifier,
} from '@/layout/modifier'

export type {
  ClickableElement,
  LongPressableElement,
  DraggableElement,
  TransformableElement,
  ScrollableElement,
  PointerInputElement,
  KeyboardInputElement,
} from '@/input/gesture-modifier'
