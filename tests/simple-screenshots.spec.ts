import { test, expect } from '@playwright/test'

test.describe('All pages render correctly', () => {
  test('Home page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    await page.screenshot({ path: 'tests/screenshots/final-home.png', fullPage: true })
  })

  test('Interaction page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    // Click second tab
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    if (box) {
      await page.mouse.click(box.x + box.width * 0.3, box.y + box.height - 28)
    }
    await page.waitForTimeout(1500)
    await page.screenshot({ path: 'tests/screenshots/final-interaction.png', fullPage: true })
  })

  test('Layout page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    // Click third tab
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    if (box) {
      await page.mouse.click(box.x + box.width * 0.5, box.y + box.height - 28)
    }
    await page.waitForTimeout(1500)
    await page.screenshot({ path: 'tests/screenshots/final-layout.png', fullPage: true })
  })

  test('Feedback page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    // Click fourth tab
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    if (box) {
      await page.mouse.click(box.x + box.width * 0.7, box.y + box.height - 28)
    }
    await page.waitForTimeout(1500)
    await page.screenshot({ path: 'tests/screenshots/final-feedback.png', fullPage: true })
  })

  test('List page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    // Click fifth tab
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    if (box) {
      await page.mouse.click(box.x + box.width * 0.9, box.y + box.height - 28)
    }
    await page.waitForTimeout(1500)
    await page.screenshot({ path: 'tests/screenshots/final-list.png', fullPage: true })
  })
})
