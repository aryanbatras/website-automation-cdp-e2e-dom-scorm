import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
await frame.evaluate(() => {
  const link = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link')).find(a => a.innerText.trim() === 'Key elements of cybersecurity');
  if (link) link.click();
});
await page.waitForTimeout(2000);
// expand lesson 1 if collapsed
// check complete
const complete = await frame.evaluate(() => {
  // find all sidebar items
  const items = Array.from(document.querySelectorAll('li.nav-sidebar__outline-list-item'));
  const ct = items.find(li => {
    const a = li.querySelector('a.nav-sidebar__outline-section-item__link');
    return a && a.innerText.trim() === 'Cybersecurity threats';
  });
  if (!ct) return 'not found in sidebar';
  const div = ct.querySelector('div.nav-sidebar__outline-section-item');
  return div ? div.className : 'no div';
});
console.log('Cybersecurity threats item class:', complete);
const prog = await frame.evaluate(() => {
  const m = document.body.innerText.match(/Data and Privacy\s*(\d+)%\s*COMPLETE/);
  return m ? m[0].replace(/\n/g,' ') : 'not found';
});
console.log('progress:', prog);
await browser.close();
