import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  const frame = page.frames().find(f => f.url().includes('scormcontent/index.html'));
  console.log('Frame URL:', frame.url());
  await page.waitForTimeout(3000);
  // Dump text of the frame
  const txt = await frame.evaluate(() => document.body.innerText.slice(0, 8000));
  console.log('FRAME BODY TEXT:\n', txt);
  // Dump all buttons/interactive
  const els = await frame.evaluate(() => Array.from(document.querySelectorAll('button,a,[role="button"],input')).map(e => ({ tag:e.tagName, text:(e.innerText||e.value||e.placeholder||'').trim().slice(0,80) })).filter(e=>e.text));
  console.log('FRAME INTERACTIVE:', JSON.stringify(els, null, 2));
  await browser.close();
})();