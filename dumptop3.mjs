import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  const info = await frame.evaluate(() => {
    const lesson = document.querySelector('.page-lesson');
    if (!lesson) return 'no lesson';
    const walk = (el, depth) => {
      if (depth > 4) return [];
      const res = [];
      for (const c of el.children) {
        const text = (c.innerText||'').trim().slice(0,80);
        res.push({ tag: c.tagName, cls: String(c.className).slice(0,70), h: c.offsetHeight, text });
        const sub = walk(c, depth+1);
        if (sub.length) res.push({ _children: sub });
      }
      return res;
    };
    return walk(lesson, 0);
  });
  console.log(JSON.stringify(info, null, 2).slice(0, 12000));
  await browser.close();
})();