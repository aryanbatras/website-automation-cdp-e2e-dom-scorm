import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('skills.yourlearning.ibm.com')) || context.pages()[0];
await page.waitForTimeout(1000);
// click primary Submit button
const clicked = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button')).filter(b => (b.innerText||'').trim()==='Submit');
  // pick the primary one (last or with btn--primary)
  const primary = btns.find(b => (b.className||'').includes('primary')) || btns[btns.length-1];
  if (primary){ primary.click(); return true;} return false;
});
console.log('clicked submit:', clicked);
await page.waitForTimeout(3000);
// return to plan via js click
const ret = await page.evaluate(() => {
  const a = Array.from(document.querySelectorAll('a')).find(x => /Return to plan/i.test((x.innerText||'').trim()));
  if (a){ a.click(); return true;} return false;
});
console.log('return to plan clicked:', ret);
await page.waitForTimeout(4000);
console.log('URL:', page.url());
await browser.close();
