import { composable, createAppContext } from '@/core/composable'
import type { ComposerContext, ComposableNode } from '@/core/types'
import { createCanvasHost } from '@/renderer/canvas-host'
import { renderComponentTree } from '@/renderer/component-renderer'
import type { ComponentNode } from '@/components/basic/types'

interface AppHost {
  requestRender: () => void
  destroy: () => void
  canvas: HTMLCanvasElement
  appContext: ComposerContext
}

function isComponentNode(node: ComposableNode): node is ComponentNode {
  return 'modifier' in node && 'measurePolicy' in node && 'drawPolicy' in node
}

export function setContent(
  canvas: HTMLCanvasElement,
  appComposable: (ctx: ComposerContext) => ComposableNode | null,
): AppHost {
  const dpr = window.devicePixelRatio || 1
  let width = canvas.clientWidth
  let height = canvas.clientHeight

  canvas.width = width * dpr
  canvas.height = height * dpr
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get 2D context')
  ctx.scale(dpr, dpr)

  const host = createCanvasHost(canvas, ctx)
  const appCtx = createAppContext({ canvas })

  const wrappedComposable = composable<{}>((_props, ctx) => {
    return appComposable(ctx)
  })

  let needsRender = true

  function render(): void {
    if (!needsRender) return
    needsRender = false
    host.clear()
    const node = wrappedComposable({}, appCtx)
    if (node && isComponentNode(node)) {
      const commands = renderComponentTree(host.ctx, node, width, height)
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
    if (ctx) {
      ctx.scale(dpr, dpr)
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
