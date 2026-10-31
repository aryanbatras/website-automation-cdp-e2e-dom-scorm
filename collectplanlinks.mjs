const planId = process.argv[2];
import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('skills.yourlearning.ibm.com')) || context.pages()[0];
await page.goto('https://skills.yourlearning.ibm.com/activity/' + planId);
await page.waitForTimeout(5000);
// scroll and collect activity links
for (let i=0;i<5;i++){ await page.evaluate(()=>window.scrollBy(0,1000)); await page.waitForTimeout(400);}
const links = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('a')).filter(a => (a.getAttribute('href')||'').includes('/activity/')).map(a=>({href:a.getAttribute('href').split('?')[0], text:(a.innerText||'').replace(/\s+/g,' ').trim().slice(0,100)}));
});
const seen=new Set(); const uniq=links.filter(l=>{if(seen.has(l.href))return false;seen.add(l.href);return true;});
console.log('num:', uniq.length);
uniq.forEach((u,i)=>console.log(i+1, u.href, '|', u.text.slice(0,70)));
await browser.close();
