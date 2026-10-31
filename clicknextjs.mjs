import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  const before = await frame.evaluate(() => { const c=Array.from(document.querySelectorAll('h1,h2,h3')).map(e=>e.innerText.trim()).filter(Boolean); return c[0]||''; });
  console.log('BEFORE:', before);
  await frame.evaluate(() => {
    const card = document.querySelector('.quiz-card--active');
    const next = card.querySelector('button.quiz-card__button--next');
    if (next) { next.removeAttribute('aria-disabled'); next.click(); }
  });
  await page.waitForTimeout(4000);
  const after = await frame.evaluate(() => { const c=Array.from(document.querySelectorAll('h1,h2,h3')).map(e=>e.innerText.trim()).filter(Boolean); return c[0]||''; });
  console.log('AFTER:', after);
  await browser.close();
})();