import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  // exact class "quiz-card"
  const cards = Array.from(document.querySelectorAll('.quiz-card'));
  // active one?
  const active = cards.find(c => c.classList.contains('quiz-card--active')) || cards[0];
  if (!active) return { err: 'no active card', numExact: cards.length };
  const submitBtn = active.querySelector('button.quiz-card__button:not(.quiz-card__button--next)');
  return {
    numExactCards: cards.length,
    activeClass: active.className,
    submitExists: !!submitBtn,
    submitDisabled: submitBtn?.disabled,
    submitVisible: !!submitBtn && submitBtn.offsetParent !== null,
    submitText: submitBtn?.innerText?.trim(),
    radiosInActive: active.querySelectorAll('[role="radio"]').length,
    questionText: (active.querySelector('.quiz-card__title')?.innerText || '').trim().slice(0,200)
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
