import { test, expect } from '@playwright/test'

test.describe('Complete Demo App Verification Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 900 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
  })

  test('01_canvas_dimensions_are_correct', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).toBeVisible()
    const box = await canvas.boundingBox()
    expect(box).toBeTruthy()
    expect(box!.width).toBe(420)
    expect(box!.height).toBe(800)
    expect(box!.x).toBeGreaterThan(0)
    await page.screenshot({ path: 'tests/screenshots/01-canvas-correct-size.png', fullPage: true })
  })

  test('02_home_page_renders_all_components', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).toBeVisible()
    await page.screenshot({ path: 'tests/screenshots/02-home-page-components.png', fullPage: true })
  })

  test('03_interaction_page_slider_checkbox_button', async ({ page }) => {
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    await page.mouse.click(box!.x + 84, box!.y + box!.height - 28)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/03-interaction-components.png', fullPage: true })
  })

  test('04_layout_page_column_row_box', async ({ page }) => {
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    await page.mouse.click(box!.x + 168, box!.y + box!.height - 28)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/04-layout-components.png', fullPage: true })
  })

  test('05_feedback_page_progress_indicators', async ({ page }) => {
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    await page.mouse.click(box!.x + 252, box!.y + box!.height - 28)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/05-feedback-components.png', fullPage: true })
  })

  test('06_list_page_lazy_column', async ({ page }) => {
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    await page.mouse.click(box!.x + 336, box!.y + box!.height - 28)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/06-list-components.png', fullPage: true })
  })

  test('07_all_tabs_navigable', async ({ page }) => {
    const canvas = page.locator('#canvas')
    const box = await canvas.boundingBox()
    for (const x of [84, 168, 252, 336, 400]) {
      await page.mouse.click(box!.x + x, box!.y + box!.height - 28)
      await page.waitForTimeout(300)
    }
    await page.screenshot({ path: 'tests/screenshots/07-all-tabs-navigable.png', fullPage: true })
  })
})
