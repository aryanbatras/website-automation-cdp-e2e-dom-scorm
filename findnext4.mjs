import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  // find all buttons/links with "next" text or next-related classes
  const all = Array.from(document.querySelectorAll('button, a, [role="button"]'));
  const nextish = all.filter(e => {
    const t = (e.textContent||'').trim().toLowerCase();
    const cls = (e.className||'').toString().toLowerCase();
    return t === 'next' || t.includes('next') || cls.includes('next') || cls.includes('continue') || cls.includes('proceed');
  });
  return nextish.map(e => ({tag:e.tagName, text:(e.textContent||'').trim().slice(0,20), cls:(e.className||'').toString().slice(0,50), visible: e.offsetParent!==null, rectW: e.getBoundingClientRect().width}));
});
console.log(JSON.stringify(info));
await browser.close();
