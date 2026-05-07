import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 420, height: 800 }
  });
  const page = await context.newPage();

  console.log('Opening http://localhost:3000...');
  await page.goto('http://localhost:3000', { timeout: 10000 });
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'screenshot-fixed-home.png' });
  console.log('Screenshot saved: screenshot-fixed-home.png');

  const tabs = [
    { name: 'interaction', index: 1 },
    { name: 'layout', index: 2 },
    { name: 'feedback', index: 3 },
    { name: 'list', index: 4 }
  ];

  for (const tab of tabs) {
    const navY = 800 - 56;
    const itemWidth = 420 / 5;
    const tabX = itemWidth * tab.index + itemWidth / 2;

    await page.mouse.click(tabX, navY);
    await page.waitForTimeout(800);

    await page.screenshot({ path: `screenshot-fixed-${tab.name}.png` });
    console.log(`Screenshot saved: screenshot-fixed-${tab.name}.png`);
  }

  await browser.close();
  console.log('Done!');
})();
