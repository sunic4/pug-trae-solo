import type { ComposerContext, ComposableFunction, ComposableNode, MutableState, RecomposeScope } from '@/core/types'
import { createSnapshot } from '@/core/snapshot'
import { createRecomposer } from '@/core/recomposer'

function composable<TProps>(
  fn: (props: TProps, ctx: ComposerContext) => ComposableNode | null,
): ComposableFunction<TProps> {
  return (props: TProps, ctx: ComposerContext): ComposableNode | null => {
    let scope: RecomposeScope

    const readObserver = <T>(state: MutableState<T>): void => {
      scope.addDependency(state.id)
    }

    const composeWithTracking = (): ComposableNode | null => {
      return ctx.snapshot.withReadObserver(readObserver, () => {
        try {
          ctx.recomposer.pushScope(scope)
          return fn(props, ctx)
        } finally {
          ctx.recomposer.popScope()
        }
      })
    }

    scope = ctx.recomposer.createScope(composeWithTracking)
    return composeWithTracking()
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
