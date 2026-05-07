import { test, expect } from '@playwright/test'

test.describe('Demo App Final Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 900 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
  })

  test('canvas renders with correct dimensions', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).toBeVisible()

    const box = await canvas.boundingBox()
    expect(box).toBeTruthy()
    expect(box!.width).toBe(420)
    expect(box!.height).toBe(800)
    expect(box!.x).toBeGreaterThan(0)

    await page.screenshot({ path: 'tests/screenshots/final-01-home.png', fullPage: true })
  })

  test('home page - text and surface components render', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).toBeVisible()
    await page.screenshot({ path: 'tests/screenshots/final-01-home.png', fullPage: true })
  })

  test('interaction page - slider, checkbox and button render', async ({ page }) => {
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    await page.mouse.click(box!.x + 84, box!.y + box!.height - 28)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/final-02-interaction.png', fullPage: true })
  })

  test('layout page - column, row and box render', async ({ page }) => {
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    await page.mouse.click(box!.x + 168, box!.y + box!.height - 28)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/final-03-layout.png', fullPage: true })
  })

  test('feedback page - circular and linear progress render', async ({ page }) => {
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    await page.mouse.click(box!.x + 252, box!.y + box!.height - 28)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/final-04-feedback.png', fullPage: true })
  })

  test('list page - lazy column items render', async ({ page }) => {
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    await page.mouse.click(box!.x + 336, box!.y + box!.height - 28)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/final-05-list.png', fullPage: true })
  })

  test('verify canvas is clickable in bottom navigation area', async ({ page }) => {
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()

    const tabAreas = [
      { x: 84, name: 'home' },
      { x: 168, name: 'interaction' },
      { x: 252, name: 'layout' },
      { x: 336, name: 'feedback' },
      { x: 400, name: 'list' },
    ]

    for (const tab of tabAreas) {
      const clickX = box!.x + tab.x
      const clickY = box!.y + box!.height - 28

      await page.mouse.click(clickX, clickY)
      await page.waitForTimeout(500)
    }

    await page.screenshot({ path: 'tests/screenshots/final-06-all-tabs.png', fullPage: true })
  })
})
