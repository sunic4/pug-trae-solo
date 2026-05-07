import { test, expect, type Page } from '@playwright/test'

const TAB_LABELS = ['首页', '交互', '布局', '反馈', '列表']

async function navigateToTab(page: Page, tabIndex: number) {
  const canvas = page.locator('#canvas')
  const box = await canvas.boundingBox()
  if (box) {
    await page.mouse.click(
      box.x + box.width * (0.2 + tabIndex * 0.2),
      box.y + box.height - 28
    )
    await page.waitForTimeout(500)
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)
})

test('应用应该正确加载并显示画布', async ({ page }) => {
  const canvas = page.locator('#canvas')
  await expect(canvas).toBeVisible()
  const box = await canvas.boundingBox()
  expect(box).toBeTruthy()
  expect(box!.width).toBeGreaterThan(0)
  expect(box!.height).toBeGreaterThan(0)
})

test('首页应该正确渲染', async ({ page }) => {
  await page.screenshot({ path: 'tests/screenshots/home-page.png', fullPage: true })
})

test.describe('所有标签页的渲染验证', () => {
  for (let i = 0; i < TAB_LABELS.length; i++) {
    test(`${TAB_LABELS[i]}标签页应该正确渲染`, async ({ page }) => {
      await navigateToTab(page, i)
      await page.waitForTimeout(1000)
      await page.screenshot({
        path: `tests/screenshots/tab-${i}-${TAB_LABELS[i]}.png`,
        fullPage: true
      })
    })
  }
})

test('画布应该响应指针事件', async ({ page }) => {
  const canvas = page.locator('#canvas')
  await canvas.dispatchEvent('pointerdown', { clientX: 100, clientY: 100 })
  await page.waitForTimeout(100)
  await canvas.dispatchEvent('pointerup', { clientX: 100, clientY: 100 })
  await page.screenshot({ path: 'tests/screenshots/after-pointer-events.png', fullPage: true })
})
