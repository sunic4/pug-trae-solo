import { test, expect } from '@playwright/test'

test('verify full page rendering', async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 900 })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  const canvas = page.locator('#canvas')
  await expect(canvas).toBeVisible()

  const box = await canvas.boundingBox()
  console.log('Canvas box:', JSON.stringify(box))

  await page.screenshot({ path: 'tests/screenshots/00-full-page.png', fullPage: false })
  await page.screenshot({ path: 'tests/screenshots/00-full-page-full.png', fullPage: true })

  expect(box).toBeTruthy()
  expect(box!.width).toBeGreaterThan(0)
  expect(box!.height).toBeGreaterThan(0)
})
