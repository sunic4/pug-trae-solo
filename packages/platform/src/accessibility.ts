import type { IdGenerator } from '@pug-canvas-ui/core'
import { createIdGenerator } from '@pug-canvas-ui/core'

type SemanticsRole = 'button' | 'text' | 'image' | 'checkbox' | 'switch' | 'slider' | 'link' | 'header' | 'list' | 'listItem' | 'navigation' | 'dialog'

interface SemanticsProperties {
  readonly role?: SemanticsRole
  readonly label?: string
  readonly value?: string
  readonly hint?: string
  readonly enabled?: boolean
  readonly checked?: boolean | 'mixed'
  readonly selected?: boolean
  readonly focused?: boolean
}

interface SemanticsNode {
  readonly id: number
  properties: SemanticsProperties
  readonly children: SemanticsNode[]
  parent: SemanticsNode | null
  addChild(node: SemanticsNode): void
  removeChild(id: number): void
  find(id: number): SemanticsNode | undefined
  toAriaAttributes(): Record<string, string>
}

class SemanticsNodeImpl implements SemanticsNode {
  readonly id: number
  properties: SemanticsProperties
  readonly children: SemanticsNode[] = []
  parent: SemanticsNode | null = null

  constructor(properties: SemanticsProperties = {}, idGenerator?: IdGenerator) {
    this.id = idGenerator?.nextId() ?? 0
    this.properties = properties
  }

  addChild(node: SemanticsNode): void {
    if (node.parent !== null) {
      const parentImpl = node.parent
      if ('removeChild' in parentImpl) {
        parentImpl.removeChild(node.id)
      }
    }
    node.parent = this
    this.children.push(node)
  }

  removeChild(id: number): void {
    const index = this.children.findIndex(c => c.id === id)
    if (index >= 0) {
      const child = this.children[index]!
      child.parent = null
      this.children.splice(index, 1)
    }
  }

  find(id: number): SemanticsNode | undefined {
    if (this.id === id) return this
    for (const child of this.children) {
      const found = child.find(id)
      if (found !== undefined) return found
    }
    return undefined
  }

  toAriaAttributes(): Record<string, string> {
    const attrs: Record<string, string> = {}
    const p = this.properties
    if (p.role !== undefined) attrs['role'] = p.role
    if (p.label !== undefined) attrs['aria-label'] = p.label
    if (p.value !== undefined) attrs['aria-valuetext'] = p.value
    if (p.hint !== undefined) attrs['aria-description'] = p.hint
    if (p.enabled === false) attrs['aria-disabled'] = 'true'
    if (p.checked === true) attrs['aria-checked'] = 'true'
    else if (p.checked === false) attrs['aria-checked'] = 'false'
    else if (p.checked === 'mixed') attrs['aria-checked'] = 'mixed'
    if (p.selected === true) attrs['aria-selected'] = 'true'
    if (p.focused === true) attrs['aria-focused'] = 'true'
    return attrs
  }
}


function createSemanticsNode(properties?: SemanticsProperties, idGenerator?: IdGenerator): SemanticsNode {
  return new SemanticsNodeImpl(properties, idGenerator)
}

interface SemanticsTree {
  readonly root: SemanticsNode
  find(id: number): SemanticsNode | undefined
  collectLabels(): string[]
  traverse(visitor: (node: SemanticsNode, depth: number) => void): void
}

class SemanticsTreeImpl implements SemanticsTree {
  readonly root: SemanticsNode
  private _idGenerator: IdGenerator

  constructor(rootProperties: SemanticsProperties = {}, idGenerator?: IdGenerator) {
    this._idGenerator = idGenerator ?? createIdGenerator()
    this.root = createSemanticsNode(rootProperties, this._idGenerator)
  }

  find(id: number): SemanticsNode | undefined {
    return this.root.find(id)
  }

  collectLabels(): string[] {
    const labels: string[] = []
    this.traverse((node) => {
      if (node.properties.label !== undefined) {
        labels.push(node.properties.label)
      }
    })
    return labels
  }

  traverse(visitor: (node: SemanticsNode, depth: number) => void): void {
    this._traverseNode(this.root, 0, visitor)
  }

  private _traverseNode(node: SemanticsNode, depth: number, visitor: (node: SemanticsNode, depth: number) => void): void {
    visitor(node, depth)
    for (const child of node.children) {
      this._traverseNode(child, depth + 1, visitor)
    }
  }
}


function createSemanticsTree(rootProperties?: SemanticsProperties, idGenerator?: IdGenerator): SemanticsTree {
  return new SemanticsTreeImpl(rootProperties, idGenerator)
}

interface AccessibilityManager {
  readonly tree: SemanticsTree
  announce(message: string): void
  focusNode(id: number): void
  getAriaTree(): Record<string, string>[]
  readonly focusedNodeId: number | null
}

class AccessibilityManagerImpl implements AccessibilityManager {
  private _idGenerator: IdGenerator
  readonly tree: SemanticsTree
  private _focusedNodeId: number | null = null
  private _announcements: string[] = []

  constructor(tree?: SemanticsTree, idGenerator?: IdGenerator) {
    this._idGenerator = idGenerator ?? createIdGenerator()
    this.tree = tree ?? createSemanticsTree({}, this._idGenerator)
  }

  get focusedNodeId(): number | null {
    return this._focusedNodeId
  }

  announce(message: string): void {
    this._announcements.push(message)
  }

  focusNode(id: number): void {
    const node = this.tree.find(id)
    if (node !== undefined) {
      if (this._focusedNodeId !== null) {
        const prev = this.tree.find(this._focusedNodeId)
        if (prev !== undefined) {
          prev.properties = { ...prev.properties, focused: false }
        }
      }
      node.properties = { ...node.properties, focused: true }
      this._focusedNodeId = id
    }
  }

  getAriaTree(): Record<string, string>[] {
    const result: Record<string, string>[] = []
    this.tree.traverse((node) => {
      const attrs = node.toAriaAttributes()
      if (Object.keys(attrs).length > 0) {
        result.push(attrs)
      }
    })
    return result
  }
}


function createAccessibilityManager(tree?: SemanticsTree, idGenerator?: IdGenerator): AccessibilityManager {
  return new AccessibilityManagerImpl(tree, idGenerator)
}

export type {
  SemanticsRole,
  SemanticsProperties,
  SemanticsNode,
  SemanticsTree,
  AccessibilityManager,
}
export { createSemanticsNode, createSemanticsTree, createAccessibilityManager }
