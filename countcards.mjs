import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const cards = document.querySelectorAll('.quiz-card, [class*="quiz-card"]');
  return {
    numCards: cards.length,
    totalRadios: document.querySelectorAll('[role="radio"]').length,
    submitBtns: Array.from(document.querySelectorAll('button.quiz-card__button')).map(b=>({text:b.innerText.trim(), disabled:b.disabled, visible: b.offsetParent!==null, class:b.className.slice(0,60)})),
    cardClasses: Array.from(cards).map(c=>c.className.slice(0,60))
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
