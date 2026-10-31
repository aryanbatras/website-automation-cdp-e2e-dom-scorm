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
// expand accordions
await frame.evaluate(() => {
  document.querySelectorAll('[aria-expanded="false"], .blocks-accordion__header').forEach(e => { try { e.click(); } catch(err){} });
  document.querySelectorAll('details').forEach(d => { d.open = true; });
});
await page.waitForTimeout(1500);
// scroll to bottom
await frame.evaluate(() => {
  const s = document.scrollingElement || document.body;
  if (s.scrollTo) s.scrollTo(0, s.scrollHeight);
});
await page.waitForTimeout(1500);
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
