import type { Arrangement, Alignment } from '@pug-canvas-ui/layout'
import type { Color, TextStyle } from '@pug-canvas-ui/render'

interface TextNodeData {
  readonly text: string
  readonly style?: { fontSize?: number; fontWeight?: string; color?: Color }
}

interface ImageNodeData {
  readonly src: string
  readonly width: number
  readonly height: number
  readonly ninePatch?: { left: number; top: number; right: number; bottom: number } | null
}

interface SpacerNodeData {
  readonly width: number
  readonly height: number
}

interface SurfaceNodeData {
  readonly color: Color
  readonly elevation: number
  readonly borderRadius: number
  readonly alignment: string
}

interface ColumnRowNodeData {
  readonly arrangement: Arrangement
  readonly alignment: Alignment
}

interface BoxNodeData {
  readonly alignment: Alignment
}

interface SliderNodeData {
  readonly value: number
  readonly valueRange: [number, number]
  readonly onValueChange?: (value: number) => void
  readonly trackColor?: Color
  readonly thumbColor?: Color
}

interface TextFieldNodeData {
  readonly value: string
  readonly kind?: string
  readonly singleLine: boolean
  readonly placeholder?: string
  readonly onValueChange?: (value: number) => void
  readonly textStyle?: TextStyle
  readonly backgroundColor?: Color
  readonly cursorColor?: Color
}

interface CheckboxNodeData {
  readonly checked: boolean
  readonly color?: Color
  readonly onCheckedChange?: (checked: boolean) => void
  readonly checkedColor?: Color
  readonly uncheckedColor?: Color
  readonly checkmarkColor?: Color
}

interface CircularProgressNodeData {
  readonly progress: number
  readonly determinate: boolean
  readonly color?: Color
  readonly strokeWidth?: number
}

interface LinearProgressNodeData {
  readonly progress: number
  readonly determinate: boolean
  readonly color: Color
  readonly trackColor?: Color
  readonly height?: number
}

interface ButtonNodeData {
  readonly color?: Color
}

interface ScaffoldNodeData {
  readonly color?: Color
}

interface LazyColumnNodeData {
  readonly kind: 'lazy-column'
  readonly itemCount: number
  readonly itemSize: number | null
  readonly spacing: number
  readonly contentPadding: number
  readonly firstVisibleItemIndex: number
  readonly firstVisibleItemScrollOffset: number
}

interface LazyRowNodeData {
  readonly kind: 'lazy-row'
  readonly itemCount: number
  readonly itemSize: number | null
  readonly spacing: number
  readonly contentPadding: number
  readonly firstVisibleItemIndex: number
  readonly firstVisibleItemScrollOffset: number
}

interface DropdownMenuNodeData {
  readonly items: Array<{ label: string; onClick?: () => void; enabled?: boolean }>
  readonly expanded: boolean
  readonly onDismissRequest?: () => void
  readonly backgroundColor?: Color
}

interface ModalBottomSheetNodeData {
  readonly onDismissRequest?: () => void
  readonly peekHeight: number
  readonly backgroundColor?: Color
}

interface PopupNodeData {
  readonly alignment: Alignment
  readonly offset: { x: number; y: number }
  readonly onDismissRequest: (() => void) | null
}

interface NavControllerNodeData {
  readonly navController: unknown
  readonly navGraph: unknown
  readonly currentDestination?: unknown
}

type NodeData =
  | TextNodeData
  | ImageNodeData
  | SpacerNodeData
  | SurfaceNodeData
  | ColumnRowNodeData
  | BoxNodeData
  | SliderNodeData
  | TextFieldNodeData
  | CheckboxNodeData
  | CircularProgressNodeData
  | LinearProgressNodeData
  | ButtonNodeData
  | ScaffoldNodeData
  | LazyColumnNodeData
  | LazyRowNodeData
  | DropdownMenuNodeData
  | ModalBottomSheetNodeData
  | PopupNodeData
  | NavControllerNodeData

function isTextNodeData(data: unknown): data is TextNodeData {
  return typeof data === 'object' && data !== null && 'text' in data && !('src' in data)
}

function isImageNodeData(data: unknown): data is ImageNodeData {
  return typeof data === 'object' && data !== null && 'src' in data
}

function isSpacerNodeData(data: unknown): data is SpacerNodeData {
  return typeof data === 'object' && data !== null && 'width' in data && 'height' in data && !('text' in data) && !('src' in data)
}

function isSurfaceNodeData(data: unknown): data is SurfaceNodeData {
  return typeof data === 'object' && data !== null && 'color' in data && 'elevation' in data
}

function isColumnRowNodeData(data: unknown): data is ColumnRowNodeData {
  return typeof data === 'object' && data !== null && 'arrangement' in data && 'alignment' in data
}

function isBoxNodeData(data: unknown): data is BoxNodeData {
  return typeof data === 'object' && data !== null && 'alignment' in data && !('arrangement' in data) && !('checked' in data)
}

function isSliderNodeData(data: unknown): data is SliderNodeData {
  return typeof data === 'object' && data !== null && 'value' in data && 'valueRange' in data
}

function isTextFieldNodeData(data: unknown): data is TextFieldNodeData {
  return typeof data === 'object' && data !== null && 'value' in data && 'singleLine' in data
}

function isCheckboxNodeData(data: unknown): data is CheckboxNodeData {
  return typeof data === 'object' && data !== null && 'checked' in data
}

function isCircularProgressNodeData(data: unknown): data is CircularProgressNodeData {
  return typeof data === 'object' && data !== null && 'progress' in data && 'determinate' in data
}

function isLinearProgressNodeData(data: unknown): data is LinearProgressNodeData {
  return typeof data === 'object' && data !== null && 'progress' in data && 'determinate' in data && 'color' in data
}

function isButtonNodeData(data: unknown): data is ButtonNodeData {
  return typeof data === 'object' && data !== null && !('checked' in data) && !('value' in data) && !('progress' in data) && !('kind' in data)
}

function isScaffoldNodeData(data: unknown): data is ScaffoldNodeData {
  return typeof data === 'object' && data !== null && 'color' in data && !('elevation' in data) && !('checked' in data) && !('value' in data) && !('progress' in data) && !('kind' in data) && !('alignment' in data)
}

function isLazyColumnNodeData(data: unknown): data is LazyColumnNodeData {
  return typeof data === 'object' && data !== null && (data as { kind?: string }).kind === 'lazy-column'
}

function isLazyRowNodeData(data: unknown): data is LazyRowNodeData {
  return typeof data === 'object' && data !== null && (data as { kind?: string }).kind === 'lazy-row'
}

function isDropdownMenuNodeData(data: unknown): data is DropdownMenuNodeData {
  return typeof data === 'object' && data !== null && 'items' in data && 'expanded' in data
}

function isModalBottomSheetNodeData(data: unknown): data is ModalBottomSheetNodeData {
  return typeof data === 'object' && data !== null && 'peekHeight' in data
}

function isPopupNodeData(data: unknown): data is PopupNodeData {
  return typeof data === 'object' && data !== null && 'alignment' in data && 'offset' in data
}

function isNavControllerNodeData(data: unknown): data is NavControllerNodeData {
  return typeof data === 'object' && data !== null && 'navController' in data
}

export type {
  NodeData,
  TextNodeData,
  ImageNodeData,
  SpacerNodeData,
  SurfaceNodeData,
  ColumnRowNodeData,
  BoxNodeData,
  SliderNodeData,
  TextFieldNodeData,
  CheckboxNodeData,
  CircularProgressNodeData,
  LinearProgressNodeData,
  ButtonNodeData,
  ScaffoldNodeData,
  LazyColumnNodeData,
  LazyRowNodeData,
  DropdownMenuNodeData,
  ModalBottomSheetNodeData,
  PopupNodeData,
  NavControllerNodeData,
}

export {
  isTextNodeData,
  isImageNodeData,
  isSpacerNodeData,
  isSurfaceNodeData,
  isColumnRowNodeData,
  isBoxNodeData,
  isSliderNodeData,
  isTextFieldNodeData,
  isCheckboxNodeData,
  isCircularProgressNodeData,
  isLinearProgressNodeData,
  isButtonNodeData,
  isScaffoldNodeData,
  isLazyColumnNodeData,
  isLazyRowNodeData,
  isDropdownMenuNodeData,
  isModalBottomSheetNodeData,
  isPopupNodeData,
  isNavControllerNodeData,
}
