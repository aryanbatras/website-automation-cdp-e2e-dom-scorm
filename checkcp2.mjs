import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const cp = window.cp;
  if (!cp) return { err: 'no cp' };
  return { keys: Object.keys(cp).slice(0,50), proto: Object.getPrototypeOf(cp)?.constructor?.name };
});
console.log(JSON.stringify(info));
await browser.close();
