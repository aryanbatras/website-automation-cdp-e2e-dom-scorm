import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const storyFrame = page.frames().find(f => f.url().includes('story.html'));
  if (!storyFrame) { console.log('NO STORY FRAME'); await browser.close(); return; }
  const info = await storyFrame.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('label'));
    const results = [];
    for (const l of labels) {
      const left = parseFloat(l.style.left);
      const top = parseFloat(l.style.top);
      if (isNaN(left) || isNaN(top)) continue;
      const el = document.elementFromPoint(left + 5, top + 5);
      results.push({ text: l.innerText.trim(), left, top, hitTag: el?.tagName, hitId: el?.id, hitCls: String(el?.className).slice(0,60) });
    }
    return results;
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();