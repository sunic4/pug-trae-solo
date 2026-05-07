export { composable, mutableStateOf, remember, setContent } from '@/core/composable'
export type { MutableState, CompositionContext } from '@/core/composable'
export { remember } from '@/core/remember'
export { mutableStateOf } from '@/core/state'

export { Modifier } from '@/layout/modifier'
export type { ReadonlyModifier } from '@/layout/types'

export { clickable } from '@/input/gesture-modifier'

export { Text } from '@/components/basic/text'
export { Image } from '@/components/basic/image'
export { Spacer } from '@/components/basic/spacer'
export { Box } from '@/components/basic/box'

export { Column } from '@/components/layout/column'
export { Row } from '@/components/layout/row'
export { Surface } from '@/components/layout/surface'

export { Button } from '@/components/interaction/button'
export { Slider } from '@/components/interaction/slider'
export { TextField } from '@/components/interaction/text-field'
export { Checkbox } from '@/components/interaction/checkbox'
export { FAB } from '@/components/interaction/fab'

export { CircularProgressIndicator } from '@/components/feedback/circular-progress'
export { LinearProgressIndicator } from '@/components/feedback/linear-progress'
export { Snackbar } from '@/components/feedback/snackbar'

export { Dialog } from '@/components/overlay/dialog'
export { ModalBottomSheet } from '@/components/overlay/modal-bottom-sheet'
export { DropdownMenu } from '@/components/overlay/dropdown-menu'
export { Popup } from '@/components/overlay/popup'

export { Scaffold } from '@/components/container/scaffold'
export { TopAppBar } from '@/components/container/top-app-bar'
export { BottomNavigation } from '@/components/container/bottom-navigation'
export { TabRow } from '@/components/container/tab-row'

export { LazyColumn, LazyRow } from '@/components/lazy/lazy-column'

export type { Color, TextStyle } from '@/renderer/types'
export { defaultTextStyle } from '@/renderer/text-style'
export { DEFAULT_MODIFIER } from '@/components/shared/constants'

export { PrimaryColor, OnPrimaryColor, SurfaceColor, BackgroundColor } from '@/theme/colors'
export { AppColors, M } from './theme/app-theme'

import { Column } from '@/components/layout/column'
import { Row } from '@/components/layout/row'
import { Box } from '@/components/basic/box'
import { Text } from '@/components/basic/text'
import { Spacer } from '@/components/basic/spacer'
import { Surface } from '@/components/layout/surface'
import { Button } from '@/components/interaction/button'
import { Modifier } from '@/layout/modifier'
import { AppColors } from './theme/app-theme'
import type { CompositionContext } from '@/core/composition-context'
import type { TextStyle } from '@/renderer/types'
import { defaultTextStyle } from '@/renderer/text-style'
import { DEFAULT_MODIFIER } from '@/components/shared/constants'

export function createLayoutHelpers(ctx: CompositionContext) {
  function heading(text: string, size: number = 24, styleOverride?: Partial<TextStyle>): void {
    Text(ctx, text, DEFAULT_MODIFIER, {
      ...defaultTextStyle(),
      fontSize: size,
      fontWeight: 'bold',
      color: AppColors.onBackground,
      ...styleOverride,
    })
  }

  function body(text: string, size: number = 14, styleOverride?: Partial<TextStyle>): void {
    Text(ctx, text, DEFAULT_MODIFIER, {
      ...defaultTextStyle(),
      fontSize: size,
      color: AppColors.onSurface,
      ...styleOverride,
    })
  }

  function caption(text: string, size: number = 12, styleOverride?: Partial<TextStyle>): void {
    Text(ctx, text, DEFAULT_MODIFIER, {
      ...defaultTextStyle(),
      fontSize: size,
      color: { r: 117, g: 117, b: 117, a: 1 },
      ...styleOverride,
    })
  }

  function spacer(height: number = 8): void {
    Spacer(ctx, 0, height)
  }

  function gap(width: number = 8): void {
    Spacer(ctx, width, 0)
  }

  function card(childrenFn?: () => void, options?: { elevation?: number; padding?: number }): void {
    const p = options?.padding ?? 16
    const e = options?.elevation ?? 2
    Surface(ctx, childrenFn, {
      modifier: Modifier.create().fillMaxWidth().padding(p).freeze(),
      color: AppColors.cardBg,
      elevation: e,
      borderRadius: 12,
      alignment: 'start',
    })
  }

  function section(childrenFn?: () => void): void {
    Surface(ctx, childrenFn, {
      modifier: Modifier.create().fillMaxWidth().padding(16).freeze(),
      color: AppColors.sectionBg,
      elevation: 0,
      borderRadius: 12,
      alignment: 'start',
    })
  }

  function primaryButton(onClick: () => void, label: string): void {
    Button(ctx, onClick, label, { backgroundColor: AppColors.primary })
  }

  function successButton(onClick: () => void, label: string): void {
    Button(ctx, onClick, label, { backgroundColor: AppColors.success })
  }

  function warningButton(onClick: () => void, label: string): void {
    Button(ctx, onClick, label, { backgroundColor: AppColors.warning })
  }

  function errorButton(onClick: () => void, label: string): void {
    Button(ctx, onClick, label, { backgroundColor: AppColors.error })
  }

  return {
    heading,
    body,
    caption,
    spacer,
    gap,
    card,
    section,
    primaryButton,
    successButton,
    warningButton,
    errorButton,
    column: Column,
    row: Row,
    box: Box,
    text: Text,
    modifier: Modifier,
  }
}
