import { composable, mutableStateOf, setContent, remember } from '@/index'
import type { ComposerContext, ComposableNode, MutableState } from '@/core/types'
import { Scaffold } from '@/components/container/scaffold'
import { TopAppBar } from '@/components/container/top-app-bar'
import { BottomNavigation } from '@/components/container/bottom-navigation'
import { Modifier } from '@/layout/modifier'
import { AppColors } from './theme/app-theme'
import { HomePageComposable } from './pages/home-page'
import { InteractionPageComposable } from './pages/interaction-page'
import { LayoutPageComposable } from './pages/layout-page'
import { FeedbackPageComposable } from './pages/feedback-page'
import { ListPageComposable } from './pages/list-page'
import type { ComponentNode } from '@/components/basic/types'

const TAB_ROUTES = ['home', 'interaction', 'layout', 'feedback', 'list'] as const
const TAB_LABELS = ['首页', '交互', '布局', '反馈', '列表']
const TAB_ICONS = ['◆', '☍', '▦', '◎', '☰']

interface AppProps {
  selectedTab: MutableState<number>
  showSnackbar: MutableState<boolean>
  snackbarMessage: MutableState<string>
  showDialog: MutableState<boolean>
}

function App(props: AppProps, ctx: ComposerContext): ComposableNode | null {
  const tab = props.selectedTab.value

  let content: ComposableNode | null = null
  switch (tab) {
    case 0:
      content = HomePageComposable({}, ctx)
      break
    case 1:
      content = InteractionPageComposable(
        { showSnackbar: props.showSnackbar, snackbarMessage: props.snackbarMessage },
        ctx,
      )
      break
    case 2:
      content = LayoutPageComposable({}, ctx)
      break
    case 3:
      content = FeedbackPageComposable(
        { showDialog: props.showDialog, showSnackbar: props.showSnackbar, snackbarMsg: props.snackbarMessage },
        ctx,
      )
      break
    case 4:
      content = ListPageComposable({}, ctx)
      break
  }

  const topBar = TopAppBar(
    `Pug Demo - ${TAB_LABELS[tab] ?? ''}`,
    Modifier.create().freeze(),
  )

  const bottomNavItems = TAB_LABELS.map((label, i) => ({
    label,
    selected: i === tab,
    onSelect: () => { props.selectedTab.value = i },
  }))

  const bottomNav = BottomNavigation(
    bottomNavItems,
    tab,
    Modifier.create().freeze(),
    AppColors.surface,
    { r: 117, g: 117, b: 117, a: 1 },
    AppColors.primary,
  )

  return Scaffold(
    Modifier.create().freeze(),
    topBar,
    content && isComponentNode(content) ? [content] : [],
    bottomNav,
    null,
    AppColors.background,
  )
}

const AppComposable = composable<AppProps>(App)

function isComponentNode(node: ComposableNode): node is ComponentNode {
  return 'modifier' in node && 'measurePolicy' in node && 'drawPolicy' in node
}

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

  const appHost = setContent(canvasEl, (ctx) => {
    const selectedTab = remember(ctx, () => {
      const state = mutableStateOf(0, ctx.snapshot)
      selectedTabState = state
      return state
    })
    const showSnackbar = remember(ctx, () => mutableStateOf(false, ctx.snapshot))
    const snackbarMessage = remember(ctx, () => mutableStateOf('', ctx.snapshot))
    const showDialog = remember(ctx, () => mutableStateOf(false, ctx.snapshot))

    return AppComposable({
      selectedTab,
      showSnackbar,
      snackbarMessage,
      showDialog,
    }, ctx)
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
