import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// click take again
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => /take again/i.test(b.innerText||''));
  if (btn) btn.click();
});
await page.waitForTimeout(1000);
// try "cyber" lowercase
await frame.evaluate(() => {
  const input = document.querySelector('input.quiz-fill__input, input[type="text"]');
  if (input) {
    input.focus();
    input.value = 'Cyber';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
});
await page.waitForTimeout(500);
await frame.evaluate(() => {
  const card = document.querySelector('.quiz-card');
  const btn = card?.querySelector('button.quiz-card__button:not(.quiz-card__button--next)');
  if (btn) btn.click();
});
await page.waitForTimeout(2000);
const fb = await frame.evaluate(() => {
  const card = document.querySelector('.quiz-card');
  return (card?.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
});
console.log('feedback (cyber):', fb);
await browser.close();
