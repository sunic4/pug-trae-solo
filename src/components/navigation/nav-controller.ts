import type { ComponentBase, ComponentNode, ChildLayout, MeasuredSizeMap } from '@/components/basic/types'
import { DEFAULT_MODIFIER, normalizeModifier } from '@/components/shared/imports'
import type { ReadonlyModifier } from '@/layout/modifier'
import type { MeasurePolicy, Measurable, Constraints, MeasureResult } from '@/layout/types'
import { createMeasureResult } from '@/layout/measure'
import { createMeasurePolicy } from '@/layout/simple-measure-policy'
import { NOOP_DRAW_POLICY } from '@/components/basic/types'
import type { Rect } from '@/renderer/types'
import { layoutColumnChildren } from '@/components/shared/layout-helpers'

interface NavDestination {
  readonly route: string
  readonly content: ComponentNode[]
}

interface NavGraph {
  readonly startRoute: string
  readonly destinations: ReadonlyMap<string, NavDestination>
  findDestination(route: string): NavDestination | undefined
}

class NavGraphImpl implements NavGraph {
  readonly startRoute: string
  readonly destinations: ReadonlyMap<string, NavDestination>

  constructor(startRoute: string, destinations: NavDestination[]) {
    this.startRoute = startRoute
    const map = new Map<string, NavDestination>()
    for (const d of destinations) {
      map.set(d.route, d)
    }
    this.destinations = map
  }

  findDestination(route: string): NavDestination | undefined {
    return this.destinations.get(route)
  }
}

function createNavGraph(startRoute: string, destinations: NavDestination[]): NavGraph {
  return new NavGraphImpl(startRoute, destinations)
}

const MAX_BACK_STACK_SIZE = 50

interface NavController {
  readonly currentRoute: string
  readonly backStack: readonly string[]
  readonly canPop: boolean
  navigate(route: string): void
  popBackStack(): boolean
  replace(route: string): void
  popTo(route: string): boolean
}

class NavControllerImpl implements NavController {
  private _backStack: string[]

  constructor(startRoute: string) {
    this._backStack = [startRoute]
  }

  get currentRoute(): string {
    return this._backStack[this._backStack.length - 1] ?? ''
  }

  get backStack(): readonly string[] {
    return this._backStack
  }

  get canPop(): boolean {
    return this._backStack.length > 1
  }

  navigate(route: string): void {
    if (this._backStack.length >= MAX_BACK_STACK_SIZE) {
      this._backStack.shift()
    }
    this._backStack.push(route)
  }

  popBackStack(): boolean {
    if (!this.canPop) return false
    this._backStack.pop()
    return true
  }

  replace(route: string): void {
    if (this._backStack.length > 0) {
      this._backStack[this._backStack.length - 1] = route
    } else {
      this._backStack.push(route)
    }
  }

  popTo(route: string): boolean {
    const index = this._backStack.lastIndexOf(route)
    if (index < 0) return false
    this._backStack = this._backStack.slice(0, index + 1)
    return true
  }
}

function createNavController(startRoute: string): NavController {
  return new NavControllerImpl(startRoute)
}

function navHostMeasurePolicy(): MeasurePolicy {
  return createMeasurePolicy({
    measure(_measurables: Measurable[], constraints: Constraints): MeasureResult {
      return createMeasureResult(constraints.maxWidth, constraints.maxHeight)
    },
    minIntrinsicWidth(): number {
      return 0
    },
    minIntrinsicHeight(): number {
      return 0
    },
  })
}

type NavHostComponent = {
  readonly kind: 'nav-host'
  readonly navController: NavController
  readonly navGraph: NavGraph
  readonly currentDestination: NavDestination | undefined
} & ComponentBase

function NavHost(
  navController: NavController,
  navGraph: NavGraph,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
): NavHostComponent {
  const mod = normalizeModifier(modifier)
  const currentDestination = navGraph.findDestination(navController.currentRoute)
  return {
    kind: 'nav-host',
    navController,
    navGraph,
    modifier: mod,
    currentDestination,
    measurePolicy: navHostMeasurePolicy(),
    drawPolicy: NOOP_DRAW_POLICY,
    getChildren(): ComponentNode[] {
      return this.currentDestination?.content ?? []
    },
    layoutChildren(contentArea: Rect, measuredSizes: MeasuredSizeMap): ChildLayout[] {
      return layoutColumnChildren(this.getChildren(), contentArea, measuredSizes, 'start')
    },
  }
}

export type { NavDestination, NavGraph, NavController, NavHostComponent }
export { createNavGraph, createNavController, NavHost, MAX_BACK_STACK_SIZE }
