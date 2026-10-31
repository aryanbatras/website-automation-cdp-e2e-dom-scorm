import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// expand Lesson 1 section
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button.nav-sidebar__outline-section-toggle')).find(b => /lesson 1/i.test(b.innerText||''));
  if (btn) btn.click();
});
await page.waitForTimeout(500);
const info = await frame.evaluate(() => {
  const items = Array.from(document.querySelectorAll('li.nav-sidebar__outline-list-item'));
  const ct = items.find(li => {
    const a = li.querySelector('a.nav-sidebar__outline-section-item__link');
    return a && a.innerText.trim() === 'Cybersecurity threats';
  });
  if (!ct) return { err: 'not found', totalItems: items.length };
  const div = ct.querySelector('div.nav-sidebar__outline-section-item');
  return { found: true, class: div ? div.className : 'no div' };
});
console.log(JSON.stringify(info));
await browser.close();
