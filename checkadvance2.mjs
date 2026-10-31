import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('.quiz-item__card'));
  const active = cards.find(c => c.classList.contains('quiz-item__card--active'));
  const card = active?.querySelector('.quiz-card');
  const submitBtn = card?.querySelector('button.quiz-card__button:not(.quiz-card__button--next)');
  const nextBtn = card?.querySelector('button.quiz-card__button--next');
  return {
    submitRectW: submitBtn?.getBoundingClientRect().width,
    nextRectW: nextBtn?.getBoundingClientRect().width,
    nextDisplay: nextBtn ? window.getComputedStyle(nextBtn).display : null
  };
});
console.log(JSON.stringify(info));
await browser.close();
