import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(4000);
  const frame = page.frames().find(f => f.url().includes('scormcontent'));
  console.log('Frame URL:', frame?.url());
  if (!frame) { console.log('no scormcontent frame'); await browser.close(); return; }
  const txt = await frame.evaluate(() => document.body.innerText.slice(0, 8000));
  console.log('FRAME BODY TEXT:\n', txt);
  const els = await frame.evaluate(() => Array.from(document.querySelectorAll('button,a,[role="button"],input,select')).map(e => ({ tag:e.tagName, text:(e.innerText||e.value||e.placeholder||'').trim().slice(0,80) })).filter(e=>e.text));
  console.log('FRAME INTERACTIVE:', JSON.stringify(els, null, 2));
  await browser.close();
})();