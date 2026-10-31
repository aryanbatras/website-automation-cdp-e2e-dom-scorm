import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// click the quiz-header start-quiz TAKE AGAIN button
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => b.className.includes('quiz-header__start-quiz'));
  if (btn) btn.click();
});
await page.waitForTimeout(2000);
const info = await frame.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('.quiz-item__card'));
  return cards.map((c,i) => ({i, classes: c.className, visible: c.offsetParent !== null && c.getClientRects().length>0, q: (c.querySelector('.quiz-card__title')?.innerText||'').trim().slice(0,60)}));
});
console.log(JSON.stringify(info));
await browser.close();
