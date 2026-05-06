import { describe, it, expect } from 'vitest'
import { createNavGraph, createNavController, NavHost, MAX_BACK_STACK_SIZE } from '@/components/navigation/nav-controller'
import type { NavController, NavDestination } from '@/components/navigation/nav-controller'
import { Box } from '@/components/basic/box'
import type { NavGraph } from '@/components/navigation/nav-controller'

describe('NavGraph', () => {
  it('creates graph with start route', () => {
    const graph = createNavGraph('home', [
      { route: 'home', content: [Box()] },
    ])
    expect(graph.startRoute).toBe('home')
    expect(graph.destinations.size).toBe(1)
  })

  it('finds destination by route', () => {
    const dest: NavDestination = { route: 'home', content: [Box()] }
    const graph = createNavGraph('home', [dest])
    expect(graph.findDestination('home')).toBe(dest)
  })

  it('returns undefined for unknown route', () => {
    const graph = createNavGraph('home', [
      { route: 'home', content: [Box()] },
    ])
    expect(graph.findDestination('unknown')).toBeUndefined()
  })

  it('supports multiple destinations', () => {
    const graph = createNavGraph('home', [
      { route: 'home', content: [Box()] },
      { route: 'detail', content: [Box()] },
      { route: 'settings', content: [Box()] },
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
  it('creates NavHost component', () => {
    const navController = createNavController('home')
    const navGraph = createNavGraph('home', [
      { route: 'home', content: [Box()] },
    ])
    const host = NavHost(navController, navGraph)
    expect(host.kind).toBe('nav-host')
    expect(host.navController).toBe(navController)
    expect(host.navGraph).toBe(navGraph)
  })

  it('resolves current destination', () => {
    const homeDest: NavDestination = { route: 'home', content: [Box()] }
    const navController = createNavController('home')
    const navGraph = createNavGraph('home', [homeDest])
    const host = NavHost(navController, navGraph)
    expect(host.currentDestination).toBe(homeDest)
  })

  it('returns undefined for unknown current route', () => {
    const navController = createNavController('unknown')
    const navGraph = createNavGraph('home', [
      { route: 'home', content: [Box()] },
    ])
    const host = NavHost(navController, navGraph)
    expect(host.currentDestination).toBeUndefined()
  })

  it('updates destination after navigation', () => {
    const detailDest: NavDestination = { route: 'detail', content: [Box()] }
    const navController = createNavController('home')
    const navGraph = createNavGraph('home', [
      { route: 'home', content: [Box()] },
      detailDest,
    ])
    navController.navigate('detail')
    const host = NavHost(navController, navGraph)
    expect(host.currentDestination).toBe(detailDest)
  })
})
