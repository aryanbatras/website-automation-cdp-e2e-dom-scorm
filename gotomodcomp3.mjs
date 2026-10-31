import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// navigate to Module completion
await frame.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
  const link = links.find(a => (a.textContent||'').trim() === 'Module completion');
  if (link) link.click();
});
await page.waitForTimeout(3000);
// exit course
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => /exit course/i.test(b.innerText||''));
  if (btn) btn.click();
});
await page.waitForTimeout(5000);
await browser.close();
console.log('exited');
