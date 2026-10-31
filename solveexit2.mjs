import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// navigate to Encryption
await frame.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
  const link = links.find(a => (a.textContent||'').trim() === 'Encryption');
  if (link) link.click();
});
await page.waitForTimeout(2000);
// reset quiz
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => /take again/i.test(b.innerText||''));
  if (btn) btn.click();
});
await page.waitForTimeout(1000);
// fill CYBER
const input = await frame.$('input.quiz-fill__input');
if (input) {
  await input.click();
  await input.fill('CYBER');
  await page.waitForTimeout(500);
}
// submit
await frame.evaluate(() => {
  const card = document.querySelector('.quiz-card');
  const btn = card?.querySelector('button.quiz-card__button:not(.quiz-card__button--next)');
  if (btn) btn.click();
});
await page.waitForTimeout(2000);
const fb = await frame.evaluate(() => {
  const card = document.querySelector('.quiz-card');
  return (card?.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
});
console.log('feedback:', fb);
// exit course immediately
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => /exit course/i.test(b.innerText||''));
  if (btn) btn.click();
});
await page.waitForTimeout(5000);
await browser.close();
console.log('exited');
