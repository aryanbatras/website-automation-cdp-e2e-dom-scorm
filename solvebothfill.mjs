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
// reset quiz (take again)
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => /take again/i.test(b.innerText||''));
  if (btn) btn.click();
});
await page.waitForTimeout(1000);
// fill both inputs
const inputs = await frame.$$('input.quiz-fill__input');
console.log('num inputs:', inputs.length);
if (inputs[0]) { await inputs[0].click(); await inputs[0].fill('CYBER'); }
if (inputs[1]) { await inputs[1].click(); await inputs[1].fill('QUEEN AND KING'); }
await page.waitForTimeout(1000);
// submit first card
const submit0 = frame.locator('.quiz-card').nth(0).locator('button.quiz-card__button:not(.quiz-card__button--next)').first();
await submit0.click();
await page.waitForTimeout(2000);
// submit second card
const submit1 = frame.locator('.quiz-card').nth(1).locator('button.quiz-card__button:not(.quiz-card__button--next)').first();
await submit1.click();
await page.waitForTimeout(2000);
// check feedback
const info = await frame.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('.quiz-card'));
  return cards.map((c,i) => ({
    i, feedback: (c.querySelector('.quiz-card__feedback-label')?.innerText || '').trim()
  }));
});
console.log(JSON.stringify(info));
// click continue if available
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
