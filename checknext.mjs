import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  const info = await frame.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const matches = [];
    for (const el of all) {
      const t = (el.innerText || '').trim();
      const cls = String(el.className);
      if (/(^|\s)(next|continue|submit|finish|done)(\s|$)/i.test(t) && t.length < 40 && el.offsetWidth > 0) {
        matches.push({ tag: el.tagName, cls: cls.slice(0,60), text: t });
      }
    }
    // dedupe
    const seen = new Set();
    return matches.filter(m => { const k = m.text+m.cls; if (seen.has(k)) return false; seen.add(k); return true; });
  });
  console.log('NEXT/CONTINUE TEXT MATCHES:', JSON.stringify(info, null, 2));
  const title = await frame.evaluate(() => { const c=Array.from(document.querySelectorAll('h1,h2,h3')).map(e=>e.innerText.trim()).filter(Boolean); return c[0]||''; });
  console.log('TITLE:', title);
  await browser.close();
})();