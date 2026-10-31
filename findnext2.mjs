import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  // find elements with click handlers / role button containing next/arrow/chevron
  const all = Array.from(document.querySelectorAll('[role="button"], button, a, [tabindex="0"]'));
  return all.filter(e => /next|chevron|arrow|continue|submit/i.test((e.className||'')+' '+(e.getAttribute('aria-label')||'')+' '+(e.innerText||''))).map(e=>({tag:e.tagName, cls:e.className.slice(0,60), text:(e.innerText||'').trim().slice(0,20), visible:e.offsetParent!==null, rectW:e.getBoundingClientRect().width}));
});
console.log(JSON.stringify(info));
await browser.close();
