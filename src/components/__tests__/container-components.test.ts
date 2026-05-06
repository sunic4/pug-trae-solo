import { describe, it, expect } from 'vitest'
import { Card } from '@/components/container/card'
import { TopAppBar } from '@/components/container/index'
import { BottomNavigation } from '@/components/container/bottom-navigation'
import { Box } from '@/components/basic/box'
import { Modifier } from '@/layout/modifier'
import { Text } from '@/components/basic/text'
import { Scaffold } from '@/components/container/scaffold'
import { TabRow } from '@/components/container/tab-row'
import { hasModifierElement } from '@/test-utils'

describe('Card', () => {
  it('should create a card with default params', () => {
    const card = Card()
    expect(card.kind).toBe('card')
    expect(card.color).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(card.elevation).toBe(1)
    expect(card.borderRadius).toBe(8)
    expect(card.alignment).toBe('start')
    expect(card.children).toEqual([])
  })

  it('should create a card with custom color and elevation', () => {
    const color = { r: 200, g: 200, b: 200, a: 1 }
    const card = Card(Modifier.create().freeze(), color, 4, 16)
    expect(card.color).toEqual(color)
    expect(card.elevation).toBe(4)
    expect(card.borderRadius).toBe(16)
  })

  it('should create a card with children', () => {
    const card = Card(
      Modifier.create().freeze(),
      undefined,
      1,
      8,
      'center',
      [Text('Title'), Text('Body')],
    )
    expect(card.children.length).toBe(2)
  })

  it('should have a measure policy', () => {
    const card = Card()
    expect(card.measurePolicy).toBeDefined()
    expect(typeof card.measurePolicy.measure).toBe('function')
    expect(typeof card.measurePolicy.measureWithWeights).toBe('function')
  })

  it('should include background and clip in modifier', () => {
    const card = Card(Modifier.create().freeze(), undefined, 1, 8)
    expect(hasModifierElement(card.modifier, 'draw', 'background')).toBe(true)
    expect(hasModifierElement(card.modifier, 'draw', 'clip')).toBe(true)
  })

  it('should include shadow element when elevation > 0', () => {
    const card = Card(Modifier.create().freeze(), undefined, 4, 8)
    expect(hasModifierElement(card.modifier, 'draw', 'shadow')).toBe(true)
  })

  it('should not include shadow element when elevation is 0', () => {
    const card = Card(Modifier.create().freeze(), undefined, 0, 8)
    expect(hasModifierElement(card.modifier, 'draw', 'shadow')).toBe(false)
  })
})

describe('Scaffold', () => {
  it('should create a scaffold with default params', () => {
    const scaffold = Scaffold()
    expect(scaffold.kind).toBe('scaffold')
    expect(scaffold.topBar).toBeNull()
    expect(scaffold.bottomBar).toBeNull()
    expect(scaffold.snackbarHost).toBeNull()
    expect(scaffold.content).toEqual([])
  })

  it('should create a scaffold with topBar', () => {
    const topBar = Box(Modifier.create().freeze(), 'center', [Text('AppBar')])
    const scaffold = Scaffold(Modifier.create().freeze(), topBar)
    expect(scaffold.topBar).not.toBeNull()
    expect(scaffold.topBar!.kind).toBe('box')
  })

  it('should create a scaffold with bottomBar', () => {
    const bottomBar = Box(Modifier.create().freeze(), 'center', [Text('Nav')])
    const scaffold = Scaffold(Modifier.create().freeze(), null, [], bottomBar)
    expect(scaffold.bottomBar).not.toBeNull()
    expect(scaffold.bottomBar!.kind).toBe('box')
  })

  it('should create a scaffold with content', () => {
    const scaffold = Scaffold(
      Modifier.create().freeze(),
      null,
      [Text('Content A'), Text('Content B')],
    )
    expect(scaffold.content.length).toBe(2)
  })

  it('should have a measure policy', () => {
    const scaffold = Scaffold()
    expect(scaffold.measurePolicy).toBeDefined()
    expect(typeof scaffold.measurePolicy.measure).toBe('function')
  })

  it('should measure scaffold with all slots', () => {
    const topBar = Box(Modifier.create().freeze(), 'center', [Text('Top')])
    const bottomBar = Box(Modifier.create().freeze(), 'center', [Text('Bottom')])
    const scaffold = Scaffold(Modifier.create().freeze(), topBar, [Text('Body')], bottomBar)
    const result = scaffold.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 360, minHeight: 0, maxHeight: 640,
    })
    expect(result.width).toBe(360)
    expect(result.height).toBe(640)
  })
})

describe('TopAppBar', () => {
  it('should create a top app bar with default params', () => {
    const appBar = TopAppBar('Title')
    expect(appBar.kind).toBe('top-app-bar')
    expect(appBar.title).toBe('Title')
    expect(appBar.navigationIcon).toBeNull()
    expect(appBar.actions).toEqual([])
    expect(appBar.elevation).toBe(0)
  })

  it('should create a top app bar with navigation icon', () => {
    const navIcon = Box(Modifier.create().freeze(), 'center', [Text('←')])
    const appBar = TopAppBar('Title', Modifier.create().freeze(), navIcon)
    expect(appBar.navigationIcon).not.toBeNull()
  })

  it('should create a top app bar with actions', () => {
    const actions = [Box(Modifier.create().freeze(), 'center', [Text('A1')])]
    const appBar = TopAppBar('Title', Modifier.create().freeze(), null, actions)
    expect(appBar.actions.length).toBe(1)
  })

  it('should have a measure policy', () => {
    const appBar = TopAppBar('Title')
    expect(appBar.measurePolicy).toBeDefined()
    expect(typeof appBar.measurePolicy.measure).toBe('function')
  })

  it('should measure top app bar', () => {
    const appBar = TopAppBar('Hello')
    const result = appBar.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 360, minHeight: 0, maxHeight: 56,
    })
    expect(result.height).toBe(56)
    expect(result.width).toBeGreaterThan(0)
  })
})

describe('TabRow', () => {
  it('should create a tab row with default params', () => {
    const tabs = [
      { label: 'Tab 1', selected: true, onSelect: () => {} },
      { label: 'Tab 2', selected: false, onSelect: () => {} },
    ]
    const tabRow = TabRow(tabs)
    expect(tabRow.kind).toBe('tab-row')
    expect(tabRow.tabs.length).toBe(2)
    expect(tabRow.selectedIndex).toBe(0)
  })

  it('should create a tab row with custom selectedIndex', () => {
    const tabs = [
      { label: 'A', selected: false, onSelect: () => {} },
      { label: 'B', selected: true, onSelect: () => {} },
    ]
    const tabRow = TabRow(tabs, 1)
    expect(tabRow.selectedIndex).toBe(1)
  })

  it('should have a measure policy', () => {
    const tabRow = TabRow([])
    expect(tabRow.measurePolicy).toBeDefined()
    expect(typeof tabRow.measurePolicy.measure).toBe('function')
  })

  it('should measure tab row', () => {
    const tabs = [
      { label: 'Tab 1', selected: true, onSelect: () => {} },
      { label: 'Tab 2', selected: false, onSelect: () => {} },
    ]
    const tabRow = TabRow(tabs)
    const result = tabRow.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 360, minHeight: 0, maxHeight: 48,
    })
    expect(result.height).toBe(48)
  })
})

describe('BottomNavigation', () => {
  it('should create a bottom navigation with default params', () => {
    const items = [
      { label: 'Home', selected: true, onSelect: () => {} },
      { label: 'Search', selected: false, onSelect: () => {} },
    ]
    const nav = BottomNavigation(items)
    expect(nav.kind).toBe('bottom-navigation')
    expect(nav.items.length).toBe(2)
    expect(nav.selectedIndex).toBe(0)
  })

  it('should create a bottom navigation with custom selectedIndex', () => {
    const items = [
      { label: 'Home', selected: false, onSelect: () => {} },
      { label: 'Search', selected: true, onSelect: () => {} },
    ]
    const nav = BottomNavigation(items, 1)
    expect(nav.selectedIndex).toBe(1)
  })

  it('should have a measure policy', () => {
    const nav = BottomNavigation([])
    expect(nav.measurePolicy).toBeDefined()
    expect(typeof nav.measurePolicy.measure).toBe('function')
  })

  it('should measure bottom navigation', () => {
    const items = [
      { label: 'Home', selected: true, onSelect: () => {} },
      { label: 'Search', selected: false, onSelect: () => {} },
    ]
    const nav = BottomNavigation(items)
    const result = nav.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 360, minHeight: 0, maxHeight: 56,
    })
    expect(result.height).toBe(56)
  })

  it('should include shadow in modifier', () => {
    const items = [{ label: 'Home', selected: true, onSelect: () => {} }]
    const nav = BottomNavigation(items)
    expect(hasModifierElement(nav.modifier, 'draw', 'shadow')).toBe(true)
  })
})

describe('Container component composition', () => {
  it('should compose Scaffold with TopAppBar and BottomNavigation', () => {
    const topBar = TopAppBar('My App', Modifier.create().freeze(), null, [])
    const bottomNav = BottomNavigation([
      { label: 'Home', selected: true, onSelect: () => {} },
      { label: 'Settings', selected: false, onSelect: () => {} },
    ])
    const scaffold = Scaffold(
      Modifier.create().freeze(),
      topBar,
      [Text('Body')],
      bottomNav,
    )
    expect(scaffold.kind).toBe('scaffold')
    expect(scaffold.topBar!.kind).toBe('top-app-bar')
    expect(scaffold.bottomBar!.kind).toBe('bottom-navigation')
  })

  it('should compose Card with content', () => {
    const card = Card(
      Modifier.create().padding(16).freeze(),
      { r: 255, g: 255, b: 255, a: 1 },
      2,
      12,
      'start',
      [Text('Card Title'), Text('Card Body')],
    )
    expect(card.kind).toBe('card')
    expect(card.children.length).toBe(2)
  })
})
