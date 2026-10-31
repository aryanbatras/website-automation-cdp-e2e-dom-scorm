import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  return Array.from(document.querySelectorAll('button')).map(b=>({text:(b.innerText||'').trim().slice(0,30), cls:b.className.slice(0,50), visible: b.offsetParent!==null, rectW: b.getBoundingClientRect().width})).filter(b=>b.text||b.rectW>0);
});
console.log(JSON.stringify(info));
await browser.close();
