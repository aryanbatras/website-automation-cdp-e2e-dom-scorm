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
  const card = document.querySelectorAll('.quiz-card')[2];
  const q = (card?.querySelector('.quiz-card__title')?.innerText || '').trim();
  const input = card?.querySelector('input.quiz-fill__input');
  return { q, hasInput: !!input, inputVal: input?.value };
});
console.log(JSON.stringify(info));
await browser.close();
