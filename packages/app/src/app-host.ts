import { composable, createAppContext } from '@pug-canvas-ui/core'
import type { ComposerContext } from '@pug-canvas-ui/core'
import type { CompositionContext } from '@pug-canvas-ui/core'
import type { ReadonlyModifier } from '@pug-canvas-ui/layout'
import type { ClickableElement } from '@pug-canvas-ui/types'
import type { PointerInputHandler } from '@pug-canvas-ui/types'
import type { HitTestableNode } from '@pug-canvas-ui/input'
import { createCanvasHost } from '@pug-canvas-ui/render'
import { createDensity } from '@pug-canvas-ui/platform'
import { createPointerEventDispatcher } from '@pug-canvas-ui/input'
import { createTapRecognizer } from '@pug-canvas-ui/input'
import { renderEmittedTree } from './component-renderer'

interface AppHost {
  requestRender: () => void
  destroy: () => void
  canvas: HTMLCanvasElement
  appContext: ComposerContext
}

function findClickable(modifier: ReadonlyModifier): ClickableElement | null {
  for (let i = 0; i < modifier.size; i++) {
    const el = modifier.get(i)
    if (el.kind === 'input' && el.name === 'clickable') {
      return el as ClickableElement
    }
  }
  return null
}

export function setContent(
  canvas: HTMLCanvasElement,
  appComposable: (ctx: CompositionContext) => void,
): AppHost {
  const density = createDensity()
  const dpr = density.scale
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

  const rootComposable = composable<Record<string, never>>((ctx: CompositionContext) => {
    rootCtx = ctx
    appComposable(rootCtx)
  })
  rootComposable({}, appCtx)

  const dispatcher = createPointerEventDispatcher()
  dispatcher.attach(canvas)

  const gestureCache = new Map<number, ReturnType<typeof createTapRecognizer>>()

  dispatcher.setHandlerResolver((hitNode: HitTestableNode): PointerInputHandler | null => {
    if (!rootCtx) return null
    const emittedNode = rootCtx.emittedNodes.get(hitNode.id)
    if (!emittedNode) return null
    const clickable = findClickable(emittedNode.modifier)
    if (!clickable) return null

    let recognizer = gestureCache.get(hitNode.id)
    if (!recognizer) {
      recognizer = createTapRecognizer()
      recognizer.onTap = (event) => {
        clickable.onClick(event)
        requestRender()
      }
      gestureCache.set(hitNode.id, recognizer)
    }

    return (eventData) => { recognizer.addPointerEvent(eventData) }
  })

  let needsRender = true

  function render(): void {
    if (!needsRender) return
    needsRender = false
    appCtx.recomposer.performRecompose()
    host.clear()
    if (rootCtx && rootCtx.rootNodeId !== null) {
      const result = renderEmittedTree(host.ctx, rootCtx.emittedNodes, rootCtx.rootNodeId, width, height)
      host.render(result.commands)
      dispatcher.setRootNode(result.hitTestRoot)
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

  const originalScheduleRecompose = appCtx.recomposer.scheduleRecompose.bind(appCtx.recomposer)
  appCtx.recomposer.scheduleRecompose = (scope) => {
    originalScheduleRecompose(scope)
    requestRender()
  }

  window.addEventListener('resize', handleResize)
  render()

  function destroy(): void {
    window.removeEventListener('resize', handleResize)
    dispatcher.dispose()
    for (const r of gestureCache.values()) {
      r.dispose()
    }
    gestureCache.clear()
  }

  return { requestRender, destroy, canvas, appContext: appCtx }
}
