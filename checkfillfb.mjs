import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const card = document.querySelector('.quiz-card');
  const fb = (card?.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
  const body = (card?.querySelector('.quiz-card__feedback-text')?.innerText || '').trim();
  return { feedback: fb, body };
});
console.log(JSON.stringify(info));
await browser.close();
