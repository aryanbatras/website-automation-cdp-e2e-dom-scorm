import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('PLAN-EC6B83791960')) || context.pages()[0];
await page.waitForTimeout(3000);
const links = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.includes('/activity/')) {
      const text = (a.innerText||'').replace(/\s+/g,' ').trim();
      out.push({ href: href.split('?')[0], text: text.slice(0,100) });
    }
  });
  return out;
});
const seen = new Set();
const uniq = links.filter(i => { if(seen.has(i.href)) return false; seen.add(i.href); return true; });
console.log('TOTAL UNIQUE:', uniq.length);
uniq.forEach((u,i) => console.log(i+1, '|', u.href, '|', u.text.slice(0,90)));
await browser.close();
