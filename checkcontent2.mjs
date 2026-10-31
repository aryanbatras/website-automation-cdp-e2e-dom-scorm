import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(4000);
const frames = page.frames();
console.log('FRAMES:', frames.length);
for (const f of frames) console.log('  -', f.url().slice(0,120));
const cf = page.frames().find(f => f.url().includes('scormcontent'));
if (cf) {
  const text = await cf.evaluate(() => document.body.innerText);
  console.log('CONTENT TEXT LEN:', text.length);
  console.log(text.slice(0, 1500));
}
await browser.close();
