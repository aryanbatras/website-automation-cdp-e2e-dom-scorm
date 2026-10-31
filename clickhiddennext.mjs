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
// solve quiz if needed (it should be in proceed state already, but let's ensure passed)
// click the hidden next button via JS
const result = await frame.evaluate(() => {
  const card = document.querySelector('.quiz-card');
  const nextBtn = card?.querySelector('button.quiz-card__button--next');
  if (nextBtn) { nextBtn.click(); return 'clicked next'; }
  return 'no next btn';
});
console.log('next btn click:', result);
await page.waitForTimeout(3000);
// check progress
const prog = await frame.evaluate(() => {
  const m = document.body.innerText.match(/Data and Privacy\s*(\d+)%\s*COMPLETE/);
  return m ? m[0].replace(/\n/g,' ') : 'not found';
});
console.log('progress:', prog);
// check complete status
const complete = await frame.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
  const link = links.find(a => (a.textContent||'').trim() === 'Cybersecurity threats');
  const div = link?.closest('li')?.querySelector('div.nav-sidebar__outline-section-item');
  return div ? div.className : 'no div';
});
console.log('Cybersecurity threats class:', complete);
await browser.close();
