import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
await frame.evaluate(() => {
  const s = document.scrollingElement || document.body;
  if (s.scrollTo) s.scrollTo(0, s.scrollHeight);
  // also scroll all containers
  document.querySelectorAll('*').forEach(e => { if (e.scrollTo) try { e.scrollTo(0, e.scrollHeight); } catch(err){} });
});
await page.waitForTimeout(3000);
const prog = await frame.evaluate(() => {
  const m = document.body.innerText.match(/Data and Privacy\s*(\d+)%\s*COMPLETE/);
  return m ? m[0].replace(/\n/g,' ') : 'not found';
});
console.log('top progress:', prog);
await browser.close();
