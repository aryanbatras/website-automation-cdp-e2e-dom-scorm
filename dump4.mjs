import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  await page.waitForTimeout(3000);
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  const txt = await page.evaluate(() => document.body.innerText.slice(0, 4000));
  console.log('BODY TEXT:\n', txt);
  await browser.close();
})();