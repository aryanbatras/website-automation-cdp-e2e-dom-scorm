import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// expand WRAP-UP section
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button.nav-sidebar__outline-section-toggle')).find(b => /wrap-up/i.test(b.innerText||''));
  if (btn) btn.click();
});
await page.waitForTimeout(500);
// click Module completion link
const clicked = await frame.evaluate(() => {
  const link = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link')).find(a => /module completion/i.test(a.innerText||''));
  if (link) { link.click(); return true; } return false;
});
console.log('clicked module completion:', clicked);
await page.waitForTimeout(2000);
const prog = await frame.evaluate(() => {
  const m = document.body.innerText.match(/Data and Privacy\s*(\d+)%\s*COMPLETE/);
  return m ? m[0].replace(/\n/g,' ') : 'not found';
});
console.log('top progress:', prog);
const text = await frame.evaluate(() => document.body.innerText.slice(0, 500));
console.log(text.slice(0, 400));
await browser.close();
