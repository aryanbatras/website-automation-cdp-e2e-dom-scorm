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
  const cb = document.querySelector('button.continue-btn, .continue-btn');
  const hint = document.querySelector('.continue-hint');
  const hintText = hint?.innerText?.trim();
  return { continueBtn: !!cb, continueVisible: !!cb && cb.offsetParent !== null, continueRectW: cb?.getBoundingClientRect().width, hintText };
});
console.log(JSON.stringify(info));
await browser.close();
