import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const btn = document.querySelectorAll('.quiz-card')[0].querySelector('button.quiz-card__button:not(.quiz-card__button--next)');
  const cs = window.getComputedStyle(btn);
  const rect = btn.getBoundingClientRect();
  return { position: cs.position, rect: {top:rect.top, left:rect.left, width:rect.width, height:rect.height} };
});
console.log(JSON.stringify(info));
await browser.close();
