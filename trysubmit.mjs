import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  const before = await frame.evaluate(() => document.querySelector('.quiz-card--active .quiz-card__counter')?.innerText);
  console.log('BEFORE:', before);
  // Click SUBMIT button in active card
  await frame.evaluate(() => {
    const card = document.querySelector('.quiz-card--active');
    const btn = card.querySelector('.quiz-card__submit button');
    if (btn) btn.click();
  });
  await page.waitForTimeout(4000);
  const after = await frame.evaluate(() => document.querySelector('.quiz-card--active .quiz-card__counter')?.innerText);
  console.log('AFTER:', after);
  await browser.close();
})();