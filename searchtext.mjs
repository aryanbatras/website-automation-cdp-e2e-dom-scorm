import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  const info = await frame.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const res = [];
    for (const el of all) {
      const t = (el.innerText || '').trim();
      if (t && /next|continue|proceed|finish|done|forward/i.test(t) && t.length < 50 && el.offsetWidth > 0) {
        res.push({ tag: el.tagName, cls: String(el.className).slice(0,60), text: t });
      }
    }
    const seen = new Set();
    return res.filter(r => { const k=r.text+r.cls; if (seen.has(k)) return false; seen.add(k); return true; });
  });
  console.log('MATCHES:', JSON.stringify(info, null, 2));
  await browser.close();
})();