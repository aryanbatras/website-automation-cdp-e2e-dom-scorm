import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// click next sidebar item after Cybersecurity threats
await frame.evaluate(() => {
  const link = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link')).find(a => a.innerText.trim() === 'Key elements of cybersecurity');
  if (link) link.click();
});
await page.waitForTimeout(2000);
// check complete status of Cybersecurity threats
const complete = await frame.evaluate(() => {
  const link = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link')).find(a => a.innerText.trim() === 'Cybersecurity threats');
  const div = link?.closest('li')?.querySelector('div.nav-sidebar__outline-section-item');
  return div ? div.className.includes('complete') : null;
});
console.log('Cybersecurity threats complete:', complete);
const prog = await frame.evaluate(() => {
  const m = document.body.innerText.match(/Data and Privacy\s*(\d+)%\s*COMPLETE/);
  return m ? m[0].replace(/\n/g,' ') : 'not found';
});
console.log('top progress:', prog);
await browser.close();
