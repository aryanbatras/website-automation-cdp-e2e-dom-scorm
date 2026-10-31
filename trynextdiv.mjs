import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  const before = await frame.evaluate(() => document.querySelector('.quiz-card--active .quiz-card__counter')?.innerText);
  console.log('BEFORE:', before);
  // Try multiple things
  await frame.evaluate(() => {
    const card = document.querySelector('.quiz-card--active');
    // remove hidden
    const nextDiv = card.querySelector('.quiz-card__next');
    if (nextDiv) { nextDiv.classList.remove('visually-hidden-always'); nextDiv.removeAttribute('aria-hidden'); }
    const nextBtn = card.querySelector('.quiz-card__button--next');
    if (nextBtn) { nextBtn.classList.remove('visually-hidden-always'); nextBtn.removeAttribute('aria-hidden'); nextBtn.removeAttribute('tabindex'); }
    // click the div
    if (nextDiv) nextDiv.click();
    if (nextBtn) nextBtn.click();
  });
  await page.waitForTimeout(4000);
  const after = await frame.evaluate(() => document.querySelector('.quiz-card--active .quiz-card__counter')?.innerText);
  console.log('AFTER:', after);
  await browser.close();
})();