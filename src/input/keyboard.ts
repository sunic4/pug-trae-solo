type KeyboardEventType = 'keydown' | 'keyup' | 'keypress'

interface KeyboardEventData {
  readonly type: KeyboardEventType
  readonly key: string
  readonly code: string
  readonly ctrlKey: boolean
  readonly shiftKey: boolean
  readonly altKey: boolean
  readonly metaKey: boolean
  readonly repeat: boolean
  readonly consumed: boolean
  consume(): void
}

interface KeyboardShortcut {
  readonly key: string
  readonly ctrlKey: boolean
  readonly shiftKey: boolean
  readonly altKey: boolean
  readonly metaKey: boolean
}

type KeyboardEventHandler = (event: KeyboardEventData) => void

function toKeyboardEventType(type: string): KeyboardEventType {
  switch (type) {
    case 'keydown':
    case 'keyup':
    case 'keypress':
      return type
    default:
      return 'keydown'
  }
}

interface KeyboardHandler {
  readonly id: number
  handleKeyEvent(event: KeyboardEventData): boolean
}

interface KeyboardManager {
  attach(target: HTMLElement): void
  detach(): void
  setFocusedHandler(handler: KeyboardHandler | null): void
  addGlobalHandler(handler: KeyboardHandler, shortcut?: KeyboardShortcut): void
  removeGlobalHandler(handler: KeyboardHandler): void
  dispose(): void
}

class KeyboardEventDataImpl implements KeyboardEventData {
  readonly type: KeyboardEventType
  readonly key: string
  readonly code: string
  readonly ctrlKey: boolean
  readonly shiftKey: boolean
  readonly altKey: boolean
  readonly metaKey: boolean
  readonly repeat: boolean
  private _consumed = false

  constructor(nativeEvent: KeyboardEvent) {
    this.type = toKeyboardEventType(nativeEvent.type)
    this.key = nativeEvent.key
    this.code = nativeEvent.code
    this.ctrlKey = nativeEvent.ctrlKey
    this.shiftKey = nativeEvent.shiftKey
    this.altKey = nativeEvent.altKey
    this.metaKey = nativeEvent.metaKey
    this.repeat = nativeEvent.repeat
  }

  get consumed(): boolean {
    return this._consumed
  }

  consume(): void {
    this._consumed = true
  }
}

function doShortcutsMatch(event: KeyboardEventData, shortcut: KeyboardShortcut): boolean {
  return (
    (shortcut.key === '' || event.key.toLowerCase() === shortcut.key.toLowerCase()) &&
    event.ctrlKey === shortcut.ctrlKey &&
    event.shiftKey === shortcut.shiftKey &&
    event.altKey === shortcut.altKey &&
    event.metaKey === shortcut.metaKey
  )
}

interface ShortcutEntry {
  handler: KeyboardHandler
  shortcut?: KeyboardShortcut
}

class KeyboardManagerImpl implements KeyboardManager {
  private _target: HTMLElement | null = null
  private _focusedHandler: KeyboardHandler | null = null
  private _globalHandlers: ShortcutEntry[] = []
  private _disposed = false
  private _boundKeyDown: ((e: Event) => void) | null = null
  private _boundKeyUp: ((e: Event) => void) | null = null

  attach(target: HTMLElement): void {
    if (this._disposed) return
    this.detach()
    this._target = target

    this._boundKeyDown = (e: Event): void => {
      if (e instanceof KeyboardEvent) this._handleNativeEvent(e)
    }
    this._boundKeyUp = (e: Event): void => {
      if (e instanceof KeyboardEvent) this._handleNativeEvent(e)
    }

    target.addEventListener('keydown', this._boundKeyDown)
    target.addEventListener('keyup', this._boundKeyUp)
  }

  detach(): void {
    if (this._target !== null && this._boundKeyDown !== null) {
      this._target.removeEventListener('keydown', this._boundKeyDown)
    }
    if (this._target !== null && this._boundKeyUp !== null) {
      this._target.removeEventListener('keyup', this._boundKeyUp)
    }
    this._target = null
    this._boundKeyDown = null
    this._boundKeyUp = null
  }

  setFocusedHandler(handler: KeyboardHandler | null): void {
    this._focusedHandler = handler
  }

  addGlobalHandler(handler: KeyboardHandler, shortcut?: KeyboardShortcut): void {
    if (this._disposed) return
    if (!this._globalHandlers.some(e => e.handler === handler)) {
      this._globalHandlers.push({ handler, shortcut })
    }
  }

  removeGlobalHandler(handler: KeyboardHandler): void {
    this._globalHandlers = this._globalHandlers.filter(e => e.handler !== handler)
  }

  dispose(): void {
    this._disposed = true
    this.detach()
    this._focusedHandler = null
    this._globalHandlers = []
  }

  private _handleNativeEvent(nativeEvent: KeyboardEvent): void {
    const event = new KeyboardEventDataImpl(nativeEvent)

    for (const entry of this._globalHandlers) {
      if (entry.shortcut !== undefined) {
        if (doShortcutsMatch(event, entry.shortcut)) {
          entry.handler.handleKeyEvent(event)
          if (event.consumed) return
        }
      } else {
        entry.handler.handleKeyEvent(event)
        if (event.consumed) return
      }
    }

    if (this._focusedHandler !== null) {
      this._focusedHandler.handleKeyEvent(event)
    }
  }
}

function keyboardShortcut(
  key: string,
  modifiers: { ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean; metaKey?: boolean } = {},
): KeyboardShortcut {
  return {
    key: key.toLowerCase(),
    ctrlKey: modifiers.ctrlKey ?? false,
    shiftKey: modifiers.shiftKey ?? false,
    altKey: modifiers.altKey ?? false,
    metaKey: modifiers.metaKey ?? false,
  }
}

function createKeyboardManager(): KeyboardManager {
  return new KeyboardManagerImpl()
}

export type {
  KeyboardEventType,
  KeyboardEventData,
  KeyboardShortcut,
  KeyboardEventHandler,
  KeyboardHandler,
  KeyboardManager,
}

export {
  KeyboardEventDataImpl,
  doShortcutsMatch,
  keyboardShortcut,
  createKeyboardManager,
}
