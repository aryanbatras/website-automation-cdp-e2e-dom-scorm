import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('skills.yourlearning.ibm.com')) || context.pages()[0];
await page.waitForTimeout(1000);
const els = await page.evaluate(() => {
  const out=[];
  document.querySelectorAll('a,button').forEach(e=>{
    const t=(e.innerText||'').trim();
    if(/return to plan|back to plan/i.test(t)) out.push({tag:e.tagName,text:t.slice(0,40),href:e.getAttribute('href')});
  });
  return out;
});
console.log(JSON.stringify(els));
// click via js
const clicked = await page.evaluate(() => {
  const el = Array.from(document.querySelectorAll('a,button')).find(e=>/return to plan/i.test((e.innerText||'').trim()));
  if(el){ el.click(); return true;} return false;
});
console.log('clicked:', clicked);
await page.waitForTimeout(5000);
console.log('URL now:', page.url());
await browser.close();
