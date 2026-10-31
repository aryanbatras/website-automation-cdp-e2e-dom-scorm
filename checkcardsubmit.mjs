import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('.quiz-card'));
  return cards.map((c,i) => {
    const submitBtn = c.querySelector('button.quiz-card__button:not(.quiz-card__button--next)');
    const nextBtn = c.querySelector('button.quiz-card__button--next');
    return {
      i,
      submitVisible: !!submitBtn && submitBtn.offsetParent !== null,
      submitDisabled: submitBtn?.disabled,
      nextVisible: !!nextBtn && nextBtn.offsetParent !== null,
      nextDisabled: nextBtn?.disabled,
      feedbackLabel: (c.querySelector('.quiz-card__feedback-label')?.innerText || '').trim()
    };
  });
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
