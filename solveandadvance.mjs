import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// navigate to Cybersecurity threats
await frame.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
  const link = links.find(a => (a.textContent||'').trim() === 'Cybersecurity threats');
  if (link) link.click();
});
await page.waitForTimeout(2000);
// solve quiz: select False (index 1), submit
await frame.evaluate(() => {
  const card = document.querySelector('.quiz-card');
  const opts = Array.from(card?.querySelectorAll('[role="radio"]') || []);
  if (opts[1]) opts[1].click();
});
await page.waitForTimeout(800);
await frame.evaluate(() => {
  const card = document.querySelector('.quiz-card');
  const btn = card?.querySelector('button.quiz-card__button:not(.quiz-card__button--next)');
  if (btn) btn.click();
});
await page.waitForTimeout(2000);
// check proceed state and click next if available
const nextResult = await frame.evaluate(() => {
  const card = document.querySelector('.quiz-card');
  const nextBtn = card?.querySelector('button.quiz-card__button--next');
  if (nextBtn) { nextBtn.click(); return 'clicked next'; }
  // try clicking the proceed actions
  const actions = card?.querySelector('.quiz-card__actions--proceed');
  if (actions) { actions.click(); return 'clicked actions'; }
  return 'no next';
});
console.log('next result:', nextResult);
await page.waitForTimeout(3000);
// check progress
const prog = await frame.evaluate(() => {
  const m = document.body.innerText.match(/Data and Privacy\s*(\d+)%\s*COMPLETE/);
  return m ? m[0].replace(/\n/g,' ') : 'not found';
});
console.log('progress:', prog);
const complete = await frame.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
  const link = links.find(a => (a.textContent||'').trim() === 'Cybersecurity threats');
  const div = link?.closest('li')?.querySelector('div.nav-sidebar__outline-section-item');
  return div ? div.className : 'no div';
});
console.log('Cybersecurity threats class:', complete);
const heading = await frame.evaluate(() => document.querySelector('h1,h2,h3')?.innerText?.trim());
console.log('current heading:', heading);
await browser.close();
