import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  // find the active quiz card
  const cards = Array.from(document.querySelectorAll('.quiz-card'));
  const active = cards.find(c => c.offsetParent !== null && c.getClientRects().length > 0);
  if (!active) return { err: 'no active card', numCards: cards.length };
  const q = (active.querySelector('.quiz-card__title')?.innerText || '').trim();
  const opts = Array.from(active.querySelectorAll('[role="radio"]')).map((el,i) => {
    const labelId = el.getAttribute('aria-labelledby');
    const label = labelId ? document.getElementById(labelId) : null;
    return { i, text: (label?.innerText || el.innerText || '').trim(), ariaChecked: el.getAttribute('aria-checked') };
  });
  const submitBtn = active.querySelector('button.quiz-card__button:not(.quiz-card__button--next)');
  return { q: q.slice(0,300), opts, submitVisible: !!submitBtn && submitBtn.offsetParent !== null, submitDisabled: submitBtn?.disabled };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
