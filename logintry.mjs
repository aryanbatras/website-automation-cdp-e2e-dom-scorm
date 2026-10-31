import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  await page.goto('https://skillsbuild.org/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  // Click Adult learning
  await page.getByRole('link', { name: 'Adult learning' }).click().catch(e => console.log('click err', e.message));
  await page.waitForTimeout(8000);
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  const txt = await page.evaluate(() => document.body.innerText.slice(0, 1200));
  console.log('BODY:', txt);
  await browser.close();
})();