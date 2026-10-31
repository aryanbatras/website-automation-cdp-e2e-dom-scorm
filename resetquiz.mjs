import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// click the restart TAKE AGAIN button
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => b.className.includes('restart-button'));
  if (btn) btn.click();
});
await page.waitForTimeout(2000);
// if START QUIZ button appears, click it
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => /start quiz/i.test(b.innerText||''));
  if (btn) btn.click();
});
await page.waitForTimeout(2000);
const info = await frame.evaluate(() => {
  const active = Array.from(document.querySelectorAll('.quiz-item__card')).find(c => c.classList.contains('quiz-item__card--active'));
  const card = active?.querySelector('.quiz-card');
  const q = (card?.querySelector('.quiz-card__title')?.innerText || '').trim().slice(0,80);
  const opts = Array.from(card?.querySelectorAll('[role="radio"]') || []).map(o=>o.getAttribute('aria-checked'));
  return { q, opts };
});
console.log(JSON.stringify(info));
await browser.close();
