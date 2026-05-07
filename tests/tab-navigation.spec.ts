import { test, expect } from '@playwright/test'

test.describe('Demo App Tab Navigation', () => {
  test('navigate through all tabs', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    const canvas = page.locator('#canvas')
    await expect(canvas).toBeVisible()

    await page.screenshot({ path: 'tests/screenshots/tab-01-home.png', fullPage: true })

    const box = await canvas.boundingBox()
    if (box) {
      await canvas.dispatchEvent('pointerdown', { clientX: box.x + box.width * 0.2, clientY: box.y + box.height - 28 })
      await canvas.dispatchEvent('pointerup')
      await page.waitForTimeout(500)
      await page.screenshot({ path: 'tests/screenshots/tab-02-interaction.png', fullPage: true })

      await canvas.dispatchEvent('pointerdown', { clientX: box.x + box.width * 0.4, clientY: box.y + box.height - 28 })
      await canvas.dispatchEvent('pointerup')
      await page.waitForTimeout(500)
      await page.screenshot({ path: 'tests/screenshots/tab-03-layout.png', fullPage: true })

      await canvas.dispatchEvent('pointerdown', { clientX: box.x + box.width * 0.6, clientY: box.y + box.height - 28 })
      await canvas.dispatchEvent('pointerup')
      await page.waitForTimeout(500)
      await page.screenshot({ path: 'tests/screenshots/tab-04-feedback.png', fullPage: true })

      await canvas.dispatchEvent('pointerdown', { clientX: box.x + box.width * 0.8, clientY: box.y + box.height - 28 })
      await canvas.dispatchEvent('pointerup')
      await page.waitForTimeout(500)
      await page.screenshot({ path: 'tests/screenshots/tab-05-list.png', fullPage: true })
    }
  })
})
