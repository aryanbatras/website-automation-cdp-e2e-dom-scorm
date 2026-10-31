import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// click the selected (correct) radio again
await frame.evaluate(() => {
  const active = Array.from(document.querySelectorAll('.quiz-card')).find(c => c.offsetParent !== null && c.getClientRects().length > 0);
  const selected = Array.from(active.querySelectorAll('[role="radio"]')).find(o => o.getAttribute('aria-checked') === 'true');
  if (selected) selected.click();
});
await page.waitForTimeout(2000);
const info = await frame.evaluate(() => {
  const active = Array.from(document.querySelectorAll('.quiz-card')).find(c => c.offsetParent !== null && c.getClientRects().length > 0);
  const q = (active?.querySelector('.quiz-card__title')?.innerText || '').trim().slice(0,80);
  return { q };
});
console.log(JSON.stringify(info));
await browser.close();
