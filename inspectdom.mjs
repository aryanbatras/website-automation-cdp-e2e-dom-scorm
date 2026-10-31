import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  const frame = page.frames().find(f => f.url().includes('scormcontent'));
  await page.waitForTimeout(4000);
  // Dump all elements with class containing next/prev/play/back or clickable
  const info = await frame.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const result = [];
    for (const el of all) {
      const cls = (el.className || '').toString().toLowerCase();
      const id = (el.id || '').toLowerCase();
      const aria = (el.getAttribute('aria-label') || '').toLowerCase();
      const title = (el.getAttribute('title') || '').toLowerCase();
      if (/next|prev|back|play|pause|submit|continue|start/i.test(cls+id+aria+title)) {
        result.push({ tag: el.tagName, cls: el.className, id: el.id, aria, title, text: (el.innerText||'').trim().slice(0,40) });
      }
    }
    return result.slice(0, 60);
  });
  console.log('NEXT/PREV ELEMENTS:', JSON.stringify(info, null, 2));
  // Also count total elements
  const total = await frame.evaluate(() => document.querySelectorAll('*').length);
  console.log('TOTAL ELEMENTS:', total);
  await browser.close();
})();