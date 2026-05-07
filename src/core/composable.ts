import type { ComposerContext, ComposableFunction, ComposableNode, MutableState, RecomposeScope } from '@/core/types'
import { createSnapshot } from '@/core/snapshot'
import { createRecomposer } from '@/core/recomposer'
import { CompositionContextImpl } from '@/core/composition-context'
import type { CompositionContext } from '@/core/composition-context'

function composable<TProps>(
  fn: (ctx: CompositionContext, props: TProps) => void,
): ComposableFunction<TProps> {
  return (_props: TProps, ctx: ComposerContext): ComposableNode | null => {
    const compositionCtx = new CompositionContextImpl(ctx.snapshot, ctx.recomposer)
    let scope: RecomposeScope

    const readObserver = <T>(state: MutableState<T>): void => {
      scope.addDependency(state.id)
    }

    const composeWithTracking = (): void => {
      ctx.snapshot.withReadObserver(readObserver, () => {
        try {
          ctx.recomposer.pushScope(scope)
          fn(compositionCtx, _props)
        } finally {
          ctx.recomposer.popScope()
        }
      })
    }

    scope = ctx.recomposer.createScope(composeWithTracking)
    composeWithTracking()

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
