import { describe, it, expect, beforeEach } from 'vitest'
import {
  createSemanticsNode,
  createSemanticsTree,
  createAccessibilityManager,
} from '@/platform/accessibility'
import type { AccessibilityManager } from '@/platform/accessibility'
import { createIdGenerator } from '@/core/id-generator'
import type { SemanticsNode, SemanticsTree } from '@/platform/accessibility'

describe('SemanticsNode', () => {
  it('creates node with properties', () => {
    const node = createSemanticsNode({ role: 'button', label: 'Submit' })
    expect(node.properties.role).toBe('button')
    expect(node.properties.label).toBe('Submit')
  })

  it('creates node with default empty properties', () => {
    const node = createSemanticsNode()
    expect(node.properties.role).toBeUndefined()
    expect(node.children).toHaveLength(0)
    expect(node.parent).toBeNull()
  })

  it('assigns unique ids', () => {
    const idGen = createIdGenerator()
    const n1 = createSemanticsNode({}, idGen)
    const n2 = createSemanticsNode({}, idGen)
    expect(n1.id).not.toBe(n2.id)
  })

  it('addChild sets parent and adds to children', () => {
    const parent = createSemanticsNode({ role: 'list' })
    const child = createSemanticsNode({ role: 'listItem', label: 'Item 1' })
    parent.addChild(child)
    expect(parent.children).toHaveLength(1)
    expect(child.parent).toBe(parent)
  })

  it('removeChild removes child and clears parent', () => {
    const parent = createSemanticsNode({ role: 'list' })
    const child = createSemanticsNode({ role: 'listItem' })
    parent.addChild(child)
    parent.removeChild(child.id)
    expect(parent.children).toHaveLength(0)
    expect(child.parent).toBeNull()
  })

  it('find returns node by id', () => {
    const idGen = createIdGenerator()
    const root = createSemanticsNode({ role: 'navigation' }, idGen)
    const child = createSemanticsNode({ role: 'button', label: 'Home' }, idGen)
    root.addChild(child)
    expect(root.find(child.id)).toBe(child)
  })

  it('find returns undefined for non-existent id', () => {
    const root = createSemanticsNode()
    expect(root.find(99999)).toBeUndefined()
  })

  it('find searches recursively', () => {
    const idGen = createIdGenerator()
    const root = createSemanticsNode({}, idGen)
    const child = createSemanticsNode({}, idGen)
    const grandchild = createSemanticsNode({ label: 'Deep' }, idGen)
    root.addChild(child)
    child.addChild(grandchild)
    expect(root.find(grandchild.id)).toBe(grandchild)
  })

  describe('toAriaAttributes', () => {
    it('maps role to role attribute', () => {
      const node = createSemanticsNode({ role: 'button' })
      expect(node.toAriaAttributes()).toEqual({ role: 'button' })
    })

    it('maps label to aria-label', () => {
      const node = createSemanticsNode({ label: 'Submit' })
      expect(node.toAriaAttributes()).toEqual({ 'aria-label': 'Submit' })
    })

    it('maps enabled=false to aria-disabled', () => {
      const node = createSemanticsNode({ enabled: false })
      expect(node.toAriaAttributes()).toEqual({ 'aria-disabled': 'true' })
    })

    it('maps checked=true to aria-checked', () => {
      const node = createSemanticsNode({ checked: true })
      expect(node.toAriaAttributes()).toEqual({ 'aria-checked': 'true' })
    })

    it('maps checked=mixed to aria-checked=mixed', () => {
      const node = createSemanticsNode({ checked: 'mixed' })
      expect(node.toAriaAttributes()).toEqual({ 'aria-checked': 'mixed' })
    })

    it('maps selected=true to aria-selected', () => {
      const node = createSemanticsNode({ selected: true })
      expect(node.toAriaAttributes()).toEqual({ 'aria-selected': 'true' })
    })

    it('maps focused=true to aria-focused', () => {
      const node = createSemanticsNode({ focused: true })
      expect(node.toAriaAttributes()).toEqual({ 'aria-focused': 'true' })
    })

    it('maps value to aria-valuetext', () => {
      const node = createSemanticsNode({ value: '50%' })
      expect(node.toAriaAttributes()).toEqual({ 'aria-valuetext': '50%' })
    })

    it('maps hint to aria-description', () => {
      const node = createSemanticsNode({ hint: 'Double click to edit' })
      expect(node.toAriaAttributes()).toEqual({ 'aria-description': 'Double click to edit' })
    })

    it('returns empty object for empty properties', () => {
      const node = createSemanticsNode()
      expect(node.toAriaAttributes()).toEqual({})
    })

    it('maps all properties together', () => {
      const node = createSemanticsNode({
        role: 'checkbox',
        label: 'Accept terms',
        checked: true,
        enabled: true,
      })
      const attrs = node.toAriaAttributes()
      expect(attrs['role']).toBe('checkbox')
      expect(attrs['aria-label']).toBe('Accept terms')
      expect(attrs['aria-checked']).toBe('true')
    })
  })
})

describe('SemanticsTree', () => {
  it('creates tree with root', () => {
    const tree = createSemanticsTree({ role: 'navigation' })
    expect(tree.root.properties.role).toBe('navigation')
  })

  it('find searches from root', () => {
    const idGen = createIdGenerator()
    const tree = createSemanticsTree({ role: 'list' }, idGen)
    const child = createSemanticsNode({ label: 'Item' }, idGen)
    tree.root.addChild(child)
    expect(tree.find(child.id)).toBe(child)
  })

  it('collectLabels gathers all labels', () => {
    const tree = createSemanticsTree({ role: 'list' })
    tree.root.addChild(createSemanticsNode({ label: 'Item 1' }))
    tree.root.addChild(createSemanticsNode({ label: 'Item 2' }))
    tree.root.addChild(createSemanticsNode({ role: 'button' }))
    const labels = tree.collectLabels()
    expect(labels).toEqual(['Item 1', 'Item 2'])
  })

  it('traverse visits all nodes with depth', () => {
    const tree = createSemanticsTree({ role: 'list' })
    const child = createSemanticsNode({ role: 'listItem' })
    const grandchild = createSemanticsNode({ role: 'text' })
    tree.root.addChild(child)
    child.addChild(grandchild)

    const visited: Array<{ id: number; depth: number }> = []
    tree.traverse((node, depth) => {
      visited.push({ id: node.id, depth })
    })
    expect(visited).toHaveLength(3)
    expect(visited[0]!.depth).toBe(0)
    expect(visited[1]!.depth).toBe(1)
    expect(visited[2]!.depth).toBe(2)
  })

  it('collectLabels returns empty for tree without labels', () => {
    const tree = createSemanticsTree()
    expect(tree.collectLabels()).toEqual([])
  })
})

describe('AccessibilityManager', () => {
  let manager: AccessibilityManager

  beforeEach(() => {
    manager = createAccessibilityManager()
  })

  it('creates manager with default tree', () => {
    expect(manager.tree).toBeDefined()
    expect(manager.focusedNodeId).toBeNull()
  })

  it('creates manager with custom tree', () => {
    const tree = createSemanticsTree({ role: 'navigation' })
    const mgr = createAccessibilityManager(tree)
    expect(mgr.tree).toBe(tree)
  })

  it('focusNode sets focused node', () => {
    const idGen = createIdGenerator()
    const mgr = createAccessibilityManager(undefined, idGen)
    const child = createSemanticsNode({ role: 'button', label: 'Click' }, idGen)
    mgr.tree.root.addChild(child)
    mgr.focusNode(child.id)
    expect(mgr.focusedNodeId).toBe(child.id)
    expect(child.properties.focused).toBe(true)
  })

  it('focusNode unfocuses previous node', () => {
    const idGen = createIdGenerator()
    const mgr = createAccessibilityManager(undefined, idGen)
    const child1 = createSemanticsNode({ role: 'button', label: 'A', focused: true }, idGen)
    const child2 = createSemanticsNode({ role: 'button', label: 'B' }, idGen)
    mgr.tree.root.addChild(child1)
    mgr.tree.root.addChild(child2)
    mgr.focusNode(child1.id)
    mgr.focusNode(child2.id)
    expect(child1.properties.focused).toBe(false)
    expect(child2.properties.focused).toBe(true)
    expect(mgr.focusedNodeId).toBe(child2.id)
  })

  it('focusNode ignores non-existent id', () => {
    manager.focusNode(99999)
    expect(manager.focusedNodeId).toBeNull()
  })

  it('announce stores message', () => {
    manager.announce('Page loaded')
  })

  it('getAriaTree returns ARIA attributes for all nodes', () => {
    const tree = createSemanticsTree({ role: 'list' })
    tree.root.addChild(createSemanticsNode({ role: 'listItem', label: 'Item 1' }))
    tree.root.addChild(createSemanticsNode({ role: 'listItem', label: 'Item 2' }))
    const mgr = createAccessibilityManager(tree)
    const ariaTree = mgr.getAriaTree()
    expect(ariaTree.length).toBe(3)
    expect(ariaTree[0]).toEqual({ role: 'list' })
    expect(ariaTree[1]).toEqual({ role: 'listItem', 'aria-label': 'Item 1' })
  })

  it('getAriaTree skips nodes without ARIA attributes', () => {
    const tree = createSemanticsTree()
    tree.root.addChild(createSemanticsNode())
    const mgr = createAccessibilityManager(tree)
    const ariaTree = mgr.getAriaTree()
    expect(ariaTree).toHaveLength(0)
  })
})
