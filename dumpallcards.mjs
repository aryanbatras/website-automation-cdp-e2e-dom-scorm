const title = process.argv.slice(2).join(' ');
import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
await frame.evaluate((t) => {
  const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
  const link = links.find(a => (a.textContent||'').trim() === t);
  if (link) link.click();
}, title);
await page.waitForTimeout(2000);
const info = await frame.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('.quiz-card'));
  return cards.map((c,i) => {
    const q = (c.querySelector('.quiz-card__title')?.innerText || '').trim();
    const opts = Array.from(c.querySelectorAll('[role="radio"]')).map((o,j) => {
      const labelId = o.getAttribute('aria-labelledby');
      const label = labelId ? document.getElementById(labelId) : null;
      return { j, text: (label?.innerText || o.innerText || '').trim() };
    });
    const fb = (c.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
    return { i, q: q.slice(0,300), opts, feedback: fb };
  });
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
