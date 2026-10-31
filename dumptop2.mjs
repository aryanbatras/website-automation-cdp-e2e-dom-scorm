import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  const info = await frame.evaluate(() => {
    const app = document.getElementById('app');
    const walk = (el, depth) => {
      if (depth > 3) return [];
      const res = [];
      for (const c of el.children) {
        res.push({ tag: c.tagName, cls: String(c.className).slice(0,70), id: c.id, h: c.offsetHeight, w: c.offsetWidth, text: (c.innerText||'').trim().slice(0,60) });
        if (depth < 3) {
          const sub = walk(c, depth+1);
          if (sub.length) res.push({ _children: sub });
        }
      }
      return res;
    };
    return walk(app, 0);
  });
  console.log(JSON.stringify(info, null, 2).slice(0, 8000));
  await browser.close();
})();