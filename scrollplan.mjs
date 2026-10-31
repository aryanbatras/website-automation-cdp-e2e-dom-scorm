import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('PLAN-EC6B83791960')) || context.pages()[0];
await page.waitForTimeout(2000);
// scroll down
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(2000);
const text = await page.evaluate(() => document.body.innerText);
console.log('has Data and Privacy:', text.includes('Data and Privacy'));
console.log('has Threats and Vulnerabilities:', text.includes('Threats and Vulnerabilities'));
// find links
const links = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('a')).filter(a => (a.getAttribute('href')||'').includes('/activity/ALM') || (a.getAttribute('href')||'').includes('/activity/URL')).map(a=>({href:a.getAttribute('href').split('?')[0], text:(a.innerText||'').replace(/\s+/g,' ').trim().slice(0,80)}));
});
const seen=new Set(); const uniq=links.filter(l=>{if(seen.has(l.href))return false;seen.add(l.href);return true;});
console.log('num activity links:', uniq.length);
uniq.forEach((u,i)=>console.log(i+1, u.href, '|', u.text.slice(0,60)));
await browser.close();
