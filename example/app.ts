import { useState, setContent, Column, Row, Box, Modifier, Text, Button, defaultTextStyle, DEFAULT_MODIFIER, PrimaryColor, OnPrimaryColor, BackgroundColor, OnBackgroundColor } from 'pug-canvas-ui'
import type { CompositionContext, Color, MutableState } from 'pug-canvas-ui'

const AppColors = {
  primary: PrimaryColor,
  onPrimary: OnPrimaryColor,
  background: BackgroundColor,
  onBackground: OnBackgroundColor,
} as const

function CounterApp(ctx: CompositionContext): void {
  const count = useState(ctx, 0)

  Column(ctx, Modifier.create().fillMaxSize().background(AppColors.background).freeze(), 'center', 'center', () => {
    Text(ctx, 'Counter', DEFAULT_MODIFIER, { ...defaultTextStyle(), fontSize: 28, fontWeight: 'bold', color: AppColors.onBackground })

    Spacer(ctx, 0, 32)

    Box(
      ctx,
      Modifier.create()
        .background(AppColors.primary)
        .padding(48, 24)
        .freeze(),
      'center',
      () => {
        Text(ctx, `${count.value}`, DEFAULT_MODIFIER, { ...defaultTextStyle(), fontSize: 48, fontWeight: 'bold', color: AppColors.onPrimary })
      },
    )

    Spacer(ctx, 0, 32)

    Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
      Button(ctx, () => { count.value -= 1 }, '-', { backgroundColor: { r: 244, g: 67, b: 54, a: 1 } })
      Spacer(ctx, 24, 0)
      Button(ctx, () => { count.value += 1 }, '+', { backgroundColor: { r: 76, g: 175, b: 80, a: 1 } })
    })
  })
}

function Spacer(ctx: CompositionContext, width: number, height: number): void {
  Box(ctx, Modifier.create().layoutSize(width, height).freeze(), 'center')
}

function main(): void {
  const canvasEl = document.getElementById('canvas')
  if (!(canvasEl instanceof HTMLCanvasElement)) {
    console.error('Canvas element not found')
    return
  }

  canvasEl.style.width = `${window.innerWidth}px`
  canvasEl.style.height = `${window.innerHeight}px`

  setContent(canvasEl, (rootCtx) => {
    CounterApp(rootCtx)
  })
}

main()
