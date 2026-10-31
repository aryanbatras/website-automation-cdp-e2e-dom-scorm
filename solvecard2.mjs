import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// select index 2 in card 2
await frame.evaluate(() => {
  const card = document.querySelectorAll('.quiz-card')[2];
  const opts = Array.from(card?.querySelectorAll('[role="radio"]') || []);
  if (opts[2]) opts[2].click();
});
await page.waitForTimeout(800);
await frame.evaluate(() => {
  const card = document.querySelectorAll('.quiz-card')[2];
  const btn = card?.querySelector('button.quiz-card__button:not(.quiz-card__button--next)');
  if (btn) btn.click();
});
await page.waitForTimeout(2000);
const fb = await frame.evaluate(() => {
  const card = document.querySelectorAll('.quiz-card')[2];
  return (card?.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
});
console.log('feedback:', fb);
// click continue
await page.waitForTimeout(1000);
const cr = await frame.evaluate(() => {
  const b = document.querySelector('button.continue-btn, .continue-btn');
  if (b && b.offsetParent !== null) { b.click(); return 'clicked'; }
  return 'no continue';
});
console.log('continue:', cr);
await page.waitForTimeout(2000);
const prog = await frame.evaluate(() => {
  const m = document.body.innerText.match(/Data and Privacy\s*(\d+)%\s*COMPLETE/);
  return m ? m[0].replace(/\n/g,' ') : 'not found';
});
console.log('progress:', prog);
await browser.close();
