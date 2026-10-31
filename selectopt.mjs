import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// select option index 2 (the best answer)
await frame.evaluate(() => {
  const active = Array.from(document.querySelectorAll('.quiz-card')).find(c => c.offsetParent !== null && c.getClientRects().length > 0);
  const opts = Array.from(active.querySelectorAll('[role="radio"]'));
  if (opts[2]) opts[2].click();
});
await page.waitForTimeout(1500);
// check submit
const info = await frame.evaluate(() => {
  const active = Array.from(document.querySelectorAll('.quiz-card')).find(c => c.offsetParent !== null && c.getClientRects().length > 0);
  const submitBtn = active.querySelector('button.quiz-card__button:not(.quiz-card__button--next)');
  const nextBtn = active.querySelector('button.quiz-card__button--next');
  return {
    submitVisible: !!submitBtn && submitBtn.offsetParent !== null,
    submitRectW: submitBtn?.getBoundingClientRect().width,
    nextVisible: !!nextBtn && nextBtn.offsetParent !== null,
    feedbackLabel: (active.querySelector('.quiz-card__feedback-label')?.innerText || '').trim()
  };
});
console.log(JSON.stringify(info));
await browser.close();
