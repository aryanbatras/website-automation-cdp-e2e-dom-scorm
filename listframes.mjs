import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(4000);
  console.log('NUM FRAMES:', page.frames().length);
  page.frames().forEach((f, i) => console.log(i, '=>', f.url().slice(0,120)));
  await browser.close();
})();