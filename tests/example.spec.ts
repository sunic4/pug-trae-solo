import { test, expect } from '@playwright/test'

test('example app renders correctly', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)
  const canvas = page.locator('#canvas')
  await expect(canvas).toBeVisible()
  await page.screenshot({ path: 'tests/screenshots/example-app.png', fullPage: true })
})

test('canvas has expected dimensions', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)
  const canvas = page.locator('#canvas')
  const boundingBox = await canvas.boundingBox()
  expect(boundingBox).toBeTruthy()
  expect(boundingBox!.width).toBeGreaterThan(0)
  expect(boundingBox!.height).toBeGreaterThan(0)
})

test('canvas receives pointer events', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)
  const canvas = page.locator('#canvas')
  await canvas.dispatchEvent('pointerdown', { clientX: 100, clientY: 100 })
  await page.waitForTimeout(100)
  await canvas.dispatchEvent('pointerup', { clientX: 100, clientY: 100 })
  await page.screenshot({ path: 'tests/screenshots/after-click.png', fullPage: true })
})
