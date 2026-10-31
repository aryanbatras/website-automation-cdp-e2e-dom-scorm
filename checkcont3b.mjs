import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const b = document.querySelector('button.continue-btn, .continue-btn');
  return { exists: !!b, visible: !!b && b.offsetParent !== null, rectW: b?.getBoundingClientRect().width, disabled: b?.disabled, text: b?.innerText?.trim() };
});
console.log(JSON.stringify(info));
await browser.close();
