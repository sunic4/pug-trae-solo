import { composable, remember, useState, setContent, Modifier, Scaffold, TopAppBar, BottomNavigation } from 'pug-canvas-ui'
import type { CompositionContext, MutableState } from 'pug-canvas-ui'
import { QuickStartPageComposable } from './pages/quickstart-page'
import { InteractionPageComposable } from './pages/interaction-page'
import { LayoutPageComposable } from './pages/layout-page'
import { FeedbackPageComposable } from './pages/feedback-page'
import { ListPageComposable } from './pages/list-page'
import { AnimationPageComposable } from './pages/animation-page'
import { ComponentsPageComposable } from './pages/components-page'
import { GesturesPageComposable } from './pages/gestures-page'
import { NavigationPageComposable } from './pages/navigation-page'
import { AdvancedPageComposable } from './pages/advanced-page'
import { AppColors, TAB_LABELS } from './theme/tabs'

interface AppState {
  selectedTab: MutableState<number>
  showSnackbar: MutableState<boolean>
  snackbarMessage: MutableState<string>
  showDialog: MutableState<boolean>
}

function App(ctx: CompositionContext, state: AppState): void {
  const tab = state.selectedTab.value

  const topBar = () => {
    TopAppBar(ctx, `Pug Demo — ${TAB_LABELS[tab] ?? ''}`, Modifier.create().freeze())
  }

  const bodyContent = () => {
    switch (tab) {
      case 0:
        QuickStartPageComposable({}, ctx)
        break
      case 1:
        InteractionPageComposable({
          showSnackbar: state.showSnackbar,
          snackbarMessage: state.snackbarMessage,
        }, ctx)
        break
      case 2:
        LayoutPageComposable({}, ctx)
        break
      case 3:
        AnimationPageComposable({}, ctx)
        break
      case 4:
        FeedbackPageComposable({
          showDialog: state.showDialog,
          showSnackbar: state.showSnackbar,
          snackbarMsg: state.snackbarMessage,
        }, ctx)
        break
      case 5:
        ListPageComposable({}, ctx)
        break
      case 6:
        ComponentsPageComposable({}, ctx)
        break
      case 7:
        GesturesPageComposable({}, ctx)
        break
      case 8:
        NavigationPageComposable({}, ctx)
        break
      case 9:
        AdvancedPageComposable({}, ctx)
        break
    }
  }

  const bottomNavItems = TAB_LABELS.map((label, i) => ({
    label,
    selected: i === tab,
    onSelect: () => { state.selectedTab.value = i },
  }))

  const bottomBar = () => {
    BottomNavigation(
      ctx,
      bottomNavItems,
      tab,
      Modifier.create().freeze(),
      {
        backgroundColor: AppColors.surface,
        contentColor: { r: 117, g: 117, b: 117, a: 1 },
        selectedItemColor: AppColors.primary,
      },
    )
  }

  Scaffold(ctx, topBar, bodyContent, bottomBar, { backgroundColor: AppColors.background })
}

const AppComposable = composable<AppState>(App)

function main(): void {
  const canvasEl = document.getElementById('canvas')
  if (!(canvasEl instanceof HTMLCanvasElement)) {
    console.error('Canvas element not found')
    return
  }

  const initialWidth = Math.min(420, window.innerWidth)
  const initialHeight = Math.min(800, window.innerHeight)
  canvasEl.style.width = `${initialWidth}px`
  canvasEl.style.height = `${initialHeight}px`

  let selectedTabState: MutableState<number> | null = null

  const appHost = setContent(canvasEl, (rootCtx) => {
    const selectedTab = remember(rootCtx, () => {
      const state = useState(rootCtx, 0)
      selectedTabState = state
      return state
    })
    const showSnackbar = useState(rootCtx, false)
    const snackbarMessage = useState(rootCtx, '')
    const showDialog = useState(rootCtx, false)

    AppComposable({
      selectedTab,
      showSnackbar,
      snackbarMessage,
      showDialog,
    }, rootCtx)
  })

  canvasEl.addEventListener('pointerdown', (e) => {
    const rect = canvasEl.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const width = canvasEl.clientWidth
    const height = canvasEl.clientHeight
    const navHeight = 56
    const navY = height - navHeight

    if (y >= navY && y <= height && selectedTabState) {
      const itemWidth = width / TAB_LABELS.length
      const newTab = Math.floor(x / itemWidth)
      if (newTab >= 0 && newTab < TAB_LABELS.length) {
        selectedTabState.value = newTab
        appHost.requestRender()
      }
    }
  })
}

main()
