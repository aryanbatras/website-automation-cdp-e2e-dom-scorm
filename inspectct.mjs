import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const link = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link')).find(a => a.innerText.trim() === 'Cybersecurity threats');
  if (!link) return { err: 'not found' };
  let el = link.parentElement;
  const classes = [];
  for (let i=0; i<3; i++) { classes.push(el?.className); el = el?.parentElement; }
  return { classes };
});
console.log(JSON.stringify(info));
await browser.close();
