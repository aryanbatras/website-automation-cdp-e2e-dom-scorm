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
    // walk up parents, listing siblings at each level
    let el = target.parentElement;
    const chain = [];
    while (el && el.tagName !== 'svg') {
      chain.push({ tag: el.tagName, name: el.getAttribute('data-display-name'), id: el.id, children: el.children.length });
      el = el.parentElement;
    }
    return chain;
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();