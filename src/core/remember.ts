import type { CompositionContext } from '@/core/composition-context'

type RememberKey = string | number | boolean | null | undefined

interface RememberCache<T> {
  readonly value: T
  readonly keys: readonly RememberKey[]
}

function isRememberCache<T>(value: object): value is RememberCache<T> {
  return 'value' in value && 'keys' in value
}

function remember<T>(ctx: CompositionContext, calculation: () => T, keys?: readonly RememberKey[]): T {
  const scope = ctx.recomposer.currentScope

  if (!scope) {
    return calculation()
  }

  const cache = scope.getRememberCache<RememberCache<T>>(isRememberCache<T>)

  if (cache) {
    if (keys === undefined) {
      return cache.value
    }
    const prevKeys = cache.keys
    if (keys.length === prevKeys.length && keys.every((k, i) => k === prevKeys[i])) {
      return cache.value
    }
  }

  const value = calculation()
  scope.setRememberCache<RememberCache<T>>({ value, keys: keys ?? [] })
  return value
}

export { remember }
export type { RememberKey }
