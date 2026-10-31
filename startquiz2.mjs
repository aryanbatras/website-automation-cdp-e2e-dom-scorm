import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// click TAKE AGAIN
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => /take again/i.test(b.innerText||''));
  if (btn) btn.click();
});
await page.waitForTimeout(2000);
// check if a START QUIZ / question appeared
const info = await frame.evaluate(() => {
  const startBtn = Array.from(document.querySelectorAll('button')).find(b => /start quiz/i.test(b.innerText||''));
  const radios = document.querySelectorAll('[role="radio"]').length;
  const question = document.querySelector('.quiz-card__title, [class*="quiz-card__title"]');
  return { hasStart: !!startBtn, radios, question: (question?.innerText||'').trim().slice(0,120) };
});
console.log(JSON.stringify(info));
await browser.close();
