import { test, expect } from '@playwright/test'

test.describe('Demo App Complete Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 900 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
  })

  test('home page renders correctly', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).toBeVisible()
    const box = await canvas.boundingBox()
    console.log('Home page canvas:', JSON.stringify(box))
    await page.screenshot({ path: 'tests/screenshots/home-page.png', fullPage: true })
  })

  test('navigate to interaction page', async ({ page }) => {
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    console.log('Canvas for interaction:', JSON.stringify(box))

    const tabX = (box!.x + 84)
    const tabY = (box!.y + box!.height - 28)
    console.log('Clicking tab at:', tabX, tabY)

    await page.mouse.click(tabX, tabY)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/interaction-page.png', fullPage: true })
  })

  test('navigate to layout page', async ({ page }) => {
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    const tabX = (box!.x + 168)
    const tabY = (box!.y + box!.height - 28)
    await page.mouse.click(tabX, tabY)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/layout-page.png', fullPage: true })
  })

  test('navigate to feedback page', async ({ page }) => {
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    const tabX = (box!.x + 252)
    const tabY = (box!.y + box!.height - 28)
    await page.mouse.click(tabX, tabY)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/feedback-page.png', fullPage: true })
  })

  test('navigate to list page', async ({ page }) => {
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    const tabX = (box!.x + 336)
    const tabY = (box!.y + box!.height - 28)
    await page.mouse.click(tabX, tabY)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/list-page.png', fullPage: true })
  })
})
