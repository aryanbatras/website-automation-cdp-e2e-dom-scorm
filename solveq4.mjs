import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  // Click the "Web server" option (index 1) in active card
  await frame.evaluate(() => {
    const card = document.querySelector('.quiz-card--active');
    const opts = Array.from(card.querySelectorAll('[role="radio"]'));
    const labels = opts.map(o => (o.parentElement?.querySelector('.quiz-multiple-choice-option__text')?.innerText || '').trim());
    const idx = labels.findIndex(t => /web server/i.test(t));
    if (idx >= 0) opts[idx].click();
  });
  await page.waitForTimeout(800);
  // Submit
  await frame.evaluate(() => {
    const card = document.querySelector('.quiz-card--active');
    const btn = card.querySelector('.quiz-card__submit button');
    if (btn) btn.click();
  });
  await page.waitForTimeout(2000);
  const info = await frame.evaluate(() => ({
    label: document.querySelector('.quiz-card--active .quiz-card__feedback-label')?.innerText,
    text: document.querySelector('.quiz-card--active .quiz-card__feedback-text')?.innerText?.trim().slice(0,120),
    checked: Array.from(document.querySelector('.quiz-card--active').querySelectorAll('[role="radio"]')).filter(o=>o.getAttribute('aria-checked')==='true').map(o=>o.parentElement?.querySelector('.quiz-multiple-choice-option__text')?.innerText?.trim())
  }));
  console.log(JSON.stringify(info));
  await browser.close();
})();