import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const cb = document.querySelector('button.continue-btn, .continue-btn');
  return { exists: !!cb, visible: !!cb && cb.offsetParent !== null, rectW: cb?.getBoundingClientRect().width, disabled: cb?.disabled, text: cb?.innerText?.trim() };
});
console.log(JSON.stringify(info));
// scroll to bottom
await frame.evaluate(() => { const s = document.scrollingElement || document.body; s.scrollTo(0, s.scrollHeight); });
await page.waitForTimeout(800);
const info2 = await frame.evaluate(() => {
  const cb = document.querySelector('button.continue-btn, .continue-btn');
  return { exists: !!cb, visible: !!cb && cb.offsetParent !== null, rectW: cb?.getBoundingClientRect().width, disabled: cb?.disabled, text: cb?.innerText?.trim() };
});
console.log('after scroll:', JSON.stringify(info2));
await browser.close();
