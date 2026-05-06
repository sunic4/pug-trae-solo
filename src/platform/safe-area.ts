interface SafeArea {
  readonly top: number
  readonly bottom: number
  readonly left: number
  readonly right: number
}

function readEnvInset(name: string): number {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 0
  try {
    const el = document.createElement('div')
    el.style.position = 'fixed'
    el.style.top = '0'
    el.style.left = '0'
    el.style.width = `env(${name})`
    el.style.height = `env(${name})`
    el.style.visibility = 'hidden'
    el.style.pointerEvents = 'none'
    document.documentElement.appendChild(el)
    const rect = el.getBoundingClientRect()
    document.documentElement.removeChild(el)
    const value = Math.max(rect.width, rect.height)
    return Number.isFinite(value) ? value : 0
  } catch {
    return 0
  }
}


function detectSafeArea(): SafeArea {
  return {
    top: readEnvInset('safe-area-inset-top'),
    bottom: readEnvInset('safe-area-inset-bottom'),
    left: readEnvInset('safe-area-inset-left'),
    right: readEnvInset('safe-area-inset-right'),
  }
}

const ZERO_SAFE_AREA: SafeArea = { top: 0, bottom: 0, left: 0, right: 0 }

export type { SafeArea }
export { detectSafeArea, ZERO_SAFE_AREA }
