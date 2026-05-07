import { test, expect } from '@playwright/test'

test.describe('Demo App Page Verification', () => {
  test('home page renders with all components', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    const canvas = page.locator('#canvas')
    await expect(canvas).toBeVisible()

    const box = await canvas.boundingBox()
    console.log('Canvas bounding box:', box)

    await page.screenshot({ path: 'tests/screenshots/01-home-page.png', fullPage: true })
  })

  test('verify canvas is properly sized', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    expect(box).toBeTruthy()
    expect(box!.width).toBeGreaterThan(0)
    expect(box!.height).toBeGreaterThan(0)

    await page.screenshot({ path: 'tests/screenshots/02-canvas-size.png', fullPage: true })

    console.log('Canvas dimensions:', box!.width, 'x', box!.height)
    console.log('Bottom nav area y:', box!.y + box!.height - 56)
  })
})
