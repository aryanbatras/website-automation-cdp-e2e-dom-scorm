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
    while (el && el.tagName !== 'svg') {
      console.log(el.tagName, (el.getAttribute('data-acc-text')||''), el.getAttribute('aria-label')||'');
      el = el.parentElement;
    }
    // return outerHTML of the nearest g with a rect or path
    const g = target.closest('g');
    return g ? g.outerHTML.slice(0, 1500) : 'no g';
  });
  console.log(info);
  await browser.close();
})();