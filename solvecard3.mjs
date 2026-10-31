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
// reset quiz (take again)
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => /take again/i.test(b.innerText||''));
  if (btn) btn.click();
});
await page.waitForTimeout(1000);
// fill all 3 inputs
const inputs = await frame.$$('input.quiz-fill__input');
console.log('num inputs:', inputs.length);
const answers = ['CYBER', 'QUEEN AND KING', 'DATA ENCRYPTION CAN BE FUN'];
for (let i = 0; i < inputs.length; i++) {
  await inputs[i].click();
  await inputs[i].fill(answers[i]);
  await page.waitForTimeout(300);
}
await page.waitForTimeout(1000);
// submit each card
for (let ci = 0; ci < 3; ci++) {
  const submitBtn = frame.locator('.quiz-card').nth(ci).locator('button.quiz-card__button:not(.quiz-card__button--next)').first();
  await submitBtn.click();
  await page.waitForTimeout(2000);
  const fb = await frame.evaluate((c) => {
    const card = document.querySelectorAll('.quiz-card')[c];
    return (card?.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
  }, ci);
  console.log(`card ${ci}: ${fb}`);
}
// check continue
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
