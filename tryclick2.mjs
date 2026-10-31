import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// try clicking various elements
const targets = ['.quiz-card__feedback', '.quiz-card__feedback-label', '.quiz-card__title', '.quiz-card__container', '.quiz-item__card--active'];
for (const sel of targets) {
  await frame.evaluate((s) => {
    const el = document.querySelector(s);
    if (el) el.click();
  }, sel);
  await page.waitForTimeout(800);
  const q = await frame.evaluate(() => {
    const active = Array.from(document.querySelectorAll('.quiz-item__card')).find(c => c.classList.contains('quiz-item__card--active'));
    const card = active?.querySelector('.quiz-card');
    return (card?.querySelector('.quiz-card__title')?.innerText || '').trim().slice(0,60);
  });
  console.log(sel, '->', q);
}
await browser.close();
