import { describe, it, expect, vi } from 'vitest'
import { Dialog } from '@/components/index'
import { DropdownMenu } from '@/components/index'
import { Text } from '@/components/basic/index'
import { ModalBottomSheet } from '@/components/overlay/modal-bottom-sheet'
import { Modifier } from '@/layout/modifier'
import { Popup } from '@/components/overlay/popup'
import { hasModifierElement } from '@/test-utils'

describe('Dialog', () => {
  it('should create a dialog with title', () => {
    const onDismiss = vi.fn()
    const dialog = Dialog(onDismiss, 'Confirm')
    expect(dialog.kind).toBe('dialog')
    expect(dialog.title).toBe('Confirm')
  })

  it('should accept content', () => {
    const onDismiss = vi.fn()
    const dialog = Dialog(onDismiss, 'Title', [Text('Body text')])
    expect(dialog.content.length).toBe(1)
  })

  it('should accept buttons', () => {
    const onDismiss = vi.fn()
    const onConfirm = vi.fn()
    const dialog = Dialog(onDismiss, 'Title', [], [
      { label: 'Cancel', onClick: onDismiss },
      { label: 'OK', onClick: onConfirm },
    ])
    expect(dialog.buttons.length).toBe(2)
    expect(dialog.buttons[0]!.label).toBe('Cancel')
    expect(dialog.buttons[1]!.label).toBe('OK')
  })

  it('should have background in modifier', () => {
    const onDismiss = vi.fn()
    const dialog = Dialog(onDismiss, 'Title')
    expect(hasModifierElement(dialog.modifier, 'draw', 'background')).toBe(true)
  })

  it('should have a measure policy', () => {
    const onDismiss = vi.fn()
    const dialog = Dialog(onDismiss, 'Title')
    expect(dialog.measurePolicy).toBeDefined()
    expect(typeof dialog.measurePolicy.measure).toBe('function')
  })

  it('should measure with min width', () => {
    const onDismiss = vi.fn()
    const dialog = Dialog(onDismiss, 'Title')
    const result = dialog.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 600, minHeight: 0, maxHeight: 800,
    })
    expect(result.width).toBeGreaterThanOrEqual(280)
  })
})

describe('ModalBottomSheet', () => {
  it('should create with default peek height', () => {
    const onDismiss = vi.fn()
    const sheet = ModalBottomSheet(onDismiss)
    expect(sheet.kind).toBe('modal-bottom-sheet')
    expect(sheet.peekHeight).toBe(200)
  })

  it('should accept custom peek height', () => {
    const onDismiss = vi.fn()
    const sheet = ModalBottomSheet(onDismiss, [], Modifier.create().freeze(), 300)
    expect(sheet.peekHeight).toBe(300)
  })

  it('should accept content', () => {
    const onDismiss = vi.fn()
    const sheet = ModalBottomSheet(onDismiss, [Text('Sheet content')])
    expect(sheet.content.length).toBe(1)
  })

  it('should have background in modifier', () => {
    const onDismiss = vi.fn()
    const sheet = ModalBottomSheet(onDismiss)
    expect(hasModifierElement(sheet.modifier, 'draw', 'background')).toBe(true)
  })

  it('should have a measure policy', () => {
    const onDismiss = vi.fn()
    const sheet = ModalBottomSheet(onDismiss)
    expect(sheet.measurePolicy).toBeDefined()
    expect(typeof sheet.measurePolicy.measure).toBe('function')
  })

  it('should measure with peek height', () => {
    const onDismiss = vi.fn()
    const sheet = ModalBottomSheet(onDismiss, [], Modifier.create().freeze(), 300)
    const result = sheet.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 400, minHeight: 0, maxHeight: 800,
    })
    expect(result.height).toBeGreaterThanOrEqual(300)
  })
})

describe('DropdownMenu', () => {
  it('should create with items', () => {
    const onDismiss = vi.fn()
    const items = [
      { label: 'Edit', onClick: vi.fn(), enabled: true },
      { label: 'Delete', onClick: vi.fn(), enabled: true },
    ]
    const menu = DropdownMenu(items, true, onDismiss)
    expect(menu.kind).toBe('dropdown-menu')
    expect(menu.items.length).toBe(2)
    expect(menu.expanded).toBe(true)
  })

  it('should support disabled items', () => {
    const onDismiss = vi.fn()
    const items = [
      { label: 'Edit', onClick: vi.fn(), enabled: true },
      { label: 'Delete', onClick: vi.fn(), enabled: false },
    ]
    const menu = DropdownMenu(items, true, onDismiss)
    expect(menu.items[1]!.enabled).toBe(false)
  })

  it('should track expanded state', () => {
    const onDismiss = vi.fn()
    const items = [{ label: 'Item', onClick: vi.fn(), enabled: true }]
    const menu = DropdownMenu(items, false, onDismiss)
    expect(menu.expanded).toBe(false)
  })

  it('should have background in modifier', () => {
    const onDismiss = vi.fn()
    const items = [{ label: 'Item', onClick: vi.fn(), enabled: true }]
    const menu = DropdownMenu(items, true, onDismiss)
    expect(hasModifierElement(menu.modifier, 'draw', 'background')).toBe(true)
  })

  it('should have a measure policy', () => {
    const onDismiss = vi.fn()
    const items = [{ label: 'Item', onClick: vi.fn(), enabled: true }]
    const menu = DropdownMenu(items, true, onDismiss)
    expect(menu.measurePolicy).toBeDefined()
    expect(typeof menu.measurePolicy.measure).toBe('function')
  })

  it('should measure based on item count', () => {
    const onDismiss = vi.fn()
    const items = [
      { label: 'A', onClick: vi.fn(), enabled: true },
      { label: 'B', onClick: vi.fn(), enabled: true },
      { label: 'C', onClick: vi.fn(), enabled: true },
    ]
    const menu = DropdownMenu(items, true, onDismiss)
    const result = menu.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 300, minHeight: 0, maxHeight: 600,
    })
    expect(result.height).toBe(3 * 48)
  })
})

describe('Popup', () => {
  it('should create with default params', () => {
    const popup = Popup()
    expect(popup.kind).toBe('popup')
    expect(popup.alignment).toBe('center')
    expect(popup.offset).toEqual({ x: 0, y: 0 })
  })

  it('should accept content', () => {
    const popup = Popup([Text('Tooltip')])
    expect(popup.content.length).toBe(1)
  })

  it('should accept alignment', () => {
    const popup = Popup([], Modifier.create().freeze(), 'start')
    expect(popup.alignment).toBe('start')
  })

  it('should accept offset', () => {
    const popup = Popup([], Modifier.create().freeze(), 'center', { x: 10, y: 20 })
    expect(popup.offset).toEqual({ x: 10, y: 20 })
  })

  it('should accept onDismissRequest', () => {
    const onDismiss = vi.fn()
    const popup = Popup([], Modifier.create().freeze(), 'center', { x: 0, y: 0 }, onDismiss)
    expect(popup.onDismissRequest).toBe(onDismiss)
  })

  it('should have null onDismissRequest by default', () => {
    const popup = Popup()
    expect(popup.onDismissRequest).toBeNull()
  })

  it('should have a measure policy', () => {
    const popup = Popup()
    expect(popup.measurePolicy).toBeDefined()
    expect(typeof popup.measurePolicy.measure).toBe('function')
  })

  it('should measure empty popup', () => {
    const popup = Popup()
    const result = popup.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 300, minHeight: 0, maxHeight: 600,
    })
    expect(result.width).toBe(0)
    expect(result.height).toBe(0)
  })
})
