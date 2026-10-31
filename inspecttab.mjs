import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  const page = pages.find(p => p.url().includes('alm.ibm.com')) || pages[pages.length-1];
  await page.bringToFront();
  await page.waitForTimeout(5000);
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  console.log('FRAMES:', page.frames().map(f => f.url()));
  const txt = await page.evaluate(() => document.body.innerText.slice(0, 6000));
  console.log('BODY:\n', txt);
  await browser.close();
})();