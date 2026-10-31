import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('PLAN-EC6B83791960')) || context.pages()[0];
await page.waitForTimeout(3000);
// expand all sections? they might be collapsed. Let's get all activity links
const items = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('a[href*="/activity/"]').forEach(a => {
    const href = a.getAttribute('href');
    const text = (a.innerText||'').replace(/\s+/g,' ').trim();
    // only items with duration
    if (/Duration is/.test(text)) {
      out.push({ href: href.split('?')[0], text: text.slice(0,120) });
    }
  });
  return out;
});
// dedupe by href
const seen = new Set();
const uniq = items.filter(i => { if(seen.has(i.href)) return false; seen.add(i.href); return true; });
console.log('TOTAL UNIQUE:', uniq.length);
uniq.forEach((u,i) => console.log(i+1, '|', u.href, '|', u.text.slice(0,90)));
await browser.close();
