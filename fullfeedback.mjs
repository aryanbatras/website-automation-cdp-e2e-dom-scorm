import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const body = document.querySelector('.quiz-card__feedback-text, [class*="feedback-text"]');
  const fb = document.querySelector('.quiz-card__feedback-label, [class*="feedback-label"]');
  return { feedbackLabel: (fb?.innerText||'').trim(), bodyText: (body?.innerText||'').trim() };
});
console.log(JSON.stringify(info, null, 2));
// also check if there's a "correct" option revealed via class
const opts = await frame.evaluate(() => Array.from(document.querySelectorAll('[role="radio"]')).map((el,i) => ({i, cls: el.className, ariaChecked: el.getAttribute('aria-checked')})));
console.log(JSON.stringify(opts));
await browser.close();
