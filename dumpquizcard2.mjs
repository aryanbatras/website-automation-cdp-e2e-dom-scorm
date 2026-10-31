import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const card = document.querySelector('.quiz-card, [class*="quiz-card"]');
  if (!card) return { err: 'no card' };
  return { len: card.innerText.length, text: card.innerText.slice(0, 3000) };
});
console.log(JSON.stringify(info).slice(0, 4000));
await browser.close();
