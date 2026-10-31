import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
await frame.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
  const link = links.find(a => (a.textContent||'').trim() === 'Show what you know!');
  if (link) link.click();
});
await page.waitForTimeout(2000);
const info = await frame.evaluate(() => {
  const iframes = Array.from(document.querySelectorAll('iframe')).map(f => f.src.slice(0,100));
  const btns = Array.from(document.querySelectorAll('button')).filter(b => b.offsetParent !== null).map(b => ({text:(b.innerText||'').trim().slice(0,30), cls:b.className.slice(0,40)}));
  const gameEl = document.querySelector('[class*="game"], [id*="game"]');
  return { iframes, btns, hasGameEl: !!gameEl, gameElClass: gameEl?.className?.slice(0,60) };
});
console.log(JSON.stringify(info));
await browser.close();
