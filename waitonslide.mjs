import { chromium } from 'playwright';
const title = process.argv[2];
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  // navigate to slide
  await frame.evaluate((t) => {
    const l = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link')).find(a => a.innerText.trim() === t);
    if (l) l.click();
  }, title);
  await page.waitForTimeout(3000);
  const before = await frame.evaluate(() => document.body.innerText.match(/(\d+)%\s*COMPLETE/)?.[0]);
  console.log('BEFORE:', before);
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(10000);
    const prog = await frame.evaluate(() => document.body.innerText.match(/(\d+)%\s*COMPLETE/)?.[0]);
    // check checkmark
    const item = await frame.evaluate((t) => {
      const l = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link')).find(a => a.innerText.trim() === t);
      const item = l?.closest('.nav-sidebar__outline-section-item');
      return item?.classList.contains('nav-sidebar__outline-section-item--complete');
    }, title);
    console.log(`wait ${(i+1)*10}s: ${prog} checkmark=${item}`);
  }
  await browser.close();
})();