import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(4000);
  const scormFrame = page.frames().find(f => f.url().includes('scormcontent'));
  const storyFrame = page.frames().find(f => f.url().includes('story.html'));
  console.log('STORY FRAME:', storyFrame ? storyFrame.url() : 'NOT FOUND');
  if (!storyFrame) { await browser.close(); return; }
  await page.waitForTimeout(3000);
  const text = await storyFrame.evaluate(() => document.body.innerText.replace(/\s+/g,' ').slice(0,3000));
  console.log('STORY TEXT:\n', text);
  const btns = await storyFrame.evaluate(() => Array.from(document.querySelectorAll('button,a,[role="button"]')).map(e => ({ tag: e.tagName, text: (e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,60), cls: String(e.className).slice(0,50) })));
  console.log('STORY BUTTONS:', JSON.stringify(btns, null, 2));
  await browser.close();
})();