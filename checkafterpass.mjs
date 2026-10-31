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
// solve quiz (False, first try)
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
// Now check all buttons and continue-btn
const info = await frame.evaluate(() => {
  const cb = document.querySelector('button.continue-btn, .continue-btn');
  const allBtns = Array.from(document.querySelectorAll('button')).filter(b => b.offsetParent !== null).map(b=>({text:(b.innerText||'').trim(), cls:b.className.slice(0,40)}));
  return {
    continueBtn: !!cb, continueVisible: !!cb && cb.offsetParent !== null, continueRectW: cb?.getBoundingClientRect().width,
    allVisibleBtns: allBtns.filter(b => b.text)
  };
});
console.log(JSON.stringify(info));
await browser.close();
