import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  // Open sidebar
  await frame.evaluate(() => {
    const btn = document.querySelector('button.nav-control__button, [aria-label="Open navigation menu"], .nav-control__button');
    if (btn) btn.click();
  });
  await page.waitForTimeout(2000);
  const items = await frame.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
    return links.map(a => {
      const parent = a.closest('.nav-sidebar__outline-section-item') || a.parentElement;
      const item = a.closest('.nav-sidebar__outline-section-item');
      const hasCheck = item?.classList.contains('nav-sidebar__outline-section-item--complete') || false;
      return { text: a.innerText.trim(), hasCheck };
    });
  });
  console.log(JSON.stringify(items.filter(i => i.text), null, 2));
  await browser.close();
})();