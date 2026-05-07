import { test } from '@playwright/test'

test.describe('Demo Screenshots', () => {
  test('Home Page screenshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'tests/screenshots/current-home.png' })
  })

  test('Interaction Page screenshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    if (box) {
      await canvas.dispatchEvent('pointerdown', { clientX: box.x + box.width * 0.3, clientY: box.y + box.height - 28 })
      await canvas.dispatchEvent('pointerup')
    }

    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/current-interaction.png' })
  })

  test('Layout Page screenshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    if (box) {
      await canvas.dispatchEvent('pointerdown', { clientX: box.x + box.width * 0.5, clientY: box.y + box.height - 28 })
      await canvas.dispatchEvent('pointerup')
    }

    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/current-layout.png' })
  })

  test('Feedback Page screenshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    if (box) {
      await canvas.dispatchEvent('pointerdown', { clientX: box.x + box.width * 0.7, clientY: box.y + box.height - 28 })
      await canvas.dispatchEvent('pointerup')
    }

    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/current-feedback.png' })
  })

  test('List Page screenshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    if (box) {
      await canvas.dispatchEvent('pointerdown', { clientX: box.x + box.width * 0.9, clientY: box.y + box.height - 28 })
      await canvas.dispatchEvent('pointerup')
    }

    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/current-list.png' })
  })
})
