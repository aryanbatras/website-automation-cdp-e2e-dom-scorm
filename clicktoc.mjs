import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  // Click "Operating systems" TOC link
  await frame.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
    const target = links.find(a => a.innerText.trim() === 'Operating systems');
    if (target) target.click();
  });
  await page.waitForTimeout(4000);
  const title = await frame.evaluate(() => { const c=Array.from(document.querySelectorAll('h1,h2,h3')).map(e=>e.innerText.trim()).filter(Boolean); return c[0]||''; });
  console.log('TITLE AFTER:', title);
  await browser.close();
})();