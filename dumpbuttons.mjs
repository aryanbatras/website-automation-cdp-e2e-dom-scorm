import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  console.log('PAGES:', pages.length);
  pages.forEach((p,i)=>console.log(i, p.url()));
  const page = pages.find(p => p.url().includes('alm.ibm.com'));
  if (!page) { console.log('NOPAGE'); await browser.close(); return; }
  await page.waitForTimeout(2000);
  console.log('FRAMES:', page.frames().length);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  if (!frame) { console.log('NOFRAME'); await browser.close(); return; }
  const btns = await frame.evaluate(() => Array.from(document.querySelectorAll('button')).map(e => ({ cls:String(e.className).slice(0,60), text:e.innerText.trim().slice(0,40), aria:e.getAttribute('aria-label') })));
  console.log(JSON.stringify(btns, null, 2));
  await browser.close();
})();