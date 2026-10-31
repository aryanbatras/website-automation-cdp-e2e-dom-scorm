import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const hasQuizCard = !!document.querySelector('.quiz-card');
  const hasQuizWrap = !!document.querySelector('.quiz__wrap, .quiz-item__card');
  const radios = document.querySelectorAll('[role="radio"]').length;
  const body = document.body.innerText.slice(0, 1200);
  return { hasQuizCard, hasQuizWrap, radios, body };
});
console.log('hasQuizCard:', info.hasQuizCard, 'hasQuizWrap:', info.hasQuizWrap, 'radios:', info.radios);
console.log(info.body);
await browser.close();
