import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const card = document.querySelector('.quiz-card');
  const fb = (card?.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
  const submitBtn = card?.querySelector('button.quiz-card__button:not(.quiz-card__button--next)');
  const nextBtn = card?.querySelector('button.quiz-card__button--next');
  const opts = Array.from(card?.querySelectorAll('[role="radio"]') || []).map(o=>({ariaChecked:o.getAttribute('aria-checked'), ariaDisabled:o.getAttribute('aria-disabled')}));
  return { feedback: fb, submitVisible: !!submitBtn && submitBtn.offsetParent !== null, submitDisabled: submitBtn?.disabled, nextVisible: !!nextBtn && nextBtn.offsetParent !== null, nextDisabled: nextBtn?.disabled, opts };
});
console.log(JSON.stringify(info));
await browser.close();
