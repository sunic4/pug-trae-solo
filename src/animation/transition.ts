import type { AnimationSpec } from '@/animation/animation-spec'
import { Animatable } from '@/animation/animatable'
import { tween } from '@/animation/animation-spec'

type ContentKey = string | number

interface CrossfadeState {
  readonly key: ContentKey
  readonly alpha: number
}

interface CrossfadeComponent {
  readonly kind: 'crossfade'
  readonly targetState: ContentKey
  readonly animationSpec: AnimationSpec<number>
  readonly currentAlpha: number
  readonly states: ReadonlyArray<CrossfadeState>
}

const DEFAULT_TRANSITION_SPEC: AnimationSpec<number> = tween({ durationMillis: 300 })

class CrossfadeController {
  private _currentKey: ContentKey
  private _alpha: Animatable
  private _states: CrossfadeState[] = []

  constructor(initialKey: ContentKey, spec: AnimationSpec<number> = DEFAULT_TRANSITION_SPEC) {
    this._currentKey = initialKey
    this._alpha = new Animatable(1, spec)
    this._states = [{ key: initialKey, alpha: 1 }]
  }

  get currentKey(): ContentKey {
    return this._currentKey
  }

  get currentAlpha(): number {
    return this._alpha.value
  }

  get states(): ReadonlyArray<CrossfadeState> {
    return this._states
  }

  setTarget(targetKey: ContentKey): void {
    if (targetKey === this._currentKey) return
    this._currentKey = targetKey
    this._states = this._states.map((s) => ({
      ...s,
      alpha: s.key === targetKey ? 1 : 0,
    }))
    if (!this._states.some((s) => s.key === targetKey)) {
      this._states.push({ key: targetKey, alpha: 1 })
    }
  }

  snapTo(key: ContentKey): void {
    this._currentKey = key
    this._alpha.snapTo(1)
    this._states = [{ key, alpha: 1 }]
  }
}

function Crossfade(
  targetState: ContentKey,
  animationSpec: AnimationSpec<number> = DEFAULT_TRANSITION_SPEC,
): CrossfadeComponent {
  return {
    kind: 'crossfade',
    targetState,
    animationSpec,
    currentAlpha: 1,
    states: [{ key: targetState, alpha: 1 }],
  }
}

interface AnimatedContentState {
  readonly key: ContentKey
  readonly enterProgress: number
  readonly exitProgress: number
}

interface AnimatedContentComponent {
  readonly kind: 'animated-content'
  readonly targetState: ContentKey
  readonly animationSpec: AnimationSpec<number>
  readonly states: ReadonlyArray<AnimatedContentState>
}

class AnimatedContentController {
  private _currentKey: ContentKey
  private _enterAnimatable: Animatable
  private _states: AnimatedContentState[] = []

  constructor(initialKey: ContentKey, spec: AnimationSpec<number> = DEFAULT_TRANSITION_SPEC) {
    this._currentKey = initialKey
    this._enterAnimatable = new Animatable(1, spec)
    this._states = [{ key: initialKey, enterProgress: 1, exitProgress: 0 }]
  }

  get currentKey(): ContentKey {
    return this._currentKey
  }

  get states(): ReadonlyArray<AnimatedContentState> {
    return this._states
  }

  setTarget(targetKey: ContentKey): void {
    if (targetKey === this._currentKey) return
    const oldKey = this._currentKey
    this._currentKey = targetKey
    this._states = [
      { key: oldKey, enterProgress: 1, exitProgress: 1 },
      { key: targetKey, enterProgress: 1, exitProgress: 0 },
    ]
  }

  snapTo(key: ContentKey): void {
    this._currentKey = key
    this._enterAnimatable.snapTo(1)
    this._states = [{ key, enterProgress: 1, exitProgress: 0 }]
  }
}

function AnimatedContent(
  targetState: ContentKey,
  animationSpec: AnimationSpec<number> = DEFAULT_TRANSITION_SPEC,
): AnimatedContentComponent {
  return {
    kind: 'animated-content',
    targetState,
    animationSpec,
    states: [{ key: targetState, enterProgress: 1, exitProgress: 0 }],
  }
}

export type { CrossfadeComponent, CrossfadeState, AnimatedContentComponent, AnimatedContentState, ContentKey }
export { Crossfade, CrossfadeController, AnimatedContent, AnimatedContentController }
