import type { ComposerContext, ComposableFunction, ComposableNode } from './types'
import { createSnapshot } from './snapshot'
import { createRecomposer } from './recomposer'
import { CompositionContextImpl } from './composition-context'
import type { CompositionContext } from './composition-context'

function composable<TProps>(
  fn: (ctx: CompositionContext, props: TProps) => void,
): ComposableFunction<TProps> {
  return (_props: TProps, ctx: ComposerContext): ComposableNode | null => {
    const compositionCtx = new CompositionContextImpl(ctx.snapshot, ctx.recomposer)

    const scope = ctx.recomposer.createScope(() => {
      ctx.snapshot.withReadObserver(
        (state) => { scope.addDependency(state.id) },
        () => {
          ctx.recomposer.pushScope(scope)
          try {
            fn(compositionCtx, _props)
          } finally {
            ctx.recomposer.popScope()
          }
        },
      )
    })
    scope.execute()

    return null
  }
}

function sideEffect(ctx: ComposerContext, effect: () => void): void {
  const scope = ctx.recomposer.currentScope
  if (!scope) {
    effect()
    return
  }
  scope.addSideEffect(effect)
}

interface AppContextOptions {
  canvas?: HTMLCanvasElement
}

function createAppContext(_options?: AppContextOptions): ComposerContext {
  const snapshot = createSnapshot()
  const recomposer = createRecomposer()
  return { snapshot, recomposer }
}

export { composable, sideEffect, createAppContext }
export type { CompositionContext }
