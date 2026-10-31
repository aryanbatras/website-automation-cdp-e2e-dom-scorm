import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const all = Array.from(document.querySelectorAll('*'));
  const nextish = all.filter(e => {
    const t = (e.textContent||'').trim().toLowerCase();
    const cls = (e.className||'').toString().toLowerCase();
    return (t === 'next' || cls.includes('next') || cls.includes('continue') || cls.includes('proceed')) && e.offsetParent !== null;
  });
  return nextish.map(e => ({tag:e.tagName, text:(e.textContent||'').trim().slice(0,20), cls:(e.className||'').toString().slice(0,60), rectW: e.getBoundingClientRect().width}));
});
console.log(JSON.stringify(info));
await browser.close();
