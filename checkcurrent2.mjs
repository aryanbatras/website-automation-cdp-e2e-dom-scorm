import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const h = Array.from(document.querySelectorAll('h1,h2,h3')).map(e => e.innerText.trim()).filter(Boolean);
  const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
  const active = links.find(a => a.parentElement?.parentElement?.querySelector('div')?.className?.includes('active'));
  return { headings: h.slice(0,3), totalLinks: links.length };
});
console.log(JSON.stringify(info));
// find active sidebar item
const active = await frame.evaluate(() => {
  const items = Array.from(document.querySelectorAll('li.nav-sidebar__outline-list-item'));
  const activeItem = items.find(li => {
    const div = li.querySelector('div.nav-sidebar__outline-section-item');
    return div && div.className.includes('active');
  });
  const a = activeItem?.querySelector('a.nav-sidebar__outline-section-item__link');
  return a ? (a.textContent||'').trim() : 'none';
});
console.log('active slide:', active);
await browser.close();
