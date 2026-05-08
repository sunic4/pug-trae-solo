import { describe, it, expect, vi } from 'vitest'
import { createDensity, dp, sp, MDPI_DPI } from '../density'
import { detectSafeArea, ZERO_SAFE_AREA } from '../safe-area'
import { detectScreenInfo, createPlatformAdapter, inferOrientation } from '../screen-info'
import type { PlatformAdapter, ScreenInfo } from '../screen-info'

describe('Density', () => {
  it('creates density with default scale', () => {
    const d = createDensity()
    expect(d.scale).toBeGreaterThanOrEqual(1)
    expect(d.dpi).toBe(Math.round(d.scale * MDPI_DPI))
    expect(d.fontScale).toBe(1)
  })

  it('creates density with custom scale and fontScale', () => {
    const d = createDensity(2, 1.5)
    expect(d.scale).toBe(2)
    expect(d.dpi).toBe(320)
    expect(d.fontScale).toBe(1.5)
  })

  it('clamps scale to minimum 1', () => {
    const d = createDensity(0)
    expect(d.scale).toBe(1)
    expect(d.dpi).toBe(160)
  })

  it('clamps negative scale', () => {
    const d = createDensity(-2)
    expect(d.scale).toBe(1)
  })

  it('clamps fontScale to minimum 0.1', () => {
    const d = createDensity(1, 0)
    expect(d.fontScale).toBe(0.1)
  })

  it('clamps negative fontScale', () => {
    const d = createDensity(1, -1)
    expect(d.fontScale).toBe(0.1)
  })

  it('dp converts dp to pixels', () => {
    const d = createDensity(2)
    expect(dp(10, d)).toBe(20)
    expect(dp(0, d)).toBe(0)
    expect(dp(1.5, d)).toBe(3)
  })

  it('sp converts sp to pixels with fontScale', () => {
    const d = createDensity(2, 1.5)
    expect(sp(10, d)).toBe(30)
    expect(sp(0, d)).toBe(0)
  })

  it('sp with default fontScale equals dp', () => {
    const d = createDensity(3)
    expect(sp(10, d)).toBe(dp(10, d))
  })

  it('MDPI_DPI is 160', () => {
    expect(MDPI_DPI).toBe(160)
  })
})

describe('SafeArea', () => {
  it('ZERO_SAFE_AREA has all zeros', () => {
    expect(ZERO_SAFE_AREA.top).toBe(0)
    expect(ZERO_SAFE_AREA.bottom).toBe(0)
    expect(ZERO_SAFE_AREA.left).toBe(0)
    expect(ZERO_SAFE_AREA.right).toBe(0)
  })

  it('detectSafeArea returns SafeArea object', () => {
    const sa = detectSafeArea()
    expect(typeof sa.top).toBe('number')
    expect(typeof sa.bottom).toBe('number')
    expect(typeof sa.left).toBe('number')
    expect(typeof sa.right).toBe('number')
    expect(sa.top).toBeGreaterThanOrEqual(0)
    expect(sa.bottom).toBeGreaterThanOrEqual(0)
    expect(sa.left).toBeGreaterThanOrEqual(0)
    expect(sa.right).toBeGreaterThanOrEqual(0)
  })
})

describe('ScreenInfo', () => {
  it('inferOrientation returns portrait when height >= width', () => {
    expect(inferOrientation(400, 800)).toBe('portrait')
    expect(inferOrientation(800, 800)).toBe('portrait')
  })

  it('inferOrientation returns landscape when width > height', () => {
    expect(inferOrientation(800, 400)).toBe('landscape')
  })

  it('detectScreenInfo returns valid ScreenInfo', () => {
    const info = detectScreenInfo()
    expect(typeof info.width).toBe('number')
    expect(typeof info.height).toBe('number')
    expect(['portrait', 'landscape']).toContain(info.orientation)
    expect(info.density).toBeDefined()
    expect(info.safeArea).toBeDefined()
  })

  it('detectScreenInfo uses provided density', () => {
    const d = createDensity(3)
    const info = detectScreenInfo(d)
    expect(info.density.scale).toBe(3)
  })

  it('detectScreenInfo orientation matches dimensions', () => {
    const info = detectScreenInfo()
    const expected = info.height >= info.width ? 'portrait' : 'landscape'
    expect(info.orientation).toBe(expected)
  })
})

describe('PlatformAdapter', () => {
  function createTestAdapter(): { adapter: PlatformAdapter; eventTarget: EventTarget; setWindowSize: (w: number, h: number) => void } {
    const eventTarget = new EventTarget()
    let size = { width: 800, height: 600 }
    const adapter = createPlatformAdapter(undefined, {
      eventTarget,
      getWindowSize: () => size,
    })
    return {
      adapter,
      eventTarget,
      setWindowSize: (w: number, h: number) => { size = { width: w, height: h } },
    }
  }

  it('provides screenInfo', () => {
    const { adapter } = createTestAdapter()
    const info = adapter.screenInfo
    expect(info).toBeDefined()
    expect(info.width).toBe(800)
    expect(info.height).toBe(600)
    expect(info.orientation).toBe('landscape')
  })

  it('observe returns unsubscribe function', () => {
    const { adapter } = createTestAdapter()
    const unsub = adapter.observe(() => {})
    expect(typeof unsub).toBe('function')
    unsub()
  })

  it('observe callback is called on resize', () => {
    const { adapter, eventTarget, setWindowSize } = createTestAdapter()
    const callback = vi.fn<(info: ScreenInfo) => void>()
    adapter.observe(callback)

    setWindowSize(400, 800)
    eventTarget.dispatchEvent(new Event('resize'))

    expect(callback).toHaveBeenCalledTimes(1)
    const info = callback.mock.calls[0]![0]
    expect(info.width).toBe(400)
    expect(info.height).toBe(800)
    expect(info.orientation).toBe('portrait')
  })

  it('unsubscribe stops callbacks', () => {
    const { adapter, eventTarget } = createTestAdapter()
    const callback = vi.fn()
    const unsub = adapter.observe(callback)
    unsub()

    eventTarget.dispatchEvent(new Event('resize'))

    expect(callback).not.toHaveBeenCalled()
  })

  it('dispose stops all callbacks', () => {
    const { adapter, eventTarget } = createTestAdapter()
    const callback1 = vi.fn()
    const callback2 = vi.fn()
    adapter.observe(callback1)
    adapter.observe(callback2)
    adapter.dispose()

    eventTarget.dispatchEvent(new Event('resize'))

    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).not.toHaveBeenCalled()
  })

  it('observe after dispose returns no-op unsubscribe', () => {
    const { adapter } = createTestAdapter()
    adapter.dispose()
    const unsub = adapter.observe(() => {})
    expect(typeof unsub).toBe('function')
    unsub()
  })

  it('multiple observers receive updates', () => {
    const { adapter, eventTarget, setWindowSize } = createTestAdapter()
    const cb1 = vi.fn()
    const cb2 = vi.fn()
    adapter.observe(cb1)
    adapter.observe(cb2)

    setWindowSize(1024, 768)
    eventTarget.dispatchEvent(new Event('resize'))

    expect(cb1).toHaveBeenCalledTimes(1)
    expect(cb2).toHaveBeenCalledTimes(1)
  })

  it('screenInfo updates after resize', () => {
    const { adapter, eventTarget, setWindowSize } = createTestAdapter()
    expect(adapter.screenInfo.orientation).toBe('landscape')

    setWindowSize(400, 800)
    eventTarget.dispatchEvent(new Event('resize'))

    expect(adapter.screenInfo.width).toBe(400)
    expect(adapter.screenInfo.height).toBe(800)
    expect(adapter.screenInfo.orientation).toBe('portrait')
  })

  it('works without eventTarget', () => {
    const adapter = createPlatformAdapter(undefined, {
      eventTarget: undefined,
      getWindowSize: () => ({ width: 100, height: 200 }),
    })
    expect(adapter.screenInfo.width).toBe(100)
    expect(adapter.screenInfo.height).toBe(200)
    adapter.dispose()
  })
})
