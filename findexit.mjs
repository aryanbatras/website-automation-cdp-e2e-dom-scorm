import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button')).map(b=>({text:(b.innerText||'').trim(), cls:b.className.slice(0,40), visible: b.offsetParent!==null}));
  return btns.filter(b => /exit/i.test(b.text));
});
console.log(JSON.stringify(info));
await browser.close();
