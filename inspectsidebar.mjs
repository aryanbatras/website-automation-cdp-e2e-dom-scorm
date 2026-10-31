import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  // find the "Show what you know!" sidebar item and its parent
  const link = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link')).find(a => /show what you know/i.test(a.innerText||''));
  if (!link) return { err: 'not found' };
  let el = link;
  const chain = [];
  for (let i=0; i<4; i++) { chain.push(el.outerHTML.slice(0,300)); el = el.parentElement; }
  return { chain };
});
console.log(JSON.stringify(info).slice(0, 2000));
await browser.close();
