import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
await frame.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
  const link = links.find(a => (a.textContent||'').trim() === 'Encryption');
  if (link) link.click();
});
await page.waitForTimeout(2000);
const info = await frame.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('.quiz-card'));
  return cards.map((c,i) => {
    const q = (c.querySelector('.quiz-card__title')?.innerText || '').trim();
    const input = c.querySelector('input.quiz-fill__input');
    const fb = (c.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
    return { i, q: q.slice(0,200), hasInput: !!input, inputValue: input?.value, feedback: fb };
  });
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
