import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  await page.goto('https://www.ibm.com/account/reg/us-en/signup?formid=urx-54369', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  const els = await page.evaluate(() => Array.from(document.querySelectorAll('a,button,input')).map(e => ({ tag:e.tagName, text:(e.innerText||e.value||e.placeholder||'').trim().slice(0,60), href:e.href||'' })).filter(e=>e.text));
  console.log(JSON.stringify(els.filter(e=>/google|github|sign in|log in/i.test(e.text+e.href)), null, 2));
  await browser.close();
})();