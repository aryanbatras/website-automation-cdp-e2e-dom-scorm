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
// fill input 0 (CYBER) and input 2 (DATA ENCRYPTION CAN BE FUN)
const inputs = await frame.$$('input.quiz-fill__input');
// input 0
await inputs[0].click();
await inputs[0].fill('CYBER');
await page.waitForTimeout(300);
// input 2
await inputs[2].click();
await inputs[2].fill('DATA ENCRYPTION CAN BE FUN');
await page.waitForTimeout(500);
// submit card 0
const s0 = frame.locator('.quiz-card').nth(0).locator('button.quiz-card__button:not(.quiz-card__button--next)').first();
await s0.click();
await page.waitForTimeout(2000);
// submit card 2
const s2 = frame.locator('.quiz-card').nth(2).locator('button.quiz-card__button:not(.quiz-card__button--next)').first();
await s2.click();
await page.waitForTimeout(2000);
// check feedback
const info = await frame.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('.quiz-card'));
  return cards.map((c,i) => ({ i, feedback: (c.querySelector('.quiz-card__feedback-label')?.innerText || '').trim() }));
});
console.log(JSON.stringify(info));
// click continue
await page.waitForTimeout(1000);
const cr = await frame.evaluate(() => {
  const b = document.querySelector('button.continue-btn, .continue-btn');
  if (b && b.offsetParent !== null) { b.click(); return 'clicked'; }
  return 'no continue';
});
console.log('continue:', cr);
await page.waitForTimeout(2000);
const complete = await frame.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
  const link = links.find(a => (a.textContent||'').trim() === 'Encryption');
  const div = link?.closest('li')?.querySelector('div.nav-sidebar__outline-section-item');
  return div ? div.className.includes('complete') : null;
});
console.log('Encryption complete:', complete);
const prog = await frame.evaluate(() => {
  const m = document.body.innerText.match(/Data and Privacy\s*(\d+)%\s*COMPLETE/);
  return m ? m[0].replace(/\n/g,' ') : 'not found';
});
console.log('progress:', prog);
await browser.close();
