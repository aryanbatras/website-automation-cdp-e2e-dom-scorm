import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// click NEXT button (quiz-card__button--next) that's visible
await frame.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button.quiz-card__button--next'));
  const btn = btns.find(b => b.offsetParent !== null) || btns[0];
  if (btn) btn.click();
});
await page.waitForTimeout(2000);
// check if quiz__wrap still present
const hasQuiz = await frame.evaluate(() => !!document.querySelector('.quiz__wrap'));
console.log('has quiz__wrap:', hasQuiz);
const text = await frame.evaluate(() => document.body.innerText);
console.log('progress:', text.match(/(\d+)%\s*COMPLETE/)?.[0]);
console.log('title:', text.match(/Practice quiz|Summary|About this lesson|Lesson 5/)?.[0]);
await browser.close();
