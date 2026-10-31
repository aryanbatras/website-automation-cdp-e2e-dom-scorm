import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const items = Array.from(document.querySelectorAll('li.nav-sidebar__outline-list-item'));
  const total = items.length;
  const complete = items.filter(li => li.querySelector('.nav-sidebar__outline-section-item--complete') || li.className.includes('complete')).length;
  // also check for checkmark svg or complete class on the item div
  const complete2 = items.filter(li => {
    const div = li.querySelector('div.nav-sidebar__outline-section-item');
    return div && div.className.includes('complete');
  }).length;
  return { total, complete, complete2 };
});
console.log(JSON.stringify(info));
await browser.close();
