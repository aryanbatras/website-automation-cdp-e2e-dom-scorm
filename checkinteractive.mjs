import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
await frame.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
  const link = links.find(a => (a.textContent||'').trim() === 'Encryption');
  if (link) link.click();
});
await page.waitForTimeout(2000);
const info = await frame.evaluate(() => {
  const accordions = Array.from(document.querySelectorAll('[aria-expanded="false"], .blocks-accordion__header'));
  const tabs = Array.from(document.querySelectorAll('[role="tab"]:not([aria-selected="true"])'));
  const reveals = Array.from(document.querySelectorAll('.blocks-reveal__header'));
  const details = Array.from(document.querySelectorAll('details:not([open])'));
  return { accordions: accordions.length, tabs: tabs.length, reveals: reveals.length, details: details.length };
});
console.log(JSON.stringify(info));
await browser.close();
