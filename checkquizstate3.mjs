import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('.quiz-item__card'));
  return cards.map((c,i) => ({i, classes: c.className, visible: c.offsetParent !== null && c.getClientRects().length>0, q: (c.querySelector('.quiz-card__title')?.innerText||'').trim().slice(0,60)}));
});
console.log(JSON.stringify(info));
// buttons
const btns = await frame.evaluate(() => Array.from(document.querySelectorAll('button')).filter(b=>/start|take again|restart/i.test(b.innerText||'')).map(b=>({text:b.innerText.trim(), cls:b.className.slice(0,40), visible:b.offsetParent!==null})));
console.log('btns:', JSON.stringify(btns));
await browser.close();
