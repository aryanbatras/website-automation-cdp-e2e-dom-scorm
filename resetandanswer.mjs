import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// click TAKE AGAIN
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => /take again/i.test(b.innerText||''));
  if (btn) btn.click();
});
await page.waitForTimeout(1500);
// select index 1 (Operational)
await frame.evaluate(() => {
  const card = document.querySelector('.quiz-card');
  const opts = Array.from(card?.querySelectorAll('[role="radio"]') || []);
  if (opts[1]) opts[1].click();
});
await page.waitForTimeout(800);
// submit
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
console.log('feedback:', fb);
// click continue if available
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
