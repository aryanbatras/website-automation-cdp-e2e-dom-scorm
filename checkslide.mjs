import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// navigate to Cybersecurity threats
await frame.evaluate(() => {
  const link = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link')).find(a => a.innerText.trim() === 'Cybersecurity threats');
  if (link) link.click();
});
await page.waitForTimeout(2000);
const info = await frame.evaluate(() => {
  const cb = document.querySelector('button.continue-btn, .continue-btn');
  const qn = document.querySelector('button.quiz-card__button--next');
  const quizCard = !!document.querySelector('.quiz-card');
  const quizWrap = !!document.querySelector('.quiz__wrap');
  const body = document.body.innerText.slice(0, 400);
  return {
    continueBtn: !!cb && cb.offsetParent !== null,
    quizNext: !!qn && qn.offsetParent !== null,
    quizCard, quizWrap,
    snippet: body.replace(/\s+/g,' ').slice(0,300)
  };
});
console.log(JSON.stringify(info));
await browser.close();
