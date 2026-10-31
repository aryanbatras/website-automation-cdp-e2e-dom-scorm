import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  // find "Go to activity" link/button
  const handle = await page.getByText('Go to activity', { exact: false }).first();
  console.log('found:', await handle.count?.());
  await handle.click();
  await page.waitForTimeout(10000);
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  console.log('FRAMES:', page.frames().map(f => f.url()));
  const txt = await page.evaluate(() => document.body.innerText.slice(0, 3000));
  console.log('BODY:\n', txt);
  await browser.close();
})();