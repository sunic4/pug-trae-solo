/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  KeyboardEventDataImpl,
  doShortcutsMatch,
  keyboardShortcut,
  createKeyboardManager,
} from '@/input/keyboard'

import type { KeyboardManager, KeyboardHandler, KeyboardEventData } from '@/input/keyboard'

type MockKeyboardEventOptions = Partial<KeyboardEventInit> & {
  type?: string
}

function createMockKeyboardEvent(overrides: MockKeyboardEventOptions = {}): KeyboardEvent {
  const { type: eventType = 'keydown', ...init } = overrides
  return new KeyboardEvent(eventType, {
    key: init.key ?? 'a',
    code: init.code ?? 'KeyA',
    ctrlKey: init.ctrlKey ?? false,
    shiftKey: init.shiftKey ?? false,
    altKey: init.altKey ?? false,
    metaKey: init.metaKey ?? false,
    repeat: init.repeat ?? false,
  })
}

describe('KeyboardEventDataImpl', () => {
  it('wraps native KeyboardEvent properties', () => {
    const native = createMockKeyboardEvent({
      type: 'keydown',
      key: 'Enter',
      code: 'Enter',
      ctrlKey: true,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      repeat: false,
    })
    const data = new KeyboardEventDataImpl(native)
    expect(data.type).toBe('keydown')
    expect(data.key).toBe('Enter')
    expect(data.code).toBe('Enter')
    expect(data.ctrlKey).toBe(true)
    expect(data.shiftKey).toBe(false)
    expect(data.altKey).toBe(false)
    expect(data.metaKey).toBe(false)
    expect(data.repeat).toBe(false)
    expect(data.consumed).toBe(false)
  })

  it('supports consume()', () => {
    const native = createMockKeyboardEvent()
    const data = new KeyboardEventDataImpl(native)
    expect(data.consumed).toBe(false)
    data.consume()
    expect(data.consumed).toBe(true)
  })

  it('handles keyup type', () => {
    const native = createMockKeyboardEvent({ type: 'keyup' })
    const data = new KeyboardEventDataImpl(native)
    expect(data.type).toBe('keyup')
  })
})

describe('doShortcutsMatch', () => {
  it('matches exact key and modifiers', () => {
    const native = createMockKeyboardEvent({
      key: 's',
      ctrlKey: true,
    })
    const event = new KeyboardEventDataImpl(native)
    const shortcut = keyboardShortcut('s', { ctrlKey: true })
    expect(doShortcutsMatch(event, shortcut)).toBe(true)
  })

  it('rejects when modifier differs', () => {
    const native = createMockKeyboardEvent({
      key: 's',
      ctrlKey: true,
      shiftKey: false,
    })
    const event = new KeyboardEventDataImpl(native)
    const shortcut = keyboardShortcut('s', { ctrlKey: true, shiftKey: true })
    expect(doShortcutsMatch(event, shortcut)).toBe(false)
  })

  it('rejects when key differs', () => {
    const native = createMockKeyboardEvent({ key: 'a' })
    const event = new KeyboardEventDataImpl(native)
    const shortcut = keyboardShortcut('b')
    expect(doShortcutsMatch(event, shortcut)).toBe(false)
  })

  it('matches case insensitive key', () => {
    const native = createMockKeyboardEvent({ key: 'A' })
    const event = new KeyboardEventDataImpl(native)
    const shortcut = keyboardShortcut('a')
    expect(doShortcutsMatch(event, shortcut)).toBe(true)
  })

  it('empty shortcut key matches any key', () => {
    const native = createMockKeyboardEvent({ key: 'x' })
    const event = new KeyboardEventDataImpl(native)
    const shortcut = keyboardShortcut('')
    expect(doShortcutsMatch(event, shortcut)).toBe(true)
  })
})

describe('keyboardShortcut', () => {
  it('creates shortcut with defaults', () => {
    const s = keyboardShortcut('enter')
    expect(s.key).toBe('enter')
    expect(s.ctrlKey).toBe(false)
    expect(s.shiftKey).toBe(false)
    expect(s.altKey).toBe(false)
    expect(s.metaKey).toBe(false)
  })

  it('creates shortcut with modifiers', () => {
    const s = keyboardShortcut('k', { ctrlKey: true, shiftKey: true })
    expect(s.key).toBe('k')
    expect(s.ctrlKey).toBe(true)
    expect(s.shiftKey).toBe(true)
    expect(s.altKey).toBe(false)
    expect(s.metaKey).toBe(false)
  })
})

describe('KeyboardManager', () => {
  let manager: KeyboardManager
  let target: HTMLElement

  beforeEach(() => {
    manager = createKeyboardManager()
    target = document.createElement('div')
  })

  it('starts with no focused handler', () => {
    expect(manager).toBeDefined()
  })

  it('attaches and detaches from element', () => {
    manager.attach(target)
    manager.detach()
  })

  it('disposes cleanly', () => {
    manager.attach(target)
    manager.dispose()
  })

  it('dispatches to focused handler', () => {
    const handler: KeyboardHandler = {
      id: 1,
      handleKeyEvent: vi.fn().mockReturnValue(true),
    }
    manager.attach(target)
    manager.setFocusedHandler(handler)

    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(handler.handleKeyEvent).toHaveBeenCalled()
  })

  it('dispatches to global handlers before focused', () => {
    const globalHandler: KeyboardHandler = {
      id: 100,
      handleKeyEvent: vi.fn().mockImplementation((e: KeyboardEventData) => {
        e.consume()
        return true
      }),
    }
    const focusedHandler: KeyboardHandler = {
      id: 200,
      handleKeyEvent: vi.fn().mockReturnValue(true),
    }

    manager.attach(target)
    manager.addGlobalHandler(globalHandler)
    manager.setFocusedHandler(focusedHandler)

    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(globalHandler.handleKeyEvent).toHaveBeenCalled()
    expect(focusedHandler.handleKeyEvent).not.toHaveBeenCalled()
  })

  it('dispatches to focused handler when global does not consume', () => {
    const globalHandler: KeyboardHandler = {
      id: 100,
      handleKeyEvent: vi.fn().mockReturnValue(false),
    }
    const focusedHandler: KeyboardHandler = {
      id: 200,
      handleKeyEvent: vi.fn().mockReturnValue(true),
    }

    manager.attach(target)
    manager.addGlobalHandler(globalHandler)
    manager.setFocusedHandler(focusedHandler)

    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(globalHandler.handleKeyEvent).toHaveBeenCalled()
    expect(focusedHandler.handleKeyEvent).toHaveBeenCalled()
  })

  it('only dispatches global handler with matching shortcut', () => {
    const matchHandler: KeyboardHandler = {
      id: 100,
      handleKeyEvent: vi.fn().mockReturnValue(true),
    }
    const noMatchHandler: KeyboardHandler = {
      id: 101,
      handleKeyEvent: vi.fn().mockReturnValue(true),
    }

    manager.attach(target)
    manager.addGlobalHandler(matchHandler, keyboardShortcut('s', { ctrlKey: true }))
    manager.addGlobalHandler(noMatchHandler, keyboardShortcut('o', { ctrlKey: true }))

    target.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }))
    expect(matchHandler.handleKeyEvent).toHaveBeenCalled()
    expect(noMatchHandler.handleKeyEvent).not.toHaveBeenCalled()
  })

  it('removes global handler', () => {
    const handler: KeyboardHandler = {
      id: 100,
      handleKeyEvent: vi.fn().mockReturnValue(true),
    }

    manager.attach(target)
    manager.addGlobalHandler(handler)
    manager.removeGlobalHandler(handler)

    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
    expect(handler.handleKeyEvent).not.toHaveBeenCalled()
  })
})
