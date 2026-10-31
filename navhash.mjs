import { chromium } from 'playwright';
const hash = process.argv[2];
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  await frame.evaluate((h) => { window.location.hash = h; }, hash);
  await page.waitForTimeout(4000);
  const title = await frame.evaluate(() => { const c=Array.from(document.querySelectorAll('h1,h2,h3')).map(e=>e.innerText.trim()).filter(Boolean); return c[0]||''; });
  const text = await frame.evaluate(() => document.body.innerText.replace(/\s+/g,' ').slice(0,600));
  console.log('TITLE:', title);
  console.log('TEXT:', text);
  await browser.close();
})();