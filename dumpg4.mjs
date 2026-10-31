import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const storyFrame = page.frames().find(f => f.url().includes('story.html'));
  if (!storyFrame) { console.log('NO STORY FRAME'); await browser.close(); return; }
  const info = await storyFrame.evaluate(() => {
    const texts = Array.from(document.querySelectorAll('svg text'));
    const target = texts.find(t => t.textContent.trim().toLowerCase().includes('embedded'));
    if (!target) return 'no target';
    let el = target.parentElement;
    while (el && el.children.length !== 4) el = el.parentElement;
    if (!el) return 'no 4-child parent';
    return Array.from(el.children).map(c => ({ tag: c.tagName, name: c.getAttribute('data-display-name'), id: c.id, bbox: c.getBoundingClientRect().toJSON() })).map(x => ({...x, bbox:{x:x.bbox.x,y:x.bbox.y,w:x.bbox.width,h:x.bbox.height}}));
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();