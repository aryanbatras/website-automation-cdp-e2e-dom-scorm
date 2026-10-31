import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const card = document.querySelector('.quiz-card');
  const actions = card?.querySelector('.quiz-card__actions');
  const fb = (card?.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
  const input = document.querySelector('input.quiz-fill__input');
  return {
    feedback: fb,
    actionsClass: actions?.className,
    inputVal: input?.value,
    continueBtn: !!document.querySelector('button.continue-btn'),
    continueVisible: !!document.querySelector('button.continue-btn') && document.querySelector('button.continue-btn')?.offsetParent !== null
  };
});
console.log(JSON.stringify(info));
await browser.close();
