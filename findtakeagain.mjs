import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  return btns.filter(b => /take|again|retry|next/i.test(b.innerText||'')).map(b=>({text:(b.innerText||'').trim(), cls:b.className.slice(0,60), visible: b.offsetParent!==null, rect: b.getBoundingClientRect().width}));
});
console.log(JSON.stringify(info));
// also check for any clickable with "Take"
const all = await frame.evaluate(() => Array.from(document.querySelectorAll('*')).filter(e=>/take again/i.test((e.innerText||'').trim())).map(e=>e.tagName+'.'+e.className.slice(0,40)));
console.log('take again elements:', all);
await browser.close();
