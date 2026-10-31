import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('.quiz-card'));
  return cards.map((c,i) => ({
    i,
    q: (c.querySelector('.quiz-card__title')?.innerText || '').trim().slice(0,120),
    feedback: (c.querySelector('.quiz-card__feedback-label')?.innerText || '').trim()
  }));
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
