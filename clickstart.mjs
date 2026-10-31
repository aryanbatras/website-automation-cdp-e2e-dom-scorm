import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// find buttons
const btns = await frame.evaluate(() => {
  return Array.from(document.querySelectorAll('button, a, [role="button"]')).map(b => ({
    tag: b.tagName, text: (b.innerText||'').trim().slice(0,60), class: b.className.slice(0,80)
  })).filter(b => b.text);
});
console.log(JSON.stringify(btns, null, 2));
await browser.close();
