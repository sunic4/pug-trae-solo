import {
  composable,
  mutableStateOf,
  remember,
  setContent,
  Scaffold,
  TopAppBar,
  BottomNavigation,
  Modifier,
  AppColors,
} from './index'
import type { MutableState } from './index'
import type { CompositionContext } from './index'
import { HomePageComposable } from './pages/home-page'
import { InteractionPageComposable } from './pages/interaction-page'
import { LayoutPageComposable } from './pages/layout-page'
import { FeedbackPageComposable } from './pages/feedback-page'
import { ListPageComposable } from './pages/list-page'

const TAB_LABELS = ['首页', '交互', '布局', '反馈', '列表'] as const

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
        HomePageComposable(ctx, {})
        break
      case 1:
        InteractionPageComposable(ctx, {
          showSnackbar: state.showSnackbar,
          snackbarMessage: state.snackbarMessage,
        })
        break
      case 2:
        LayoutPageComposable(ctx, {})
        break
      case 3:
        FeedbackPageComposable(ctx, {
          showDialog: state.showDialog,
          showSnackbar: state.showSnackbar,
          snackbarMsg: state.snackbarMessage,
        })
        break
      case 4:
        ListPageComposable(ctx, {})
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
      const state = mutableStateOf(0, rootCtx.snapshot)
      selectedTabState = state
      return state
    })
    const showSnackbar = remember(rootCtx, () => mutableStateOf(false, rootCtx.snapshot))
    const snackbarMessage = remember(rootCtx, () => mutableStateOf('', rootCtx.snapshot))
    const showDialog = remember(rootCtx, () => mutableStateOf(false, rootCtx.snapshot))

    AppComposable(rootCtx, {
      selectedTab,
      showSnackbar,
      snackbarMessage,
      showDialog,
    })
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
