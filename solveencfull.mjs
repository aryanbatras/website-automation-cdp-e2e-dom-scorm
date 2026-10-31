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
// scroll through all content
await frame.evaluate(() => {
  const s = document.scrollingElement || document.body;
  if (s.scrollTo) s.scrollTo(0, 0);
});
await page.waitForTimeout(500);
// expand accordions
await frame.evaluate(() => {
  document.querySelectorAll('[aria-expanded="false"], .blocks-accordion__header').forEach(e => { try { e.click(); } catch(err){} });
});
await page.waitForTimeout(1000);
// scroll to bottom slowly
for (let i = 0; i < 5; i++) {
  await frame.evaluate(() => {
    const s = document.scrollingElement || document.body;
    if (s.scrollTo) s.scrollTo(0, s.scrollHeight);
  });
  await page.waitForTimeout(1000);
}
// reset quiz
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => /take again/i.test(b.innerText||''));
  if (btn) btn.click();
});
await page.waitForTimeout(1000);
// fill both inputs
const inputs = await frame.$$('input.quiz-fill__input');
if (inputs[0]) { await inputs[0].click(); await inputs[0].fill('CYBER'); }
if (inputs[1]) { await inputs[1].click(); await inputs[1].fill('QUEEN AND KING'); }
await page.waitForTimeout(1000);
// submit both
const submit0 = frame.locator('.quiz-card').nth(0).locator('button.quiz-card__button:not(.quiz-card__button--next)').first();
await submit0.click();
await page.waitForTimeout(2000);
const submit1 = frame.locator('.quiz-card').nth(1).locator('button.quiz-card__button:not(.quiz-card__button--next)').first();
await submit1.click();
await page.waitForTimeout(2000);
// check continue-btn
const info = await frame.evaluate(() => {
  const cb = document.querySelector('button.continue-btn, .continue-btn');
  const hint = document.querySelector('.continue-hint');
  return { continueBtn: !!cb, continueVisible: !!cb && cb.offsetParent !== null, continueRectW: cb?.getBoundingClientRect().width, hintText: hint?.innerText?.trim() };
});
console.log(JSON.stringify(info));
// check complete
const complete = await frame.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
  const link = links.find(a => (a.textContent||'').trim() === 'Encryption');
  const div = link?.closest('li')?.querySelector('div.nav-sidebar__outline-section-item');
  return div ? div.className.includes('complete') : null;
});
console.log('Encryption complete:', complete);
await browser.close();
