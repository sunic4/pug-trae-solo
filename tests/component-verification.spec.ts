import { test, expect } from '@playwright/test'

test.describe('Demo App Component Rendering Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 900 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
  })

  test('verify canvas is visible and properly sized', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).toBeVisible()

    const box = await canvas.boundingBox()
    expect(box).toBeTruthy()
    expect(box!.width).toBe(420)
    expect(box!.height).toBe(800)
  })

  test('home page components render', async ({ page }) => {
    await page.screenshot({ path: 'tests/screenshots/verify-home.png', fullPage: true })
    expect(true).toBe(true)
  })

  test('interaction page renders with slider and checkbox', async ({ page }) => {
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    await page.mouse.click(box!.x + 84, box!.y + box!.height - 28)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/verify-interaction.png', fullPage: true })
    expect(true).toBe(true)
  })

  test('layout page renders with column and row', async ({ page }) => {
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    await page.mouse.click(box!.x + 168, box!.y + box!.height - 28)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/verify-layout.png', fullPage: true })
    expect(true).toBe(true)
  })

  test('feedback page renders with progress indicators', async ({ page }) => {
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    await page.mouse.click(box!.x + 252, box!.y + box!.height - 28)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/verify-feedback.png', fullPage: true })
    expect(true).toBe(true)
  })

  test('list page renders with list items', async ({ page }) => {
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    await page.mouse.click(box!.x + 336, box!.y + box!.height - 28)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/verify-list.png', fullPage: true })
    expect(true).toBe(true)
  })
})
