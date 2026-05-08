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

type KeyboardEventHandler = (event: KeyboardEventData) => void

export type { KeyboardEventType, KeyboardEventData, KeyboardEventHandler }
