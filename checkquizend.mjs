import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button')).filter(b => b.offsetParent !== null).map(b=>({text:(b.innerText||'').trim().slice(0,30), cls:b.className.slice(0,50)}));
  const text = document.body.innerText;
  const hasResults = /your score|passed|completed|results/i.test(text);
  return { btns, hasResults, snippet: text.slice(text.indexOf('Practice quiz'), text.indexOf('Practice quiz')+800) };
});
console.log(JSON.stringify(info, null, 2).slice(0, 3000));
await browser.close();
