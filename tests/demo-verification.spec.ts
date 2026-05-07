import { test, expect } from '@playwright/test'

test.describe('Demo App Full Verification', () => {
  test('Home Page renders correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    const canvas = page.locator('#canvas')
    await expect(canvas).toBeVisible()
    await page.screenshot({ path: 'tests/screenshots/demo-home-initial.png', fullPage: true })
  })

  test('Interaction Page - click tab', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    if (box) {
      await canvas.dispatchEvent('pointerdown', { clientX: box.x + box.width * 0.2, clientY: box.y + box.height - 28 })
      await canvas.dispatchEvent('pointerup')
    }
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'tests/screenshots/demo-interaction.png', fullPage: true })
  })

  test('Layout Page - click tab', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    if (box) {
      await canvas.dispatchEvent('pointerdown', { clientX: box.x + box.width * 0.4, clientY: box.y + box.height - 28 })
      await canvas.dispatchEvent('pointerup')
    }
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'tests/screenshots/demo-layout.png', fullPage: true })
  })

  test('Feedback Page - click tab', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    if (box) {
      await canvas.dispatchEvent('pointerdown', { clientX: box.x + box.width * 0.6, clientY: box.y + box.height - 28 })
      await canvas.dispatchEvent('pointerup')
    }
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'tests/screenshots/demo-feedback.png', fullPage: true })
  })

  test('List Page - click tab', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    if (box) {
      await canvas.dispatchEvent('pointerdown', { clientX: box.x + box.width * 0.8, clientY: box.y + box.height - 28 })
      await canvas.dispatchEvent('pointerup')
    }
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'tests/screenshots/demo-list.png', fullPage: true })
  })

  test('Home page text rendering', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    await page.screenshot({ path: 'tests/screenshots/demo-home-detailed.png', fullPage: true })
  })

  test('Interaction components test', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    if (box) {
      await canvas.dispatchEvent('pointerdown', { clientX: box.x + box.width * 0.2, clientY: box.y + box.height - 28 })
      await canvas.dispatchEvent('pointerup')
    }
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/demo-interaction-detailed.png', fullPage: true })
  })
})
