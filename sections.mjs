import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('PLAN-EC6B83791960')) || context.pages()[0];
await page.waitForTimeout(2000);
// click the first section header that is collapsed. Try clicking "Get ready!" text in main content
const clicked = await page.evaluate(() => {
  const els = Array.from(document.querySelectorAll('*')).filter(e => (e.innerText||'').trim()==='Get ready!');
  console.log('count Get ready! exact:', els.length);
  if (els.length) { els[0].click(); return true; } return false;
});
console.log('clicked:', clicked);
await page.waitForTimeout(2000);
// try clicking the section toggle - look for buttons with aria-expanded
const toggles = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('[aria-expanded]')).map(e=>({tag:e.tagName, expanded:e.getAttribute('aria-expanded'), text:(e.innerText||'').trim().slice(0,40)}));
});
console.log('toggles:', JSON.stringify(toggles));
await browser.close();
