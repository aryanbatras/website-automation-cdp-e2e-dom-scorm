import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// select index 0 (probably wrong)
await frame.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('.quiz-item__card'));
  const active = cards.find(c => c.classList.contains('quiz-item__card--active'));
  const card = active?.querySelector('.quiz-card');
  const opts = Array.from(card?.querySelectorAll('[role="radio"]') || []);
  if (opts[0]) opts[0].click();
});
await page.waitForTimeout(600);
await frame.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('.quiz-item__card'));
  const active = cards.find(c => c.classList.contains('quiz-item__card--active'));
  const card = active?.querySelector('.quiz-card');
  const btn = card?.querySelector('button.quiz-card__button:not(.quiz-card__button--next)');
  if (btn) btn.click();
});
await page.waitForTimeout(2000);
const info = await frame.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('.quiz-item__card'));
  const active = cards.find(c => c.classList.contains('quiz-item__card--active'));
  const card = active?.querySelector('.quiz-card');
  const fb = (card?.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
  const body = (card?.querySelector('.quiz-card__feedback-text')?.innerText || '').trim();
  const opts = Array.from(card?.querySelectorAll('[role="radio"]') || []).map(o=>({ariaChecked:o.getAttribute('aria-checked'), ariaDisabled:o.getAttribute('aria-disabled')}));
  return { feedback: fb, body: body.slice(0,400), opts };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
