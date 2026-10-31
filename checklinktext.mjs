import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const link = document.querySelectorAll('a.nav-sidebar__outline-section-item__link')[5];
  return { innerText: link?.innerText, textContent: link?.textContent?.trim(), html: link?.outerHTML?.slice(0,300) };
});
console.log(JSON.stringify(info));
await browser.close();
