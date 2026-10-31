import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button, a, [role="button"]')).map(e=>({tag:e.tagName, text:(e.innerText||'').trim().slice(0,40), cls:e.className.slice(0,50), visible: e.offsetParent!==null})).filter(e=>e.text||e.cls.includes('continue')||e.cls.includes('next'));
  const accordions = document.querySelectorAll('[aria-expanded="false"], details:not([open])').length;
  const videos = document.querySelectorAll('video').length;
  return { btns, accordions, videos };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
