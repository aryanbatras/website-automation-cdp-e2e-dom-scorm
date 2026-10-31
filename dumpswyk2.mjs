import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
await frame.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
  const link = links.find(a => (a.textContent||'').trim() === 'Show what you know!');
  if (link) link.click();
});
await page.waitForTimeout(2000);
const info = await frame.evaluate(() => {
  const quizCards = document.querySelectorAll('.quiz-card').length;
  const practice = !!document.querySelector('.quiz__wrap, .quiz-item__card');
  const radios = document.querySelectorAll('[role="radio"]').length;
  const inputs = document.querySelectorAll('input.quiz-fill__input').length;
  const body = document.body.innerText.slice(0, 1000);
  return { quizCards, practice, radios, inputs, body };
});
console.log('quizCards:', info.quizCards, 'practice:', info.practice, 'radios:', info.radios, 'inputs:', info.inputs);
console.log(info.body);
await browser.close();
