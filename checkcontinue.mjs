import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const btn = document.querySelector('button.continue-btn, .continue-btn');
  return { exists: !!btn, visible: !!btn && btn.offsetParent !== null, text: btn?.innerText?.trim(), disabled: btn?.disabled };
});
console.log(JSON.stringify(info));
// also check page text for "Continue" or "Next lesson"
const text = await frame.evaluate(() => document.body.innerText);
console.log('has Continue:', /continue/i.test(text), 'has Next lesson:', /next lesson/i.test(text));
await browser.close();
