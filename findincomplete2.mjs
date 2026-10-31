import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const items = Array.from(document.querySelectorAll('li.nav-sidebar__outline-list-item'));
  return items.map(li => {
    const a = li.querySelector('a.nav-sidebar__outline-section-item__link');
    const div = li.querySelector('div.nav-sidebar__outline-section-item');
    const complete = div && div.className.includes('complete');
    return { text: a ? a.innerText.trim() : '', complete: !!complete };
  }).filter(x => !x.complete);
});
console.log(JSON.stringify(info));
await browser.close();
