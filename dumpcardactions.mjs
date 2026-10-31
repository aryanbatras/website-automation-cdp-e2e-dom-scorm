import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const html = await frame.evaluate(() => {
  const card = document.querySelectorAll('.quiz-card')[0];
  const actions = card.querySelector('.quiz-card__actions');
  return actions ? actions.outerHTML : 'NO ACTIONS';
});
console.log(html);
await browser.close();
