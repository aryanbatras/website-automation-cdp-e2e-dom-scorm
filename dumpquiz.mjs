import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(1000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const html = await frame.evaluate(() => {
  const card = document.querySelector('.quiz-card, [class*="quiz-card"]');
  return card ? card.outerHTML.slice(0, 4000) : 'NO CARD';
});
console.log(html);
await browser.close();
