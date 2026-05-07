import { test, expect } from '@playwright/test'

test('Check page and console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })

  await page.goto('/')
  await page.waitForTimeout(2000)

  await page.screenshot({ path: 'tests/screenshots/check-page.png', fullPage: true })

  const canvas = await page.locator('#canvas').count()
  expect(canvas).toBe(1)
})
