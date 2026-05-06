import { describe, it, expect } from 'vitest'
import { Crossfade, CrossfadeController, AnimatedContent, AnimatedContentController } from '@/animation/transition'
import { tween } from '@/animation/animation-spec'

describe('Crossfade', () => {
  it('should have default animation spec', () => {
    const cf = Crossfade('page1')
    expect(cf.animationSpec).toBeDefined()
  })

  it('should accept custom animation spec', () => {
    const spec = tween({ durationMillis: 500 })
    const cf = Crossfade('page1', spec)
    expect(cf.animationSpec).toBe(spec)
  })

  it('should have initial state with alpha 1', () => {
    const cf = Crossfade('page1')
    expect(cf.states.length).toBe(1)
    expect(cf.states[0]!.alpha).toBe(1)
  })

  it('should support numeric keys', () => {
    const cf = Crossfade(0)
    expect(cf.targetState).toBe(0)
  })
})

describe('CrossfadeController', () => {
  it('should initialize with key', () => {
    const ctrl = new CrossfadeController('page1')
    expect(ctrl.currentKey).toBe('page1')
  })

  it('should snap to key', () => {
    const ctrl = new CrossfadeController('page1')
    ctrl.snapTo('page2')
    expect(ctrl.currentKey).toBe('page2')
    expect(ctrl.states.length).toBe(1)
    expect(ctrl.states[0]!.key).toBe('page2')
  })

  it('should set target and update states', () => {
    const ctrl = new CrossfadeController('page1')
    ctrl.setTarget('page2')
    expect(ctrl.currentKey).toBe('page2')
    const page2State = ctrl.states.find((s) => s.key === 'page2')
    expect(page2State).toBeDefined()
    expect(page2State!.alpha).toBe(1)
  })

  it('should not change when setting same target', () => {
    const ctrl = new CrossfadeController('page1')
    ctrl.setTarget('page1')
    expect(ctrl.states.length).toBe(1)
  })

  it('should add new key to states on target change', () => {
    const ctrl = new CrossfadeController('page1')
    ctrl.setTarget('page2')
    const hasPage2 = ctrl.states.some((s) => s.key === 'page2')
    expect(hasPage2).toBe(true)
  })

  it('should fade out old key on target change', () => {
    const ctrl = new CrossfadeController('page1')
    ctrl.setTarget('page2')
    const page1State = ctrl.states.find((s) => s.key === 'page1')
    expect(page1State!.alpha).toBe(0)
  })
})

describe('AnimatedContent', () => {
  it('should create with target state', () => {
    const ac = AnimatedContent('step1')
    expect(ac.kind).toBe('animated-content')
    expect(ac.targetState).toBe('step1')
  })

  it('should have default animation spec', () => {
    const ac = AnimatedContent('step1')
    expect(ac.animationSpec).toBeDefined()
  })

  it('should accept custom animation spec', () => {
    const spec = tween({ durationMillis: 400 })
    const ac = AnimatedContent('step1', spec)
    expect(ac.animationSpec).toBe(spec)
  })

  it('should have initial state with enterProgress 1', () => {
    const ac = AnimatedContent('step1')
    expect(ac.states.length).toBe(1)
    expect(ac.states[0]!.enterProgress).toBe(1)
    expect(ac.states[0]!.exitProgress).toBe(0)
  })
})

describe('AnimatedContentController', () => {
  it('should initialize with key', () => {
    const ctrl = new AnimatedContentController('step1')
    expect(ctrl.currentKey).toBe('step1')
  })

  it('should snap to key', () => {
    const ctrl = new AnimatedContentController('step1')
    ctrl.snapTo('step2')
    expect(ctrl.currentKey).toBe('step2')
    expect(ctrl.states.length).toBe(1)
    expect(ctrl.states[0]!.key).toBe('step2')
  })

  it('should set target and create two states', () => {
    const ctrl = new AnimatedContentController('step1')
    ctrl.setTarget('step2')
    expect(ctrl.currentKey).toBe('step2')
    expect(ctrl.states.length).toBe(2)
  })

  it('should mark old state as exiting', () => {
    const ctrl = new AnimatedContentController('step1')
    ctrl.setTarget('step2')
    const oldState = ctrl.states.find((s) => s.key === 'step1')
    expect(oldState!.exitProgress).toBe(1)
  })

  it('should mark new state as entering', () => {
    const ctrl = new AnimatedContentController('step1')
    ctrl.setTarget('step2')
    const newState = ctrl.states.find((s) => s.key === 'step2')
    expect(newState!.enterProgress).toBe(1)
  })

  it('should not change when setting same target', () => {
    const ctrl = new AnimatedContentController('step1')
    ctrl.setTarget('step1')
    expect(ctrl.states.length).toBe(1)
  })
})
