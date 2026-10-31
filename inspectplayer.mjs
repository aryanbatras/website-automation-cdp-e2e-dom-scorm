import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const storyFrame = page.frames().find(f => f.url().includes('story.html'));
  if (!storyFrame) { console.log('NO STORY FRAME'); await browser.close(); return; }
  const info = await storyFrame.evaluate(() => {
    const p = GetPlayer();
    const obj = p.object;
    // try to get slide info
    let slides = null;
    try { slides = Object.keys(obj).filter(k => /slide/i.test(k)); } catch(e){}
    return {
      objectKeys: Object.keys(obj).slice(0, 50),
      objectStr: (JSON.stringify(obj) || '').slice(0, 2000)
    };
  });
  console.log(JSON.stringify(info, null, 2).slice(0, 4000));
  await browser.close();
})();