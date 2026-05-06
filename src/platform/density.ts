interface Density {
  readonly scale: number
  readonly dpi: number
  readonly fontScale: number
}

const MDPI_DPI = 160


function createDensity(scale: number = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, fontScale: number = 1): Density {
  const clampedScale = Math.max(1, scale)
  return {
    scale: clampedScale,
    dpi: Math.round(clampedScale * MDPI_DPI),
    fontScale: Math.max(0.1, fontScale),
  }
}


function dp(value: number, density: Density): number {
  return value * density.scale
}


function sp(value: number, density: Density): number {
  return value * density.scale * density.fontScale
}

export type { Density }
export { createDensity, dp, sp, MDPI_DPI }
