import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const html = await frame.evaluate(() => {
  const wrap = document.querySelector('.quiz__wrap, [class*="quiz__wrap"]');
  return wrap ? wrap.outerHTML.slice(0, 6000) : 'NO WRAP';
});
console.log(html);
await browser.close();
