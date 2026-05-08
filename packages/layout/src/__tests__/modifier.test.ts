import { describe, it, expect } from 'vitest'
import { Modifier, createShadow } from '../modifier'
import { assertPaddingElement, assertFillMaxSizeElement, assertBackgroundElement } from './assertions'

describe('Modifier', () => {
  describe('when creating an empty modifier', () => {
    it('should have size 0', () => {
      const mod = Modifier.create().freeze()
      expect(mod.size).toBe(0)
    })
  })

  describe('when adding a padding element', () => {
    it('should increase size and store element', () => {
      const mod = Modifier.create().padding(16).freeze()
      expect(mod.size).toBe(1)
      const el = mod.get(0)
      assertPaddingElement(el)
      expect(el.left).toBe(16)
      expect(el.top).toBe(16)
      expect(el.right).toBe(16)
      expect(el.bottom).toBe(16)
    })
  })

  describe('when adding padding with horizontal and vertical', () => {
    it('should store horizontal and vertical separately', () => {
      const mod = Modifier.create().padding(16, 8).freeze()
      const el = mod.get(0)
      assertPaddingElement(el)
      expect(el.left).toBe(16)
      expect(el.right).toBe(16)
      expect(el.top).toBe(8)
      expect(el.bottom).toBe(8)
    })
  })

  describe('when adding fillMaxSize element', () => {
    it('should store fillMaxSize element', () => {
      const mod = Modifier.create().fillMaxSize().freeze()
      expect(mod.size).toBe(1)
      const el = mod.get(0)
      assertFillMaxSizeElement(el)
      expect(el.fraction).toBe(1)
    })
  })

  describe('when adding fillMaxSize with fraction', () => {
    it('should store fraction value', () => {
      const mod = Modifier.create().fillMaxSize(0.5).freeze()
      const el = mod.get(0)
      assertFillMaxSizeElement(el)
      expect(el.fraction).toBe(0.5)
    })
  })

  describe('when adding background element', () => {
    it('should store background element', () => {
      const color = { r: 255, g: 0, b: 0, a: 1 }
      const mod = Modifier.create().background(color).freeze()
      expect(mod.size).toBe(1)
      const el = mod.get(0)
      assertBackgroundElement(el)
      expect(el.color).toEqual(color)
    })
  })

  describe('when adding background with borderRadius', () => {
    it('should store borderRadius', () => {
      const color = { r: 0, g: 0, b: 255, a: 1 }
      const mod = Modifier.create().background(color, 8).freeze()
      const el = mod.get(0)
      assertBackgroundElement(el)
      expect(el.borderRadius).toBe(8)
    })
  })

  describe('when chaining multiple elements', () => {
    it('should store all elements in order', () => {
      const mod = Modifier.create()
        .padding(8)
        .fillMaxSize()
        .background({ r: 0, g: 0, b: 255, a: 1 })
        .freeze()

      expect(mod.size).toBe(3)
      expect(mod.get(0).kind).toBe('layout')
      expect(mod.get(0).name).toBe('padding')
      expect(mod.get(1).kind).toBe('layout')
      expect(mod.get(1).name).toBe('fillMaxSize')
      expect(mod.get(2).kind).toBe('draw')
      expect(mod.get(2).name).toBe('background')
    })
  })

  describe('when calling filterByKind', () => {
    it('should return only elements of specified kind', () => {
      const mod = Modifier.create()
        .padding(8)
        .fillMaxSize()
        .background({ r: 0, g: 0, b: 0, a: 1 })
        .freeze()

      const layoutMods = mod.filterByKind('layout')
      expect(layoutMods.size).toBe(2)

      const drawMods = mod.filterByKind('draw')
      expect(drawMods.size).toBe(1)

      const inputMods = mod.filterByKind('input')
      expect(inputMods.size).toBe(0)
    })
  })

  describe('when calling get', () => {
    it('should throw for out of bounds index', () => {
      const mod = Modifier.create().padding(8).freeze()
      expect(() => mod.get(1)).toThrow()
    })
  })

  describe('when adding shadow element', () => {
    it('should store shadow element', () => {
      const mod = Modifier.create().shadow(4).freeze()
      expect(mod.size).toBe(1)
      expect(mod.get(0).kind).toBe('draw')
      expect(mod.get(0).name).toBe('shadow')
    })
  })

  describe('when using createShadow factory', () => {
    it('should create a shadow element', () => {
      const el = createShadow(8)
      expect(el.kind).toBe('draw')
      expect(el.name).toBe('shadow')
      expect(el.elevation).toBe(8)
    })
  })

  describe('when using extendFrom', () => {
    it('should copy elements from base modifier', () => {
      const base = Modifier.create().padding(8).freeze()
      const extended = Modifier.extendFrom(base).fillMaxSize().freeze()
      expect(extended.size).toBe(2)
      expect(extended.get(0).name).toBe('padding')
      expect(extended.get(1).name).toBe('fillMaxSize')
    })
  })

  describe('when modifying frozen modifier', () => {
    it('should throw error', () => {
      const builder = Modifier.create().padding(8)
      builder.freeze()
      expect(() => builder.padding(4)).toThrow('Cannot modify a frozen Modifier')
    })
  })
})
