import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  const info = await frame.evaluate(() => {
    // top-level structure: find the main content container and its siblings
    const body = document.body;
    const children = Array.from(body.children).map(c => ({ tag: c.tagName, cls: String(c.className).slice(0,80), id: c.id, h: c.offsetHeight }));
    // find any element with "next" in class
    const nextEls = Array.from(document.querySelectorAll('*')).filter(e => /next/i.test(String(e.className))).map(e => ({ tag: e.tagName, cls: String(e.className).slice(0,80), text: (e.innerText||'').trim().slice(0,30) }));
    return { bodyChildren: children, nextClassEls: nextEls.slice(0,20) };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();