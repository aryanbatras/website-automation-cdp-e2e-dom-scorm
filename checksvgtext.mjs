import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(3000);
  const storyFrame = page.frames().find(f => f.url().includes('story.html'));
  if (!storyFrame) { console.log('NO STORY FRAME'); await browser.close(); return; }
  const info = await storyFrame.evaluate(() => {
    const texts = Array.from(document.querySelectorAll('text,tspan')).map(t => t.textContent.trim()).filter(Boolean);
    return texts;
  });
  console.log(JSON.stringify(info));
  await browser.close();
})();