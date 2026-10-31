import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const h = Array.from(document.querySelectorAll('h1,h2,h3')).map(e => e.innerText.trim()).filter(Boolean);
  const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link')).map(a => a.innerText.trim()).slice(0, 10);
  return { headings: h.slice(0,5), sidebarSample: links, totalLinks: document.querySelectorAll('a.nav-sidebar__outline-section-item__link').length };
});
console.log(JSON.stringify(info));
await browser.close();
