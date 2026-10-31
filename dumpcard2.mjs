import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const card = document.querySelectorAll('.quiz-card')[2];
  const q = (card?.querySelector('.quiz-card__title')?.innerText || '').trim();
  const opts = Array.from(card?.querySelectorAll('[role="radio"]') || []).map((o,i) => {
    const labelId = o.getAttribute('aria-labelledby');
    const label = labelId ? document.getElementById(labelId) : null;
    return { i, text: (label?.innerText || o.innerText || '').trim(), ariaChecked: o.getAttribute('aria-checked'), ariaDisabled: o.getAttribute('aria-disabled') };
  });
  return { q, opts };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
