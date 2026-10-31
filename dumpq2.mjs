import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
await frame.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
  const link = links.find(a => (a.textContent||'').trim() === 'Why data privacy matters');
  if (link) link.click();
});
await page.waitForTimeout(2000);
const info = await frame.evaluate(() => {
  const card = document.querySelectorAll('.quiz-card')[0];
  const q = (card?.querySelector('.quiz-card__title')?.innerText || '').trim();
  const opts = Array.from(card?.querySelectorAll('[role="radio"]') || []).map((o,i) => {
    const labelId = o.getAttribute('aria-labelledby');
    const label = labelId ? document.getElementById(labelId) : null;
    return { i, text: (label?.innerText || o.innerText || '').trim(), ariaChecked: o.getAttribute('aria-checked'), ariaDisabled: o.getAttribute('aria-disabled') };
  });
  const fb = (card?.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
  const body = (card?.querySelector('.quiz-card__feedback-text')?.innerText || '').trim();
  return { q, opts, feedback: fb, body };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
