import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// select option index 1
await frame.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('.quiz-item__card'));
  const active = cards.find(c => c.classList.contains('quiz-item__card--active'));
  const card = active?.querySelector('.quiz-card');
  const opts = Array.from(card?.querySelectorAll('[role="radio"]') || []);
  console.log('opts count', opts.length);
  if (opts[1]) opts[1].click();
});
for (let w of [500, 1000, 2000]) {
  await page.waitForTimeout(w);
  const fb = await frame.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.quiz-item__card'));
    const active = cards.find(c => c.classList.contains('quiz-item__card--active'));
    const card = active?.querySelector('.quiz-card');
    const label = card?.querySelector('.quiz-card__feedback-label');
    return (label?.innerText || '').trim();
  });
  console.log(`after ${w}ms: feedback="${fb}"`);
}
await browser.close();
