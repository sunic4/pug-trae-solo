import { composable, createAppContext } from '@pug-canvas-ui/core'
import type { ComposerContext } from '@pug-canvas-ui/core'
import type { CompositionContext } from '@pug-canvas-ui/core'
import { createCanvasHost } from '@pug-canvas-ui/render'
import { renderEmittedTree } from './component-renderer'

interface AppHost {
  requestRender: () => void
  destroy: () => void
  canvas: HTMLCanvasElement
  appContext: ComposerContext
}

export function setContent(
  canvas: HTMLCanvasElement,
  appComposable: (ctx: CompositionContext) => void,
): AppHost {
  const dpr = window.devicePixelRatio || 1
  let width = canvas.clientWidth
  let height = canvas.clientHeight

  canvas.width = width * dpr
  canvas.height = height * dpr
  const ctx2d = canvas.getContext('2d')
  if (!ctx2d) throw new Error('Failed to get 2d context')
  ctx2d.scale(dpr, dpr)

  const host = createCanvasHost(canvas, ctx2d)
  const appCtx = createAppContext({ canvas })

  let rootCtx: CompositionContext | null = null

  composable<Record<string, never>>((ctx: CompositionContext) => {
    rootCtx = ctx
    appComposable(rootCtx)
  })

  let needsRender = true

  function render(): void {
    if (!needsRender) return
    needsRender = false
    host.clear()
    if (rootCtx && rootCtx.rootNodeId !== null) {
      const commands = renderEmittedTree(host.ctx, rootCtx.emittedNodes, rootCtx.rootNodeId, width, height)
      host.render(commands)
    }
  }

  function requestRender(): void {
    needsRender = true
    requestAnimationFrame(render)
  }

  function handleResize(): void {
    width = canvas.clientWidth
    height = canvas.clientHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    if (ctx2d) {
      ctx2d.scale(dpr, dpr)
    }
    requestRender()
  }

  const originalScheduleRecompose = appCtx.recomposer.scheduleRecompose
  appCtx.recomposer.scheduleRecompose = (scope) => {
    originalScheduleRecompose(scope)
    requestRender()
  }

  window.addEventListener('resize', handleResize)
  render()

  function destroy(): void {
    window.removeEventListener('resize', handleResize)
  }

  return { requestRender, destroy, canvas, appContext: appCtx }
}
