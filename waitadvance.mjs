import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(3000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const active = Array.from(document.querySelectorAll('.quiz-card')).find(c => c.offsetParent !== null && c.getClientRects().length > 0);
  const q = (active?.querySelector('.quiz-card__title')?.innerText || '').trim().slice(0,120);
  const opts = Array.from(active?.querySelectorAll('[role="radio"]') || []).map(o=>o.getAttribute('aria-checked'));
  return { q, opts, numActiveCards: Array.from(document.querySelectorAll('.quiz-card')).filter(c=>c.offsetParent!==null&&c.getClientRects().length>0).length };
});
console.log(JSON.stringify(info));
await browser.close();
