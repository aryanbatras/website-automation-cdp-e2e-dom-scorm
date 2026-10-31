import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
  const link = links.find(a => (a.textContent||'').trim() === 'Cybersecurity threats');
  const div = link?.closest('li')?.querySelector('div.nav-sidebar__outline-section-item');
  return { found: !!link, class: div ? div.className : 'no div' };
});
console.log(JSON.stringify(info));
await browser.close();
