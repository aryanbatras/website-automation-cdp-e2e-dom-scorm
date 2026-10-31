import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// reset
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => /take again/i.test(b.innerText||''));
  if (btn) btn.click();
});
await page.waitForTimeout(1000);
// type using keyboard
const input = await frame.$('input.quiz-fill__input');
if (input) {
  await input.click();
  await input.fill('CYBER');
  await page.waitForTimeout(500);
  const val = await frame.evaluate(() => document.querySelector('input.quiz-fill__input')?.value);
  console.log('input value after fill:', val);
  // submit
  await frame.evaluate(() => {
    const card = document.querySelector('.quiz-card');
    const btn = card?.querySelector('button.quiz-card__button:not(.quiz-card__button--next)');
    if (btn) btn.click();
  });
  await page.waitForTimeout(2000);
  const fb = await frame.evaluate(() => {
    const card = document.querySelector('.quiz-card');
    const label = (card?.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
    const body = (card?.querySelector('.quiz-card__feedback-text')?.innerText || '').trim();
    return { label, body };
  });
  console.log(JSON.stringify(fb));
}
await browser.close();
