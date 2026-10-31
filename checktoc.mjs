import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  const items = await frame.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
    return links.map(a => ({ text: a.innerText.trim().slice(0,40), href: a.getAttribute('href'), cls: String(a.className).slice(0,60) }));
  });
  // find Operating systems
  const os = items.filter(i => /operating system/i.test(i.text));
  console.log('OS items:', JSON.stringify(os, null, 2));
  console.log('total items:', items.length);
  await browser.close();
})();