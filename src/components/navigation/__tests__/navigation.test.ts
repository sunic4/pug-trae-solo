import { describe, it, expect } from 'vitest'
import { createNavGraph, createNavController, NavHost, MAX_BACK_STACK_SIZE } from '@/components/navigation/nav-controller'
import type { NavController, NavDestination } from '@/components/navigation/nav-controller'
import { createSnapshot } from '@/core/snapshot'
import { createRecomposer } from '@/core/recomposer'
import { CompositionContextImpl } from '@/core/composition-context'

function createTestCtx() {
  return new CompositionContextImpl(createSnapshot(), createRecomposer())
}

describe('NavGraph', () => {
  it('creates graph with start route', () => {
    const graph = createNavGraph('home', [
      { route: 'home', content: () => {} },
    ])
    expect(graph.startRoute).toBe('home')
    expect(graph.destinations.size).toBe(1)
  })

  it('finds destination by route', () => {
    const dest: NavDestination = { route: 'home', content: () => {} }
    const graph = createNavGraph('home', [dest])
    expect(graph.findDestination('home')).toBe(dest)
  })

  it('returns undefined for unknown route', () => {
    const graph = createNavGraph('home', [
      { route: 'home', content: () => {} },
    ])
    expect(graph.findDestination('unknown')).toBeUndefined()
  })

  it('supports multiple destinations', () => {
    const graph = createNavGraph('home', [
      { route: 'home', content: () => {} },
      { route: 'detail', content: () => {} },
      { route: 'settings', content: () => {} },
    ])
    expect(graph.destinations.size).toBe(3)
    expect(graph.findDestination('detail')).toBeDefined()
    expect(graph.findDestination('settings')).toBeDefined()
  })
})

describe('NavController', () => {
  let controller: NavController

  beforeEach(() => {
    controller = createNavController('home')
  })

  it('initializes with start route', () => {
    expect(controller.currentRoute).toBe('home')
    expect(controller.backStack).toEqual(['home'])
  })

  it('canPop is false with single route', () => {
    expect(controller.canPop).toBe(false)
  })

  it('navigate adds route to back stack', () => {
    controller.navigate('detail')
    expect(controller.currentRoute).toBe('detail')
    expect(controller.backStack).toEqual(['home', 'detail'])
    expect(controller.canPop).toBe(true)
  })

  it('popBackStack removes top route', () => {
    controller.navigate('detail')
    const result = controller.popBackStack()
    expect(result).toBe(true)
    expect(controller.currentRoute).toBe('home')
  })

  it('popBackStack returns false when cannot pop', () => {
    const result = controller.popBackStack()
    expect(result).toBe(false)
    expect(controller.currentRoute).toBe('home')
  })

  it('replace changes top route', () => {
    controller.navigate('detail')
    controller.replace('profile')
    expect(controller.currentRoute).toBe('profile')
    expect(controller.backStack).toEqual(['home', 'profile'])
  })

  it('replace on empty stack pushes route', () => {
    const c = createNavController('home')
    c.popBackStack()
    c.replace('start')
    expect(c.currentRoute).toBe('start')
  })

  it('popTo navigates to existing route', () => {
    controller.navigate('detail')
    controller.navigate('settings')
    controller.navigate('profile')
    const result = controller.popTo('detail')
    expect(result).toBe(true)
    expect(controller.currentRoute).toBe('detail')
    expect(controller.backStack).toEqual(['home', 'detail'])
  })

  it('popTo returns false for non-existent route', () => {
    controller.navigate('detail')
    const result = controller.popTo('unknown')
    expect(result).toBe(false)
    expect(controller.currentRoute).toBe('detail')
  })

  it('popTo keeps target route in stack', () => {
    controller.navigate('detail')
    controller.navigate('settings')
    controller.popTo('home')
    expect(controller.currentRoute).toBe('home')
    expect(controller.backStack).toEqual(['home'])
  })

  it('limits back stack size', () => {
    for (let i = 0; i < MAX_BACK_STACK_SIZE + 5; i++) {
      controller.navigate(`route-${i}`)
    }
    expect(controller.backStack.length).toBeLessThanOrEqual(MAX_BACK_STACK_SIZE)
  })

  it('MAX_BACK_STACK_SIZE is 50', () => {
    expect(MAX_BACK_STACK_SIZE).toBe(50)
  })
})

describe('NavHost', () => {
  it('emits a group node with navController and navGraph data', () => {
    const ctx = createTestCtx()
    const navController = createNavController('home')
    const navGraph = createNavGraph('home', [
      { route: 'home', content: () => {} },
    ])
    NavHost(ctx, navController, navGraph)
    expect(ctx.emittedNodes.size).toBe(1)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { navController: NavController; navGraph: typeof navGraph; currentDestination?: NavDestination }
    expect(data.navController).toBe(navController)
    expect(data.navGraph).toBe(navGraph)
  })

  it('resolves current destination and calls its content', () => {
    const ctx = createTestCtx()
    let contentCalled = false
    const homeDest: NavDestination = { route: 'home', content: () => { contentCalled = true } }
    const navController = createNavController('home')
    const navGraph = createNavGraph('home', [homeDest])
    NavHost(ctx, navController, navGraph)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { currentDestination?: NavDestination }
    expect(data.currentDestination).toBe(homeDest)
    expect(contentCalled).toBe(true)
  })

  it('returns undefined currentDestination for unknown current route', () => {
    const ctx = createTestCtx()
    const navController = createNavController('unknown')
    const navGraph = createNavGraph('home', [
      { route: 'home', content: () => {} },
    ])
    NavHost(ctx, navController, navGraph)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { currentDestination?: NavDestination }
    expect(data.currentDestination).toBeUndefined()
  })

  it('updates destination after navigation', () => {
    const ctx = createTestCtx()
    const detailDest: NavDestination = { route: 'detail', content: () => {} }
    const navController = createNavController('home')
    const navGraph = createNavGraph('home', [
      { route: 'home', content: () => {} },
      detailDest,
    ])
    navController.navigate('detail')
    NavHost(ctx, navController, navGraph)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { currentDestination?: NavDestination }
    expect(data.currentDestination).toBe(detailDest)
  })
})
