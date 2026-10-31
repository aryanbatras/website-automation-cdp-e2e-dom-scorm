import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('PLAN-EC6B83791960')) || context.pages()[0];
await page.waitForTimeout(3000);
// find any element containing "Data and Privacy"
const info = await page.evaluate(() => {
  const els = Array.from(document.querySelectorAll('*')).filter(e => (e.innerText||'').trim() === 'Data and Privacy' || (e.textContent||'').trim()==='Data and Privacy');
  return els.map(e => ({tag:e.tagName, class:e.className.slice(0,80), parent:e.parentElement?.tagName, href:e.getAttribute&&e.getAttribute('href')})).slice(0,10);
});
console.log(JSON.stringify(info, null, 2));
// parent chain
const chain = await page.evaluate(() => {
  let el = Array.from(document.querySelectorAll('*')).find(e => (e.innerText||'').trim()==='Data and Privacy');
  const out=[];
  while (el && el !== document.body) { out.push(el.tagName + '.' + (el.className||'').toString().slice(0,40)); el = el.parentElement; }
  return out;
});
console.log('CHAIN:', JSON.stringify(chain));
await browser.close();
