import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(5000);
  const frame = page.frames()[3];
  const info = await frame.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const result = [];
    for (const el of all) {
      const cls = (el.className || '').toString().toLowerCase();
      const id = (el.id || '').toLowerCase();
      const aria = (el.getAttribute('aria-label') || '').toLowerCase();
      const title = (el.getAttribute('title') || '').toLowerCase();
      const role = (el.getAttribute('role') || '').toLowerCase();
      const name = (el.getAttribute('name') || '').toLowerCase();
      const haystack = cls + ' ' + id + ' ' + aria + ' ' + title + ' ' + role + ' ' + name;
      if (/next|prev|back|play|pause|submit|continue|start|forward/i.test(haystack)) {
        result.push({ tag: el.tagName, cls: String(el.className).slice(0,60), id: el.id, aria, title, text: (el.innerText||'').trim().slice(0,40) });
      }
    }
    return result.slice(0, 80);
  });
  console.log('COUNT:', info.length);
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();