interface SelectableItem {
  readonly label: string
  readonly selected: boolean
  readonly onSelect: () => void
}

export type { SelectableItem }
