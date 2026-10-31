import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('PLAN-EC6B83791960')) || context.pages()[0];
await page.waitForTimeout(2000);
// find clickable section headers
const secs = await page.evaluate(() => {
  const out=[];
  document.querySelectorAll('*').forEach(e => {
    const t=(e.innerText||'').trim();
    if (/Microcredential \d|Get ready!|Prerequisites/.test(t) && t.length < 60) {
      out.push({tag:e.tagName, text:t, class:(e.className||'').toString().slice(0,60)});
    }
  });
  // dedupe
  const seen=new Set(); return out.filter(o=>{if(seen.has(o.text))return false;seen.add(o.text);return true;});
});
console.log(JSON.stringify(secs));
// try clicking "Show more" button
const showMore = await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button,a,span,div')).find(e => (e.innerText||'').trim()==='Show more');
  if (btn) { btn.click(); return true; } return false;
});
console.log('show more clicked:', showMore);
await page.waitForTimeout(3000);
const text = await page.evaluate(() => document.body.innerText);
console.log('has Data and Privacy now:', text.includes('Data and Privacy'));
await browser.close();
