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
await page.waitForTimeout(3000);
const info = await frame.evaluate(() => {
  // find all clickable elements
  const btns = Array.from(document.querySelectorAll('button, a, [role="button"], [onclick]')).filter(e => e.offsetParent !== null).map(e => ({tag:e.tagName, text:(e.innerText||'').trim().slice(0,40), cls:e.className.slice(0,50)})).filter(e => e.text);
  // find elements with "play" or "start" or "game"
  const gameEls = Array.from(document.querySelectorAll('*')).filter(e => /play|start|game/i.test((e.className||'')+' '+(e.getAttribute('aria-label')||''))).slice(0,10).map(e=>e.tagName+'.'+ (e.className||'').slice(0,40));
  return { btns: btns.slice(0,20), gameEls };
});
console.log(JSON.stringify(info));
await browser.close();
